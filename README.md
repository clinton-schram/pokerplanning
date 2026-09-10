# Poker Planning

Lightweight poker planning app built with Preact, Vite, TypeScript, and a Hono API.

## Prerequisites

- Node.js 20+
- npm

## Install

```bash
npm install
```

## Run locally

Start both the API and frontend dev servers:

```bash
npm run dev
```

If you need to run only the frontend dev server:

```bash
npm run dev:client
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

## Test

```bash
npm run test
```

For watch mode during development:

```bash
npm run test:watch
```

## Available scripts

- `npm run dev` - start both API and frontend dev servers in watch mode
- `npm run dev:client` - start only the Vite frontend dev server
- `npm run dev:server` - start the API server in watch mode
- `npm start` - start the API server once
- `npm run build` - run TypeScript build and create the frontend production bundle
- `npm run preview` - preview the built frontend locally
- `npm run test` - run the test suite once
- `npm run test:watch` - run tests in watch mode
