#!/bin/bash

# Deployment Verification Script
# This script helps verify that the deployment is working correctly

set -e

echo "🔍 Coalition Membership API Deployment Verification"
echo "=================================================="

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
PORT="6069"

echo ""
echo "📊 Checking deployment status..."

# Check if we can connect to the server
echo "🌐 Testing server connectivity..."
if ! sshpass -p "$SERVER_PASSWORD" ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to server. Please check your network connection."
    exit 1
fi
echo "✅ Server connectivity confirmed!"

# Check container status
echo ""
echo "🐳 Checking container status..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep coalition-membership-api || echo "Container not found"
    
    echo ""
    echo "Container Details:"
    docker inspect coalition-membership-api 2>/dev/null | grep -A 5 -B 5 "Image" || echo "Container not found"
    
    echo ""
    echo "Build Timestamp:"
    docker exec coalition-membership-api env | grep BUILD_TIMESTAMP 2>/dev/null || echo "Build timestamp not found"
EOF

# Test API endpoints
echo ""
echo "🧪 Testing API endpoints..."

# Health check
echo "Health Check:"
curl -s "http://$SERVER_HOST:$PORT/api/health" | jq '.' 2>/dev/null || curl -s "http://$SERVER_HOST:$PORT/api/health"

# Test specific endpoints
echo ""
echo "Testing specific endpoints:"
echo "Events:"
curl -s "http://$SERVER_HOST:$PORT/api/events" | jq '. | length' 2>/dev/null || echo "Events endpoint failed"

echo "Donation Targets:"
curl -s "http://$SERVER_HOST:$PORT/api/donationtargets" | jq '. | length' 2>/dev/null || echo "Donation targets endpoint failed"

echo "Members:"
curl -s "http://$SERVER_HOST:$PORT/api/members" | jq '. | length' 2>/dev/null || echo "Members endpoint failed"

# Check file timestamps
echo ""
echo "📁 Checking file timestamps..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "Application files:"
    docker exec coalition-membership-api find /app -name "*.dll" -exec stat -c "%y %n" {} \; | head -5 2>/dev/null || echo "Could not check application files"
    
    echo ""
    echo "Controller files:"
    docker exec coalition-membership-api ls -la /app/Controllers/Events/ 2>/dev/null || echo "Could not check controller files"
EOF

# Check logs
echo ""
echo "📋 Recent container logs:"
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    docker logs coalition-membership-api --tail 20 2>/dev/null || echo "Could not retrieve logs"
EOF

echo ""
echo "✅ Verification completed!"
echo ""
echo "🌐 API URL: http://$SERVER_HOST:$PORT"
echo "📊 Health Check: http://$SERVER_HOST:$PORT/api/health"
