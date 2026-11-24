import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config'
import type { DB } from '../db'
import { requireAuth, signToken } from '../lib/auth'
import { HttpError, parse } from '../lib/errors'

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(120)

const registerBody = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
})

const loginBody = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(72),
})

type UserRow = { id: number; name: string; email: string; password_hash: string; created_at: string }

const publicUser = (u: UserRow) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at })

export function authRoutes(db: DB) {
  const router = Router()
  const byEmail = db.prepare('SELECT * FROM users WHERE email = ?')

  router.post('/register', (req, res) => {
    const body = parse(registerBody, req.body)
    if (byEmail.get(body.email)) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'An account with that email already exists.')
    }
    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(body.name, body.email, bcrypt.hashSync(body.password, 10))
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid) as UserRow
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
  })

  router.post('/login', (req, res) => {
    const body = parse(loginBody, req.body)
    const user = byEmail.get(body.email) as UserRow | undefined
    // Same message for unknown email and wrong password, so accounts can't be enumerated.
    if (!user || !bcrypt.compareSync(body.password, user.password_hash)) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }
    res.json({ token: signToken(user.id), user: publicUser(user) })
  })

  /** One-click sign-in to the seeded demo account, for reviewers. */
  router.post('/demo', (_req, res) => {
    const user = byEmail.get(config.demoUser.email) as UserRow
    res.json({ token: signToken(user.id), user: publicUser(user) })
  })

  router.get('/me', requireAuth, (_req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(res.locals.userId) as UserRow | undefined
    if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'This account no longer exists.')
    res.json({ user: publicUser(user) })
  })

  return router
}
