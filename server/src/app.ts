import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { config } from './config'
import type { DB } from './db'
import { errorHandler, HttpError, notFound } from './lib/errors'
import { openapi } from './openapi'
import { accountRoutes } from './routes/account'
import { authRoutes } from './routes/auth'
import { healthRoutes, newsletterRoutes } from './routes/misc'
import { orderRoutes } from './routes/orders'
import { productRoutes } from './routes/products'

type Options = { rateLimit?: boolean }

export function createApp(db: DB, { rateLimit: limit = true }: Options = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // behind the hosting provider's proxy; needed for per-IP rate limits

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server (no Origin header) and the configured frontends.
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true)
        cb(new HttpError(403, 'CORS_BLOCKED', `Origin ${origin} is not allowed.`))
      },
      maxAge: 86400,
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  if (limit) {
    const window = 15 * 60 * 1000
    const tooMany = { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } }
    app.use('/api', rateLimit({ windowMs: window, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false, message: tooMany }))
    app.use(
      ['/api/auth/login', '/api/auth/register'],
      rateLimit({ windowMs: window, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: tooMany }),
    )
  }

  // Interactive docs need inline scripts, so they get a relaxed CSP; the JSON API keeps helmet's defaults.
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openapi)
  })
  app.use('/api/docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openapi, {
    customSiteTitle: 'Atelier API docs',
    swaggerOptions: { persistAuthorization: true },
  }))
  app.use(helmet())

  app.get('/', (_req, res) => res.redirect('/api/docs'))
  app.use('/api/health', healthRoutes(db))
  app.use('/api/products', productRoutes(db))
  app.use('/api/auth', authRoutes(db))
  app.use('/api/account', accountRoutes(db))
  app.use('/api/orders', orderRoutes(db))
  app.use('/api/newsletter', newsletterRoutes(db))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
