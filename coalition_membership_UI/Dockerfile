# Multi-stage build for Coalition Membership UI
# Stage 1: Build the Angular application
FROM node:18-alpine as node
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built application
COPY --from=node /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --from=node /app/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx config for port 4201 with proper asset handling
RUN echo 'server { \
    listen 4201; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Handle Angular routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin *; \
    } \
    \
    # Handle API proxy if needed \
    location /api/ { \
        proxy_pass http://196.190.251.48:6069/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer-when-downgrade" always; \
    add_header Content-Security-Policy "default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''" always; \
}' > /etc/nginx/conf.d/default.conf

# Fix permissions for all files
RUN chmod -R 755 /usr/share/nginx/html/ && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

EXPOSE 4201

CMD ["nginx", "-g", "daemon off;"]