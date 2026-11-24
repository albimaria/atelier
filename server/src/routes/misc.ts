import { Router } from 'express'
import { z } from 'zod'
import type { DB } from '../db'
import { parse } from '../lib/errors'

const startedAt = Date.now()

export function healthRoutes(db: DB) {
  const router = Router()
  router.get('/', (_req, res) => {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }
    res.json({
      status: 'ok',
      service: 'atelier-api',
      demo: true,
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      products: n,
      time: new Date().toISOString(),
    })
  })
  return router
}

const newsletterBody = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(120) })

export function newsletterRoutes(db: DB) {
  const router = Router()
  /** Idempotent: subscribing twice is not an error. */
  router.post('/', (req, res) => {
    const { email } = parse(newsletterBody, req.body)
    db.prepare('INSERT INTO newsletter (email) VALUES (?) ON CONFLICT DO NOTHING').run(email)
    res.status(201).json({ subscribed: true })
  })
  return router
}
