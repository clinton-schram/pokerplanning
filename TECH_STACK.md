# Tech Stack Documentation - Poker Planning App (Lightweight Edition)

## Overview
This document outlines a lightweight tech stack designed to deliver a modern, responsive Poker Planning application with minimal dependencies, fast performance, and low operational overhead. The focus is on simplicity, speed, and essential functionality without unnecessary complexity.

## Philosophy
- **Minimal Dependencies**: Only include libraries that provide clear value
- **Modern UX**: Leverage modern web standards for smooth interactions
- **Fast Performance**: Optimize for speed without sacrificing usability
- **Easy Maintenance**: Simple codebase that's easy to understand and modify
- **Scalable Simplicity**: Design that grows gracefully without complexity bloat

---

## Frontend Architecture

### Framework & UI Library
- **Preact 10** (instead of React)
  - Lightweight React-like alternative (~4KB vs ~42KB for React)
  - Identical JSX syntax and component model
  - Excellent performance for interactive UIs
  - Minimal learning curve for React developers
  - Compatible with React ecosystem libraries

**Alternative:** Plain vanilla JavaScript with **htmx** for interactivity (ultra-lightweight)

### Build Tool
- **Vite**
  - Extremely fast development server (instant HMR)
  - Minimal configuration needed
  - Excellent for Preact projects
  - Production builds optimized automatically
  - ~20KB overhead (vs Webpack's 100KB+)

### Styling
- **Pico CSS** (recommended) or **classless CSS framework**
  - Minimal CSS framework (~10KB)
  - Semantic HTML automatically looks good
  - No utility classes to learn
  - Built-in dark mode support
  - Responsive by default
  
  **Alternative:** Hand-written CSS (5-10KB) for maximum control and minimal overhead
  
  **Or:** Tailwind CSS with aggressive purging (for familiar workflow, but larger)

### State Management
- **Preact Signals** (built into Preact ecosystem)
  - Tiny, reactive state management (~2KB)
  - No boilerplate or middleware
  - Fine-grained reactivity (only affected components re-render)
  - Simple to understand and use
  
  **Alternative:** Plain Context API if minimal state needed

**State Structure Example:**
```javascript
import { signal, effect } from '@preact/signals';

// Global state
export const currentUser = signal({ name: '', currentRoomId: null });
export const currentRoom = signal(null);
export const teamMembers = signal([]);
export const isRevealed = signal(false);

// Derived state
export const hasVoted = signal(false);
```

### UI Components
- **Preact-compatible component library:** (minimal option)
  - Build custom components (buttons, cards, modals)
  - ~500 lines of component code instead of large library
  - Full control over styling and behavior
  - Zero extra dependencies
  
  **Or:** **Shoelace** (web components, framework-agnostic, ~50KB)
  - Modern component library
  - Works with any framework
  - Beautiful default styling

### HTTP Client
- **Fetch API** (native browser API)
  - No external dependency needed
  - Lightweight wrapper for error handling
  
**Simple fetch wrapper example:**
```javascript
async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}
```

### Real-Time Communication
- **Native WebSocket API** with Socket.IO as optional enhancement
  - Lightweight direct WebSocket (~2KB for wrapper)
  - No dependency on Socket.IO library (~50KB)
  - Simple event emitter pattern for client-side
  
  **Alternative:** **Socket.IO** if fallback compatibility needed (~50KB total)

**WebSocket wrapper example:**
```javascript
class RoomSocket {
  constructor(roomId) {
    this.ws = new WebSocket(`wss://api.example.com/rooms/${roomId}`);
    this.listeners = {};
    this.ws.onmessage = e => {
      const { event, data } = JSON.parse(e.data);
      this.listeners[event]?.forEach(cb => cb(data));
    };
  }

  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    this.ws.send(JSON.stringify({ event, data }));
  }
}
```

### Browser Storage
- **localStorage API** (native browser API)
  - No dependency needed
  - Perfect for name caching
  - Simple key-value storage

**Total Frontend Bundle Size Target: 80-120KB gzipped**
- Preact: ~4KB
- Vite runtime: ~2KB
- Pico CSS: ~10KB
- Application code: ~20-30KB
- Socket wrapper: ~2KB
- Other dependencies: ~40-50KB

---

## Backend Architecture

### Runtime & Framework
- **Node.js with Hono** or **Express (minimal)**
  - Hono: Ultra-lightweight framework (~14KB), built for edge computing
  - Express: Familiar, ~50KB with middleware
  - TypeScript support for both
  - Minimal boilerplate
  
  **Alternative:** **Fastify** for better performance, lighter than Express

### Language
- **TypeScript (with strict mode)**
  - Static type safety
  - Better IDE support
  - Zero runtime overhead
  - Strict null checking

### API Design
- **RESTful JSON API** (simple and proven)
  - No GraphQL complexity
  - Stateless design
  - Standard HTTP methods and status codes

**Minimal Endpoints:**
```
POST   /api/rooms              - Create room
GET    /api/rooms/:roomId      - Get room state
POST   /api/rooms/:roomId/join - Join room with name
POST   /api/rooms/:roomId/vote - Submit vote
POST   /api/rooms/:roomId/reveal - Reveal votes
POST   /api/rooms/:roomId/reset  - Reset round
WS     /ws/rooms/:roomId       - WebSocket connection
```

### Real-Time Communication
- **Native WebSocket** (built into Node.js)
  - Lightweight implementation
  - No Socket.IO overhead
  - ~100 lines of code for room management
  
  **Alternative:** **ws** library (~50KB) for cleaner API if needed

**Room WebSocket example:**
```javascript
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req, roomId) => {
  ws.on('message', (data) => {
    const { event, payload } = JSON.parse(data);
    broadcastToRoom(roomId, { event, payload });
  });
});

