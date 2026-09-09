# Tech Stack Documentation - Poker Planning App

## Overview
This document outlines the recommended technology stack for building the Poker Planning application. The stack is designed to support real-time multiplayer functionality, responsive UI, efficient state management, and scalability.

## Frontend Architecture

### Framework & UI Library
- **React 18+** (or Vue 3 / Svelte as alternatives)
  - Component-based architecture for modular UI
  - Virtual DOM for efficient rendering and updates
  - Excellent ecosystem and community support
  - React Router for client-side routing (room creation, joining, gameplay)
  - Server-Side Rendering (SSR) capability via Next.js for SEO and performance

### Build Tool & Module Bundler
- **Vite** (recommended) or Webpack
  - Vite: Fast build times, modern ES modules, excellent dev experience
  - Hot Module Replacement (HMR) for rapid development iteration
  - Optimized production builds with tree-shaking
  - Support for environment variables and configuration

### State Management
- **Redux Toolkit** or **Zustand**
  - Redux Toolkit: Industry standard, powerful devtools, middleware support
  - Zustand: Lightweight, minimal boilerplate, simpler learning curve
  - Store centralized app state (room data, team members, votes, reveal status)
  - Actions for room creation, joining, card selection, reveal/reset

**State Structure Example:**
```javascript
{
  rooms: {
    [roomId]: {
      id: string,
      createdAt: timestamp,
      participants: [{ id, name, selectedCard, hasVoted }],
      isRevealed: boolean,
      availableCards: string[]
    }
  },
  currentUser: {
    name: string,
    currentRoomId: string | null
  },
  ui: {
    loading: boolean,
    error: string | null
  }
}
```

### Styling & CSS
- **Tailwind CSS** (recommended) or Styled Components
  - Tailwind CSS: Utility-first approach, consistent design, minimal CSS size
  - Pre-built components library (Headless UI, shadcn/ui)
  - Responsive design utilities for mobile/tablet/desktop
  - Dark mode support out-of-the-box
  
  **Alternative:** Styled Components for CSS-in-JS approach

### UI Component Libraries
- **shadcn/ui** or **Headless UI**
  - Pre-built, accessible, unstyled components
  - Modal/dialog for name entry
  - Button, card, input components
  - Dialog for room creation/joining flows

### Form Management
- **React Hook Form**
  - Lightweight form handling
  - Validation with Zod or Yup
  - Minimal re-renders
  - Better performance than Formik

### HTTP Client
- **Axios** or **Fetch API** with wrapper
  - API calls to backend (room creation, joining, submitting votes)
  - Error handling and retry logic
  - Request/response interceptors

### WebSocket Client (for real-time multiplayer)
- **Socket.IO Client** or **Native WebSocket API**
  - Real-time updates when members join/leave
  - Live vote count and card reveals
  - Automatic reconnection handling
  - Broadcasting vote changes to all room participants

---

## Backend Architecture

### Runtime & Server Framework
- **Node.js + Express** (recommended) or **FastAPI (Python)**
  - Node.js + Express: JavaScript full-stack, excellent async support, large ecosystem
  - FastAPI: Python performance, async support, automatic API documentation
  - Alternative: Next.js API Routes for fullstack JavaScript/React solution

### Language
- **TypeScript**
  - Type safety for server-side code
  - Better IDE support and refactoring
  - Catches errors at compile-time rather than runtime
  - Improved code maintainability and documentation

### API Architecture
- **RESTful API** with optional GraphQL
  - RESTful endpoints:
    - `POST /api/rooms` - Create a new room
    - `GET /api/rooms/:roomId` - Get room details
    - `POST /api/rooms/:roomId/join` - Join a room
    - `POST /api/rooms/:roomId/vote` - Submit a vote
    - `POST /api/rooms/:roomId/reveal` - Reveal all votes
    - `POST /api/rooms/:roomId/reset` - Reset votes
    - `DELETE /api/rooms/:roomId/members/:memberId` - Remove member
  
  - Alternative: GraphQL for flexible querying and subscriptions for real-time updates

### Real-Time Communication
- **Socket.IO** (recommended) or **WebSocket**
  - Bi-directional communication between client and server
  - Event-driven architecture (vote submitted, reveal triggered, user joined, etc.)
  - Automatic fallback to polling if WebSocket unavailable
  - Room-based namespacing for managing multiple concurrent rooms
  
  **Socket.IO Events:**
  - `room:user-joined` - User joins room
  - `room:user-left` - User leaves room
  - `vote:submitted` - User submits their vote
  - `vote:revealed` - Reveal votes
  - `vote:reset` - Reset voting round
  - `error:room-not-found` - Room doesn't exist

