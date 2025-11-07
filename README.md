# 🦫 bhvr - Cloudflare Fullstack Template

> Fork this. Build your app. Deploy to the edge. Type-safe from database to UI.

**[Live Demo](https://bhvr-typesafe-cloudflare-template.pages.dev)** • **[Backend API](https://cloudflare-fullstack-backend.fyzan-shaik.workers.dev)** • **[AI Agent Context](./AGENTS.md)**

## What You Get

Type-safe fullstack monorepo ready for production:

-  ⚡ **Hono RPC** - Autocomplete API calls from frontend to backend
-  🗄️ **Drizzle + D1** - Type-safe SQL queries on Cloudflare's edge
-  🎨 **React + TanStack** - Router, Query, modern UI
-  🚀 **Deploy anywhere** - Workers for backend, Pages for frontend
-  📦 **Turborepo** - Fast builds, caching, parallel execution

## Quick Start

### 1. Install & Setup

```bash
# Clone your fork
git clone <your-fork>
cd bhvr-cloudflare-d1

# Install dependencies
bun install

# Run interactive setup (creates DB, updates config, applies migrations)
bun run setup
```

**What `setup` does:**

1. ✓ Checks Bun installed
2. ✓ Verifies Cloudflare authentication (`wrangler login`)
3. ✓ Creates D1 database in your Cloudflare account
4. ✓ Updates `wrangler.toml` with production database ID
5. ✓ Applies database migrations locally
6. ✓ Seeds demo data

### 2. Start Development

```bash
bun dev
```

Visit **http://localhost:5173** 🎉

## Development Workflow

### Want to add a new API endpoint?

**Example: Add a "posts" feature**

#### Step 1: Define Schema

**`packages/db/src/schema.ts`**

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

#### Step 2: Create Validation

**`packages/shared/src/schemas.ts`**

```typescript
export const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1),
	userId: z.number().int().positive(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

#### Step 3: Generate Migration

```bash
cd apps/backend
bun run db:generate  # Creates migration file
bun run db:migrate   # Applies to local DB
```

#### Step 4: Add API Handler

**`apps/backend/src/routes/api.ts`**

```typescript
import { posts } from '@repo/db/schema';
import { createPostSchema } from '@repo/shared';

api.get('/posts', async (c) => {
	const db = c.get('db');
	const allPosts = await db.select().from(posts).all();
	return c.json({ success: true, data: allPosts });
});

api.post('/posts', zValidator('json', createPostSchema), async (c) => {
	const db = c.get('db');
	const data = c.req.valid('json');
	const result = await db.insert(posts).values(data).returning().get();
	return c.json({ success: true, data: result }, 201);
});
```

#### Step 5: Use in Frontend

**`apps/frontend/src/routes/posts.tsx`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function PostsPage() {
	const { data } = useQuery({
		queryKey: ['posts'],
		queryFn: async () => {
			const res = await apiClient.api.posts.$get(); // ← Fully typed!
			return res.json();
		},
	});

	// Use data.data (it's typed as Post[])
}
```

**That's it!** Types flow automatically: `DB → Backend → Frontend`

### Want to change the database?

```bash
# 1. Edit packages/db/src/schema.ts (add/modify tables)
# 2. Generate migration
cd apps/backend && bun run db:generate

# 3. Review the SQL
cat migrations/0001_*.sql

# 4. Apply locally
bun run db:migrate

# 5. Test your changes
cd ../.. && bun dev

# 6. Deploy to production (when ready)
cd apps/backend && bun run db:migrate:prod
```

**⚠️ Never delete old migrations once applied to production!**

## Deployment

### Backend (Cloudflare Workers)

```bash
cd apps/backend

# Apply database migrations to production (first time or after schema changes)
bun run db:migrate:prod

# Deploy the Worker
bun run deploy
```

Your API is live at `https://your-worker.workers.dev`

### Frontend (Cloudflare Pages)

**Option A: Git Integration (Recommended)**

1. Push to GitHub
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Connect repository
4. Build settings:
   -  **Build command:** `cd apps/frontend && bun install && bun run build`
   -  **Build output:** `apps/frontend/dist`
5. Environment variable:
   -  `VITE_API_URL` = `https://your-worker.workers.dev`

**Option B: CLI Deploy**

```bash
cd apps/frontend
bun run build
bunx wrangler pages deploy dist --project-name=bhvr-frontend
```

## Project Structure

```
apps/
├── backend/          # Hono API → Cloudflare Workers
│   ├── src/routes/   # API endpoints
│   ├── migrations/   # Database migrations (auto-generated)
│   └── wrangler.toml # Worker configuration
│
└── frontend/         # React SPA → Cloudflare Pages
    ├── src/routes/   # TanStack Router pages
    ├── src/lib/api.ts # Hono RPC client (type-safe!)
    └── src/components/ # React components

packages/
├── db/               # Drizzle schema shared between apps
│   └── src/schema.ts # Table definitions → types flow from here
│
└── shared/           # Zod schemas & types shared between apps
    ├── src/schemas.ts # Request validation
    └── src/types.ts   # Shared TypeScript types
```

## Commands

```bash
# Development
bun dev              # Start all apps (frontend + backend)
bun run type-check   # Check types across monorepo
bun run lint         # Lint with Biome
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format code with Biome

# Database
cd apps/backend
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Apply migrations locally
bun run db:migrate:prod # Apply to production

# Deployment
cd apps/backend && bun run deploy      # Deploy backend
cd apps/frontend && bun run build      # Build frontend
```

## Adding UI Components

```bash
cd apps/frontend
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add dialog
# See https://ui.shadcn.com for all components
```

## Code Quality

### Biome (Linting + Formatting)

Configured in `biome.json` - fast, all-in-one toolchain:

```bash
bun run lint         # Check for issues
bun run lint:fix     # Fix auto-fixable issues
bun run format       # Format all code
bun run type-check   # TypeScript type checking
```

### Optional: Git Hooks

Want to run checks before commits? Add a pre-commit hook:

```bash
# Create .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
bun run lint:fix && bun run type-check
EOF

chmod +x .git/hooks/pre-commit
```

Or use your preferred tool: [husky](https://typicode.github.io/husky/), [lefthook](https://github.com/evilmartians/lefthook), etc.

## CI/CD

### Automated Workflows (GitHub Actions)

**`.github/workflows/ci.yml`** - Runs on every PR and push to main:

-  ✓ Installs dependencies
-  ✓ Runs linting (`bun run lint`)
-  ✓ Runs type checking (`bun run type-check`)

**`.github/workflows/deploy-backend.yml`** - Auto-deploys backend to Workers:

-  Triggers on push to main when backend files change
-  Builds and deploys to Cloudflare Workers

#### Setup GitHub Actions Secrets

To enable automatic deployments, add these secrets to your repository:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

**`CLOUDFLARE_API_TOKEN`**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
- Click **Create Token**
- Use template: **Edit Cloudflare Workers**
- Or create custom token with permissions:
  - Account > Workers Scripts > Edit
  - Account > Account Settings > Read
- Copy the token and add it as a secret

**`CLOUDFLARE_ACCOUNT_ID`**
- Go to [Workers & Pages](https://dash.cloudflare.com/) dashboard
- Copy your Account ID from the right sidebar
- Add it as a secret

**Without these secrets, deployment will fail with:**
```
✘ [ERROR] In a non-interactive environment, it's necessary to set a 
CLOUDFLARE_API_TOKEN environment variable for wrangler to work.
```

**Frontend Deployment:**

Connect your repo to Cloudflare Pages for automatic deployments (recommended):
1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project** → **Connect to Git**
3. Select your repository
4. Build settings:
   - **Build command:** `cd apps/frontend && bun install && bun run build`
   - **Build output:** `apps/frontend/dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-worker.workers.dev`

### Manual Deployment

If you prefer manual control, deploy via CLI:

```bash
# Backend
cd apps/backend && bun run deploy

# Frontend
cd apps/frontend
bun run build
bunx wrangler pages deploy dist --project-name=your-project-name
```

## Type Safety Flow

```
┌─────────────────────────────────────────────────────────┐
│  packages/db/schema.ts                                  │
│  Define: export const users = sqliteTable(...)          │
│  Types: export type User = typeof users.$inferSelect    │
│                           ↓                             │
│  apps/backend/routes/api.ts                             │
│  Query: const users = await db.select().from(users)     │
│  Return: c.json({ data: users })  // users is User[]    │
│                           ↓                             │
│  Hono RPC (automatic type inference)                    │
│                           ↓                             │
│  apps/frontend/routes/index.tsx                         │
│  Call: const res = await apiClient.api.users.$get()     │
│  Use: res.json().data  // Typed as User[]! ✨           │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React 18, Vite, TanStack Router/Query     |
| Backend    | Hono, Cloudflare Workers                  |
| Database   | Cloudflare D1 (SQLite), Drizzle ORM       |
| Styling    | Tailwind CSS v4, Shadcn UI                |
| State      | TanStack Query (server), Zustand (client) |
| Validation | Zod                                       |
| Monorepo   | Turborepo, Bun                            |
| Deployment | Cloudflare Pages + Workers + D1           |

## Need More Context?

-  **[AGENTS.md](./AGENTS.md)** - Complete context for AI agents working on this project (patterns, conventions, architecture, workflows)
-  **[Cloudflare Docs](https://developers.cloudflare.com)** - Workers, Pages, D1 documentation
-  **[Hono Docs](https://hono.dev)** - Web framework + RPC guide
-  **[Drizzle Docs](https://orm.drizzle.team)** - ORM and query builder
-  **[TanStack Docs](https://tanstack.com)** - Router and Query

## License

MIT - Fork it, build something awesome! 🚀
