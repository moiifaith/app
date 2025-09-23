#!/bin/bash

# Zikr App Deployment Script for Cloudflare
# Run this script to deploy your app to Cloudflare Pages

set -e  # Exit on any error

echo "🕌 Starting Zikr App Deployment to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    echo "   or"
    echo "   curl -fsSL https://workers.cloudflare.com/install | sh"
    exit 1
fi

# Check if user is logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please log in to Cloudflare:"
    wrangler login
fi

echo "✅ Authenticated with Cloudflare"

# Step 1: Create D1 Database
echo "🗄️ Creating D1 Database..."
echo "Run this command and copy the database ID:"
echo "wrangler d1 create zikr-database"
echo ""
echo "After creating the database, update wrangler.toml with the database_id"
echo "Press any key to continue..."
read -n 1

# Step 2: Create KV Namespace
echo "🔑 Creating KV Namespace for translations..."
echo "Run this command and copy the namespace ID:"
echo "wrangler kv:namespace create TRANSLATIONS"
echo ""
echo "After creating the namespace, update wrangler.toml with the id"
echo "Press any key to continue..."
read -n 1

# Step 3: Initialize database
echo "📊 Do you want to initialize the database with sample data? (y/n)"
read -r init_db
if [[ $init_db =~ ^[Yy]$ ]]; then
    echo "Initializing database..."
    echo "wrangler d1 execute zikr-database --file=./functions/schema.sql"
fi

# Step 4: Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Build complete!"

# Step 5: Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
echo "Run this command to deploy:"
echo "wrangler pages deploy dist --project-name=zikr-app"

echo ""
echo "🎉 Deployment script complete!"
echo ""
echo "Manual steps remaining:"
echo "1. Run: wrangler d1 create zikr-database"
echo "2. Run: wrangler kv:namespace create TRANSLATIONS"
echo "3. Update wrangler.toml with the IDs"
echo "4. Run: wrangler d1 execute zikr-database --file=./functions/schema.sql"
echo "5. Run: wrangler pages deploy dist --project-name=zikr-app"
echo ""
echo "Your Zikr app will be available at: https://zikr-app.pages.dev"