#!/bin/bash

# Payment Verification Service Deployment Script

set -e

echo "🚀 Starting Payment Verification Service Deployment..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
SERVICE_NAME="payment-verification-service"
SERVICE_DIR="$HOME/payment-verification-service"
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

echo "🔧 Deploying on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "=== Creating service directory ==="
    mkdir -p $SERVICE_DIR
    mkdir -p $SERVICE_DIR/logs
    
    echo "=== Extracting service files ==="
    tar -xzf /tmp/payment-verification-service_${TIMESTAMP}.tar.gz -C $SERVICE_DIR/
    chmod +x $SERVICE_DIR/payment-verification-service
    
    echo "=== Creating systemd service file ==="
    cat > /tmp/$SERVICE_NAME.service << 'EOSERVICE'
[Unit]
Description=Payment Verification Service - Checks pending payments every 2 minutes
After=network.target

[Service]
Type=simple
User=timret
WorkingDirectory=$SERVICE_DIR
ExecStart=$SERVICE_DIR/payment-verification-service
Restart=always
RestartSec=10

# Environment variables
Environment=DB_CONNECTION_STRING="server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;"
Environment=SMS_API_URL="https://api.geezsms.com/api/v1/sms/send"
Environment=SMS_TOKEN="iZElUoYIHoGUYJpTj00mODa0GrNcgtKN"
Environment=API_BASE_URL="http://localhost:5000/api"
Environment=CHECK_INTERVAL_MINUTES=2

# Logging
StandardOutput=append:$SERVICE_DIR/logs/payment-verification.log
StandardError=append:$SERVICE_DIR/logs/payment-verification-error.log

[Install]
WantedBy=multi-user.target
EOSERVICE

    echo "=== Installing systemd service file ==="
    echo "DAFTech@2024" | su -c "cp /tmp/$SERVICE_NAME.service /etc/systemd/system/$SERVICE_NAME.service"
    echo "DAFTech@2024" | su -c "chmod 644 /etc/systemd/system/$SERVICE_NAME.service"
    
    echo "=== Reloading systemd ==="
    echo "DAFTech@2024" | su -c "systemctl daemon-reload"
    
    echo "=== Stopping existing service ==="
    echo "DAFTech@2024" | su -c "systemctl stop $SERVICE_NAME 2>/dev/null" || true
    
    echo "=== Starting service ==="
    echo "DAFTech@2024" | su -c "systemctl enable $SERVICE_NAME"
    echo "DAFTech@2024" | su -c "systemctl start $SERVICE_NAME"
    
    echo "=== Waiting for service to start ==="
    sleep 5
    
    echo "=== Service Status ==="
    echo "DAFTech@2024" | su -c "systemctl status $SERVICE_NAME --no-pager" || echo "Service may need manual start with password"
    
    echo "=== Cleaning up ==="
    rm -f /tmp/payment-verification-service_${TIMESTAMP}.tar.gz
    
    echo "✅ Payment Verification Service deployed successfully!"
    echo ""
    echo "📍 Service location: $SERVICE_DIR"
    echo "📋 Logs: $SERVICE_DIR/logs/payment-verification.log"
    echo "📊 Service status: sudo systemctl status $SERVICE_NAME"
    echo "📝 View logs: tail -f $SERVICE_DIR/logs/payment-verification.log"
EOF

echo "🧹 Cleaning up local files..."
rm -f payment-verification-service_${TIMESTAMP}.tar.gz

echo "✅ Deployment completed successfully!"
echo ""
echo "🎯 Service deployed and running on server!"
echo "📋 Service name: $SERVICE_NAME"
echo "⏰ Checking interval: 2 minutes"
echo ""
echo "Useful commands on server:"
echo "  View logs:  tail -f $SERVICE_DIR/logs/payment-verification.log"
echo "  Status:     sudo systemctl status $SERVICE_NAME"
echo "  Restart:    sudo systemctl restart $SERVICE_NAME"
echo "  Stop:       sudo systemctl stop $SERVICE_NAME"

