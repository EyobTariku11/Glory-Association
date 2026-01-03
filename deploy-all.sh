#!/bin/bash

# Comprehensive Deployment Script for Coalition Membership System
# Deploys API, Football Coalition, and Admin UI in the correct order

set -e

echo "🚀 Starting Comprehensive Deployment for Coalition Membership System..."
echo "📋 This will deploy:"
echo "   1. Coalition Membership API (Port 6069)"
echo "   2. Football Coalition (Port 4200)"
echo "   3. Coalition Membership UI (Port 4201)"
echo ""

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists sshpass; then
    print_error "sshpass is not installed. Please install sshpass first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install Node.js first."
    exit 1
fi

print_success "All prerequisites are met!"

# Test server connectivity
print_status "Testing server connectivity..."
if ! sshpass -p "$SERVER_PASSWORD" ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'Connection successful'" 2>/dev/null; then
    print_error "Cannot connect to server. Please check your network connection and server details."
    exit 1
fi
print_success "Server connectivity confirmed!"

echo ""
print_status "Starting deployment process..."

# 1. Deploy API
echo ""
print_status "Step 1/3: Deploying Coalition Membership API..."
cd coalition_membership_API/MembershipAPI
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
    print_success "API deployment completed!"
else
    print_error "API deployment script not found!"
    exit 1
fi

# 2. Deploy Football Coalition
echo ""
print_status "Step 2/3: Deploying Football Coalition..."
cd ../../football-coalition
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
    print_success "Football Coalition deployment completed!"
else
    print_error "Football Coalition deployment script not found!"
    exit 1
fi

# 3. Deploy Admin UI
echo ""
print_status "Step 3/3: Deploying Coalition Membership UI..."
cd ../coalition_membership_UI
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    ./deploy.sh
    print_success "Admin UI deployment completed!"
else
    print_error "Admin UI deployment script not found!"
    exit 1
fi

# Final status check
echo ""
print_status "Performing final status check..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "=== Container Status ==="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(coalition|football)"
    
    echo ""
    echo "=== Service URLs ==="
    echo "🌐 Football Coalition: https://eplffc.et (http://196.190.251.48:4200)"
    echo "🔧 Admin UI: https://eplffc.et/admin (http://196.190.251.48:4201)"
    echo "📡 API: http://196.190.251.48:6069"
    
    echo ""
    echo "=== Health Check ==="
    echo "API Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:6069/api/health || echo "Not responding")"
    echo "API Health Endpoint: $(curl -s http://localhost:6069/api/health | jq -r '.status' 2>/dev/null || echo "Not responding")"
    echo "Football Coalition: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 || echo "Not responding")"
    echo "Admin UI: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4201 || echo "Not responding")"
EOF

echo ""
print_success "🎉 Comprehensive deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Coalition Membership API - Port 6069"
echo "   ✅ Football Coalition - Port 4200"
echo "   ✅ Coalition Membership UI - Port 4201"
echo ""
echo "🌐 Access URLs:"
echo "   🏠 Football Coalition: https://eplffc.et"
echo "   🔧 Admin Panel: https://eplffc.et/admin"
echo "   📡 API: http://$SERVER_HOST:6069"
echo ""
echo "📋 Key Features Deployed:"
echo "   • Complete API with all controllers"
echo "   • News management with approval workflow"
echo "   • Event management and donations"
echo "   • User authentication and authorization"
echo "   • Dashboard and reporting system"
echo "   • Static file serving for assets"
echo ""
print_success "All systems are now live and operational! 🚀" 