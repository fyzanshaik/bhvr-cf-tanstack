# Cloudflare Fullstack Monorepo

A modern, type-safe, full-stack monorepo template built with React, Hono, D1, and deployed on Cloudflare Pages & Workers.

## 🚀 Features

-  **Monorepo Architecture**: Turborepo for efficient build caching and task orchestration
-  **Full Type Safety**: End-to-end type safety from database to frontend
-  **Modern Stack**: React 18, Vite, Hono, Drizzle ORM
-  **Cloudflare Native**: D1 (SQLite), Workers, and Pages
-  **Developer Experience**: Hot reload, TypeScript, ESLint
-  **UI Components**: Shadcn UI with Tailwind CSS v4
-  **State Management**: TanStack Query + Zustand
-  **Routing**: TanStack Router with file-based routing
-  **Database**: Drizzle ORM with type-safe queries

## 📦 Project Structure

```
cloudflare-fullstack-monorepo/
├── apps/
│   ├── backend/          # Hono API on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── routes/   # API routes
│   │   │   ├── index.ts  # Main app entry
│   │   │   └── types.ts  # Type definitions
│   │   ├── wrangler.toml # Workers configuration
│   │   └── package.json
│   │
│   └── frontend/         # React + Vite app
│       ├── src/
│       │   ├── routes/   # TanStack Router routes
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities and API client
│       │   └── stores/   # Zustand stores
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── db/              # Database schema and ORM
│   │   ├── src/
│   │   │   └── schema.ts # Drizzle schema
│   │   └── package.json
│   │
│   └── shared/          # Shared types and schemas
│       ├── src/
│       │   ├── schemas.ts # Zod validation schemas
│       │   └── types.ts   # Shared TypeScript types
│       └── package.json
│
├── turbo.json           # Turborepo configuration
├── package.json         # Root workspace configuration
└── README.md
```

## 🛠️ Tech Stack

### Frontend

-  **React 18** - UI library
-  **Vite** - Build tool and dev server
-  **TanStack Router** - Type-safe routing
-  **TanStack Query** - Server state management
-  **Zustand** - Client state management
-  **Tailwind CSS v4** - Styling
-  **Shadcn UI** - Component library
-  **TypeScript** - Type safety

### Backend

-  **Hono** - Web framework
-  **Cloudflare Workers** - Serverless compute
-  **D1** - SQLite database at the edge
-  **Drizzle ORM** - Type-safe database queries
-  **Zod** - Runtime validation
-  **TypeScript** - Type safety

### Tooling

-  **Turborepo** - Monorepo build system
-  **Bun** - Package manager and runtime
-  **Wrangler** - Cloudflare CLI
-  **Drizzle Kit** - Database migrations

## 🏃 Quick Start

### Prerequisites

