module.exports = {
  apps: [
    {
      name: 'oncosaferx-api',
      script: 'src/index.js',
      instances: process.env.WEB_CONCURRENCY || 1,
      exec_mode: process.env.WEB_CONCURRENCY > 1 ? 'cluster' : 'fork',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        SERVE_FRONTEND: process.env.SERVE_FRONTEND || 'true',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        AUTH_PROXY_ENABLED: process.env.AUTH_PROXY_ENABLED || 'false',
        METRICS_TOKEN: process.env.METRICS_TOKEN || '',
      },
    },
  ],
};

