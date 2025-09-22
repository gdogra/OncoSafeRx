#!/bin/bash

# Build script for OncoSafeRx Frontend Docker image
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MODE="production"
TAG="latest"
PUSH=false
CACHE=true

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Build OncoSafeRx Frontend Docker image"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE        Build mode: development or production (default: production)"
    echo "  -t, --tag TAG          Docker image tag (default: latest)"
    echo "  -p, --push             Push image to registry after build"
    echo "  --no-cache             Build without using cache"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Build production image with latest tag"
    echo "  $0 -m development      # Build development image"
    echo "  $0 -t v1.2.0 -p        # Build and push with version tag"
    echo "  $0 --no-cache          # Build without cache"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -p|--push)
            PUSH=true
            shift
            ;;
        --no-cache)
            CACHE=false
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}" >&2
            show_help
            exit 1
            ;;
    esac
done

# Validate mode
if [[ "$MODE" != "production" && "$MODE" != "development" ]]; then
    echo -e "${RED}Error: Mode must be 'production' or 'development'${NC}" >&2
    exit 1
fi

# Set dockerfile and image name based on mode
if [[ "$MODE" == "development" ]]; then
    DOCKERFILE="Dockerfile.dev"
    IMAGE_NAME="oncosaferx/frontend:dev-$TAG"
else
    DOCKERFILE="Dockerfile"
    IMAGE_NAME="oncosaferx/frontend:$TAG"
fi

echo -e "${YELLOW}Building OncoSafeRx Frontend Docker image...${NC}"
echo "Mode: $MODE"
echo "Dockerfile: $DOCKERFILE"
echo "Image: $IMAGE_NAME"
echo "Cache: $CACHE"

# Build command
BUILD_CMD="docker build"

if [[ "$CACHE" == false ]]; then
    BUILD_CMD="$BUILD_CMD --no-cache"
fi

BUILD_CMD="$BUILD_CMD -f $DOCKERFILE -t $IMAGE_NAME ."

# Add build args for production
if [[ "$MODE" == "production" ]]; then
    BUILD_CMD="$BUILD_CMD --build-arg BUILD_ENV=production --build-arg REACT_APP_VERSION=$TAG"
fi

echo -e "${YELLOW}Running: $BUILD_CMD${NC}"

# Execute build
if eval $BUILD_CMD; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo "Image: $IMAGE_NAME"
    
    # Show image size
    IMAGE_SIZE=$(docker images --format "table {{.Size}}" $IMAGE_NAME | tail -n 1)
    echo "Size: $IMAGE_SIZE"
    
    # Push if requested
    if [[ "$PUSH" == true ]]; then
        echo -e "${YELLOW}Pushing image to registry...${NC}"
        if docker push $IMAGE_NAME; then
            echo -e "${GREEN}✅ Push successful!${NC}"
        else
            echo -e "${RED}❌ Push failed!${NC}" >&2
            exit 1
        fi
    fi
    
    echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}" >&2
    exit 1
fi