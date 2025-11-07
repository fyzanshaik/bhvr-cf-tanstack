# Project Structure

Complete overview of the Cloudflare Fullstack Monorepo structure.

## 📁 Directory Tree

```
cloudflare-fullstack-monorepo/
│
├── 📄 package.json                 # Root workspace configuration
├── 📄 turbo.json                   # Turborepo pipeline configuration
├── 📄 tsconfig.json                # Root TypeScript configuration
├── 📄 bun.lock                     # Bun lockfile
├── 📄 .gitignore                   # Git ignore rules
│
├── 📚 README.md                    # Main documentation
├── 📚 QUICKSTART.md                # Quick start guide
├── 📚 DEPLOYMENT.md                # Deployment guide
├── 📚 PROJECT_STRUCTURE.md         # This file
├── 🔧 setup.sh                     # Automated setup script
│
├── 📁 apps/                        # Application packages
│   │
│   ├── 📁 backend/                 # Hono API (Cloudflare Workers)
│   │   ├── 📁 src/
│   │   │   ├── 📁 routes/
│   │   │   │   └── api.ts         # API endpoints (users, posts)
│   │   │   ├── 📁 scripts/
│   │   │   │   └── seed.ts        # Database seeding
│   │   │   ├── index.ts           # Main  Hono app
│   │   │   └── types.ts           # Environment & context types
│   │   │
│   │   ├── 📁 migrations/         # Database migrations (auto-generated)
│   │   │   └── 0000_*.sql         # Generated SQL migrations
│   │   │
│   │   ├── package.json           # Backend dependencies
│   │   ├── tsconfig.json          # Backend TypeScript config
│   │   ├── wrangler.toml          # Cloudflare Workers config
│   │   ├── drizzle.config.ts      # Drizzle ORM config
│   │   └── .dev.vars.example      # Environment variables template
│   │
│   └── 📁 frontend/                # React + Vite app (Cloudflare Pages)
│       ├── 📁 src/
│       │   ├── 📁 routes/
│       │   │   ├── __root.tsx     # Root layout with navigation
│       │   │   ├── index.tsx      # Home page (/)
│       │   │   └── users.tsx      # Users page (/users)
│       │   │
│       │   ├── 📁 components/
│       │   │   └── 📁 ui/         # Shadcn UI components
│       │   │       ├── button.tsx
│       │   │       ├── card.tsx
│       │   │       ├── input.tsx
│       │   │       ├── label.tsx
│       │   │       └── table.tsx
│       │   │
│       │   ├── 📁 lib/
│       │   │   ├── api.ts         # Hono RPC client (type-safe!)
│       │   │   └── utils.ts       # Utility functions (cn)
│       │   │
│       │   ├── 📁 stores/
│       │   │   └── userStore.ts   # Zustand state management
│       │   │
│       │   ├── main.tsx           # React entry point
│       │   ├── index.css          # Tailwind CSS + theme
│       │   └── routeTree.gen.ts   # Auto-generated route tree
│       │
│       ├── 📁 public/
│       │   ├── _routes.json       # Cloudflare Pages routing
│       │   └── vite.svg           # Favicon
│       │
│       ├── package.json           # Frontend dependencies
│       ├── tsconfig.json          # Root TypeScript config
│       ├── tsconfig.app.json      # App TypeScript config
│       ├── tsconfig.node.json     # Node TypeScript config
│       ├── vite.config.ts         # Vite configuration
│       ├── components.json        # Shadcn UI config
│       ├── wrangler.toml          # Pages deployment config
│       ├── index.html             # HTML entry point
│       └── .env.example           # Environment variables template
│
└── 📁 packages/                    # Shared packages
    │
    ├── 📁 db/                      # Database layer
    │   ├── 📁 src/
    │   │   ├── schema.ts          # Drizzle schema (users, posts)
    │   │   └── index.ts           # Database exports
    │   │
    │   ├── package.json           # DB package dependencies
    │   ├── tsconfig.json          # TypeScript config
    │   └── drizzle.config.ts      # Drizzle ORM config
    │
    └── 📁 shared/                  # Shared types & schemas
        ├── 📁 src/
        │   ├── schemas.ts         # Zod validation schemas
        │   ├── types.ts           # Shared TypeScript types
        │   └── index.ts           # Package exports
        │
        ├── package.json           # Shared package dependencies
        └── tsconfig.json          # TypeScript config
```

## 🎯 Key Files Explained

### Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Defines workspace structure and root scripts |
| `turbo.json` | Configures Turborepo build pipeline |
| `tsconfig.json` | Base TypeScript configuration |
| `.gitignore` | Specifies files to ignore in Git |

### Backend (`apps/backend`)

| File | Purpose |
|------|---------|
| `src/index.ts` | Main Hono application with middleware and routing |
| `src/routes/api.ts` | API endpoints with Hono RPC type exports |
| `wrangler.toml` | Cloudflare Workers + D1 configuration |
| `drizzle.config.ts` | Database migration configuration |
| `migrations/*.sql` | Auto-generated database migrations |

### Frontend (`apps/frontend`)

| File | Purpose |
|------|---------|
| `src/main.tsx` | React entry with Router and Query providers |
| `src/routes/__root.tsx` | Root layout with navigation |
| `src/routes/index.tsx` | Home page with API demo |
| `src/routes/users.tsx` | Users CRUD page |
| `src/lib/api.ts` | Type-safe Hono RPC client |
| `vite.config.ts` | Vite + TanStack Router + Tailwind config |
| `components.json` | Shadcn UI configuration |

### Packages

| Package | Purpose |
|---------|---------|
| `packages/db` | Drizzle schema, types, and ORM setup |
| `packages/shared` | Zod schemas and shared TypeScript types |

## 🔄 Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ↓
┌─────────────────────────┐
│  Frontend (Vite/React)  │
│  - TanStack Router      │
│  - TanStack Query       │
│  - Hono RPC Client ✨   │  ← Type-safe!
└──────┬──────────────────┘
       │ API Call
       ↓
┌─────────────────────────┐
│  Backend (Hono/Workers) │
│  - API Routes           │
│  - Zod Validation       │
│  - Drizzle ORM ✨       │  ← Type-safe!
└──────┬──────────────────┘
       │ SQL Query
       ↓
┌─────────────────────────┐
│  Database (D1/SQLite)   │
│  - Users Table          │
│  - Posts Table          │
└─────────────────────────┘
```

## 🎨 Tech Stack Layers

### Layer 1: Infrastructure (Cloudflare)
- **Workers**: Backend compute
- **D1**: SQLite database
- **Pages**: Frontend hosting

### Layer 2: Framework
- **Backend**: Hono + Drizzle ORM
- **Frontend**: React + Vite + TanStack

### Layer 3: Type Safety
- **TypeScript**: Everywhere
- **Hono RPC**: Frontend ↔ Backend types
- **Drizzle**: Database ↔ Backend types
- **Zod**: Runtime validation

### Layer 4: Developer Experience
- **Turborepo**: Fast builds
- **Bun**: Fast package management
- **Wrangler**: Easy deployment

## 🚀 Deployment Flow

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│  Backend    │   │  Frontend   │
│  Deploy     │   │  Deploy     │
│             │   │             │
│  wrangler   │   │  Pages      │
│  deploy     │   │  deploy     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│  Workers    │   │   Pages     │
│  (API)      │◄──┤  (Frontend) │
└──────┬──────┘   └─────────────┘
       │
       ↓
┌─────────────┐
│     D1      │
│  (Database) │
└─────────────┘
```

## 📦 Package Dependencies

### Workspace Dependencies (Root)
- `turbo` - Monorepo build system
- `typescript` - Type checking

### Backend Dependencies
- `hono` - Web framework
- `drizzle-orm` - Database ORM
- `@hono/zod-validator` - Request validation
- `@repo/db` - Internal package
- `@repo/shared` - Internal package

### Frontend Dependencies
- `react` + `react-dom` - UI framework
- `@tanstack/react-router` - Routing
- `@tanstack/react-query` - Server state
- `zustand` - Client state
- `hono` - For RPC client
- `tailwindcss` - Styling
- `@radix-ui/*` - UI primitives

### Shared Package Dependencies
- `zod` - Schema validation
- `drizzle-orm` - Database types

## 🎓 Learning Resources

Each file in this project demonstrates best practices:

1. **Monorepo**: See `turbo.json` and root `package.json`
2. **Type Safety**: Check `apps/frontend/src/lib/api.ts`
3. **Database**: Review `packages/db/src/schema.ts`
4. **API Routes**: Study `apps/backend/src/routes/api.ts`
5. **Frontend**: Explore `apps/frontend/src/routes/*.tsx`
6. **Deployment**: Read `wrangler.toml` files

---

This structure is designed for scalability, maintainability, and developer happiness! 🎉

