# Atelier

A premium fashion and lifestyle storefront with an immersive 3D interface, in dark and light themes.

**Live site:** _link added after the first deploy_

## Highlights

- **3D hero ring:** a draggable cylinder carousel of products with momentum, depth shading and pointer parallax
- **Coverflow categories:** swipe, drag, keyboard or autoplay
- **Swipeable card deck** for new arrivals, a **3D card fan** for moods and a **tilted infinite product wall** for trending pieces
- **Tilt cards** with specular glare, layered depth scenes and scroll-triggered 3D reveals
- **Dark and light themes** that persist across visits without a flash of the wrong theme
- Cart, wishlist and recent searches saved in `localStorage`
- Respects `prefers-reduced-motion`

All 3D effects are pure CSS transforms and React, with no WebGL or animation libraries.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router

## Run locally

```bash
npm install
npm run dev
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