-  **Bun** >= 1.0.0 ([Install](https://bun.sh))
-  **Node.js** >= 18.0.0 (for compatibility)
-  **Cloudflare Account** (for deployment)

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Database (Local Development)

```bash
cd apps/backend

# Generate migrations from schema
bun run db:generate

# Apply migrations (creates local D1 database automatically)
bun run db:migrate
```

**Note**: The local D1 database is automatically created when you apply migrations!

### 3. Seed Database with Demo Data

```bash
# Insert demo users manually
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com')"
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Bob Smith', 'bob@example.com')"
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Charlie Davis', 'charlie@example.com')"
```

### 4. Start Development Servers

```bash
# From root - starts both frontend and backend
bun dev
```

Or start individually:

```bash
# Terminal 1 - Backend (port 8787)
cd apps/backend
bun dev

# Terminal 2 - Frontend (port 5173)
cd apps/frontend
bun dev
```

### 5. Open Application

-  **Frontend**: http://localhost:5173
-  **Backend API**: http://localhost:8787
-  **API Health Check**: http://localhost:8787/

## 📝 Available Scripts

### Root Level

```bash
bun dev          # Start all apps in dev mode
bun build        # Build all apps
bun type-check   # Type check all packages
bun clean        # Clean all build outputs
```

### Backend (`apps/backend`)

```bash
bun dev              # Start dev server
bun deploy           # Deploy to Cloudflare Workers
bun db:generate      # Generate migrations
bun db:migrate       # Apply migrations (local)
bun db:migrate:prod  # Apply migrations (production)
```

### Frontend (`apps/frontend`)

```bash
bun dev      # Start dev server
bun build    # Build for production
bun preview  # Preview production build
```

## 🎯 API Endpoints

### Base URL (Local)

`http://localhost:8787`

### Endpoints

-  `GET /` - Health check
-  `GET /api/hello` - Hello world demo
-  `GET /api/users` - Get all users
-  `GET /api/users/:id` - Get user by ID
-  `POST /api/users` - Create new user
   ```json
   {
   	"name": "John Doe",
   	"email": "john@example.com"
   }
   ```
-  `GET /api/posts` - Get all posts

## 🔒 Type Safety

This project demonstrates end-to-end type safety:

### 1. Database → Backend

Drizzle ORM provides type-safe database queries:

```typescript
// Automatically typed based on schema
const users = await db.select().from(users).all();
```

### 2. Backend → Frontend (Hono RPC)

Hono RPC provides type-safe API client:

```typescript
// Full autocomplete and type checking
const response = await apiClient.users.$get();
const data = await response.json(); // Typed!
```

### 3. Runtime Validation

Zod schemas validate data at runtime:

```typescript
// Validation in backend
const userData = createUserSchema.parse(body);
```

## 🎨 UI Components

This project uses Shadcn UI components built on Radix UI primitives. Components are located in `apps/frontend/src/components/ui/`.

### Adding More Components

```bash
cd apps/frontend
bunx --bun shadcn@latest add [component-name]
```

Example:

```bash
bunx --bun shadcn@latest add dialog
bunx --bun shadcn@latest add dropdown-menu
```

## 🗄️ Database Schema

### Users Table

-  `id` - Integer (Primary Key)
-  `name` - Text
-  `email` - Text (Unique)
-  `createdAt` - Timestamp
-  `updatedAt` - Timestamp

### Posts Table

-  `id` - Integer (Primary Key)
-  `title` - Text
-  `content` - Text
-  `authorId` - Integer (Foreign Key → users.id)
-  `published` - Boolean
-  `createdAt` - Timestamp
-  `updatedAt` - Timestamp

### Modifying Schema

1. Edit `packages/db/src/schema.ts`
2. Generate migration: `cd apps/backend && bun run db:generate`
3. Apply migration: `bun run db:migrate`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend:**

```bash
cd apps/backend
bunx wrangler login
bunx wrangler d1 create cloudflare-d1-db
# Update database_id in wrangler.toml
bun run db:generate
bun run db:migrate:prod
bun run deploy
```

**Frontend:**

```bash
cd apps/frontend
bun run build
bunx wrangler pages deploy dist --project-name=cloudflare-fullstack-frontend
```

## 🔧 Environment Variables

### Backend

Create `.dev.vars` in `apps/backend/` for local development (not committed):

```bash
# Usually not needed - D1 binding is in wrangler.toml
```

### Frontend

Create `.env` in `apps/frontend/` for local development:

```env
VITE_API_URL=http://localhost:8787
```

For production, set in Cloudflare Pages dashboard:

```env
VITE_API_URL=https://your-worker-url.workers.dev
```

## 📚 Learn More

### Documentation

-  [Hono Documentation](https://hono.dev/)
-  [Cloudflare Workers](https://developers.cloudflare.com/workers/)
-  [Cloudflare D1](https://developers.cloudflare.com/d1/)
-  [Drizzle ORM](https://orm.drizzle.team/)
-  [TanStack Router](https://tanstack.com/router)
-  [TanStack Query](https://tanstack.com/query)
-  [Shadcn UI](https://ui.shadcn.com/)
-  [Turborepo](https://turbo.build/)

### Cloudflare Resources

-  [Dashboard](https://dash.cloudflare.com/)
-  [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🤝 Contributing

This is a template repository. Feel free to fork and modify for your needs!

## 📄 License

MIT License - feel free to use this template for personal or commercial projects.

## 🎉 What's Next?

Now that you have a working setup, here are some ideas to extend it:

1. **Add Authentication**: Implement JWT-based auth or use Cloudflare Access
2. **Add More Tables**: Extend the database schema
3. **File Uploads**: Use Cloudflare R2 for file storage
4. **Real-time Updates**: Add WebSocket support
5. **Testing**: Add unit and integration tests
6. **CI/CD**: Set up GitHub Actions for automated deployments
7. **Monitoring**: Add logging and error tracking
8. **API Documentation**: Generate OpenAPI specs from Hono routes

---

Built with ❤️ using Cloudflare's edge platform
