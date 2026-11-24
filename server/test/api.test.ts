import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { config } from '../src/config'
import { openDb } from '../src/db'

let app: ReturnType<typeof createApp>

beforeEach(() => {
  app = createApp(openDb(':memory:'), { rateLimit: false })
})

async function demoToken() {
  const res = await request(app).post('/api/auth/demo')
  return res.body.token as string
}

const line = { productId: 'atelier-runner', size: '40', color: 'Ivory', quantity: 1 }
const contact = { name: 'Ada Lovelace', email: 'ada@example.com' }
const shipping = { address: '1 Example Road', city: 'London', postalCode: 'N1 1AA' }

describe('system', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok', demo: true })
    expect(res.body.products).toBeGreaterThan(0)
  })

  it('returns a consistent error shape for unknown routes', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('serves the OpenAPI document', async () => {
    const res = await request(app).get('/api/openapi.json')
    expect(res.status).toBe(200)
    expect(res.body.openapi).toBe('3.1.0')
  })
})

describe('catalogue', () => {
  it('filters by category and sorts by price', async () => {
    const res = await request(app).get('/api/products?category=Shoes&sort=price-asc')
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBeGreaterThan(0)
    expect(res.body.items.every((p: { category: string }) => p.category === 'Shoes')).toBe(true)
    const prices = res.body.items.map((p: { price: number }) => p.price)
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b))
  })

  it('filters by size through the JSON column', async () => {
    const res = await request(app).get('/api/products?size=40')
    expect(res.body.items.every((p: { sizes: string[] }) => p.sizes.includes('40'))).toBe(true)
  })

  it('paginates', async () => {
    const res = await request(app).get('/api/products?limit=5&page=2')
    expect(res.body.items).toHaveLength(5)
    expect(res.body.page).toBe(2)
  })

  it('rejects invalid filters', async () => {
    const res = await request(app).get('/api/products?sort=cheapest')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns a product with related pieces, and 404s for unknown ids', async () => {
    const ok = await request(app).get('/api/products/atelier-runner')
    expect(ok.body.product.name).toBe('Atelier Runner')
    expect(ok.body.related.length).toBeGreaterThan(0)
    const missing = await request(app).get('/api/products/does-not-exist')
    expect(missing.status).toBe(404)
  })
})

describe('auth', () => {
  it('registers, signs in and reads the profile', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Grace', email: 'Grace@Example.com', password: 'correct-horse' })
    expect(reg.status).toBe(201)
    expect(reg.body.user.email).toBe('grace@example.com')

    const login = await request(app).post('/api/auth/login').send({ email: 'grace@example.com', password: 'correct-horse' })
    expect(login.status).toBe(200)

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`)
    expect(me.body.user.name).toBe('Grace')
  })

  it('rejects duplicate emails, short passwords and wrong passwords', async () => {
    const dup = await request(app).post('/api/auth/register').send({ name: 'X', email: config.demoUser.email, password: '12345678' })
    expect(dup.status).toBe(400) // name too short is caught first
    const dup2 = await request(app).post('/api/auth/register').send({ name: 'Xavier', email: config.demoUser.email, password: '12345678' })
    expect(dup2.status).toBe(409)
    const short = await request(app).post('/api/auth/register').send({ name: 'Xavier', email: 'x@example.com', password: 'short' })
    expect(short.status).toBe(400)
    const wrong = await request(app).post('/api/auth/login').send({ email: config.demoUser.email, password: 'nope' })
    expect(wrong.status).toBe(401)
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('never returns password hashes', async () => {
    const res = await request(app).post('/api/auth/demo')
    expect(JSON.stringify(res.body)).not.toContain('password')
  })

  it('protects account routes', async () => {
    expect((await request(app).get('/api/account/cart')).status).toBe(401)
    expect((await request(app).get('/api/account/cart').set('Authorization', 'Bearer forged')).status).toBe(401)
  })
})

describe('cart and wishlist', () => {
  it('saves and returns the cart, validating products', async () => {
    const token = await demoToken()
    const auth = { Authorization: `Bearer ${token}` }
    const put = await request(app).put('/api/account/cart').set(auth).send({ items: [line] })
    expect(put.body.items).toEqual([line])

    const bad = await request(app)
      .put('/api/account/cart')
      .set(auth)
      .send({ items: [{ ...line, size: '99' }] })
    expect(bad.status).toBe(400)
    expect(bad.body.error.code).toBe('INVALID_SIZE')
  })

  it('replaces the wishlist and drops unknown ids', async () => {
    const auth = { Authorization: `Bearer ${await demoToken()}` }
    const res = await request(app).put('/api/account/wishlist').set(auth).send({ ids: ['atelier-runner', 'ghost-item'] })
    expect(res.body.ids).toEqual(['atelier-runner'])
  })
})

describe('orders', () => {
  it('prices orders on the server, ignoring anything the client claims', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ ...line, quantity: 2, price: 1 }], contact, shipping })
    expect(res.status).toBe(201)
    // Atelier Runner is $285: 2 × 285 = 570, free shipping over $250, 8% tax = 46.
    expect(res.body.order.totals).toEqual({ subtotal: 570, shipping: 0, tax: 46, total: 616 })
    expect(res.body.order.number).toMatch(/^ATL-/)
  })

  it('links orders to the account and clears the saved cart', async () => {
    const auth = { Authorization: `Bearer ${await demoToken()}` }
    await request(app).put('/api/account/cart').set(auth).send({ items: [line] })
    const placed = await request(app).post('/api/orders').set(auth).send({ items: [line], contact, shipping })
    expect(placed.status).toBe(201)

    const history = await request(app).get('/api/orders').set(auth)
    const numbers = history.body.items.map((o: { number: string }) => o.number)
    expect(numbers).toContain(placed.body.order.number)
    expect(numbers).toContain('ATL-DEMO-0001') // seeded order

    const cart = await request(app).get('/api/account/cart').set(auth)
    expect(cart.body.items).toEqual([])
  })

  it('rejects empty bags and unknown products', async () => {
    const empty = await request(app).post('/api/orders').send({ items: [], contact, shipping })
    expect(empty.status).toBe(400)
    const ghost = await request(app)
      .post('/api/orders')
      .send({ items: [{ ...line, productId: 'ghost' }], contact, shipping })
    expect(ghost.body.error.code).toBe('UNKNOWN_PRODUCT')
  })
})

describe('newsletter', () => {
  it('subscribes idempotently and validates email', async () => {
    expect((await request(app).post('/api/newsletter').send({ email: 'a@b.co' })).status).toBe(201)
    expect((await request(app).post('/api/newsletter').send({ email: 'A@B.co' })).status).toBe(201)
    expect((await request(app).post('/api/newsletter').send({ email: 'nope' })).status).toBe(400)
  })
})
