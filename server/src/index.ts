import { createApp } from './app'
import { config } from './config'
import { openDb } from './db'

const db = openDb()
const app = createApp(db)

const server = app.listen(config.port, () => {
  console.log(`Atelier API listening on http://localhost:${config.port} (docs at /api/docs)`)
})

function shutdown() {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
