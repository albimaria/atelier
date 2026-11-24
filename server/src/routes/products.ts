import { Router } from 'express'
import { z } from 'zod'
import type { Product } from '../../../src/types'
import type { DB } from '../db'
import { HttpError, parse } from '../lib/errors'

const flag = z.enum(['1', 'true', '0', 'false']).transform((v) => v === '1' || v === 'true')

const query = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().max(40).optional(),
  gender: z.enum(['Women', 'Men', 'Unisex']).optional(),
  mood: z.string().max(40).optional(),
  size: z.string().max(10).optional(),
  color: z.string().max(40).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  new: flag.optional(),
  sale: flag.optional(),
  trending: flag.optional(),
  sort: z.enum(['featured', 'newest', 'price-asc', 'price-desc', 'rating']).default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(48),
})

const orderBy: Record<z.infer<typeof query>['sort'], string> = {
  featured: 'is_trending DESC, sort_order ASC',
  newest: 'is_new DESC, sort_order ASC',
  'price-asc': 'price ASC, sort_order ASC',
  'price-desc': 'price DESC, sort_order ASC',
  rating: 'rating DESC, sort_order ASC',
}

type Row = { data: string }
const toProduct = (row: Row) => JSON.parse(row.data) as Product

export function productRoutes(db: DB) {
  const router = Router()

  /** List products with server-side filtering, sorting and pagination. */
  router.get('/', (req, res) => {
    const f = parse(query, req.query)
    const where: string[] = []
    const params: (string | number)[] = []

    if (f.q) {
      where.push(`(name LIKE ? OR category LIKE ? OR json_extract(data, '$.description') LIKE ?)`)
      const like = `%${f.q}%`
      params.push(like, like, like)
    }
    const eq = (sql: string, value: string | number | undefined) => {
      if (value === undefined || value === '') return
      where.push(sql)
      params.push(value)
    }
    eq('category = ?', f.category)
    eq(`(gender = ? OR gender = 'Unisex')`, f.gender)
    eq('mood = ?', f.mood)
    eq('price >= ?', f.minPrice)
    eq('price <= ?', f.maxPrice)
    if (f.new) where.push('is_new = 1')
    if (f.sale) where.push('is_sale = 1')
    if (f.trending) where.push('is_trending = 1')
    if (f.size) {
      where.push(`EXISTS (SELECT 1 FROM json_each(data, '$.sizes') WHERE value = ?)`)
      params.push(f.size)
    }
    if (f.color) {
      where.push(`EXISTS (SELECT 1 FROM json_each(data, '$.colors') WHERE json_extract(value, '$.name') = ?)`)
      params.push(f.color)
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM products ${clause}`).get(...params) as { total: number }
    const rows = db
      .prepare(`SELECT data FROM products ${clause} ORDER BY ${orderBy[f.sort]} LIMIT ? OFFSET ?`)
      .all(...params, f.limit, (f.page - 1) * f.limit) as Row[]

    res.json({
      items: rows.map(toProduct),
      total,
      page: f.page,
      pages: Math.max(1, Math.ceil(total / f.limit)),
    })
  })

  /** Categories with product counts. */
  router.get('/categories', (_req, res) => {
    const rows = db
      .prepare('SELECT category AS name, COUNT(*) AS count FROM products GROUP BY category ORDER BY MIN(sort_order)')
      .all()
    res.json({ items: rows })
  })

  /** One product plus up to four related pieces (same category or mood). */
  router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT data, category, mood FROM products WHERE id = ?').get(String(req.params.id)) as
      | (Row & { category: string; mood: string })
      | undefined
    if (!row) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'That product does not exist.')

    const related = db
      .prepare('SELECT data FROM products WHERE id != ? AND (category = ? OR mood = ?) ORDER BY sort_order LIMIT 4')
      .all(String(req.params.id), row.category, row.mood) as Row[]

    res.json({ product: toProduct(row), related: related.map(toProduct) })
  })

  return router
}
