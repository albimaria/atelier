import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
// Same pricing rules as the frontend, so the total shown at checkout is the total charged.
import { estimateTax, shippingCost } from '../../../src/services/pricing'
import { transaction, type DB } from '../db'
import { optionalAuth, requireAuth } from '../lib/auth'
import { HttpError, parse } from '../lib/errors'
import { cartLine, validateLines } from './account'

const orderBody = z.object({
  items: z.array(cartLine).min(1, 'Your bag is empty.').max(50),
  contact: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(120),
  }),
  shipping: z.object({
    address: z.string().trim().min(3).max(160),
    city: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(2).max(16),
  }),
})

type OrderRow = {
  id: number
  number: string
  name: string
  email: string
  address: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: string
  created_at: string
}

function newOrderNumber() {
  return `ATL-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`
}

export function orderRoutes(db: DB) {
  const router = Router()

  const present = (o: OrderRow) => ({
    number: o.number,
    status: o.status,
    createdAt: o.created_at,
    contact: { name: o.name, email: o.email },
    shipping: JSON.parse(o.address),
    totals: { subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total },
    items: db
      .prepare('SELECT product_id AS productId, name, image, price, size, color, quantity FROM order_items WHERE order_id = ?')
      .all(o.id),
  })

  /**
   * Place an order. Prices come from the database, never from the client.
   * Demo project: no payment is taken and nothing is shipped.
   */
  router.post('/', optionalAuth, (req, res) => {
    const body = parse(orderBody, req.body)
    const catalog = validateLines(db, body.items)
    const userId = (res.locals.userId as number | undefined) ?? null

    const subtotal = body.items.reduce((sum, l) => sum + catalog.get(l.productId)!.price * l.quantity, 0)
    const shipping = shippingCost(subtotal)
    const tax = estimateTax(subtotal)
    const total = subtotal + shipping + tax

    const order = transaction(db, () => {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO orders (number, user_id, name, email, address, subtotal, shipping, tax, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(newOrderNumber(), userId, body.contact.name, body.contact.email, JSON.stringify(body.shipping), subtotal, shipping, tax, total)
      const orderId = Number(lastInsertRowid)
      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, name, image, price, size, color, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      for (const l of body.items) {
        const p = catalog.get(l.productId)!
        insertItem.run(orderId, p.id, p.name, p.images[0], p.price, l.size, l.color, l.quantity)
      }
      if (userId) db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId)
      return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as OrderRow
    })

    res.status(201).json({ order: present(order) })
  })

  /** The signed-in shopper's order history, newest first. */
  router.get('/', requireAuth, (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
      .all(res.locals.userId) as OrderRow[]
    res.json({ items: rows.map(present) })
  })

  router.get('/:number', requireAuth, (req, res) => {
    const row = db
      .prepare('SELECT * FROM orders WHERE number = ? AND user_id = ?')
      .get(String(req.params.number), res.locals.userId) as OrderRow | undefined
    if (!row) throw new HttpError(404, 'ORDER_NOT_FOUND', 'No order with that number on your account.')
    res.json({ order: present(row) })
  })

  return router
}
