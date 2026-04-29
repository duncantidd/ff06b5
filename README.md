# ff06b5 — Cyberpunk Countdown

A Svelte 5 countdown timer to 1 January 2077, featuring a real-time face landmark scanner (powered by MediaPipe), glitch effects, and a full cyberpunk aesthetic.

**Stack:** SvelteKit · Svelte 5 (runes) · TypeScript · Tailwind CSS v4 · `@mediapipe/tasks-vision` · Node adapter

---

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) (for containerised workflows)

---

## Development

### Local (without Docker)

```sh
# Install dependencies
npm install

# Start the Vite dev server with HMR
npm run dev

# Open in browser automatically
npm run dev -- --open
```

The dev server runs at **http://localhost:5173**.

### Docker (recommended)

The `dev` service mounts your local source into the container so edits are reflected instantly without rebuilding.

```sh
# Build and start the dev container
docker compose up dev

# Rebuild after dependency changes (package.json updated)
docker compose up dev --build
```

The app is available at **http://localhost:7702** (mapped from container port 5173).

To stop:

```sh
docker compose down
```

---

## Production

### Build locally and preview

```sh
# Compile the SvelteKit app with adapter-node
npm run build

# Preview the production build locally (not for real traffic)
npm run preview
```

The preview server runs at **http://localhost:4173**.

### Docker (recommended for deployment)

The production Dockerfile uses a two-stage build:

1. **Builder** — installs all deps, runs `vite build`, then prunes dev dependencies.
2. **Runner** — copies only the compiled `build/`, pruned `node_modules/`, and `package.json` into a minimal Node 22 Alpine image.

```sh
# Build and start the production container
docker compose up prod --build -d

# View logs
docker compose logs -f prod

# Stop and remove the container
docker compose down
```

The app is served at **http://localhost:2077** (mapped from container port 3000).

#### Rebuild after code changes

Every code change requires a fresh image build since source is baked in (not mounted):

```sh
docker compose up prod --build -d
```

#### Build the image manually (without Compose)

```sh
docker build -t ff06b5:latest .

docker run -d \
  --name ff06b5-prod \
  -p 2077:3000 \
  -e NODE_ENV=production \
  ff06b5:latest
```

---

## Port reference

| Service | Host port | Container port | Access URL |
|---------|-----------|----------------|------------|
| `dev`   | 7702      | 5173 (Vite)    | http://localhost:7702 |
| `prod`  | 2077      | 3000 (Node)    | http://localhost:2077 |

---

## Project structure

```
src/
├── routes/
│   ├── +layout.svelte     # Root layout — imports global CSS, sets favicon
│   ├── +page.svelte        # Home page — renders <CountdownTimer>
│   └── layout.css          # Global styles (Tailwind, CRT screen, glitch shards)
└── lib/
    ├── components/
    │   ├── CountdownTimer.svelte  # Countdown to 2077 with glitch animation
    │   └── FaceScan.svelte        # MediaPipe face landmark scanner on canvas
    └── assets/
        └── favicon.svg
static/
├── cyberpunk_logo.png
├── honeycomb2-light.png
└── extreme_facial_closeup.png   # Source image for the face scanner
```

---

## Useful commands

```sh
# Type-check the project
npm run check

# Type-check in watch mode
npm run check:watch

# Regenerate SvelteKit type declarations (fixes "cannot find module" errors)
npm run prepare
```

---

## Recreate from scratch

```sh
npx sv@0.15.1 create --template minimal --types ts --install npm .
```
