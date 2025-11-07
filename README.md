# 🦫 bhvr - Cloudflare Fullstack Template

> Fork this. Build your app. Deploy to the edge. Type-safe from database to UI.

**[Live Demo](https://bhvr-typesafe-cloudflare-template.pages.dev)** • **[Backend API](https://cloudflare-fullstack-backend.fyzan-shaik.workers.dev)** • **[AI Agent Context](./AGENTS.md)**

## What You Get

Type-safe fullstack monorepo ready for production:

-  ⚡ **Hono RPC** - Autocomplete API calls from frontend to backend
-  🗄️ **Drizzle ORM** - Type-safe SQL queries with **Cloudflare D1** (SQLite) or **PostgreSQL**
-  🎨 **React + TanStack** - Router, Query, modern UI
-  🚀 **Deploy anywhere** - Workers for backend, Pages for frontend
-  📦 **Turborepo** - Fast builds, caching, parallel execution
-  🔄 **Database Flexible** - Switch between D1 and PostgreSQL in ~30 mins ([guide](./docs/POSTGRESQL.md))

## Database Options

This template works with **both** Cloudflare D1 (SQLite) and PostgreSQL:

| Database                    | Setup Time | Best For                            | Free Tier                                                                        |
| --------------------------- | ---------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| **Cloudflare D1** (default) | 5 mins     | Global edge apps, simple CRUD       | 5M reads, 100K writes/day                                                        |
| **PostgreSQL**              | 30 mins    | Complex queries, existing workflows | Provider-dependent ([Neon](https://neon.tech), [Supabase](https://supabase.com)) |

**Currently configured:** Cloudflare D1 (SQLite)

**Want PostgreSQL instead?** Follow the [PostgreSQL Migration Guide](./docs/POSTGRESQL.md) (~30 mins)

> **Note:** All PostgreSQL code is already included as comments in the codebase. Just uncomment and swap!

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

## Manual Setup (Alternative to Automated Script)

If you prefer to set up manually or the automated script fails, follow these steps:

### 1. Install Dependencies

```bash
bun install
```

### 2. Authenticate with Cloudflare

```bash
bunx wrangler login
```

This will open your browser to authenticate with Cloudflare.

**If authentication fails:**
- Your session may have expired. Run `bunx wrangler login` again.
- Check that you have a Cloudflare account with Workers access.

### 3. Create D1 Database

```bash
bunx wrangler d1 create bhvr-db
```

**Note:** You can use any name for your database. Replace `bhvr-db` with your preferred name.

The command will output something like:
```
✅ Successfully created DB 'bhvr-db'!

[[d1_databases]]
binding = "DB"
database_name = "bhvr-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** - you'll need it in the next step.

### 4. Update wrangler.toml

Open `apps/backend/wrangler.toml` and find the production database configuration:

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "cloudflare-d1-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

**Update these values:**
- Replace `YOUR_DATABASE_ID_HERE` with the `database_id` from step 3
- Replace `cloudflare-d1-db` with your database name (if different)

**Important:** The local development database uses `database_id = "local-db"` - don't change this!

### 5. Apply Migrations

```bash
cd apps/backend
bun run db:migrate
```

This applies migrations to your local database.

### 6. Seed Demo Data (Optional)

```bash
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com'), ('Bob Smith', 'bob@example.com'), ('Charlie Davis', 'charlie@example.com')"
```

### 7. Verify Setup

```bash
bunx wrangler d1 list
```

This shows all your D1 databases. You should see your newly created database.

## Database Management Commands

### List All Databases

```bash
bunx wrangler d1 list
```

Shows all D1 databases in your Cloudflare account with their names and IDs.

### Get Database Details

```bash
bunx wrangler d1 info <database-name>
```

Shows detailed information about a specific database, including:
- Database ID
- Creation date
- Size
- Location

### Execute SQL Commands

**Local database:**
```bash
bunx wrangler d1 execute <database-name> --local --command "SELECT * FROM users"
```

**Production database:**
```bash
bunx wrangler d1 execute <database-name> --command "SELECT * FROM users"
```

### Understanding wrangler.toml Database Configuration

The `apps/backend/wrangler.toml` file has two database configurations:

**1. Local Development (default):**
```toml
[[d1_databases]]
binding = "DB"
database_name = "cloudflare-d1-db"
database_id = "local-db"
migrations_dir = "migrations"
```
- Used when running `bun dev` locally
- `database_id = "local-db"` is a special value for local development
- Don't change this unless you know what you're doing

**2. Production:**
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "cloudflare-d1-db"
database_id = "your-actual-database-id"
migrations_dir = "migrations"
```
- Used when deploying to Cloudflare Workers
- `database_id` must match the ID from `wrangler d1 create`
- `database_name` should match the name you used when creating the database

## 🔐 GitHub Actions Setup (Required for Auto-Deployment)

**Skip this if:** You plan to deploy manually via CLI only.

**Required if:** You want automatic deployments when pushing to `main` branch.

To enable GitHub Actions auto-deployment, add two secrets to your repository:

### Quick Setup:

1. **Go to your GitHub repo** → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add both:

| Secret Name | How to Get It | Purpose |
|-------------|---------------|---------|
| `CLOUDFLARE_API_TOKEN` | [Create at dash.cloudflare.com](https://dash.cloudflare.com/profile/api-tokens) → Use template **"Edit Cloudflare Workers"** | Allows GitHub to deploy your Worker |
| `CLOUDFLARE_ACCOUNT_ID` | [Find in Workers dashboard](https://dash.cloudflare.com) → Copy from right sidebar | Identifies your Cloudflare account |

**Without these secrets, your GitHub Actions deployment will fail with:**
```
✘ [ERROR] In a non-interactive environment, it's necessary to set a 
CLOUDFLARE_API_TOKEN environment variable for wrangler to work.
```

See detailed instructions in the [CI/CD section](#cicd) below.

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

## Troubleshooting

### Setup Script Issues

**"You are not logged in to Cloudflare" or "authentication failed"**

- Your Cloudflare session may have expired
- Run: `bunx wrangler login`
- This will open your browser to re-authenticate

**"Could not extract database_id automatically"**

- The script will show the full output from `wrangler d1 create`
- Look for a line like: `database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`
- Copy the database_id and manually update `apps/backend/wrangler.toml`
- See [Manual Setup](#manual-setup-alternative-to-automated-script) for detailed instructions

**"Database already exists"**

- The database name you chose is already in use
- List existing databases: `bunx wrangler d1 list`
- Use a different name or get the ID of the existing database: `bunx wrangler d1 info <database-name>`

**"Failed to update wrangler.toml"**

- Make sure the file exists at `apps/backend/wrangler.toml`
- Check file permissions
- Manually edit the file following the [Manual Setup](#manual-setup-alternative-to-automated-script) instructions

### Database Issues

**"table already exists" during migration**

- You may have regenerated migrations after they were applied
- Solution: Delete local DB and reapply migrations:
  ```bash
  rm -rf apps/backend/.wrangler/state/v3/d1
  cd apps/backend && bun run db:migrate
  ```

**"D1 database not found"**

- Check `database_id` in `apps/backend/wrangler.toml`
- For local dev, it should be `"local-db"`
- For production, verify the ID matches your database: `bunx wrangler d1 list`
- Update the ID if it doesn't match

**"Cannot find database" when deploying**

- Verify your production `database_id` in `wrangler.toml` matches your actual database
- Run `bunx wrangler d1 list` to see all databases and their IDs
- Make sure you're using the correct database name in the production config

### Development Issues

**CORS errors**

- Backend CORS is configured for `localhost` and `*.pages.dev`
- Add custom domains in `apps/backend/src/index.ts` if needed
- Make sure frontend is using the correct API URL

**Type errors after adding endpoint**

- Restart TypeScript server in your editor
- Run `bun install` to update Hono RPC types
- Run `bun run type-check` to verify types

**Frontend can't connect to backend**

- Make sure backend is running: `bun dev` should start both
- Check backend is accessible at `http://localhost:8787`
- Verify `VITE_API_URL` in frontend (defaults to `http://localhost:8787`)

### Getting Help

- Check the [Manual Setup](#manual-setup-alternative-to-automated-script) section
- Review [Database Management Commands](#database-management-commands)
- See [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- Check [Hono Documentation](https://hono.dev)

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

## CI/CD {#cicd}

### Automated Workflows (GitHub Actions)

**⚠️ Important:** Before GitHub Actions can deploy, you must add repository secrets. [Jump to Quick Setup](#-github-actions-setup-required-for-auto-deployment) if you haven't done this yet.

**`.github/workflows/ci.yml`** - Runs on every PR and push to main:

-  ✓ Installs dependencies
-  ✓ Runs linting (`bun run lint`)
-  ✓ Runs type checking (`bun run type-check`)

**`.github/workflows/deploy-backend.yml`** - Auto-deploys backend to Workers:

-  Triggers on push to main when backend files change
-  Builds and deploys to Cloudflare Workers
-  **Requires:** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets

### Setup GitHub Actions Secrets (Detailed)

> **Quick setup instructions are [here](#-github-actions-setup-required-for-auto-deployment)**

To enable automatic deployments, add these secrets to your repository:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

**`CLOUDFLARE_API_TOKEN`**

-  Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
-  Click **Create Token**
-  Use template: **Edit Cloudflare Workers**
-  Or create custom token with permissions:
   -  Account > Workers Scripts > Edit
   -  Account > Account Settings > Read
-  Copy the token and add it as a secret

**`CLOUDFLARE_ACCOUNT_ID`**

-  Go to [Workers & Pages](https://dash.cloudflare.com/) dashboard
-  Copy your Account ID from the right sidebar
-  Add it as a secret

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
   -  **Build command:** `cd apps/frontend && bun install && bun run build`
   -  **Build output:** `apps/frontend/dist`
5. Add environment variable:
   -  `VITE_API_URL` = `https://your-worker.workers.dev`

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

-  **[docs/POSTGRESQL.md](./docs/POSTGRESQL.md)** - Complete guide to switch from D1 to PostgreSQL (~30 mins)
-  **[AGENTS.md](./AGENTS.md)** - Complete context for AI agents working on this project (patterns, conventions, architecture, workflows)
-  **[Cloudflare Docs](https://developers.cloudflare.com)** - Workers, Pages, D1 documentation
-  **[Hono Docs](https://hono.dev)** - Web framework + RPC guide
-  **[Drizzle Docs](https://orm.drizzle.team)** - ORM and query builder
-  **[TanStack Docs](https://tanstack.com)** - Router and Query

## License

MIT - Fork it, build something awesome! 🚀
