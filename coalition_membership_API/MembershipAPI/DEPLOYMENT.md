# Coalition Membership Deployment Guide

This project now uses a **separated deployment architecture** where the API and static files are deployed independently for better performance and scalability.

## 🏗️ Architecture Overview

- **API Server**: .NET Core API running on port 6069
- **Static Files Server**: Nginx serving wwwroot content on port 6070

## 📁 Deployment Scripts

### 1. API Deployment (`deploy.sh`)
Deploys only the .NET Core API without static files.

```bash
./deploy.sh
```

**Access**: http://196.190.251.48:6069

### 2. Static Files Deployment (`deploy-static.sh`)
Deploys only the static files (images, documents, etc.) using Nginx.

```bash
./deploy-static.sh
```

**Access**: http://196.190.251.48:6070

### 3. Complete Deployment (`deploy-all.sh`)
Deploys both API and static files in sequence.

```bash
./deploy-all.sh
```

## 📂 Static Files Structure

The static files server provides access to:

- **Member Images**: `/Member/` - User profile pictures
- **Association Files**: `/Association/` - Association-related files
- **Coalition Files**: `/Coalition/` - Coalition-related files
- **Company Profile**: `/CompanyProfile/` - Company profile images
- **Announcements**: `/Announcment/` - Announcement attachments
- **Courses**: `/Courses/` - Course materials
- **Event Messages**: `/Event_Message/` - Event-related files
- **Employee Files**: `/Employee/` - Employee-related files
- **Swagger UI**: `/swagger-ui/` - API documentation

## 🔧 Configuration

### API Configuration
- **Port**: 6069
- **Container**: `coalition-membership-api`
- **Image**: `coalition-membership-api:latest`

### Static Files Configuration
- **Port**: 6070
- **Container**: `coalition-membership-static`
- **Image**: `coalition-membership-static:latest`
- **Server**: Nginx with optimized caching

## 🚀 Benefits of Separated Deployment

1. **Better Performance**: Static files are served by Nginx (faster than .NET)
2. **Scalability**: Can scale API and static files independently
3. **Caching**: Nginx provides better caching for static content
4. **Security**: Static files are isolated from API logic
5. **Maintenance**: Easier to update static content without affecting API

## 📝 Usage Examples

### Accessing Member Images
```
# Direct access (for testing)
http://196.190.251.48:6070/wwwroot/Member/kirubel_gizaw.jpg

# Production access (through Apache proxy)
https://eplffc.et/wwwroot/Member/kirubel_gizaw.jpg
```

### Accessing API Endpoints
```
http://196.190.251.48:6069/api/members
```

### Health Check
```
http://196.190.251.48:6070/health
```

## 🔄 Update Process

### Update API Only
```bash
./deploy.sh
```

### Update Static Files Only
```bash
./deploy-static.sh
```

### Update Both
```bash
./deploy-all.sh
```

## 🔧 Apache Integration

To integrate with your existing Apache configuration, add this to your VirtualHost:

```apache
# Proxy wwwroot requests to nginx container
ProxyPass /wwwroot/ http://localhost:6070/wwwroot/
ProxyPassReverse /wwwroot/ http://localhost:6070/wwwroot/

# Optional: Add specific headers for static files
<Location "/wwwroot/">
    Header always set Cache-Control "public, max-age=31536000, immutable"
    Header always set Access-Control-Allow-Origin "*"
</Location>
```

This will make your static files accessible at:
- `https://eplffc.et/wwwroot/Association/Ethiopian%20Insurance%20Football%20Club.png`
- `https://eplffc.et/wwwroot/Member/kirubel_gizaw.jpg`
- etc.

## 🛠️ Troubleshooting
```bash
curl http://196.190.251.48:6069/health
```

### Check Static Files Status
```bash
curl http://196.190.251.48:6070/health
```

### View Container Logs
```bash
# API logs
docker logs coalition-membership-api

# Static files logs
docker logs coalition-membership-static
``` 