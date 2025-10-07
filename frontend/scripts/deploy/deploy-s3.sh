#!/bin/bash

# Deploy script for Gamarriando Frontend to S3
# This script deploys the built application to AWS S3

set -e

# Configuration
BUCKET_NAME="gamarriando-web"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"

echo "🚀 Starting deployment to S3..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed. Please install it first."
  exit 1
fi

# Check if we're in the right directory
if [ ! -d "out" ]; then
  echo "❌ Error: 'out' directory not found. Please run the build script first."
  exit 1
fi

# Sync files to S3
echo "📤 Uploading files to S3 bucket: $BUCKET_NAME"
aws s3 sync out/ s3://$BUCKET_NAME --delete --region $REGION

# Set cache headers for different file types
echo "⚙️ Setting cache headers..."

# HTML files - short cache
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --exclude "*" --include "*.html" --cache-control "max-age=0,no-cache,no-store,must-revalidate" --region $REGION

# Static assets - long cache
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --exclude "*" --include "*.js" --include "*.css" --include "*.png" --include "*.jpg" --include "*.jpeg" --include "*.gif" --include "*.svg" --include "*.ico" --include "*.woff" --include "*.woff2" --cache-control "max-age=31536000,immutable" --region $REGION

# Invalidate CloudFront cache
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
