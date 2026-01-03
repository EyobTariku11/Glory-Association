# Simple Setup Guide - Static Files via API

## 🎯 How It Works

1. **Client requests**: `https://eplffc.et/api/wwwroot/Association/file.png`
2. **Apache proxies**: `/api/*` → `localhost:6069/*` (your existing config)
3. **API serves**: Static file from `/var/wwwroot/Association/file.png`

## 🚀 Deployment Steps

### 1. Deploy API with Persistent Storage
```bash
./deploy.sh
```

This will:
- Deploy API to port 6069
- Mount `/var/wwwroot` as persistent volume
- Files survive container restarts

### 2. Copy Static Files to Server
```bash
./copy-static-files.sh
```

This will:
- Copy all wwwroot files to `/var/wwwroot` on server
- Set proper permissions
- Make files accessible via API

## ✅ Result

Your files will be accessible at:
- `https://eplffc.et/api/wwwroot/Association/Ethiopian%20Insurance%20Football%20Club.png`
- `https://eplffc.et/api/wwwroot/Member/kirubel_gizaw.jpg`
- `https://eplffc.et/api/wwwroot/Coalition/some-file.png`

## 🔧 No Apache Changes Needed

Your existing Apache config already handles this:
```apache
ProxyPass /api http://localhost:6069
ProxyPassReverse /api http://localhost:6069
```

## 📁 File Structure

Files are stored in `/var/wwwroot` on the server:
- `/var/wwwroot/Member/` - User profile images
- `/var/wwwroot/Association/` - Association files
- `/var/wwwroot/Coalition/` - Coalition files
- etc.

## 🔄 Updating Files

To update static files:
1. Add new files to your local `wwwroot/` directory
2. Run `./copy-static-files.sh` to sync to server
3. Files are immediately available via API

## 🛠️ Testing

Test the setup:
```bash
# Test API health
curl https://eplffc.et/api/health

# Test static file access
curl https://eplffc.et/api/wwwroot/Association/some-file.png
``` 