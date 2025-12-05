#!/bin/bash

# Frontend production build script with VITE_API_URL
# Usage: ./scripts/build-frontend-production.sh [API_URL]
# Example: ./scripts/build-frontend-production.sh https://api.example.com

set -e

# Get API URL from argument or environment variable
API_URL=${1:-${VITE_API_URL}}

if [ -z "$API_URL" ]; then
  echo "❌ Error: VITE_API_URL is required"
  echo "Usage: ./scripts/build-frontend-production.sh [API_URL]"
  echo "   or: VITE_API_URL=https://api.example.com ./scripts/build-frontend-production.sh"
  exit 1
fi

echo "🚀 Building frontend with VITE_API_URL=$API_URL"
echo "📦 Building packages/web..."

cd packages/web

# Set VITE_API_URL and build
VITE_API_URL=$API_URL npm run build

echo "✅ Build completed successfully!"
echo "📁 Output: packages/web/dist"

