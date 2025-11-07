# 🚀 Quick Start Guide

Get your Cloudflare fullstack app running in 5 minutes!

## Step 1: Install Dependencies

```bash
bun install
```

## Step 2: Set Up Local Database

```bash
cd apps/backend

# Generate database schema (creates migration files)
bun run db:generate

# Apply migrations to local database
bun run db:migrate
```

**Note**: For local development, Wrangler automatically creates a local D1 database when you run migrations or start the dev server. No need to create it manually!

## Step 3: Seed Database with Demo Data

```bash
# Still in apps/backend directory
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com')"

bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Bob Smith', 'bob@example.com')"

bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Charlie Davis', 'charlie@example.com')"

# Verify data was inserted
bunx wrangler d1 execute cloudflare-d1-db --local --command "SELECT * FROM users"
```

## Step 4: Start Development Servers

### Option A: Start Both Together (Recommended)

```bash
# From project root
cd ../..
bun dev
```

### Option B: Start Separately

```bash
# Terminal 1 - Backend
cd apps/backend
bun dev

# Terminal 2 - Frontend (in new terminal)
cd apps/frontend
bun dev
```

## Step 5: Open Your Browser

-  **Frontend**: http://localhost:5173
-  **Backend API**: http://localhost:8787

## ✅ You Should See

1. **Home Page** (`/`):

   -  Welcome message
   -  Feature cards
   -  API connection test showing "Hello from Cloudflare Workers + Hono!"

2. **Users Page** (`/users`):
   -  Form to add new users
   -  Table showing the 3 demo users you seeded
   -  Ability to create new users and see them appear instantly

## 🎉 Success Indicators

-  ✅ Frontend loads without errors
-  ✅ API connection test shows green checkmark
-  ✅ Users page displays demo users
-  ✅ You can create new users via the form
-  ✅ New users appear in the table immediately

## 🐛 Troubleshooting

### Port Already in Use

If ports 5173 or 8787 are in use:

**Frontend (5173):** Edit `apps/frontend/vite.config.ts` and change the port:

```typescript
server: {
  port: 3000, // Change to any available port
}
```

**Backend (8787):** Edit `apps/backend/wrangler.toml`:

```toml
[dev]
port = 8788  # Change to any available port
```

### Database Not Found

If you get "database not found" errors, just run migrations:

```bash
cd apps/backend
bun run db:migrate
```

The local D1 database is automatically created when you apply migrations or start the dev server.

### CORS Errors

Make sure both servers are running and the frontend proxy is configured correctly in `apps/frontend/vite.config.ts`.

### Type Errors

If you see TypeScript errors:

```bash
bun install
bun run type-check
```

## 📚 Next Steps

1. **Explore the Code**: Check out the file structure in `apps/` and `packages/`
2. **Modify the Schema**: Edit `packages/db/src/schema.ts` and regenerate migrations
3. **Add API Endpoints**: Add routes in `apps/backend/src/routes/api.ts`
4. **Create Components**: Add UI components in `apps/frontend/src/components/`
5. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) when ready

## 🎓 Learn the Stack

-  **Hono**: Fast web framework for the edge
-  **D1**: SQLite database on Cloudflare's network
-  **Drizzle**: Type-safe ORM for database operations
-  **React**: UI library
-  **TanStack Router**: Type-safe routing
-  **TanStack Query**: Server state management
-  **Tailwind + Shadcn**: Beautiful UI components

Enjoy building! 🚀
