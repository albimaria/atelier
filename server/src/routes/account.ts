import { Router } from 'express'
import { z } from 'zod'
import type { Product } from '../../../src/types'
import { transaction, type DB } from '../db'
import { requireAuth } from '../lib/auth'
import { HttpError, parse } from '../lib/errors'

export const cartLine = z.object({
  productId: z.string().min(1).max(80),
  size: z.string().min(1).max(10),
  color: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(10),
})

const cartBody = z.object({ items: z.array(cartLine).max(50) })
const wishlistBody = z.object({ ids: z.array(z.string().min(1).max(80)).max(200) })

/** Check every line refers to a real product, size and colour. Returns the products by id. */
export function validateLines(db: DB, lines: z.infer<typeof cartLine>[]) {
  const stmt = db.prepare('SELECT data FROM products WHERE id = ?')
  const found = new Map<string, Product>()
  lines.forEach((line, i) => {
    const row = stmt.get(line.productId) as { data: string } | undefined
    if (!row) throw new HttpError(400, 'UNKNOWN_PRODUCT', `Line ${i + 1}: product "${line.productId}" does not exist.`)
    const product = JSON.parse(row.data) as Product
    if (!product.sizes.includes(line.size)) {
      throw new HttpError(400, 'INVALID_SIZE', `Line ${i + 1}: size ${line.size} is not available for ${product.name}.`)
    }
    if (!product.colors.some((c) => c.name === line.color)) {
      throw new HttpError(400, 'INVALID_COLOR', `Line ${i + 1}: colour ${line.color} is not available for ${product.name}.`)
    }
    found.set(product.id, product)
  })
  return found
}

/** Signed-in shopper's saved cart and wishlist. Both are replaced wholesale so the client stays the source of truth. */
export function accountRoutes(db: DB) {
  const router = Router()
  router.use(requireAuth)

  const readCart = (userId: number) =>
    db
      .prepare('SELECT product_id AS productId, size, color, quantity FROM cart_items WHERE user_id = ? ORDER BY rowid')
      .all(userId)

  const readWishlist = (userId: number) =>
    (db.prepare('SELECT product_id FROM wishlist WHERE user_id = ? ORDER BY created_at').all(userId) as { product_id: string }[]).map(
      (r) => r.product_id,
    )

  router.get('/cart', (_req, res) => {
    res.json({ items: readCart(res.locals.userId) })
  })

  router.put('/cart', (req, res) => {
    const { items } = parse(cartBody, req.body)
    validateLines(db, items)
    const userId = res.locals.userId as number
    transaction(db, () => {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId)
      const insert = db.prepare(
        `INSERT INTO cart_items (user_id, product_id, size, color, quantity) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT DO UPDATE SET quantity = MIN(10, quantity + excluded.quantity)`,
      )
      for (const l of items) insert.run(userId, l.productId, l.size, l.color, l.quantity)
    })
    res.json({ items: readCart(userId) })
  })

  router.get('/wishlist', (_req, res) => {
    res.json({ ids: readWishlist(res.locals.userId) })
  })

  router.put('/wishlist', (req, res) => {
    const { ids } = parse(wishlistBody, req.body)
    const userId = res.locals.userId as number
    const exists = db.prepare('SELECT 1 FROM products WHERE id = ?')
    const valid = [...new Set(ids)].filter((id) => exists.get(id))
    transaction(db, () => {
      db.prepare('DELETE FROM wishlist WHERE user_id = ?').run(userId)
      const insert = db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)')
      for (const id of valid) insert.run(userId, id)
    })
    res.json({ ids: readWishlist(userId) })
  })

  return router
}
