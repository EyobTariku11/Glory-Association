FROM nginx:alpine

# Copy the built Angular app
COPY dist/football-coalition/browser/ /usr/share/nginx/html/

# Create nginx config for port 4200 with proper asset handling
RUN echo 'server { \
    listen 4200; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Handle Angular routing - CRITICAL FOR PRODUCTION \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    # Cache static assets with longer expiration \
    location ~* \.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin *; \
        try_files $uri =404; \
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

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"] 