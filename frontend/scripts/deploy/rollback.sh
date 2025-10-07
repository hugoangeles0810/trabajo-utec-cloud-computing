#!/bin/bash

# Rollback script for Gamarriando Frontend
# This script allows rolling back to a previous deployment

set -e

# Configuration
BUCKET_NAME="gamarriando-web"
BACKUP_BUCKET="gamarriando-web-backup"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"

echo "🔄 Starting rollback process..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed. Please install it first."
  exit 1
fi

# List available backups
echo "📋 Available backups:"
aws s3 ls s3://$BACKUP_BUCKET/ --region $REGION | sort -r

echo ""
read -p "Enter backup timestamp (YYYYMMDD_HHMMSS): " TIMESTAMP

if [ -z "$TIMESTAMP" ]; then
    echo "❌ Error: Timestamp is required"
    exit 1
fi

# Verify backup exists
if ! aws s3 ls s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION > /dev/null 2>&1; then
    echo "❌ Error: Backup $TIMESTAMP not found"
    exit 1
fi

# Show backup details
echo "📊 Backup details:"
aws s3 ls s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION --recursive | head -10
echo "..."

# Confirm rollback
echo ""
read -p "Are you sure you want to rollback to $TIMESTAMP? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Create backup of current state
echo "💾 Creating backup of current state..."
CURRENT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
aws s3 sync s3://$BUCKET_NAME/ s3://$BACKUP_BUCKET/rollback-$CURRENT_TIMESTAMP/ --region $REGION

# Restore backup
echo "📥 Restoring backup $TIMESTAMP..."
aws s3 sync s3://$BACKUP_BUCKET/$TIMESTAMP/ s3://$BUCKET_NAME/ --delete --region $REGION

# Invalidate CloudFront
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

echo "✅ Rollback completed successfully!"
echo "🌐 Website: https://gamarriando.com"
echo "💾 Current state backed up as: rollback-$CURRENT_TIMESTAMP"
