# DARK HORIZON

Fast, responsive space shooter built with HTML5 Canvas and vanilla JavaScript (ES modules). Collect stars, blast asteroids, and chase a new high score.

## Quick start

Because `index.html` loads ES modules (`type="module"`), the game must run from a web server (file:// won’t work).

- Option A — VS Code Live Server: install “Live Server”, then click “Go Live”.
- Option B — Windows PowerShell (Python 3):
  - Preferred: `py -m http.server 8000`
  - Fallback: `python -m http.server 8000`
  - Then open http://localhost:8000
- Option C — Node.js (if installed): `npx serve -l 8000 .`

### Troubleshooting

- Blank page or “Failed to load module script/CORS” → you opened via file://. Start a server (see above).
- `python` not recognized on Windows → use `py -m http.server 8000`.
- Port already in use → try another port, e.g. `py -m http.server 5500`.
- High score not saving → Private/Incognito may block `localStorage`.

## How to play

- Move: Arrow keys or WASD, or guide with mouse/touch
- Shoot: Space, mouse click, or tap
- Score: +20 per star, +10 per asteroid
- Game over: Collide with an asteroid
- Restart: Click “Launch Mission” or “Play Again”

## Features

- Desktop and mobile friendly (keyboard, mouse, and touch)
- Smooth animations with requestAnimationFrame
- Starfield, nebulae, engine glow, explosions, and particle FX
- High score persisted with `localStorage`

## Project structure

- `index.html` — App shell and canvas
- `style.css` — Layout and responsive styles
- `game.js` — Game loop, input, state, rendering
- `entities.js` — Entities (Player, Asteroid, Bullet, Star, FX, Background)
- `constants.js` — Tunable settings (colors, sizes, speeds, spawn rates)
- `favicon.png` — Site icon

## Technical notes

- Canvas-based rendering with gradients and shadows
- ES modules split logic across `game.js`, `entities.js`, and `constants.js`
- Mobile tweaks: touch controls and reduced asteroid speed
- High score key: `darkHorizonHighScore` in `localStorage`

## Deploy

This is a static site—no build step required. Host anywhere that serves static files:

- GitHub Pages: push the repo, enable Pages for the root of the main branch
- Netlify/Vercel: drag-and-drop the folder or connect the repo

— Inspired by classic arcade shooters. Enjoy the flight.
