#!/bin/bash

# Frontend production build script with VITE_API_URL
# Usage: ./scripts/build-frontend-production.sh [API_URL]
# Example: ./scripts/build-frontend-production.sh https://api.example.com

set -e

# Change to script's directory, then go up to project root
cd "$(dirname "$0")"
cd ..

# Get API URL from argument, environment variable, or use default Render URL
API_URL=${1:-${VITE_API_URL:-https://vip-ride-api.onrender.com}}

if [ "$API_URL" = "https://vip-ride-api.onrender.com" ] && [ -z "$1" ] && [ -z "$VITE_API_URL" ]; then
  echo "ℹ️  No API URL provided, using default: $API_URL"
  echo "   To use a different URL, pass it as argument or set VITE_API_URL"
fi

echo "🚀 Building frontend with VITE_API_URL=$API_URL"
echo "📦 Building packages/web..."

cd packages/web

# Set VITE_API_URL and build
VITE_API_URL=$API_URL npm run build

echo "✅ Build completed successfully!"
echo "📁 Output: packages/web/dist"

