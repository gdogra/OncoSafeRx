#!/bin/bash

# OncoSafeRx Manual Deployment Script
# This script builds and deploys the application to Netlify

set -e

echo "🚀 Starting OncoSafeRx deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Netlify (requires netlify-cli and authentication)
echo "🌐 Deploying to Netlify..."

if command -v netlify &> /dev/null; then
    echo "Found Netlify CLI, attempting deployment..."
    
    # Deploy to production
    netlify deploy --dir=dist --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment completed successfully!"
        echo "🔗 Check your Netlify dashboard for the live URL"
    else
        echo "❌ Netlify deployment failed"
        echo "💡 Alternative: Upload the dist/ folder manually to Netlify"
        exit 1
    fi
else
    echo "⚠️  Netlify CLI not found"
    echo "📋 Manual deployment options:"
    echo "   1. Visit https://app.netlify.com/ and drag the dist/ folder"
    echo "   2. Install Netlify CLI: npm install -g netlify-cli"
    echo "   3. Use GitHub Actions (automatic on push to main)"
fi

echo "🎉 OncoSafeRx deployment process completed!"