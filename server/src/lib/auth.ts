import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { HttpError } from './errors'

type Claims = { sub: string }

export function signToken(userId: number) {
  return jwt.sign({ sub: String(userId) } satisfies Claims, config.jwtSecret, {
    expiresIn: config.jwtTtl,
    algorithm: 'HS256',
  })
}

function readUserId(header: string | undefined): number | null {
  if (!header?.startsWith('Bearer ')) return null
  try {
    const claims = jwt.verify(header.slice(7), config.jwtSecret, { algorithms: ['HS256'] }) as Claims
    const id = Number(claims.sub)
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

/** Rejects the request unless it carries a valid bearer token. Sets res.locals.userId. */
export const requireAuth: RequestHandler = (req, res, next) => {
  const id = readUserId(req.headers.authorization)
  if (id === null) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.')
  res.locals.userId = id
  next()
}

/** Attaches res.locals.userId when a valid token is present, but never rejects. */
export const optionalAuth: RequestHandler = (req, res, next) => {
  const id = readUserId(req.headers.authorization)
  if (id !== null) res.locals.userId = id
  next()
}
