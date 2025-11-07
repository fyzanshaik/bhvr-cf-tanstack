# AI Agent Development Guide

**Purpose:** This document provides complete context for AI agents working on this project. Share this with any AI assistant (ChatGPT, Claude, Cursor, etc.) to give them full understanding of the codebase structure, patterns, and conventions.

**For Humans:** See [README.md](./README.md) for quick start and user documentation.

## Project Overview

**bhvr** is a production-ready, type-safe fullstack monorepo template for Cloudflare's edge platform.

### Tech Stack

-  **Runtime:** Bun (package manager, runtime)
-  **Monorepo:** Turborepo
-  **Frontend:** React 18 + Vite + TanStack Router/Query + Zustand
-  **Backend:** Hono (web framework) + Cloudflare Workers
-  **Database:** Cloudflare D1 (SQLite) + Drizzle ORM
-  **Styling:** Tailwind CSS v4 + Shadcn UI
-  **Validation:** Zod
-  **Type Safety:** TypeScript everywhere + Hono RPC for end-to-end types

### Architecture Principles

1. **Type Safety First:** Every layer is fully typed from DB to UI
2. **Monorepo Structure:** Shared types and schemas across packages
3. **Edge-First:** Deployed entirely on Cloudflare's global network
4. **Developer Experience:** Fast builds, hot reload, autocomplete everywhere

## Project Structure

```
├── apps/
│   ├── backend/                 # Cloudflare Worker (Hono API)
│   │   ├── src/
│   │   │   ├── index.ts        # Worker entry point
│   │   │   ├── types.ts        # Environment bindings
│   │   │   └── routes/
│   │   │       └── api.ts      # API route handlers
│   │   ├── migrations/         # Drizzle migrations (auto-generated)
│   │   ├── wrangler.toml       # Cloudflare Worker config
│   │   └── package.json
│   │
│   └── frontend/                # React SPA
│       ├── src/
│       │   ├── main.tsx        # App entry point
│       │   ├── routes/         # TanStack Router pages
│       │   │   ├── __root.tsx  # Root layout
│       │   │   └── index.tsx   # Home page
│       │   ├── components/     # React components
│       │   │   └── ui/         # Shadcn components
│       │   ├── lib/
│       │   │   ├── api.ts      # Hono RPC client
│       │   │   └── utils.ts    # Helpers
│       │   └── stores/         # Zustand stores
│       ├── public/
│       │   └── _routes.json    # Cloudflare Pages routing
│       ├── index.html
│       └── package.json
│
├── packages/
│   ├── db/                      # Database schema package
│   │   ├── src/
│   │   │   ├── schema.ts       # Drizzle table definitions
│   │   │   └── index.ts        # Exports
│   │   ├── drizzle.config.ts   # Drizzle Kit config
│   │   └── package.json
│   │
│   └── shared/                  # Shared types and validation
│       ├── src/
│       │   ├── schemas.ts      # Zod validation schemas
│       │   ├── types.ts        # Shared TypeScript types
│       │   └── index.ts        # Exports
│       └── package.json
│
├── scripts/
│   └── setup.ts                 # Interactive setup script
├── biome.json                   # Biome config (linting + formatting)
├── turbo.json                   # Turborepo pipeline config
└── package.json                 # Root workspace
```

## Development Workflows

### Adding a New API Endpoint

**Example: Add a "GET /api/posts" endpoint**

#### 1. Define Database Schema

**File:** `packages/db/src/schema.ts`