function broadcastToRoom(roomId, message) {
  rooms[roomId]?.participants?.forEach(participant => {
    if (participant.ws?.readyState === WebSocket.OPEN) {
      participant.ws.send(JSON.stringify(message));
    }
  });
}
```

### Database
- **SQLite with better-sqlite3** (for small-medium scale)
  - Minimal setup, no server needed
  - Perfect for single-server deployments
  - File-based persistence
  - ACID compliance
  - Simple backups (just copy file)
  
  **Scale up to:** PostgreSQL only if needing true horizontal scaling

**Alternative:** **PostgreSQL 14+** if expecting high concurrency
  - ACID transactions
  - Better for multi-server deployments
  - More robust but more overhead

### ORM
- **Drizzle ORM** (lightweight, ~30KB)
  - Type-safe queries
  - No decorators or magical conventions
  - Works with SQLite and PostgreSQL
  - Minimal bundle impact
  
  **Alternative:** Hand-written SQL queries (~100 lines) for maximum control and zero dependencies

**Minimal Schema Example:**
```typescript
import { sql, Database } from 'better-sqlite3';

const db = new Database('poker.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    selected_card TEXT,
    has_voted BOOLEAN DEFAULT 0,
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  );
`);
```

### Optional Caching
- **No caching layer needed initially**
  - SQLite or PostgreSQL is fast enough for single/dual server
  - Add Redis only if monitoring shows need
  - Start simple, scale when data shows necessity

### Validation
- **Zod** (~15KB) or **no external validation**
  - Lightweight schema validation
  - TypeScript integration
  
  **Alternative:** Manual validation (~50 lines) for absolutely minimal overhead

### Error Handling
- Simple try/catch with structured errors
- Consistent error response format
- Minimal logging (stdout only, captured by container logs)

### Middleware (Keep Minimal)
- Only essential middleware:
  - CORS (built-in or 2KB library)
  - Body parser (Express built-in)
  - Compression (built-in)
  - No logging, no rate limiting until needed

