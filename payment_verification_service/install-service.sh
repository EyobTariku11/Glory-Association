#!/bin/bash

# Install script for Payment Verification Service
# This will create a systemd service that runs the Go service continuously

set -e

SERVICE_NAME="payment-verification-service"
SERVICE_DESCRIPTION="Payment Verification Service - Checks pending payments every 2 minutes"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER=$(whoami)

echo "Installing Payment Verification Service..."

# Build the Go application
echo "Building Go application..."
cd "$SCRIPT_DIR"
go mod download
go build -o payment-verification-service main.go

if [ ! -f "$SCRIPT_DIR/payment-verification-service" ]; then
    echo "Error: Failed to build the application"
    exit 1
fi

echo "Build successful!"

# Create systemd service file
echo "Creating systemd service..."
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

echo "DAFTech@2024" | su -c "tee \"$SERVICE_FILE\" > /dev/null <<EOF
[Unit]
Description=$SERVICE_DESCRIPTION
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/payment-verification-service
Restart=always
RestartSec=10
Environment=DB_CONNECTION_STRING="server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;"
Environment=SMS_API_URL="https://api.geezsms.com/api/v1/sms/send"
Environment=SMS_TOKEN="iZElUoYIHoGUYJpTj00mODa0GrNcgtKN"
Environment=API_BASE_URL="http://localhost:5000/api"
Environment=CHECK_INTERVAL_MINUTES=2

# Logging
StandardOutput=append:$SCRIPT_DIR/logs/payment-verification.log
StandardError=append:$SCRIPT_DIR/logs/payment-verification-error.log

[Install]
WantedBy=multi-user.target
EOF

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Enable and start the service
echo "Enabling and starting the service..."
echo "DAFTech@2024" | su -c "systemctl daemon-reload"
echo "DAFTech@2024" | su -c "systemctl enable \"$SERVICE_NAME\""
echo "DAFTech@2024" | su -c "systemctl start \"$SERVICE_NAME\""

echo ""
echo "Installation complete!"
echo ""
echo "Service status:"
echo "DAFTech@2024" | su -c "systemctl status \"$SERVICE_NAME\" --no-pager"

echo ""
echo "Useful commands:"
echo "  Start service:   sudo systemctl start $SERVICE_NAME"
echo "  Stop service:    sudo systemctl stop $SERVICE_NAME"
echo "  Restart service: sudo systemctl restart $SERVICE_NAME"
echo "  View logs:       tail -f $SCRIPT_DIR/logs/payment-verification.log"
echo "  View status:     sudo systemctl status $SERVICE_NAME"