### Database
- **PostgreSQL** (recommended) or **MongoDB**
  - PostgreSQL: Relational data, ACID transactions, strong consistency
  - MongoDB: Flexible schema for room documents, easier horizontal scaling
  
  **Schema Design:**
  ```sql
  -- Rooms table
  CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
  );
  
  -- Participants table
  CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    selected_card VARCHAR(50),
    has_voted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Voting history table (optional)
  CREATE TABLE voting_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    results JSONB,
    revealed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

### ORM (Object-Relational Mapping)
- **Prisma** (recommended) or **TypeORM**
  - Prisma: Type-safe queries, automatic migrations, excellent DX
  - TypeORM: Full-featured, decorators for schema definition
  - Database agnostic (works with PostgreSQL, MySQL, SQLite)

### Authentication & Authorization
- **JWT (JSON Web Tokens)** for stateless authentication
  - Access tokens for API requests
  - Refresh tokens for long-lived sessions
  - Optional: Implement OAuth2 for social login
  
  Alternative: Session-based authentication with secure cookies

### Validation & Error Handling
- **Joi** or **Yup** or **Zod**
  - Schema validation for API requests
  - Consistent error messages
  - Type inference in TypeScript

### Middleware
- **CORS (Cross-Origin Resource Sharing)** middleware
- **Helmet.js** for security headers
- **Morgan** for HTTP request logging
- **Compression** middleware for response compression
- **Rate limiting** to prevent abuse

### Environment Management
- **.env files** with dotenv or similar
- Configuration management for development, staging, production
- Secret management for API keys, database credentials

---

## Database Layer

### Primary Database
- **PostgreSQL 14+**
  - Reliable ACID transactions
  - JSON support for flexible data structures (voting results)
  - Full-text search if needed for future features
  - Excellent scaling characteristics

### Optional Caching Layer
- **Redis**
  - In-memory cache for active rooms and session data
  - Pub/Sub for real-time events between server instances
  - Session storage for authentication
  - Rate limiting state
  - Temporary storage for active voting rounds

**Redis Data Structure Examples:**
```
room:{roomId}:data -> Hash with room metadata
room:{roomId}:participants -> Set of participant IDs
participant:{participantId} -> Hash with participant details
room:{roomId}:votes -> Hash with current votes
```

### Connection Pooling
- **PgBouncer** for PostgreSQL connection pooling
- Manages connections between application and database

---

## Development Tools & Workflow

### Version Control
- **Git** with GitHub
  - Feature branches, pull requests, code review workflow
  - Branch protection rules

### Package Management
- **npm** or **yarn** or **pnpm**
  - Dependency management
  - Lock files for reproducible builds
  - Script automation

### Testing Framework
- **Jest** (recommended) for unit and integration tests
  - Snapshot testing for UI components
  - Mock support for API calls and Socket.IO
  - Coverage reporting
  
  - **Vitest** as lightweight alternative

### Component Testing
- **React Testing Library** or **Cypress**
  - Testing user interactions in React components
  - End-to-end testing with Cypress
  - Accessibility testing with jest-axe

### E2E Testing
- **Cypress** or **Playwright**
  - Browser automation for full application testing
  - Visual regression testing
  - Test scenarios like room creation, joining, voting, reveal

### Linting & Code Quality
- **ESLint**
  - JavaScript/TypeScript code quality
  - Automatic fixing with `--fix` flag
  - Enforce coding standards

- **Prettier**
  - Code formatting
  - Consistent code style across project

- **Pre-commit Hooks**
  - Husky: Git hooks framework
  - lint-staged: Run linters on staged files
  - Prevent commits with linting errors

### Type Checking
- **TypeScript**
  - Static type checking for JavaScript
  - Strict mode enabled
  - Type definitions for all packages

### Documentation
- **Storybook** (optional)
  - Component documentation and showcase
  - Interactive component development environment

- **Swagger/OpenAPI** for API documentation
  - Auto-generated from JSDoc or schema definitions
  - Interactive API explorer

---

## Deployment & Infrastructure

### Backend Hosting
- **Docker** containerization
  - Consistent environment across development, staging, production
  - Easy scaling with container orchestration
  
  **Dockerfile example:**
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  EXPOSE 3000
  CMD ["npm", "start"]
  ```

- **Container Orchestration:**
  - Kubernetes for production-grade deployment
  - Docker Compose for local development
  - AWS ECS / Google Cloud Run for serverless options

### Hosting Platforms
- **Heroku**, **Railway**, **Render** for simple deployment
- **AWS** (EC2, ECS, Elastic Beanstalk) for scalability
- **Google Cloud Platform** (App Engine, Cloud Run)
- **DigitalOcean** App Platform for cost-effective hosting
- **Vercel/Netlify** for frontend, separate backend hosting

