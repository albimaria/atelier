# Atelier

A full-stack fashion storefront with an immersive 3D interface and a REST API.

> **This is a portfolio project, not a real shop.** It exists to show frontend and backend engineering to interviewers and recruiters. Nothing is sold, no payment is taken, and nothing is shipped. Demo data resets on its own.

**Live site:** https://albimaria.github.io/atelier/  
**Demo account:** click *Explore with the demo account* on the sign-in page, or use `demo@atelier.dev` / `atelier-demo`

## What to look at

### Frontend
- **3D interface built only with CSS transforms and React** (no WebGL): a draggable product ring with momentum and depth shading, coverflow categories, a swipeable card deck, a 3D card fan and a tilted infinite product wall
- Tilt cards with specular glare, layered depth scenes and scroll-triggered 3D reveals
- Dark and light themes that persist without a flash of the wrong theme; respects `prefers-reduced-motion`
- Shop filters, product pages, cart, wishlist, checkout, sign-in/registration and order history
- **Resilient API client:** shows live API status, waits for a sleeping free-tier server, and falls back to a local demo mode if the API is unreachable, so the site never breaks

### Backend (`/server`)
- **Node.js + Express 5 + TypeScript**, with **SQLite** via Node's built-in `node:sqlite` (no native dependencies)
- **Products API** with server-side filtering, search, sorting and pagination in SQL (including JSON-column filters for sizes and colours)
- **Auth:** registration and login with bcrypt-hashed passwords and JWT bearer tokens; a one-click demo account for reviewers
- **Cart and wishlist** saved per account and merged with the guest cart on sign-in
- **Orders priced on the server.** The API ignores client-sent prices and computes shipping and tax with the same rules module the frontend uses
- **Hardening:** zod request validation, a consistent error format, Helmet security headers, a CORS allowlist, rate limiting (stricter on auth routes), body size limits and no account enumeration on login
- **Interactive API docs** (OpenAPI 3.1 + Swagger UI) at `/api/docs`
- **18 integration tests** (Vitest + Supertest) run in CI before every deploy

## Architecture

```
GitHub Pages (React SPA) ──HTTPS/JSON──▶ Render (Express API) ──▶ SQLite
        │                                        │
        └──── shared catalogue + pricing rules ──┘   (src/data, src/services/pricing.ts)
```

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Service status |
| `GET /api/products` | List with `q`, `category`, `gender`, `mood`, `size`, `color`, `minPrice`, `maxPrice`, `new`, `sale`, `sort`, `page`, `limit` |
| `GET /api/products/:id` | Product and related pieces |
| `POST /api/auth/register` · `login` · `demo` | Get a JWT |
| `GET /api/auth/me` | Current user |
| `GET/PUT /api/account/cart` · `wishlist` | Saved cart and wishlist |
| `POST /api/orders` · `GET /api/orders` | Place a demo order · order history |
| `POST /api/newsletter` | Subscribe |

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Node.js · Express 5 · SQLite · zod · JWT · Vitest · GitHub Actions · GitHub Pages · Render

## Run locally

```bash
npm install && npm --prefix server install
npm run dev:api     # API on http://localhost:4000 (docs at /api/docs)
npm run dev         # site on http://localhost:5173
npm run test:api    # backend tests
```

The frontend reads the API address from `VITE_API_URL` (see `.env.development`). Without it, the site runs in local demo mode.

## Deployment

- **Frontend:** every push to `main` runs the API tests, then builds and publishes the site to GitHub Pages ([`deploy.yml`](.github/workflows/deploy.yml)).
- **API:** [`render.yaml`](render.yaml) is a Render Blueprint (free tier). Set the repository variable `VITE_API_URL` to the API's public URL so the site connects to it.
