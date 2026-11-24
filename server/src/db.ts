import bcrypt from 'bcryptjs'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
// The catalogue is shared with the frontend so both sides always agree on products and prices.
import { products } from '../../src/data/products'
import { config } from './config'

export type DB = DatabaseSync

const schema = `
CREATE TABLE IF NOT EXISTS products (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  gender         TEXT NOT NULL,
  mood           TEXT NOT NULL,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  rating         REAL NOT NULL,
  is_new         INTEGER NOT NULL DEFAULT 0,
  is_trending    INTEGER NOT NULL DEFAULT 0,
  is_sale        INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL,
  data           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  size       TEXT NOT NULL,
  color      TEXT NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  PRIMARY KEY (user_id, product_id, size, color)
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  number     TEXT NOT NULL UNIQUE,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  address    TEXT NOT NULL,
  subtotal   INTEGER NOT NULL,
  shipping   INTEGER NOT NULL,
  tax        INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  status     TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS order_items (
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  image      TEXT NOT NULL,
  price      INTEGER NOT NULL,
  size       TEXT NOT NULL,
  color      TEXT NOT NULL,
  quantity   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter (
  email      TEXT PRIMARY KEY COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
`

/** Run `fn` inside a transaction; roll back if it throws. */
export function transaction<T>(db: DB, fn: () => T): T {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

function seedProducts(db: DB) {
  const upsert = db.prepare(`
    INSERT INTO products (id, name, category, gender, mood, price, original_price, rating, is_new, is_trending, is_sale, sort_order, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, category = excluded.category, gender = excluded.gender, mood = excluded.mood,
      price = excluded.price, original_price = excluded.original_price, rating = excluded.rating,
      is_new = excluded.is_new, is_trending = excluded.is_trending, is_sale = excluded.is_sale,
      sort_order = excluded.sort_order, data = excluded.data
  `)
  transaction(db, () => {
    products.forEach((p, i) => {
      upsert.run(
        p.id, p.name, p.category, p.gender, p.mood, p.price, p.originalPrice, p.rating,
        Number(p.isNew), Number(p.isTrending), Number(p.isSale), i, JSON.stringify(p),
      )
    })
  })
}

/** A ready-made account so reviewers can explore signed-in features without registering. */
function seedDemoUser(db: DB) {
  const { name, email, password } = config.demoUser
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined
  if (existing) return

  transaction(db, () => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, bcrypt.hashSync(password, 10))
    const userId = Number(lastInsertRowid)

    const [first, second] = products
    const insertWish = db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)')
    insertWish.run(userId, products[2].id)
    insertWish.run(userId, products[5].id)

    // One past order so the order-history screen has something to show.
    const items = [
      { p: first, quantity: 1 },
      { p: second, quantity: 1 },
    ]
    const subtotal = items.reduce((s, i) => s + i.p.price * i.quantity, 0)
    const tax = Math.round(subtotal * 0.08)
    const { lastInsertRowid: orderId } = db
      .prepare(
        `INSERT INTO orders (number, user_id, name, email, address, subtotal, shipping, tax, total, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'delivered', ?)`,
      )
      .run(
        'ATL-DEMO-0001', userId, name, email,
        JSON.stringify({ address: '12 Demo Street', city: 'Sample City', postalCode: '00000' }),
        subtotal, tax, subtotal + tax, '2026-10-02T10:24:00.000Z',
      )
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, name, image, price, size, color, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const { p, quantity } of items) {
      insertItem.run(Number(orderId), p.id, p.name, p.images[0], p.price, p.sizes[0], p.colors[0].name, quantity)
    }
  })
}

export function openDb(path = config.dbPath): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA foreign_keys = ON;')
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;')
  db.exec(schema)
  seedProducts(db)
  seedDemoUser(db)
  return db
}
