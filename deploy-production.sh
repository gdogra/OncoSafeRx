#!/bin/bash

echo "🚀 OncoSafeRx Production Deployment"

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Option 1: Deploy to Netlify (if Netlify CLI is installed)
if command -v netlify &> /dev/null; then
    echo "🌐 Deploying to Netlify..."
    cd frontend
    netlify deploy --prod --dir=dist
    cd ..
fi

# Option 2: Deploy API to Heroku (if Heroku CLI is installed) 
if command -v heroku &> /dev/null; then
    echo "🖥️ Deploying API to Heroku..."
    # Set production environment variables
    heroku config:set $(grep -v '^#' .env.production | xargs) --app your-heroku-app-name
    git push heroku main
fi

echo "✅ Deployment complete!"
echo "🔗 Frontend: https://your-app.netlify.app"
echo "🔗 API: https://your-api.herokuapp.com"