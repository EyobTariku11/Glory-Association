#!/bin/bash

# Comprehensive Dashboard and Reports Deployment Script
# Deploys both Backend API and Frontend UI with enhanced functionality

set -e

echo "🎯 ========================================="
echo "🎯 Coalition Membership Dashboard & Reports"
echo "🎯 Comprehensive Deployment Script"
echo "🎯 ========================================="
echo ""

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"

echo "🚀 Starting comprehensive deployment..."

# Step 1: Deploy Backend API
echo ""
echo "📦 Step 1: Deploying Enhanced Backend API..."
echo "=============================================="
cd coalition_membership_API/MembershipAPI
chmod +x deploy.sh
./deploy.sh
cd ../..

echo ""
echo "✅ Backend API deployment completed!"

# Step 2: Deploy Frontend UI
echo ""
echo "🎨 Step 2: Deploying Enhanced Frontend UI..."
echo "============================================="
cd coalition_membership_UI
chmod +x deploy.sh
./deploy.sh
cd ..

echo ""
echo "✅ Frontend UI deployment completed!"

# Step 3: Verify deployment
echo ""
echo "🔍 Step 3: Verifying deployment..."
echo "=================================="
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "Checking running containers..."
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Checking API health..."
    curl -s http://localhost:6069/api/health || echo "API health check failed"
    
    echo ""
    echo "Checking UI accessibility..."
    curl -s http://localhost:4201 | head -5 || echo "UI accessibility check failed"
EOF

echo ""
echo "🎉 ========================================="
echo "🎉 Deployment Summary"
echo "🎉 ========================================="
echo "✅ Backend API: http://$SERVER_HOST:6069"
echo "✅ Admin UI: https://eplffc.et/admin"
echo ""
echo "📊 New Dashboard Features:"
echo "   • Coalition Overview Dashboard"
echo "   • Association-specific Dashboards"
echo "   • Comprehensive Reports System"
echo "   • Role-based Access Control"
echo "   • Export functionality (JSON, PDF, Excel)"
echo ""
echo "🔗 Key API Endpoints:"
echo "   • Coalition Overview: /api/coalition/overview"
echo "   • Association Dashboard: /api/association/dashboard"
echo "   • Reports Generation: /api/reports"
echo "   • Report Types: /api/reports/types"
echo ""
echo "🎯 Enhanced with Dashboard and Reports functionality!"
echo "🎯 Deployment completed successfully!" 