#!/bin/bash

# Setup Reverse Proxy for eplffc.et
# This script sets up Nginx as a reverse proxy to route traffic to Docker containers

set -e

echo "🔧 Setting up Reverse Proxy for eplffc.et..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"

echo "📤 Uploading reverse proxy configuration..."
sshpass -p "$SERVER_PASSWORD" scp nginx-reverse-proxy.conf $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Installing and configuring Nginx on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "Installing Nginx..."
    echo "DAFTech@2024" | su -c "apt update"
    echo "DAFTech@2024" | su -c "apt install -y nginx"
    
    echo "Backing up existing Nginx config..."
    echo "DAFTech@2024" | su -c "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup"
    
    echo "Installing new reverse proxy configuration..."
    echo "DAFTech@2024" | su -c "cp /tmp/nginx-reverse-proxy.conf /etc/nginx/sites-available/eplffc.et"
    
    echo "Enabling the site..."
    echo "DAFTech@2024" | su -c "ln -sf /etc/nginx/sites-available/eplffc.et /etc/nginx/sites-enabled/"
    echo "DAFTech@2024" | su -c "rm -f /etc/nginx/sites-enabled/default"
    
    echo "Testing Nginx configuration..."
    echo "DAFTech@2024" | su -c "nginx -t"
    
    if [ $? -eq 0 ]; then
        echo "Reloading Nginx..."
        echo "DAFTech@2024" | su -c "systemctl reload nginx"
        echo "DAFTech@2024" | su -c "systemctl enable nginx"
        
        echo "✅ Reverse proxy setup completed!"
        echo "🌐 Your site should now work at: https://eplffc.et"
        echo "🔗 /jerseys and /tickets should now work properly!"
    else
        echo "❌ Nginx configuration test failed!"
        exit 1
    fi
    
    echo "Cleaning up..."
    rm /tmp/nginx-reverse-proxy.conf
EOF

echo "✅ Reverse proxy setup completed!"
echo "🎯 Now when someone visits https://eplffc.et/jerseys or /tickets,"
echo "   it will be properly routed to your Football Coalition container!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure your domain eplffc.et points to $SERVER_HOST"
echo "   2. Deploy your Football Coalition app: ./deploy.sh"
echo "   3. Test the routes: https://eplffc.et/jerseys" 