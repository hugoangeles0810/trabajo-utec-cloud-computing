#!/bin/bash

# Gamarriando Frontend Deployment Configuration
# Updated for dev environment with AWS profile "personal"

# S3 Bucket Configuration
export BUCKET_NAME="gamarriando-web-dev"
export STAGING_BUCKET_NAME="gamarriando-web-staging"
export BACKUP_BUCKET_NAME="gamarriando-web-backup"

# AWS Configuration
export AWS_REGION="us-east-1"
export AWS_PROFILE="personal"

# CloudFront Distribution IDs (update with your actual IDs when created)
export CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
export STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"

# Domain Configuration
export DOMAIN_NAME="gamarriando.com"
export WWW_DOMAIN_NAME="www.gamarriando.com"
export STAGING_DOMAIN_NAME="staging.gamarriando.com"

# API Configuration
export API_BASE_URL="https://nq0kfvcazc.execute-api.us-east-1.amazonaws.com/dev"
export CDN_URL="https://d1234567890.cloudfront.net"

# Resource Group
export RESOURCE_GROUP="gamarriando"
export ENVIRONMENT="dev"
