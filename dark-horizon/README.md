# DARK HORIZON

A fast, responsive space shooter built with HTML5 Canvas, CSS, and vanilla JavaScript (ES Modules).

## Quick start

Because the app uses ES modules (`type="module"` in `index.html`), you must run it from a web server (opening the file directly will fail with a module/CORS error).

- Option A – VS Code: install the “Live Server” extension and click “Go Live”.
- Option B – Python 3 built‑in server (Windows PowerShell):
  - Prefer: `py -m http.server 8000`
  - Fallback: `python -m http.server 8000`
  - Then open http://localhost:8000
- Option C – Node (if installed): `npx serve -l 8000 .`

Troubleshooting
- Blank page or “Failed to load module script/CORS”: you’re likely opening `index.html` via file://. Start a local server (see above).
- “python is not recognized”: use `py -m http.server 8000`, or install Python 3 from python.org.
- High score not saving: your browser may be blocking `localStorage` in private mode.

## How to play

- Move: Arrow keys or WASD, or move your mouse/touch to guide the ship
- Shoot: Space, mouse click, or tap
- Score: +20 per star collected, +10 per asteroid destroyed
- Game over: Collide with an asteroid
- Restart: Click “Launch Mission” or “Play Again”

## Features

- Responsive on desktop, tablet, and mobile
- Multiple inputs: keyboard, mouse, and touch
- Smooth 60fps animations with requestAnimationFrame
- Starfield, nebulae, engine glow, explosions, and particle effects
- High score saved with `localStorage`

## Project structure

- `index.html` – App shell and canvas
- `style.css` – Layout and responsive styles
- `game.js` – Game loop, input, state, rendering
- `entities.js` – Entities (Player, Asteroid, Bullet, Star, FX, Background)
- `constants.js` – Tunable settings (colors, sizes, speeds, spawn rates)
- `favicon.png` – Site icon

## Technical notes

- HTML5 Canvas rendering with gradients and shadows for visual depth
- ES modules split logic across `game.js`, `entities.js`, and `constants.js`
- Mobile friendly: touch events and slightly slower asteroid speed on phones
- High score key: `darkHorizonHighScore` in `localStorage`

## Deploy

This is a static site. You can host it anywhere that serves static files:

- GitHub Pages: push the repo, enable Pages for the main branch/root
- Netlify/Vercel: drag‑and‑drop the folder or connect the repo (no build step)

## Attributions

Inspired by classic arcade shooters. Built for fun and learning.