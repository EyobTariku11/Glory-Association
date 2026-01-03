#!/bin/bash

# Unified Coalition Membership API Deployment Script
# Removes old API build on server, applies new one, and handles wwwroot in /var/coalition_membership/wwwroot

set -e

echo "🚀 Starting Unified Coalition Membership API Deployment..."

# Configuration
SERVER_HOST="196.190.251.48"
SERVER_USER="timret"
SERVER_PASSWORD="DAFTech@2024"
IMAGE_NAME="coalition-membership-api"
CONTAINER_NAME="coalition-membership-api"
PORT="6069"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🧹 Cleaning previous builds..."
cd ..
rm -rf MembershipAPI/bin/
rm -rf MembershipImplementation/bin/
rm -rf MembershipInfrustructure/bin/
rm -rf MembershipAPI/obj/
rm -rf MembershipImplementation/obj/
rm -rf MembershipInfrustructure/obj/

echo "📦 Restoring packages..."
dotnet restore "Coalition_Membership_API.sln"

echo "🔨 Building solution..."
dotnet build "Coalition_Membership_API.sln" -c Release --no-restore

echo "📋 Publishing API..."
dotnet publish "MembershipAPI/MembershipAPI.csproj" -c Release -o ./publish --no-build

echo "📅 Build timestamp: $TIMESTAMP"
echo "📁 Published files:"
ls -la ./publish/

echo "📦 Building Docker image for AMD64 platform..."
docker build --platform linux/amd64 \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    --build-arg BUILD_VERSION=$TIMESTAMP \
    --build-arg BUILD_TIMESTAMP=$TIMESTAMP \
    -t $IMAGE_NAME:$TIMESTAMP -t $IMAGE_NAME:latest -f MembershipAPI/Dockerfile .

echo "💾 Saving Docker image as tar file..."
docker save $IMAGE_NAME:latest | gzip > ${IMAGE_NAME}.tar.gz

echo "📁 Preparing static files..."
echo "📦 Creating archive of wwwroot files..."
tar -czf wwwroot-files.tar.gz MembershipAPI/wwwroot/

echo "📤 Transferring image and static files to server..."
sshpass -p "$SERVER_PASSWORD" scp ${IMAGE_NAME}.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/
sshpass -p "$SERVER_PASSWORD" scp wwwroot-files.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 Deploying to server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST << EOF
    echo "=== Server Status Check ==="
    df -h
    docker system df
    
    echo "=== Removing Old API Build ==="
    echo "Stopping existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || echo "Container not running"
    docker rm $CONTAINER_NAME 2>/dev/null || echo "Container not found"
    
    echo "Removing old Docker images..."
    docker images | grep $IMAGE_NAME | awk '{print \$3}' | xargs -r docker rmi -f || echo "No old images to remove"
    
    echo "Cleaning up old wwwroot directory..."
    rm -rf /var/coalition_membership/wwwroot/* || echo "No old wwwroot files to remove"
    
    echo "=== Loading New Docker Image ==="
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
    
    echo "=== Setting Up Static Files Directory ==="
    echo "Creating /var/coalition_membership/wwwroot directory..."
    su -c "mkdir -p /var/coalition_membership/wwwroot && chown -R $SERVER_USER:$SERVER_USER /var/coalition_membership/wwwroot"
    
    echo "Extracting static files to /var/coalition_membership/wwwroot..."
    if [ -f "/tmp/wwwroot-files.tar.gz" ]; then
        echo "Static files archive found, extracting..."
        tar -xzf /tmp/wwwroot-files.tar.gz -C /var/coalition_membership/wwwroot --strip-components=2
        chmod -R 755 /var/coalition_membership/wwwroot
        echo "✅ Static files extracted successfully!"
        ls -la /var/coalition_membership/wwwroot/
    else
        echo "⚠️ WARNING: Static files archive not found!"
    fi
    
    echo "=== Starting New Container ==="
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:8080 \
        -e ASPNETCORE_ENVIRONMENT=Production \
        -e ASPNETCORE_URLS=http://+:8080 \
        -e BUILD_TIMESTAMP=$TIMESTAMP \
        -v /var/coalition_membership/wwwroot:/var/wwwroot \
        $IMAGE_NAME:latest
    
    echo "=== Waiting for Container to Start ==="
    sleep 15
    
    echo "=== Verifying Deployment ==="
    echo "Container status:"
    if docker ps | grep -q $CONTAINER_NAME; then
        echo "✅ Container is running!"
        docker ps | grep $CONTAINER_NAME
    else
        echo "❌ Container not running! Checking logs..."
        docker logs $CONTAINER_NAME --tail 20
        exit 1
    fi
    
    echo "Container image verification:"
    docker inspect $CONTAINER_NAME | grep -A 5 -B 5 "Image"
    
    echo "Volume mount verification:"
    docker inspect $CONTAINER_NAME | grep -A 10 -B 5 "Mounts"
    
    echo "Testing health endpoint..."
    sleep 5
    if curl -f http://localhost:$PORT/api/health; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed! Checking container logs..."
        docker logs $CONTAINER_NAME --tail 20
    fi
    
    echo "Testing association dropdown endpoint..."
    if curl -f http://localhost:$PORT/api/association/GetAssociationDropDown; then
        echo "✅ Association endpoint working!"
    else
        echo "❌ Association endpoint failed!"
    fi
    
    echo "Checking static files accessibility..."
    if ls -la /var/coalition_membership/wwwroot/; then
        echo "✅ Static files accessible!"
    else
        echo "❌ Static files not accessible!"
    fi
    
    echo "=== Container Logs ==="
    docker logs $CONTAINER_NAME --tail 20
    
    echo "=== Cleaning Up ==="
    rm -f /tmp/${IMAGE_NAME}.tar.gz
    rm -f /tmp/wwwroot-files.tar.gz
    
    echo "✅ API deployment completed successfully!"
    echo "🌐 API is accessible at: http://$SERVER_HOST:$PORT"
    echo "📁 Static files served from: /var/coalition_membership/wwwroot"
    echo "📊 Health Check: http://$SERVER_HOST:$PORT/api/health"
    echo "🏢 Association Dropdown: http://$SERVER_HOST:$PORT/api/association/GetAssociationDropDown"
EOF

echo "🧹 Cleaning up local files..."
rm ${IMAGE_NAME}.tar.gz
rm -rf ./publish
rm -f wwwroot-files.tar.gz

echo "✅ Unified deployment completed successfully!"
echo "🎯 Old API build removed and new one deployed!"
echo "📁 Static files now served from /var/coalition_membership/wwwroot"
echo ""
echo "🌐 API URL: http://$SERVER_HOST:$PORT"
echo "📊 Health Check: http://$SERVER_HOST:$PORT/api/health"
echo "🏢 Association Dropdown: http://$SERVER_HOST:$PORT/api/association/GetAssociationDropDown"