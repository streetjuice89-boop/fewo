#!/bin/bash
# VoyageNest Init Script (run as regular user)

set -e

cd "$(dirname "$0")"

echo "=== VoyageNest Initialization ==="
echo ""

# Backend setup
echo "🔧 Setting up Laravel backend..."
cd backend

# Generate app key if needed
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    php artisan key:generate 2>/dev/null || echo "Key generation skipped"
fi

# Create database
echo "📊 Setting up database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS voyagenest;" 2>/dev/null || echo "Database may already exist or MySQL needs configuration"

# Run migrations
php artisan migrate --force 2>/dev/null || echo "Migration skipped - run manually with: php artisan migrate"

# Seed database
php artisan db:seed --force 2>/dev/null || echo "Seeding skipped - run manually with: php artisan db:seed"

cd ..

# Frontend setup
echo "🎨 Setting up frontends..."

if [ -d "frontend/web" ]; then
    cd frontend/web
    npm install
    cd ../..
fi

if [ -d "frontend/admin" ]; then
    cd frontend/admin
    npm install
    cd ../..
fi

echo ""
echo "✅ VoyageNest initialized!"
echo ""
echo "Start the development servers with:"
echo "   bash start.sh"



