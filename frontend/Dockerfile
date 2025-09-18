# Multi-stage build for OncoSafeRx Frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY . .

# Build arguments for environment
ARG BUILD_ENV=production
ARG REACT_APP_VERSION=1.0.0

# Set environment variables
ENV NODE_ENV=production
ENV REACT_APP_ENVIRONMENT=$BUILD_ENV
ENV REACT_APP_VERSION=$REACT_APP_VERSION

# Build the application
RUN npm run build:production

# Production image
FROM nginx:alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-site.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy static assets and service worker
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/sw.js

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><body>OK</body></html>' > /usr/share/nginx/html/health

# Set up logging
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nginx -u 1001 -G nodejs

# Change ownership of nginx directories
RUN chown -R nginx:nodejs /var/cache/nginx \
    && chown -R nginx:nodejs /var/log/nginx \
    && chown -R nginx:nodejs /etc/nginx/conf.d \
    && chown -R nginx:nodejs /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Labels for metadata
LABEL maintainer="OncoSafeRx Team"
LABEL version="1.0.0"
LABEL description="OncoSafeRx Frontend - Precision Oncology Platform"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]