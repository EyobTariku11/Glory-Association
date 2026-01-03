#!/bin/bash

# Docker-based Payment Verification Service Deployment Script

set -e

echo "🚀 Starting Payment Verification Service Docker Deployment..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
IMAGE_NAME="payment-verification-service"
CONTAINER_NAME="payment-verification-service"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🧹 Cleaning previous builds..."
rm -f ${IMAGE_NAME}.tar.gz

echo "📦 Building Docker image for AMD64 platform..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${TIMESTAMP} -t ${IMAGE_NAME}:latest .

echo "💾 Saving Docker image as tar file..."
docker save ${IMAGE_NAME}:latest | gzip > ${IMAGE_NAME}.tar.gz

echo "📤 Transferring to server..."
sshpass -p "$SERVER_PASSWORD" scp ${IMAGE_NAME}.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Deploying on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "=== Stopping existing container ==="
    docker stop $CONTAINER_NAME 2>/dev/null || echo "Container not running"
    docker rm $CONTAINER_NAME 2>/dev/null || echo "Container not found"
    
    echo "=== Removing old Docker image ==="
    docker images | grep $IMAGE_NAME | awk '{print \$3}' | xargs -r docker rmi -f || echo "No old images to remove"
    
    echo "=== Loading new Docker image ==="
    if [ -f "/tmp/${IMAGE_NAME}.tar.gz" ]; then
        echo "Loading new Docker image..."
        docker load < /tmp/${IMAGE_NAME}.tar.gz
        
        if docker images | grep -q "$IMAGE_NAME.*latest"; then
            echo "✅ New image loaded successfully!"
        else
            echo "❌ ERROR: Image not loaded properly!"
            exit 1
        fi
    else
        echo "❌ ERROR: Image file not found on server!"
        exit 1
    fi
    
    echo "=== Starting new container ==="
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -e DB_CONNECTION_STRING="server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;" \
        -e SMS_API_URL="https://api.geezsms.com/api/v1/sms/send" \
        -e SMS_TOKEN="iZElUoYIHoGUYJpTj00mODa0GrNcgtKN" \
        -e API_BASE_URL="http://localhost:5000/api" \
        -e CHECK_INTERVAL_MINUTES=2 \
        -v /home/timret/payment-verification-service/logs:/app/logs \
        $IMAGE_NAME:latest
    
    echo "=== Waiting for container to start ==="
    sleep 3
    
    echo "=== Verifying deployment ==="
    if docker ps | grep -q $CONTAINER_NAME; then
        echo "✅ Container is running!"
        docker ps | grep $CONTAINER_NAME
    else
        echo "❌ Container not running! Checking logs..."
        docker logs $CONTAINER_NAME --tail 20
        exit 1
    fi
    
    echo "=== Viewing container logs ==="
    docker logs $CONTAINER_NAME --tail 20
    
    echo "=== Cleaning up ==="
    rm -f /tmp/${IMAGE_NAME}.tar.gz
    
    echo "✅ Payment Verification Service deployed successfully!"
    echo "📋 Container name: $CONTAINER_NAME"
    echo "📊 View logs: docker logs -f $CONTAINER_NAME"
    echo "📊 View status: docker ps | grep $CONTAINER_NAME"
EOF

echo "🧹 Cleaning up local files..."
rm -f ${IMAGE_NAME}.tar.gz

echo "✅ Deployment completed successfully!"
echo "🎯 Payment Verification Service deployed as Docker container!"
echo "📋 Container name: $CONTAINER_NAME"
echo "⏰ Checking interval: 2 minutes"
echo ""
echo "Useful commands on server:"
echo "  View logs:  docker logs -f $CONTAINER_NAME"
echo "  Status:     docker ps | grep $CONTAINER_NAME"
echo "  Restart:    docker restart $CONTAINER_NAME"
echo "  Stop:       docker stop $CONTAINER_NAME"

