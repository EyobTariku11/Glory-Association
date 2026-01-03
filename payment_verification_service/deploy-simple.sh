#!/bin/bash

# Simple Payment Verification Service Deployment Script
# Uploads files to server, then you run setup commands on server

set -e

echo "🚀 Starting Payment Verification Service Deployment..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
SERVICE_NAME="payment-verification-service"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🧹 Cleaning previous builds..."
rm -f payment-verification-service
rm -f payment-verification-service_${TIMESTAMP}.tar.gz

echo "📦 Downloading Go dependencies..."
go mod download

echo "🔨 Building Go binary for Linux..."
GOOS=linux GOARCH=amd64 go build -o payment-verification-service main.go

if [ ! -f "payment-verification-service" ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"
ls -lh payment-verification-service

echo "📦 Creating deployment package..."
tar -czf payment-verification-service_${TIMESTAMP}.tar.gz payment-verification-service

echo "📤 Transferring to server..."
sshpass -p "$SERVER_PASSWORD" scp payment-verification-service_${TIMESTAMP}.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo ""
echo "✅ Files uploaded to server!"
echo ""
echo "Now run these commands on the server:"
echo ""
echo "ssh $SERVER_USER@$SERVER_HOST"
echo ""
echo "# Extract files"
echo "mkdir -p ~/payment-verification-service/logs"
echo "tar -xzf /tmp/payment-verification-service_${TIMESTAMP}.tar.gz -C ~/payment-verification-service/"
echo "chmod +x ~/payment-verification-service/payment-verification-service"
echo ""
echo "# Create systemd service file"
echo 'echo "DAFTech@2024" | su -c "tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << '\''EOF'\''"'
echo "[Unit]"
echo "Description=Payment Verification Service - Checks pending payments every 2 minutes"
echo "After=network.target"
echo ""
echo "[Service]"
echo "Type=simple"
echo "User=timret"
echo "WorkingDirectory=\$HOME/payment-verification-service"
echo "ExecStart=\$HOME/payment-verification-service/payment-verification-service"
echo "Restart=always"
echo "RestartSec=10"
echo ""
echo "# Environment variables"
echo "Environment=DB_CONNECTION_STRING=\"server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;\""
echo "Environment=SMS_API_URL=\"https://api.geezsms.com/api/v1/sms/send\""
echo "Environment=SMS_TOKEN=\"iZElUoYIHoGUYJpTj00mODa0GrNcgtKN\""
echo "Environment=API_BASE_URL=\"http://localhost:5000/api\""
echo "Environment=CHECK_INTERVAL_MINUTES=2"
echo ""
echo "# Logging"
echo "StandardOutput=append:\$HOME/payment-verification-service/logs/payment-verification.log"
echo "StandardError=append:\$HOME/payment-verification-service/logs/payment-verification-error.log"
echo ""
echo "[Install]"
echo "WantedBy=multi-user.target"
echo "EOF"
echo ""
echo "# Enable and start service"
echo 'echo "DAFTech@2024" | su -c "systemctl daemon-reload"'
echo 'echo "DAFTech@2024" | su -c "systemctl enable $SERVICE_NAME"'
echo 'echo "DAFTech@2024" | su -c "systemctl start $SERVICE_NAME"'
echo 'echo "DAFTech@2024" | su -c "systemctl status $SERVICE_NAME"'
echo ""
echo "# View logs"
echo "tail -f ~/payment-verification-service/logs/payment-verification.log"