**Total Backend Size: 2-5MB with dependencies**
- Node.js base image: ~150MB (Docker slim base)
- Dependencies: ~500MB (npm node_modules)
- Application code: ~50KB

---

## Database

### Primary Database
**Option A: SQLite (Recommended for simplicity)**
- File-based, zero configuration
- Perfect for single-server deployment
- Scales to 100K+ rooms without issue
- Automatic backups (copy file)
- Works great on VPS or single container

**Option B: PostgreSQL (Recommended for scale)**
- Use only if expecting 1M+ rooms or high concurrency
- More operational overhead (maintenance, backups, monitoring)
- Better for distributed deployments

### No Caching Layer
- Start without Redis
- Database queries are fast enough
- Add Redis only when metrics show necessity
- Monitor query performance

---

## Development Tools

### Version Control
- **Git + GitHub**
  - Standard workflow

### Package Management
- **npm** or **pnpm**
  - pnpm is faster and more efficient
  - Better monorepo support if needed later

### Testing
- **Vitest** (~10MB with dependencies)
  - Lightning-fast test runner
  - Jest-compatible syntax
  - Zero-config for Vite projects
  
  **Tests needed:**
  - API endpoint tests (~50 lines each)
  - WebSocket message flow tests (~30 lines each)
  - UI component interaction tests (~40 lines each)
  
  **Skip:** E2E testing initially, use manual testing + monitoring

### Linting & Formatting
- **Biome** (~50MB)
  - Lightning-fast linter + formatter
  - Single tool replaces ESLint + Prettier
  - Minimal config
  
  **Alternative:** Just use Prettier if minimizing tooling

### Type Checking
- **TypeScript compiler** (included)
  - Strict mode enabled
  - Check during build

### Documentation
- **README.md + inline comments**
  - No need for Storybook or Swagger initially
  - Simple implementation examples in code

---

## Deployment & Infrastructure

### Containerization
- **Docker** (essential even for single-server)
  - Lightweight Node.js image (~180MB)
  - Slim or Alpine base for minimal size

**Minimal Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Hosting Options (Minimal Operations)
**Option A: Simple VPS (~$5-10/month)**
- DigitalOcean Droplet (1GB RAM, 1 vCPU)
- Linode, Vultr, or Hetzner
- Docker Compose for container management
- Manual deployment or simple CI/CD

**Option B: Platform-as-a-Service**
- **Railway.app** (~$5-20/month)
  - Simple deployment, automatic SSL
  - Great for small apps
  - Good free tier
- **Render.com** (similar to Railway)
- **Fly.io** (good performance)

**Option C: Serverless (avoid initially)**
- Higher costs for small/medium apps
- Overkill complexity for this use case
- Stick with traditional VPS/PaaS

### Frontend Hosting
- **Vercel** (free for public repos)
  - Optimized for frontend
  - Automatic deployments
  - Global CDN
- **Netlify** (free tier available)
- **GitHub Pages** + backend API separately

### CI/CD Pipeline
- **GitHub Actions** (free)
  - Minimal workflow configuration
  
**Simple workflow:**
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: npm ci && npm run build && npm test
      - run: docker build -t app:latest .
      - run: docker push registry.example.com/app:latest
