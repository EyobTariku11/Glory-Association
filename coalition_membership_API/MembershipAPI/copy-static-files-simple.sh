#!/bin/bash

# Copy Static Files to Persistent Storage (Simple Version)
# This script copies wwwroot files to a directory accessible by the API

set -e

echo "📁 Copying static files to persistent storage..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"

# Create a temporary tar file of wwwroot
echo "📦 Creating archive of wwwroot files..."
cd .. && tar -czf wwwroot-files.tar.gz MembershipAPI/wwwroot/

echo "📤 Transferring files to server..."
sshpass -p "$SERVER_PASSWORD" scp wwwroot-files.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Extracting files on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "Creating wwwroot directory in home..."
    mkdir -p ~/wwwroot
    
    echo "Extracting files to ~/wwwroot..."
    tar -xzf /tmp/wwwroot-files.tar.gz -C ~/wwwroot --strip-components=2
    
    echo "Setting proper permissions..."
    chmod -R 755 ~/wwwroot
    
    echo "Creating symlink to /var/wwwroot if possible..."
    sudo ln -sf ~/wwwroot /var/wwwroot 2>/dev/null || echo "Could not create symlink to /var/wwwroot"
    
    echo "Cleaning up..."
    rm /tmp/wwwroot-files.tar.gz
    
    echo "✅ Static files copied successfully!"
    echo "📁 Files are now available at:"
    echo "   https://eplffc.et/api/wwwroot/Association/"
    echo "   https://eplffc.et/api/wwwroot/Member/"
    echo "   https://eplffc.et/api/wwwroot/Coalition/"
    echo ""
    echo "📂 Files are stored in: ~/wwwroot"
    ls -la ~/wwwroot/
EOF

echo "🧹 Cleaning up local files..."
rm wwwroot-files.tar.gz

echo "✅ Static files deployment completed!"
echo "🎯 Files are now accessible at https://eplffc.et/api/wwwroot/" 