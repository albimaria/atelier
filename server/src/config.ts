const env = process.env

const isProd = env.NODE_ENV === 'production'

if (isProd && !env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}

export const config = {
  isProd,
  port: Number(env.PORT ?? 4000),
  jwtSecret: env.JWT_SECRET ?? 'dev-only-secret-not-for-production',
  jwtTtl: '7d',
  dbPath: env.DB_PATH ?? 'data/atelier.db',
  corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  demoUser: {
    name: 'Demo Shopper',
    email: 'demo@atelier.dev',
    password: 'atelier-demo',
  },
} as const
