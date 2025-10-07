#!/bin/bash

# Deploy script for Gamarriando Frontend to S3 Staging
# This script deploys the built application to AWS S3 staging environment

set -e

# Configuration
BUCKET_NAME="gamarriando-web-staging"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"

echo "🚀 Starting staging deployment..."

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

# Build application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
  echo "❌ Error: Build failed - 'out' directory not found"
  exit 1
fi

# Deploy to S3 staging
echo "📤 Deploying to S3 staging bucket: $BUCKET_NAME"
aws s3 sync out/ s3://$BUCKET_NAME --delete --region $REGION

# Set cache headers for HTML files
echo "⚙️ Setting cache headers..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type "text/html" \
  --region $REGION

# Invalidate CloudFront staging cache
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E2EXAMPLE" ]; then
  echo "☁️ Invalidating CloudFront staging cache..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
else
  echo "⚠️  CloudFront staging distribution ID not configured, skipping invalidation"
fi

# Run smoke tests
echo "🧪 Running smoke tests..."
sleep 15

# Test staging domain
if curl -f -s https://staging.gamarriando.com > /dev/null; then
  echo "  ✅ Staging domain accessible"
else
  echo "  ⚠️  Staging domain not accessible (this might be expected if not configured)"
fi

echo "✅ Staging deployment completed successfully!"
echo "🌐 Staging URL: https://staging.gamarriando.com"
echo "📊 Staging CloudFront: https://d2345678901.cloudfront.net"
