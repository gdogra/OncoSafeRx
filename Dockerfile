# Use official Node.js runtime as base image
FROM node:20-alpine AS base
WORKDIR /app

# Install runtime tools (curl for healthcheck)
RUN apk add --no-cache curl

FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SENTRY_DSN
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
ENV VITE_SENTRY_ENV=production
ENV VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
ENV NODE_ENV=production
# Debug: Print environment variables during build (non-sensitive info only)
RUN echo "=== Build Environment Debug ===" && \
    echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}" && \
    echo "VITE_SUPABASE_ANON_KEY present: $(if [ -n "${VITE_SUPABASE_ANON_KEY}" ]; then echo 'YES'; else echo 'NO'; fi)" && \
    echo "NODE_ENV: ${NODE_ENV}" && \
    echo "=== End Debug ==="
COPY frontend/package*.json ./
RUN npm ci --include=dev
COPY frontend/ ./
# Create production env file with build args
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env.production && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env.production && \
    echo "VITE_SENTRY_DSN=${VITE_SENTRY_DSN}" >> .env.production && \
    echo "VITE_SENTRY_ENV=production" >> .env.production && \
    echo "VITE_SENTRY_TRACES_SAMPLE_RATE=0.1" >> .env.production && \
    echo "=== CREATED .env.production ===" && \
    cat .env.production && \
    echo "=== END .env.production ===" && \
    echo "Testing if build args are empty..." && \
    echo "VITE_SUPABASE_URL length: $(echo -n "${VITE_SUPABASE_URL}" | wc -c)" && \
    echo "VITE_SUPABASE_ANON_KEY length: $(echo -n "${VITE_SUPABASE_ANON_KEY}" | wc -c)"
RUN npm run build

FROM base AS runtime

# Set working directory in container
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
# Copy Vite build (dist)
COPY --from=frontend-builder /frontend/dist ./frontend/dist

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
