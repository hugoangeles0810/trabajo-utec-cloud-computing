#!/bin/bash

# Deploy script for Gamarriando Frontend to S3 Production
# This script deploys the built application to AWS S3 with proper cache headers

set -e

# Configuration
BUCKET_NAME="gamarriando-web"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
BACKUP_BUCKET="gamarriando-web-backup"

echo "🚀 Starting production deployment..."

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Error: Must be on main branch to deploy to production"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Uncommitted changes detected. Please commit or stash them."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed. Please install it first."
  exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the frontend directory."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run type-check
npm run lint
npm run test:ci

# Create backup
echo "💾 Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
aws s3 sync s3://$BUCKET_NAME/ s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION

# Build for production
echo "🏗️ Building for production..."
NODE_ENV=production npm run build

# Check if build was successful
if [ ! -d "out" ]; then
  echo "❌ Error: Build failed - 'out' directory not found"
  exit 1
fi

# Deploy to S3
echo "📤 Deploying to S3 bucket: $BUCKET_NAME"
aws s3 sync out/ s3://$BUCKET_NAME --delete --region $REGION

# Set cache headers for different file types
echo "⚙️ Setting cache headers..."

# HTML files - no cache
echo "  📄 Setting HTML cache headers..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type "text/html" \
  --region $REGION

# Static assets - long cache
echo "  🎨 Setting static assets cache headers..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
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

# Invalidate CloudFront cache
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E1EXAMPLE" ]; then
  echo "☁️ Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
else
  echo "⚠️  CloudFront distribution ID not configured, skipping invalidation"
fi

# Run smoke tests
echo "🧪 Running smoke tests..."
sleep 30

# Test main domain
if curl -f -s https://gamarriando.com > /dev/null; then
  echo "  ✅ Main domain accessible"
else
  echo "  ❌ Main domain not accessible"
  exit 1
fi

# Test www subdomain
if curl -f -s https://www.gamarriando.com > /dev/null; then
  echo "  ✅ WWW subdomain accessible"
else
  echo "  ❌ WWW subdomain not accessible"
  exit 1
fi

echo "✅ Production deployment completed successfully!"
echo "🌐 Website: https://gamarriando.com"
echo "📊 CloudFront: https://d1234567890.cloudfront.net"
echo "💾 Backup created: $TIMESTAMP"
