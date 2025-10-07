#!/bin/bash

# Quick Deploy Script for Gamarriando Frontend
# This script provides a simplified deployment process for quick updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load deployment configuration if it exists
if [ -f "deployment-config.sh" ]; then
    source deployment-config.sh
else
    # Default configuration
    BUCKET_NAME="gamarriando-web-dev"
    STAGING_BUCKET_NAME="gamarriando-web-staging"
    REGION="us-east-1"
    CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
    STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"
fi

# Function to show help
show_help() {
    echo "Gamarriando Frontend Quick Deploy Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  prod         Deploy to production (alias: production)"
    echo "  staging      Deploy to staging"
    echo ""
    echo "Options:"
    echo "  --no-build      Skip build step (use existing 'out' directory)"
    echo "  --no-cache      Skip cache header optimization"
    echo "  --no-invalidate Skip CloudFront invalidation"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod"
    echo "  $0 staging --no-build"
    echo "  $0 prod --no-cache --no-invalidate"
    echo ""
}

# Parse command line arguments
ENVIRONMENT=""
NO_BUILD=false
NO_CACHE=false
NO_INVALIDATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        prod|production)
            ENVIRONMENT="production"
            shift
            ;;
        staging)
            ENVIRONMENT="staging"
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --no-invalidate)
            NO_INVALIDATE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if environment is specified
if [ -z "$ENVIRONMENT" ]; then
    print_error "Environment is required"
    show_help
    exit 1
fi

# Set bucket and distribution based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    BUCKET=$BUCKET_NAME
    DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID
    URL="https://gamarriando.com"
else
    BUCKET=$STAGING_BUCKET_NAME
    DISTRIBUTION_ID=$STAGING_CLOUDFRONT_DISTRIBUTION_ID
    URL="https://staging.gamarriando.com"
fi

# Quick deployment function
quick_deploy() {
    echo "🚀 Quick Deploy - $ENVIRONMENT"
    echo "================================"
    echo "Bucket: $BUCKET"
    echo "Distribution: $DISTRIBUTION_ID"
    echo "URL: $URL"
    echo "================================"
    echo ""
    
    # Build if not skipped
    if [ "$NO_BUILD" = false ]; then
        print_status "Building application..."
        NODE_ENV=production npm run build
        
        if [ ! -d "out" ]; then
            print_error "Build failed - 'out' directory not found"
            exit 1
        fi
        print_success "Build completed"
    else
        print_warning "Skipping build step"
        if [ ! -d "out" ]; then
            print_error "'out' directory not found. Run build first or remove --no-build flag"
            exit 1
        fi
    fi
    
    # Deploy to S3
    print_status "Deploying to S3..."
    aws s3 sync out/ s3://$BUCKET --delete --region $REGION
    print_success "Files uploaded to S3"
    
    # Set cache headers if not skipped
    if [ "$NO_CACHE" = false ]; then
        print_status "Setting cache headers..."
        
        # HTML files - no cache
        aws s3 cp s3://$BUCKET/ s3://$BUCKET/ \
            --recursive \
            --exclude "*" \
            --include "*.html" \
            --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
            --content-type "text/html" \
            --region $REGION
        
        # Static assets - long cache
        aws s3 cp s3://$BUCKET/ s3://$BUCKET/ \
            --recursive \
            --exclude "*" \
            --include "*.js" \
            --include "*.css" \
            --include "*.png" \
            --include "*.jpg" \
            --include "*.jpeg" \
            --include "*.gif" \
            --include "*.svg" \
            --include "*.ico" \
            --include "*.woff" \
            --include "*.woff2" \
            --cache-control "max-age=31536000,immutable" \
            --region $REGION
        
        print_success "Cache headers set"
    else
        print_warning "Skipping cache header optimization"
    fi
    
    # Invalidate CloudFront if not skipped
    if [ "$NO_INVALIDATE" = false ]; then
        if [ ! -z "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "E1EXAMPLE" ] && [ "$DISTRIBUTION_ID" != "E2EXAMPLE" ]; then
            print_status "Invalidating CloudFront cache..."
            aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
            print_success "CloudFront cache invalidated"
        else
            print_warning "CloudFront distribution ID not configured, skipping invalidation"
        fi
    else
        print_warning "Skipping CloudFront invalidation"
    fi
    
    # Quick test
    print_status "Testing deployment..."
    sleep 10
    
    if curl -f -s "$URL" > /dev/null; then
        print_success "Website is accessible at $URL"
    else
        print_warning "Website might not be accessible yet (CloudFront propagation takes time)"
    fi
    
    echo ""
    echo "=========================================="
    print_success "QUICK DEPLOY COMPLETED!"
    echo "=========================================="
    echo "Environment: $ENVIRONMENT"
    echo "Website: $URL"
    echo "S3 Bucket: $BUCKET"
    echo "=========================================="
    echo ""
}

# Run quick deployment
quick_deploy
