# Netlify Environment Variables Configuration

Add these environment variables to your Netlify site settings:

## API Configuration
```
VITE_API_URL=https://oncosaferx.onrender.com/api
REACT_APP_API_URL=https://oncosaferx.onrender.com/api
```

## Supabase Configuration  
```
VITE_SUPABASE_URL=https://emfrwckxctyarphjvfeu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c
```

## Other Settings
```
GENERATE_SOURCEMAP=false
VITE_APP_VERSION=1.0.0
VITE_ENABLE_SERVER_ANALYTICS=false
NODE_ENV=production
```

## Steps:
1. Go to Netlify Dashboard > Site Settings > Environment Variables
2. Add each variable above
3. Trigger a new deployment