### Frontend Hosting
- **Vercel** (Next.js optimized, serverless functions)
- **Netlify** (static sites, serverless functions)
- **AWS S3 + CloudFront** (CDN distribution)
- **GitHub Pages** (static content only)

### CI/CD Pipeline
- **GitHub Actions** (recommended for GitHub repositories)
  - Automated testing on pull requests
  - Automated deployment to staging/production
  - Linting and type checking
  - Automated versioning and releases

  **Workflow Steps:**
  - Checkout code
  - Install dependencies
  - Run linting and type check
  - Run tests
  - Build Docker image
  - Push to registry
  - Deploy to production

### Monitoring & Logging
- **Sentry** for error tracking and performance monitoring
- **LogRocket** for session replay and debugging
- **DataDog** or **New Relic** for comprehensive monitoring
- **ELK Stack** (Elasticsearch, Logstash, Kibana) for log aggregation
- **Prometheus + Grafana** for metrics and alerting

### Performance Optimization
- **CDN** for static assets (Cloudflare, AWS CloudFront)
- **Image optimization** (lazy loading, next-gen formats)
- **Code splitting** and lazy loading of components
- **Database query optimization** and indexing
- **Caching strategies** (HTTP caching, Redis)

---

## Security Considerations

### Frontend Security
- **Content Security Policy (CSP)** headers
- **XSS Prevention** through proper escaping and sanitization
- **CSRF tokens** for form submissions
- **Secure localStorage usage** for non-sensitive data only

### Backend Security
- **HTTPS/TLS** encryption for all communications
- **CORS** configuration to prevent unauthorized cross-origin requests
- **Rate limiting** to prevent brute force and DoS attacks
- **Input validation** and sanitization on all endpoints
- **SQL injection prevention** through parameterized queries (ORM handles this)
- **Authentication** via JWT with secure secret management
- **Authorization** checks to ensure users can only access their rooms

### Database Security
- **Encrypted connections** to database
- **Row-level security** if using PostgreSQL
- **Backup and recovery** procedures
- **Regular security audits** and vulnerability scanning

### Dependency Security
- **Dependabot** for automated dependency updates
- **npm audit** for vulnerability scanning
- **Snyk** for continuous vulnerability monitoring

---

## Development Setup

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized development)

### Local Development Environment
```bash
# Clone repository
git clone https://github.com/clinton-schram/pokerplanning.git
cd pokerplanning

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Variables
```
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/pokerplanning
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
SOCKET_IO_PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=http://localhost:3001
```

---

## Performance Metrics & Targets

### Frontend
- **Page Load Time**: < 3 seconds
- **Time to Interactive (TTI)**: < 2.5 seconds
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB (gzipped)

### Backend
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)
- **WebSocket message latency**: < 100ms
- **Uptime Target**: 99.9%

---

## Scalability Considerations

### Horizontal Scaling
- Load balancer (Nginx, HAProxy) for distributing traffic
- Multiple Node.js instances behind load balancer
- Redis for shared session/cache across instances
- WebSocket sticky sessions to maintain Socket.IO connections

### Database Scaling
- Read replicas for scaling read operations
- Connection pooling with PgBouncer
- Database sharding if room data becomes very large
- Query optimization and proper indexing

### Real-Time Features Scaling
- Redis Pub/Sub for broadcasting to multiple instances
- Socket.IO adapter for Redis to sync events across servers
- Message queuing (Bull, RabbitMQ) for background jobs

---

## Alternative Tech Stack Options

### Option 1: Python Backend
- **FastAPI** or **Django** for backend
- **PostgreSQL** for database
- **Socket.IO** or native WebSocket with `python-socketio`
- Better for data science integrations in future

### Option 2: Fullstack TypeScript with Next.js
- **Next.js 13+** with App Router
- **Prisma** for database ORM
- **tRPC** or **GraphQL** for API
- **Socket.IO** for real-time
- Simplified deployment and shared language across stack

### Option 3: Serverless Architecture
- **AWS Lambda** for backend functions
- **AWS API Gateway** for routing
- **AWS DynamoDB** for database
- **AWS AppSync** or Lambda + WebSocket API for real-time
- **Vercel** for frontend
- Cost-effective for variable workloads but harder to maintain

---

## Recommended Final Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for components
- Redux Toolkit for state management
- Socket.IO Client for real-time

**Backend:**
- Node.js + Express with TypeScript
- PostgreSQL for primary database
- Redis for caching and pub/sub
- Socket.IO for real-time communication
- Prisma for ORM
- JWT for authentication

**DevOps:**
- Docker & Docker Compose for containerization
- GitHub Actions for CI/CD
- Vercel for frontend hosting
- AWS/DigitalOcean for backend hosting

**Development:**
- Jest & React Testing Library for testing
- ESLint & Prettier for code quality
- Husky & lint-staged for pre-commit hooks
- Sentry for error tracking
