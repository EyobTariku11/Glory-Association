#!/bin/bash

# Local Football Coalition Deployment Script
# For testing and development purposes

set -e

echo "🚀 Starting Local Football Coalition deployment..."

echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .angular/

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Angular application..."
npm run build

echo "📋 Verifying build output..."
if [ ! -d "dist/football-coalition/browser" ]; then
    echo "❌ Build failed - dist/football-coalition/browser not found"
    exit 1
fi

echo "📊 Build size check..."
BUILD_SIZE=$(du -sh dist/football-coalition/browser | cut -f1)
echo "📦 Build size: $BUILD_SIZE"

echo "🌐 Starting local server..."
echo "✅ Local deployment completed!"
echo "🔗 Site accessible at: http://localhost:4200"
echo "📁 Build files in: dist/football-coalition/browser"

# Optionally start a simple HTTP server
echo "🚀 Starting simple HTTP server..."
cd dist/football-coalition/browser
python3 -m http.server 4200 2>/dev/null || python -m SimpleHTTPServer 4200 2>/dev/null || echo "Please install Python or use a different HTTP server" 