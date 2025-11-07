# 📝 Command Reference

Quick reference for all available commands in this monorepo.

## 🏁 Initial Setup

```bash
# Install all dependencies
bun install

# Run automated setup script
./setup.sh

# Or setup manually:
cd apps/backend
bun run db:generate        # Generate migration files
bun run db:migrate         # Apply migrations (auto-creates local DB)
```

## 🚀 Development

### Start All Services

```bash
# From root - starts both frontend and backend
bun dev
```

### Start Individual Services

```bash
# Backend only (port 8787)
cd apps/backend
bun dev

# Frontend only (port 5173)
cd apps/frontend
bun dev
```

## 🗄️ Database Commands

### Backend Directory (`apps/backend`)

```bash
# Generate migrations from schema changes
bun run db:generate

# Apply migrations (local)
bun run db:migrate

# Apply migrations (production)
bun run db:migrate:prod

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Using Wrangler CLI

```bash
# Execute SQL (local)
bunx wrangler d1 execute cloudflare-d1-db --local --command "SELECT * FROM users"

# Execute SQL (production)
bunx wrangler d1 execute cloudflare-d1-db --remote --command "SELECT * FROM users"

# List all D1 databases
bunx wrangler d1 list

# Get database info
bunx wrangler d1 info cloudflare-d1-db
```

## 🏗️ Building

### Build All

```bash
# From root
bun build
```

### Build Individual Apps

```bash
# Backend
cd apps/backend
bun run build

# Frontend
cd apps/frontend
bun run build
```

## 🧪 Type Checking

```bash
# Type check all packages
bun run type-check

# Type check specific app
cd apps/backend
bun run type-check

cd apps/frontend
bun run type-check
```

## 🧹 Cleaning

```bash
# Clean all build outputs
bun run clean

# Clean specific directories
rm -rf apps/*/dist
rm -rf packages/*/dist
rm -rf .turbo
```

## 🚢 Deployment

### Backend to Cloudflare Workers

```bash
cd apps/backend

# Login to Cloudflare (first time only)
bunx wrangler login

# Deploy to production
bun run deploy

# Deploy with specific environment
bunx wrangler deploy --env production
```

### Frontend to Cloudflare Pages

```bash
cd apps/frontend

# Build for production
bun run build

# Deploy directly
bunx wrangler pages deploy dist --project-name=cloudflare-fullstack-frontend

# Or use Git integration (recommended)
# Just push to your repo and Pages auto-deploys
git push origin main
```

## 📦 Package Management

### Add Dependencies

```bash
# Add to root workspace
bun add -D some-dev-dependency

# Add to specific app
cd apps/backend
bun add hono

cd apps/frontend
bun add react-icons

# Add to shared package
cd packages/shared
bun add lodash
```

### Remove Dependencies

```bash
bun remove package-name
```

### Update Dependencies

```bash
# Update all
bun update

# Update specific package
bun update package-name
```

## 🎨 Frontend Specific

### Add Shadcn UI Components

```bash
cd apps/frontend

# Add a single component
bunx --bun shadcn@latest add button

# Add multiple components
bunx --bun shadcn@latest add dialog dropdown-menu
```

### Preview Production Build

```bash
cd apps/frontend
bun run preview
```

## 🐛 Debugging

### View Backend Logs (Local)

```bash
cd apps/backend
bun dev
# Logs appear in terminal
```

### View Backend Logs (Production)

```bash
cd apps/backend
bunx wrangler tail
```

### Check Build Errors

```bash
# From root
bun run type-check
bun run build
```

## 🔍 Inspection

### View Database Schema

```bash
cd apps/backend
bunx wrangler d1 execute cloudflare-d1-db --local --command ".schema"
```

### Query Database

```bash
# Local
bunx wrangler d1 execute cloudflare-d1-db --local --command "SELECT * FROM users"

# Production
bunx wrangler d1 execute cloudflare-d1-db --remote --command "SELECT * FROM users"
```

### Check Turborepo Cache

```bash
# From root
bunx turbo run build --dry-run
```

## 🌐 Testing API Endpoints

### Using curl

```bash
# Health check
curl http://localhost:8787/

# Get all users
curl http://localhost:8787/api/users

# Get hello message
curl http://localhost:8787/api/hello

# Create user
curl -X POST http://localhost:8787/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### Using httpie (if installed)

```bash
# Get users
http localhost:8787/api/users

# Create user
http POST localhost:8787/api/users name="Test User" email="test@example.com"
```

## 🔐 Environment Variables

### Local Development

```bash
# Backend
cd apps/backend
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values

# Frontend
cd apps/frontend
cp .env.example .env
# Edit .env with your values
```

### Production (Cloudflare)

```bash
# Set Workers secret
bunx wrangler secret put SECRET_NAME

# For Pages, set in dashboard:
# Dashboard → Pages → Your Project → Settings → Environment Variables
```

## 📊 Monitoring

### Backend Performance

```bash
# View real-time logs
cd apps/backend
bunx wrangler tail

# With filtering
bunx wrangler tail --status error
```

### Build Performance

```bash
# Analyze build
bun run build --verbose

# Check Turbo cache hits
bunx turbo run build --summarize
```

## 🆘 Help Commands

```bash
# Wrangler help
bunx wrangler --help
bunx wrangler d1 --help

# Turbo help
bunx turbo --help

# Bun help
bun --help
```

## 💡 Pro Tips

### Watch Mode for Type Checking

```bash
# Terminal 1
cd apps/backend
bun run type-check --watch

# Terminal 2
cd apps/frontend
bun run type-check --watch
```

### Faster Installs

```bash
# Use --frozen-lockfile for CI/production
bun install --frozen-lockfile

# Skip optional dependencies
bun install --no-optional
```

### Parallel Commands

```bash
# Run type check on all packages in parallel
bunx turbo run type-check
```

## 📚 Quick Links

- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **Hono Docs**: https://hono.dev/
- **TanStack Router**: https://tanstack.com/router
- **Drizzle ORM**: https://orm.drizzle.team/

---

💡 **Tip**: Bookmark this file for quick reference while developing!

