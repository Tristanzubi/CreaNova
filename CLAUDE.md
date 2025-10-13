# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React-Express-MySQL monorepo** following the Wild Code School architecture (v7.2.4). The project uses npm workspaces with two main packages: `client` (React + Vite) and `server` (Express + TypeScript).

## Essential Commands

### Development
```bash
npm install              # Install all dependencies (workspaces)
npm run dev              # Start both client and server concurrently
npm run dev:client       # Start only client (Vite dev server on port 3000)
npm run dev:server       # Start only server (Express on port 3310)
```

### Database
```bash
npm run db:migrate       # Run database migrations from server/database/schema.sql
npm run db:seed          # Seed the database with fixtures
```

### Testing
```bash
npm run test             # Run all tests (Jest for server, Playwright for client)
npm run check            # Run Biome linting and type-checking
npm run check:fix        # Auto-fix Biome issues
```

### Building
```bash
npm run build            # Build both client and server
```

### Individual Workspace Commands
```bash
# Run commands in specific workspace:
npm run <script> --workspace=client
npm run <script> --workspace=server

# Example:
npm run check-types --workspace=server
```

## Architecture

### Client (`client/`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Testing**: Playwright (E2E tests in `client/tests/`)
- **Structure**:
  - `src/pages/` - Page components
  - `src/components/` - Reusable components
  - `src/contexts/` - React contexts
  - `src/hooks/` - Custom hooks
  - `src/services/` - API service layer
  - `src/types/` - TypeScript type definitions
  - `src/router.tsx` - Route configuration

### Server (`server/`)
- **Framework**: Express with TypeScript
- **Database**: MySQL2 (promise-based)
- **Auth**: JWT + argon2 for password hashing
- **Testing**: Jest + Supertest (tests in `server/tests/`)
- **Structure**:
  - `src/modules/` - Feature modules (admin, artwork, favorite, item, newsletter, purchase, user)
  - `src/utils/` - Shared utilities (auth, validation, file handling, admin)
  - `src/types/` - TypeScript type definitions (including Express augmentation)
  - `src/router.ts` - Route definitions
  - `src/app.ts` - Express app configuration
  - `src/main.ts` - Server entry point
  - `database/` - Database client, schema, migrations, and fixtures

### Module Pattern (Server)
Each module follows a consistent structure:
```
modules/[module-name]/
  ├── [module-name]Actions.ts    # Request handlers (browse, read, add, edit, destroy)
  └── [module-name]Repository.ts # Database queries
```

### Middleware Stack
The project uses several middleware utilities found in `server/src/utils/`:
- `auth.ts` - JWT authentication, password hashing, login/logout/refresh
- `validation.ts` - Request validation middleware
- `file.ts` - File upload handling (Multer)
- `admin.ts` - Admin-only route protection

### Custom Express Types
The Express Request object is augmented with custom properties in `server/src/types/express/index.d.ts`:
- `req.user` - Contains authenticated user data (id, email, firstname, lastname, isAdmin)

**Important**: When adding new middleware properties to `req`, you must add them to this type definition.

## Environment Configuration

### Client (`.env` in `client/`)
```
VITE_API_URL=http://localhost:3310
```

### Server (`.env` in `server/`)
```
APP_PORT=3310
APP_SECRET=YOUR_APP_SECRET_KEY
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_DATABASE_USERNAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=YOUR_DATABASE_NAME
CLIENT_URL=http://localhost:3000
```

Copy `.env.sample` files in each workspace to create your `.env` files.

## Database Workflow

1. Define schema in `server/database/schema.sql`
2. Run `npm run db:migrate` to apply changes
3. Add seed data in `server/database/fixtures/`
4. Run `npm run db:seed` to populate database

## REST API Conventions

The project follows standard REST patterns:

| Operation | Method | Path         | Response (Success) | Response (Error)    |
|-----------|--------|--------------|-------------------|---------------------|
| Browse    | GET    | /api/items   | 200 + array       | -                   |
| Read      | GET    | /api/items/:id | 200 + object    | 404                 |
| Add       | POST   | /api/items   | 201 + insertId    | 400                 |
| Edit      | PUT    | /api/items/:id | 204             | 400, 404            |
| Destroy   | DELETE | /api/items/:id | 204             | 404                 |

## Code Quality

- **Linter/Formatter**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Pre-commit hooks configured via `.git-hooks/`
- **Commit Linting**: Conventional commits enforced via commitlint
- **Branch Naming**: Validated via validate-branch-name

Run `npm run check` before committing to catch issues early.

## Testing

### Server Tests (Jest)
Run: `npm run test --workspace=server`

### Client Tests (Playwright)
Run: `npm run test --workspace=client`

Test configuration: `client/playwright.config.ts`
Tests location: `client/tests/`

## Deployment

The project supports Docker deployment with Traefik. See README.md for full deployment instructions.

Key files:
- `docker-compose.yml` - Local Docker setup
- `docker-compose.prod.yml` - Production configuration
- GitHub Actions secrets required: `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD`, `PROJECT_NAME`
