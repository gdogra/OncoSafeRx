# Use official Node.js runtime as base image
FROM node:20-alpine AS base
WORKDIR /app

# Install runtime tools (curl for healthcheck)
RUN apk add --no-cache curl

FROM base AS runtime

# Set working directory in container
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
# Build frontend within container with production environment variables
COPY frontend/ ./frontend/
WORKDIR /app/frontend
# Set production environment variables for Vite build
ENV NODE_ENV=production
ENV VITE_SUPABASE_URL=https://emfrwckxctyarphjvfeu.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c
ENV VITE_API_URL=/api
ENV VITE_ENABLE_SERVER_ANALYTICS=false
ENV VITE_SKIP_SUPABASE_PREFLIGHT=true
ENV VITE_SUPABASE_AUTH_VIA_PROXY=true
ENV VITE_ALLOW_DEMO_LOGIN=false
RUN npm ci && npm run build
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S oncosaferx -u 1001

# Change ownership of app directory
RUN chown -R oncosaferx:nodejs /app
USER oncosaferx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"]