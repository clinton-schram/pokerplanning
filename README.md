# Poker Planning

Lightweight poker planning app built with Preact, Vite, TypeScript, and a Hono API.

## Prerequisites

- Node.js 22+
- npm

## Install

```bash
npm install
```

## Run locally

Start the API server in one terminal:

```bash
npm run dev:server
```

Start the frontend dev server in a second terminal:

```bash
npm run dev
```

Then open the Vite app in your browser:

- Frontend: http://localhost:5173
- API: http://localhost:3000

The frontend dev server proxies `/api` requests to the backend on port `3000`.

## Run the API without watch mode

```bash
npm start
```

You can override the API port with `PORT`:

```bash
PORT=4000 npm start
```

## Build

```bash
npm run build
```

## Run with Docker Compose

Start the full app in the background:

```bash
docker compose up -d
```

Then open http://localhost:3000 by default.

The Compose service sets `HOST=0.0.0.0` in the container so the app is reachable from your machine.

If you use the legacy Compose CLI, `docker-compose up -d` works with the included `docker-compose.yml` file.

To use a different host port:

```bash
APP_PORT=4000 docker compose up -d
```

Then open `http://localhost:4000`.

Stop it with:

```bash
docker compose down
```

## Run with Docker

Build the image manually:

```bash
docker build -t pokerplanning .
```

Run the full app:

```bash
docker run --rm -p 3000:3000 pokerplanning
```

Then open http://localhost:3000.

The container builds the frontend, and the Hono server serves both the API and the built app from the same port.

## Test

```bash
npm run test
```

For watch mode during development:

```bash
npm run test:watch
```

## Available scripts

- `npm run dev` - start the Vite frontend dev server
- `npm run dev:server` - start the API server in watch mode
- `npm start` - start the API server once
- `npm run build` - run TypeScript build and create the frontend production bundle
- `npm run preview` - preview the built frontend locally
- `npm run test` - run the test suite once
- `npm run test:watch` - run tests in watch mode
