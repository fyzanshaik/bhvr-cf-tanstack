#!/bin/bash

# Cloudflare Fullstack Setup Script
# This script helps you set up the development environment

set -e  # Exit on error

echo "🚀 Cloudflare Fullstack Monorepo Setup"
echo "======================================"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it from https://bun.sh"
    exit 1
fi

echo "✅ Bun is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install
echo ""

# Navigate to backend
cd apps/backend

echo "🗄️ Setting up database..."
echo ""

echo "📝 Generating database migrations..."
bun run db:generate

echo ""
echo "🔧 Applying migrations..."
bun run db:migrate

echo ""
echo "🌱 Seeding database with demo data..."
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Alice Johnson', 'alice@example.com')"
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT OR IGNORE INTO users (id, name, email) VALUES (2, 'Bob Smith', 'bob@example.com')"
bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT OR IGNORE INTO users (id, name, email) VALUES (3, 'Charlie Davis', 'charlie@example.com')"

echo ""
echo "✅ Verifying data..."
bunx wrangler d1 execute cloudflare-d1-db --local --command "SELECT * FROM users"

cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start development servers: bun dev"
echo "2. Open frontend: http://localhost:5173"
echo "3. Check backend API: http://localhost:8787"
echo ""
echo "📚 For more information, see:"
echo "   - README.md - Full documentation"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo ""
echo "Happy coding! 🎉"

