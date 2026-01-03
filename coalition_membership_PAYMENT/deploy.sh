#!/bin/bash

set -e

echo "Starting Coalition Membership Payment deployment..."

# Build Docker image for AMD64
echo "Building Docker image for AMD64 platform..."
docker build --platform linux/amd64 -t coalition-payment .

# Save and transfer
echo "Saving and transferring to server..."
docker save coalition-payment -o coalition-payment.tar
scp coalition-payment.tar timret@196.190.251.48:/home/timret/

# Deploy on server
echo "Deploying on server..."
ssh timret@196.190.251.48 << 'EOF'
docker load -i /home/timret/coalition-payment.tar
docker stop coalition-payment || true
docker rm coalition-payment || true
docker run -d --name coalition-payment --restart unless-stopped -p 8080:8080 coalition-payment
rm /home/timret/coalition-payment.tar
echo "Deployment completed!"
docker ps | grep coalition-payment
EOF

# Clean up local tar file
rm -f coalition-payment.tar

echo "Coalition Membership Payment deployed successfully!"
echo "Payment service accessible at: http://196.190.251.48:8080"
echo "Payment endpoints: http://196.190.251.48:8080/arifpay" 