#!/bin/bash

# Docker Cleanup Script for Coalition Membership API
# This script removes all existing Docker images and containers

set -e

echo "🧹 Docker Cleanup for Coalition Membership API"
echo "==============================================="

# Configuration
IMAGE_NAME="coalition-membership-api"
CONTAINER_NAME="coalition-membership-api"

echo "🐳 Stopping and removing containers..."
docker stop $CONTAINER_NAME 2>/dev/null || echo "Container $CONTAINER_NAME not running"
docker rm $CONTAINER_NAME 2>/dev/null || echo "Container $CONTAINER_NAME not found"

echo "🗑️ Removing Docker images..."
docker rmi $IMAGE_NAME:latest 2>/dev/null || echo "Image $IMAGE_NAME:latest not found"
docker images | grep $IMAGE_NAME | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || echo "No images to remove"

echo "🧹 Cleaning Docker build cache..."
docker builder prune -f

echo "🧹 Cleaning unused Docker resources..."
docker system prune -f

echo "📋 Current Docker images:"
docker images | grep $IMAGE_NAME || echo "No coalition-membership-api images found"

echo "📋 Current Docker containers:"
docker ps -a | grep $CONTAINER_NAME || echo "No coalition-membership-api containers found"

echo "✅ Docker cleanup completed!"
echo ""
echo "🎯 You can now run a fresh deployment with:"
echo "   ./deploy-simple.sh"
