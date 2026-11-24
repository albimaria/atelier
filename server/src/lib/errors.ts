import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError, type ZodType } from 'zod'

/** An error with an HTTP status and a stable machine-readable code. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

/** Parse `input` with a zod schema or throw a 400 with field-level issues. */
export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Some fields are missing or invalid.',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    )
  }
  return result.data
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`))
}

/** Every error leaves the API in the same shape: { error: { code, message, details? } }. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: err.issues } })
    return
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' } })
    return
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } })
    return
  }
  console.error(err)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
}
