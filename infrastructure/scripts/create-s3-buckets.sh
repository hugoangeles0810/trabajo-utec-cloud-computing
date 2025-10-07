#!/bin/bash

# Create S3 Buckets for Gamarriando Frontend
# This script creates the necessary S3 buckets for hosting the frontend

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

# Configuration
REGION="us-east-1"
PRODUCTION_BUCKET="gamarriando-web"
STAGING_BUCKET="gamarriando-web-staging"
BACKUP_BUCKET="gamarriando-web-backup"

echo "🪣 Creating S3 Buckets for Gamarriando Frontend"
echo "=============================================="
echo "Region: $REGION"
echo "Production Bucket: $PRODUCTION_BUCKET"
echo "Staging Bucket: $STAGING_BUCKET"
echo "Backup Bucket: $BACKUP_BUCKET"
echo "=============================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "AWS CLI is configured"

# Function to create bucket
create_bucket() {
    local bucket_name=$1
    local purpose=$2
    
    print_status "Creating $purpose bucket: $bucket_name"
    
    # Check if bucket already exists
    if aws s3 ls "s3://$bucket_name" 2>/dev/null; then
        print_warning "Bucket $bucket_name already exists"
        return 0
    fi
    
    # Create bucket
    if aws s3 mb "s3://$bucket_name" --region "$REGION"; then
        print_success "Bucket $bucket_name created successfully"
    else
        print_error "Failed to create bucket $bucket_name"
        exit 1
    fi
    
    # Enable versioning
    print_status "Enabling versioning for $bucket_name"
    aws s3api put-bucket-versioning \
        --bucket "$bucket_name" \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    print_status "Enabling encryption for $bucket_name"
    aws s3api put-bucket-encryption \
        --bucket "$bucket_name" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    # Block public access
    print_status "Blocking public access for $bucket_name"
    aws s3api put-public-access-block \
        --bucket "$bucket_name" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    print_success "$purpose bucket $bucket_name configured successfully"
}

# Function to configure website hosting
configure_website_hosting() {
    local bucket_name=$1
    local purpose=$2
    
    print_status "Configuring website hosting for $bucket_name"
    
    aws s3 website "s3://$bucket_name" \
        --index-document index.html \
        --error-document 404.html
    
    print_success "Website hosting configured for $bucket_name"
}

# Function to configure CORS
configure_cors() {
    local bucket_name=$1
    local purpose=$2
    
    print_status "Configuring CORS for $bucket_name"
    
    aws s3api put-bucket-cors \
        --bucket "$bucket_name" \
        --cors-configuration '{
            "CORSRules": [
                {
                    "AllowedHeaders": ["*"],
                    "AllowedMethods": ["GET", "HEAD"],
                    "AllowedOrigins": [
                        "https://gamarriando.com",
                        "https://www.gamarriando.com",
                        "https://staging.gamarriando.com"
                    ],
                    "ExposeHeaders": ["ETag"],
                    "MaxAgeSeconds": 3600
                }
            ]
        }'
    
    print_success "CORS configured for $bucket_name"
}

# Create buckets
create_bucket "$PRODUCTION_BUCKET" "production"
create_bucket "$STAGING_BUCKET" "staging"
create_bucket "$BACKUP_BUCKET" "backup"

# Configure website hosting for production and staging
configure_website_hosting "$PRODUCTION_BUCKET" "production"
configure_website_hosting "$STAGING_BUCKET" "staging"

# Configure CORS for production and staging
configure_cors "$PRODUCTION_BUCKET" "production"
configure_cors "$STAGING_BUCKET" "staging"

# Create bucket policies
print_status "Creating bucket policies..."

# Production bucket policy
aws s3api put-bucket-policy \
    --bucket "$PRODUCTION_BUCKET" \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'"$PRODUCTION_BUCKET"'/*"
            }
        ]
    }'

# Staging bucket policy
aws s3api put-bucket-policy \
    --bucket "$STAGING_BUCKET" \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'"$STAGING_BUCKET"'/*"
            }
        ]
    }'

print_success "Bucket policies created"

echo ""
echo "=========================================="
print_success "S3 BUCKETS CREATED SUCCESSFULLY!"
echo "=========================================="
echo "Production Bucket: $PRODUCTION_BUCKET"
echo "Staging Bucket: $STAGING_BUCKET"
echo "Backup Bucket: $BACKUP_BUCKET"
echo ""
echo "Website URLs:"
echo "Production: http://$PRODUCTION_BUCKET.s3-website-$REGION.amazonaws.com"
echo "Staging: http://$STAGING_BUCKET.s3-website-$REGION.amazonaws.com"
echo ""
echo "Next steps:"
echo "1. Deploy your frontend to the buckets"
echo "2. Configure CloudFront distributions (optional)"
echo "3. Set up custom domain with Route 53 (optional)"
echo "=========================================="
