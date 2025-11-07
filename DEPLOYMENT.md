# Deployment Guide

This guide walks you through deploying your fullstack application to Cloudflare.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/sign-up
2. **Wrangler CLI**: Already included in the project
3. **Bun**: Install from https://bun.sh

## Backend Deployment (Cloudflare Workers)

### 1. Authenticate with Cloudflare

```bash
cd apps/backend
bunx wrangler login
```

### 2. Create D1 Database (Production)

```bash
bunx wrangler d1 create cloudflare-d1-db
```

**Note**: This creates a production D1 database (not local). This will output a database ID. Copy it and update `apps/backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "cloudflare-d1-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Paste the ID here
```

### 3. Generate and Run Migrations

```bash
# Generate migrations from Drizzle schema
bun run db:generate

# Apply migrations to production database
bun run db:migrate:prod
```

### 4. Deploy Backend

```bash
bun run deploy
```

Your backend will be deployed to a URL like: `https://cloudflare-fullstack-backend.YOUR_SUBDOMAIN.workers.dev`

### 5. Seed Database (Optional)

You can seed your database with demo data using the Wrangler CLI:

```bash
bunx wrangler d1 execute cloudflare-d1-db --remote --command "INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com')"
bunx wrangler d1 execute cloudflare-d1-db --remote --command "INSERT INTO users (name, email) VALUES ('Bob Smith', 'bob@example.com')"
```

## Frontend Deployment (Cloudflare Pages)

### 1. Build the Frontend

```bash
cd apps/frontend
bun run build
```

### 2. Update API URL

Create a `.env.production` file in `apps/frontend/`:

```env
VITE_API_URL=https://cloudflare-fullstack-backend.YOUR_SUBDOMAIN.workers.dev
```

Rebuild:

```bash
bun run build
```

### 3. Deploy to Cloudflare Pages

#### Option A: Direct Upload

```bash
bunx wrangler pages deploy dist --project-name=cloudflare-fullstack-frontend
```

#### Option B: Git Integration (Recommended for Production)

1. Push your code to GitHub/GitLab
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   -  **Build command**: `cd apps/frontend && bun install && bun run build`
   -  **Build output directory**: `apps/frontend/dist`
   -  **Root directory**: `/`
6. Add environment variable:
   -  `VITE_API_URL`: Your Worker URL
7. Click "Save and Deploy"

### 4. Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Add your domain (must be on Cloudflare)
4. DNS records will be automatically configured

## Environment Variables

### Backend (.dev.vars for local, wrangler.toml for production)

-  `ENVIRONMENT`: development or production

### Frontend (.env for local, Cloudflare Pages settings for production)

-  `VITE_API_URL`: Backend API URL

## Monitoring and Logs

### View Backend Logs

```bash
cd apps/backend
bunx wrangler tail
```

### View Pages Deployment Logs

Check the Cloudflare Dashboard → Pages → Your Project → Deployments

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your Worker's CORS configuration includes your Pages domain:

```typescript
// apps/backend/src/index.ts
cors({
	origin: ['https://your-pages-domain.pages.dev'],
	credentials: true,
});
```

### Database Migration Issues

If migrations fail, you can check the D1 database:

```bash
bunx wrangler d1 execute cloudflare-d1-db --remote --command "SELECT * FROM users"
```

### Build Failures

Ensure all workspace dependencies are installed:

```bash
# From root
bun install
```

## Updating Deployments

### Backend Updates

```bash
cd apps/backend
bun run deploy
```

### Frontend Updates

If using Git integration, just push to your repository. If using direct upload:

```bash
cd apps/frontend
bun run build
bunx wrangler pages deploy dist --project-name=cloudflare-fullstack-frontend
```

## Cost Estimation

Cloudflare's free tier includes:

-  **Workers**: 100,000 requests/day
-  **Pages**: Unlimited requests, 500 builds/month
-  **D1**: 5 GB storage, 5 million reads/day, 100,000 writes/day

This is more than enough for development and small-to-medium production apps!