```typescript
export const posts = sqliteTable('posts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	content: text('content').notNull(),
	userId: integer('user_id').references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

#### 2. Create Zod Schema

**File:** `packages/shared/src/schemas.ts`

```typescript
export const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1),
	userId: z.number().int().positive(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

#### 3. Generate & Apply Migration

```bash
cd apps/backend
bun run db:generate  # Creates new migration file
bun run db:migrate   # Applies to local DB
```

#### 4. Add API Handler

**File:** `apps/backend/src/routes/api.ts`

```typescript
import { posts } from '@repo/db/schema';
import { createPostSchema } from '@repo/shared';

// GET /api/posts
api.get('/posts', async (c) => {
	const db = c.get('db');
	const allPosts = await db.select().from(posts).all();

	return c.json<ApiResponse<typeof allPosts>>({
		success: true,
		data: allPosts,
	});
});

// POST /api/posts
api.post('/posts', zValidator('json', createPostSchema), async (c) => {
	const db = c.get('db');
	const data = c.req.valid('json');

	const result = await db.insert(posts).values(data).returning().get();

	return c.json<ApiResponse<typeof result>>(
		{
			success: true,
			data: result,
		},
		201
	);
});
```

#### 5. Use in Frontend

**File:** `apps/frontend/src/routes/posts.tsx`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function PostsPage() {
	// Fully typed! Autocomplete works!
	const { data } = useQuery({
		queryKey: ['posts'],
		queryFn: async () => {
			const res = await apiClient.api.posts.$get();
			return res.json();
		},
	});

	const createPost = useMutation({
		mutationFn: async (post: { title: string; content: string; userId: number }) => {
			const res = await apiClient.api.posts.$post({ json: post });
			return res.json();
		},
	});

	// Component JSX...
}
```

**That's it!** Types flow automatically from DB → Backend → Frontend.

### Database Migrations

**⚠️ CRITICAL RULES:**

1. **Never delete migrations** that have been applied to production
2. **Always create new migrations** for schema changes
3. **Test locally first** before applying to production

**Workflow:**

```bash
# 1. Edit packages/db/src/schema.ts
# 2. Generate migration
cd apps/backend
bun run db:generate

# 3. Review generated SQL in migrations/ folder
cat migrations/0001_*.sql

# 4. Apply locally
bun run db:migrate

# 5. Test thoroughly

# 6. Apply to production
bun run db:migrate:prod
```

### Type Safety Flow

```
┌─────────────────────────────────────────────────────────┐
│ packages/db/schema.ts                                   │
│ ┌─────────────────────────────────────────┐            │
│ │ export const users = sqliteTable(...)   │            │
│ │ export type User = typeof users.$inferSelect │       │
│ └─────────────────────────────────────────┘            │
│                       ↓                                 │
│ apps/backend/src/routes/api.ts                         │
│ ┌─────────────────────────────────────────┐            │
│ │ const users = await db.select()         │            │
│ │         .from(users).all();             │            │
│ │ // users is User[] ✓                    │            │
│ └─────────────────────────────────────────┘            │
│                       ↓                                 │
│ Hono RPC Client (auto-generated types)                 │
│                       ↓                                 │
│ apps/frontend/src/routes/index.tsx                     │
│ ┌─────────────────────────────────────────┐            │
│ │ const res = await apiClient.api.users   │            │
│ │               .$get();                  │            │
│ │ const data = await res.json();          │            │
│ │ // data.data is User[] ✓                │            │
│ └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Adding Shadcn Components

```bash
cd apps/frontend
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add dialog
# etc.
```

Components are added to `apps/frontend/src/components/ui/`

### State Management

**TanStack Query:** For server state (API data)

```typescript
const { data } = useQuery({
	queryKey: ['users'],
	queryFn: fetchUsers,
});
```

**Zustand:** For client state (UI state, temporary data)

```typescript
// apps/frontend/src/stores/userStore.ts
export const useUserStore = create<UserState>((set) => ({
	currentUser: null,
	setCurrentUser: (user) => set({ currentUser: user }),
}));
```

**TanStack Router:** For URL state

```typescript
export const Route = createFileRoute('/users/$userId')({
	loader: async ({ params }) => {
		// params.userId is available
	},
});
```

## Environment & Configuration

### Backend (apps/backend/wrangler.toml)

```toml
# Default (development)
name = "bhvr-backend"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "bhvr-db"
database_id = "local-db"  # For local dev
migrations_dir = "migrations"

[vars]
ENVIRONMENT = "development"

# Production
[env.production]
name = "bhvr-backend-prod"

[env.production.vars]
ENVIRONMENT = "production"

[[env.production.d1_databases]]
binding = "DB"
database_name = "bhvr-db"
database_id = "YOUR_PRODUCTION_DB_ID"  # Set during setup
migrations_dir = "migrations"
```

### Frontend (apps/frontend)

**Local:** Uses `http://localhost:8787` (auto-configured in `vite.config.ts`)

**Production:** Set `VITE_API_URL` in Cloudflare Pages dashboard

## Common Commands

```bash
# Development
bun dev                    # Start all apps (frontend + backend)
bun build                  # Build all apps
bun run type-check         # Type check entire project

# Setup
bun run setup              # Interactive setup (creates DB, updates config)

# Database
cd apps/backend
bun run db:generate        # Generate migration from schema changes
bun run db:migrate         # Apply migrations locally
bun run db:migrate:prod    # Apply migrations to production

# Deployment
cd apps/backend
bun run deploy             # Deploy backend to Workers

cd apps/frontend
bun run build              # Build frontend
bunx wrangler pages deploy dist --project-name=bhvr  # Deploy frontend

# Code Quality
bun run lint               # Check code with Biome
bun run lint:fix           # Fix auto-fixable issues
bun run format             # Format code

# Pre-commit hooks run automatically on git commit
```

## Known Patterns & Conventions

### File Naming

-  React components: PascalCase (`UserCard.tsx`)
-  Utilities: camelCase (`formatDate.ts`)
-  Routes: kebab-case or dynamic (`users/$userId.tsx`)
-  Database schemas: camelCase with plural (`users`, `posts`)

### Import Aliases

-  `@/` → `apps/frontend/src/`
-  `@repo/db` → `packages/db`
-  `@repo/shared` → `packages/shared`

### API Response Format

```typescript
interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
```

### Error Handling

-  Backend: Return appropriate HTTP status codes (400, 404, 409, 500)
-  Frontend: Use TanStack Query's `isError` and `error` states
-  Always log errors server-side for debugging

## Deployment

### Backend (Cloudflare Workers)

```bash
cd apps/backend
bun run db:migrate:prod  # First time or after schema changes
bun run deploy
```

### Frontend (Cloudflare Pages)

**Option 1: Git Integration (Recommended)**

1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Build command: `cd apps/frontend && bun install && bun run build`
4. Output directory: `apps/frontend/dist`
5. Set `VITE_API_URL` environment variable

**Option 2: CLI**

```bash
cd apps/frontend
bun run build
bunx wrangler pages deploy dist --project-name=bhvr
```

## Troubleshooting

### "table already exists" during migration

-  You regenerated migrations after they were applied
-  Solution: Delete local DB `rm -rf apps/backend/.wrangler/state/v3/d1` and reapply

### CORS errors

-  Backend CORS is configured for `localhost` and `*.pages.dev`
-  Add custom domains in `apps/backend/src/index.ts`

### Type errors after adding endpoint

-  Restart TypeScript server in your editor
-  Run `bun install` to update Hono RPC types

### D1 database not found

-  Check `database_id` in `wrangler.toml`
-  For local dev, it should be `"local-db"`
-  For production, run `bunx wrangler d1 create bhvr-db` and use the returned ID

## Contributing Guidelines

When making changes:

1. Run `bun run type-check` to catch type errors
2. Run `bun run lint:fix` to format code
3. Test locally with `bun dev`
4. Pre-commit hooks will run automatically
5. Update this guide if you change architecture

## Architecture Decisions

### Why Cloudflare?

-  Global edge network (fast everywhere)
-  Generous free tier (perfect for side projects)
-  D1 brings database to the edge
-  Workers + Pages integrate seamlessly

### Why Hono?

-  Smallest, fastest web framework for Workers
-  Built-in RPC for type-safe client-server communication
-  Better DX than tRPC for simple use cases

### Why Drizzle?

-  Type-safe SQL with great autocomplete
-  Lightweight (perfect for edge)
-  SQL-first approach (no magic, just SQL)

### Why TanStack Stack?

-  Router: Type-safe, file-based routing
-  Query: Industry standard for async state
-  Both integrate perfectly

### Why Zustand?

-  Simplest client state (versus Redux/Jotai)
-  Minimal boilerplate
-  Works great alongside TanStack Query

## Future Enhancements

Planned features:

-  [ ] Authentication (Clerk or WorkOS)
-  [ ] File uploads (Cloudflare R2)
-  [ ] Real-time (WebSockets/Durable Objects)
-  [ ] Email (Resend)
-  [ ] Testing setup (Vitest)

## Resources

-  [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
-  [Hono Documentation](https://hono.dev)
-  [Drizzle ORM](https://orm.drizzle.team)
-  [TanStack Router](https://tanstack.com/router)
-  [TanStack Query](https://tanstack.com/query)
-  [Shadcn UI](https://ui.shadcn.com)
