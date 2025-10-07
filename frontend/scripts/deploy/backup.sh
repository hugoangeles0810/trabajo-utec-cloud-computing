#!/bin/bash

# Backup script for Gamarriando Frontend
# This script creates automatic backups of the current deployment

set -e

# Configuration
BUCKET_NAME="gamarriando-web"
BACKUP_BUCKET="gamarriando-web-backup"
REGION="us-east-1"
MAX_BACKUPS=10

echo "💾 Creating automatic backup..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed. Please install it first."
  exit 1
fi

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "📥 Creating backup: $TIMESTAMP"
aws s3 sync s3://$BUCKET_NAME/ s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION

# Verify backup was created
if aws s3 ls s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION > /dev/null 2>&1; then
  echo "✅ Backup created successfully: $TIMESTAMP"
else
  echo "❌ Error: Backup creation failed"
  exit 1
fi

# Clean up old backups (keep only MAX_BACKUPS)
echo "🧹 Cleaning up old backups (keeping last $MAX_BACKUPS)..."

# Get list of backups, sort by timestamp (newest first), and remove excess
aws s3 ls s3://$BACKUP_BUCKET/ --region $REGION | \
  grep -E 'PRE [0-9]{8}_[0-9]{6}/' | \
  sort -r | \
  tail -n +$((MAX_BACKUPS + 1)) | \
  awk '{print $2}' | \
  while read backup_dir; do
    if [ ! -z "$backup_dir" ]; then
      echo "  🗑️  Removing old backup: $backup_dir"
      aws s3 rm s3://$BACKUP_BUCKET/$backup_dir --recursive --region $REGION
    fi
  done

# Show current backups
echo "📋 Current backups:"
aws s3 ls s3://$BACKUP_BUCKET/ --region $REGION | sort -r

echo "✅ Backup process completed successfully!"
echo "💾 Latest backup: $TIMESTAMP"