```

### Monitoring (Keep Minimal)
- **No external monitoring initially**
  - Use container logs (stdout)
  - Monitor from hosting provider dashboard
  
- **Add only if needed:**
  - Basic health checks (/health endpoint)
  - Error tracking: Sentry free tier
  - Uptime monitoring: UptimeRobot free tier

### Performance Targets
- **Frontend Load:** < 2 seconds
- **First Contentful Paint:** < 1.5 seconds
- **Bundle Size:** 100KB gzipped max
- **API Response:** < 100ms p95
- **WebSocket Latency:** < 50ms

---

## Security (Lightweight Approach)

### Frontend
- Content Security Policy headers
- HTTPS only (automatic with most hosting)
- No sensitive data in localStorage except username

### Backend
- HTTPS/TLS (automatic with most hosting)
- Basic CORS configuration
- Input validation with Zod
- No authentication initially (rooms are public links)
  - Add JWT later if needed

### Database
- Encrypted connections (default in most setups)
- Regular backups to separate storage

### Dependency Security
- **Dependabot** automated updates
- `npm audit` before deployment
- Minimal dependencies reduce attack surface

---

## Lightweight Tech Stack Summary

### Frontend
```
Preact (4KB) + Vite + Pico CSS (10KB) + Signals = 
Fast, modern, lightweight UX (~100KB gzipped total)
```

### Backend
```
Hono/Express + TypeScript + SQLite + WebSocket =
Simple, maintainable, single-server deployment
```

### Deployment
```
Docker + GitHub Actions + VPS/Railway =
Simple, low-cost, easy to manage
```

### Total Infrastructure Cost
- **Development:** Free (GitHub, local machine)
- **Production:** $5-20/month (VPS) or free-$50/month (PaaS)
- **Database:** Free (SQLite) or included (PaaS)
- **Monitoring:** Free (provider logs) or $20-50/month (optional Sentry)

---

## Recommended Lightweight Stack

### Frontend
- **Preact 10** + TypeScript
- **Vite** for build tooling
- **Pico CSS** for styling (or hand-written CSS)
- **Preact Signals** for state management
- **Native Fetch API** for HTTP
- **Native WebSocket API** for real-time
- **Total bundle: ~100KB gzipped**

### Backend
- **Hono** + TypeScript (or Node.js/Express)
- **SQLite** with better-sqlite3 (or PostgreSQL if scaling)
- **Native WebSocket** for real-time
- **Zod** for validation
- **Vitest** for testing

### Deployment
- **Docker** containerization
- **GitHub Actions** for CI/CD
- **Railway.app** or DigitalOcean VPS for hosting
- **GitHub Pages** for frontend
- **Sentry free tier** for error tracking (optional)

### Development Tools
- **Biome** for linting/formatting
- **TypeScript** for type safety
- **Vitest** for unit tests
- **Minimal pre-commit hooks** (just formatter check)

### Performance Characteristics
- **Initial Load:** 1-2 seconds
- **Bundle Size:** 100KB gzipped
- **Time to Interactive:** <1.5 seconds
- **API Latency:** 30-100ms
- **WebSocket Connect:** <50ms
- **Memory Usage:** 50-100MB per process
- **Monthly Cost:** $5-20

---

## When to Add Complexity

Only add the following when you have metrics showing need:

| Feature | Add When |
|---------|----------|
| Redis | Database queries > 50ms at peak |
| PostgreSQL | > 100K concurrent users |
| Logging (ELK) | > 1000 errors/day |
| Rate Limiting | > 100 requests/second per user |
| API Gateway | > 2 backend instances |
| CDN | > 1000 requests/second globally |
| Authentication | Multiple user roles needed |
| Advanced Analytics | Using data for business decisions |

---

## Migration Path (If Needed)

As the app grows, migrate incrementally:

1. **0-1K rooms:** SQLite + single VPS
2. **1K-10K rooms:** PostgreSQL + single VPS
3. **10K-100K rooms:** PostgreSQL + 2 backend instances + load balancer
4. **100K+ rooms:** PostgreSQL + 3+ instances + Redis + CDN

Each step is optional and only needed when current setup shows bottlenecks.

---

## Competitive UX While Staying Lightweight

### Modern Interactions (Minimal Code)
```javascript
// Smooth transitions with Web Animations API
element.animate([{ opacity: 0 }, { opacity: 1 }], 300);

// Responsive design with CSS Grid
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

// Instant feedback on button clicks
button.addEventListener('click', () => {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => button.style.transform = '', 100);
});
```

### Progressive Enhancement
- Core functionality works without JavaScript
- WebSocket connection optional (fallback to polling)
- Graceful degradation on older browsers
- Mobile-first responsive design

This approach delivers a competitive, modern UX without the bloat of heavy frameworks.
