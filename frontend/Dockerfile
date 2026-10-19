# ==============================================================================
# ERCS Frontend Dockerfile
# Multi-stage build: Node.js build stage + Nginx Alpine production runtime
# DevSecOps Practice: Minimal attack surface, static asset serving & reverse proxy
# ==============================================================================

# Stage 1: Build static React SPA assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for build caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production web server
FROM nginx:1.27-alpine-slim

# Apply Alpine security patches
RUN apk update && apk upgrade --no-cache

# Copy custom Nginx configuration with reverse proxy for /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck to verify Nginx is actively responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
