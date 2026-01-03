#!/bin/bash

# Update Apache Configuration for eplffc.et
# This script updates the Apache config to fix Angular routing issues

set -e

echo "🔧 Updating Apache Configuration for eplffc.et..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"

echo "📤 Uploading fixed Apache configuration..."
sshpass -p "$SERVER_PASSWORD" scp apache-config-fixed.conf $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Updating Apache configuration on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    echo "Backing up existing Apache config..."
    echo "DAFTech@2024" | su -c "cp /etc/apache2/sites-available/eplffc.et.conf /etc/apache2/sites-available/eplffc.et.conf.backup"
    
    echo "Installing new Apache configuration..."
    echo "DAFTech@2024" | su -c "cp /tmp/apache-config-fixed.conf /etc/apache2/sites-available/eplffc.et.conf"
    
    echo "Testing Apache configuration..."
    echo "DAFTech@2024" | su -c "apache2ctl configtest"
    
    if [ $? -eq 0 ]; then
        echo "Reloading Apache..."
        echo "DAFTech@2024" | su -c "systemctl reload apache2"
        
        echo "✅ Apache configuration updated successfully!"
        echo "🌐 Your site should now work at: https://eplffc.et"
        echo "🔗 /jerseys and /tickets should now work properly!"
    else
        echo "❌ Apache configuration test failed!"
        echo "Restoring backup..."
        echo "DAFTech@2024" | su -c "cp /etc/apache2/sites-available/eplffc.et.conf.backup /etc/apache2/sites-available/eplffc.et.conf"
        exit 1
    fi
    
    echo "Cleaning up..."
    rm /tmp/apache-config-fixed.conf
EOF

echo "✅ Apache configuration updated successfully!"
echo "🎯 Now when someone visits https://eplffc.et/jerseys or /tickets,"
echo "   it will be properly routed to your Football Coalition container!"
echo ""
echo "📋 Test your routes:"
echo "   - https://eplffc.et/jerseys"
echo "   - https://eplffc.et/tickets" 