#!/bin/bash

# Coalition Membership UI Deployment Script
# Enhanced with proper asset handling and build process

set -e

echo "🚀 Starting Coalition Membership UI Deployment..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
IMAGE_NAME="coalition-membership-ui"
CONTAINER_NAME="coalition-membership-ui"
PORT="4201"

echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .angular/

echo "📦 Installing dependencies..."
npm ci --silent

echo "🔨 Building Angular application..."
npm run build

echo "📋 Verifying build output..."
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "📊 Build size check..."
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "📦 Build size: $BUILD_SIZE"

echo "📋 Copying web.config for routing..."
cp web.config dist/

echo "🐳 Building Docker image for AMD64 platform..."
docker build --platform linux/amd64 -t $IMAGE_NAME:latest .

echo "💾 Saving Docker image as tar file..."
docker save $IMAGE_NAME:latest | gzip > ${IMAGE_NAME}.tar.gz

echo "📤 Transferring image to server..."
sshpass -p "$SERVER_PASSWORD" scp ${IMAGE_NAME}.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Loading image on server and deploying..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "Loading Docker image..."
    docker load < /tmp/${IMAGE_NAME}.tar.gz
    
    echo "Stopping existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    echo "Starting new container with enhanced functionality..."
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:4201 \
        $IMAGE_NAME:latest
    
    echo "Cleaning up..."
    rm /tmp/${IMAGE_NAME}.tar.gz
    
    echo "✅ UI deployment completed!"
    echo "🌐 Admin UI is accessible at: https://eplffc.et/admin"
    echo "🔗 Direct access: http://$SERVER_HOST:$PORT"
    echo "📊 Available features:"
    echo "   - Coalition Dashboard with association overviews"
    echo "   - Association-specific dashboards"
    echo "   - Comprehensive Reports system"
    echo "   - Role-based access control"
    echo "   - News management with approval workflow"
    echo "   - Event management and donations"
    
    echo "📊 Container status:"
    docker ps | grep $CONTAINER_NAME
EOF

echo "🧹 Cleaning up local files..."
rm ${IMAGE_NAME}.tar.gz

echo "✅ Coalition Membership UI deployment completed successfully!"
echo "🎯 Enhanced with proper asset handling!"
echo "🌐 Admin UI is accessible at: https://eplffc.et/admin"
echo "🔗 Direct access: http://$SERVER_HOST:$PORT" 