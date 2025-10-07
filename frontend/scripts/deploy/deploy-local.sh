#!/bin/bash

# Deploy script for Gamarriando Frontend from Local Machine to S3
# This script handles the complete deployment process from local development to AWS S3

set -e

# Configuration - Update these values according to your setup
BUCKET_NAME="gamarriando-web-dev"
STAGING_BUCKET_NAME="gamarriando-web-staging"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"  # Update with your actual distribution ID
STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"  # Update with your actual staging distribution ID

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        print_status "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the frontend directory."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed successfully"
}

# Function to run pre-deployment checks
run_checks() {
    print_status "Running pre-deployment checks..."
    
    # Type checking
    print_status "Running TypeScript type checking..."
    if ! npm run type-check; then
        print_error "Type checking failed"
        exit 1
    fi
    
    # Linting
    print_status "Running ESLint..."
    if ! npm run lint; then
        print_error "Linting failed"
        exit 1
    fi
    
    # Tests
    print_status "Running tests..."
    if ! npm run test:ci; then
        print_error "Tests failed"
        exit 1
    fi
    
    print_success "All checks passed"
}

# Function to build the application
build_application() {
    print_status "Building application for production..."
    
    # Set environment variables for production build
    export NODE_ENV=production
    export NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev"}
    export NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL:-"https://d1234567890.cloudfront.net"}
    
    # Build the application
    if ! npm run build; then
        print_error "Build failed"
        exit 1
    fi
    
    # Check if build was successful
    if [ ! -d "out" ]; then
        print_error "Build failed - 'out' directory not found"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Function to create backup
create_backup() {
    local bucket_name=$1
    local backup_bucket="gamarriando-web-backup"
    
    print_status "Creating backup of current deployment..."
    
    # Create timestamp
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    # Create backup
    if aws s3 sync s3://$bucket_name/ s3://$backup_bucket/$timestamp/ --region $REGION; then
        print_success "Backup created: $timestamp"
    else
        print_warning "Backup creation failed, but continuing with deployment"
    fi
}

# Function to deploy to S3
deploy_to_s3() {
    local bucket_name=$1
    local environment=$2
    
    print_status "Deploying to S3 bucket: $bucket_name ($environment)"
    
    # Sync files to S3
    if ! aws s3 sync out/ s3://$bucket_name --delete --region $REGION; then
        print_error "Failed to sync files to S3"
        exit 1
    fi
    
    # Set cache headers for HTML files (no cache)
    print_status "Setting cache headers for HTML files..."
    aws s3 cp s3://$bucket_name/ s3://$bucket_name/ \
        --recursive \
        --exclude "*" \
        --include "*.html" \
        --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
        --content-type "text/html" \
        --region $REGION
    
    # Set cache headers for static assets (long cache)
    print_status "Setting cache headers for static assets..."
    aws s3 cp s3://$bucket_name/ s3://$bucket_name/ \
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
    
    print_success "Deployment to S3 completed successfully"
}

# Function to invalidate CloudFront
invalidate_cloudfront() {
    local distribution_id=$1
    local environment=$2
    
    if [ ! -z "$distribution_id" ] && [ "$distribution_id" != "E1EXAMPLE" ] && [ "$distribution_id" != "E2EXAMPLE" ]; then
        print_status "Invalidating CloudFront cache for $environment..."
        
        if aws cloudfront create-invalidation --distribution-id $distribution_id --paths "/*"; then
            print_success "CloudFront cache invalidated successfully"
        else
            print_warning "CloudFront invalidation failed, but deployment was successful"
        fi
    else
        print_warning "CloudFront distribution ID not configured, skipping invalidation"
    fi
}

# Function to run smoke tests
run_smoke_tests() {
    local url=$1
    local environment=$2
    
    print_status "Running smoke tests for $environment..."
    
    # Wait for CloudFront to propagate
    sleep 30
    
    # Test the URL
    if curl -f -s "$url" > /dev/null; then
        print_success "$environment website is accessible at $url"
    else
        print_error "$environment website is not accessible at $url"
        exit 1
    fi
}

# Function to show deployment summary
show_summary() {
    local environment=$1
    local url=$2
    
    echo ""
    echo "=========================================="
    print_success "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=========================================="
    echo "Environment: $environment"
    echo "Website URL: $url"
    echo "S3 Bucket: $BUCKET_NAME"
    echo "Region: $REGION"
    echo "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    echo "=========================================="
    echo ""
}

# Main deployment function
deploy() {
    local environment=$1
    
    case $environment in
        "production")
            print_status "Starting PRODUCTION deployment..."
            create_backup $BUCKET_NAME
            deploy_to_s3 $BUCKET_NAME "production"
            invalidate_cloudfront $CLOUDFRONT_DISTRIBUTION_ID "production"
            run_smoke_tests "https://gamarriando.com" "production"
            show_summary "production" "https://gamarriando.com"
            ;;
        "staging")
            print_status "Starting STAGING deployment..."
            deploy_to_s3 $STAGING_BUCKET_NAME "staging"
            invalidate_cloudfront $STAGING_CLOUDFRONT_DISTRIBUTION_ID "staging"
            run_smoke_tests "https://staging.gamarriando.com" "staging"
            show_summary "staging" "https://staging.gamarriando.com"
            ;;
        *)
            print_error "Invalid environment. Use 'production' or 'staging'"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Gamarriando Frontend Local Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  production    Deploy to production environment"
    echo "  staging       Deploy to staging environment"
    echo ""
    echo "Options:"
    echo "  --skip-checks     Skip pre-deployment checks (type-check, lint, tests)"
    echo "  --skip-backup     Skip creating backup (production only)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production"
    echo "  $0 staging"
    echo "  $0 production --skip-checks"
    echo "  $0 production --skip-backup"
    echo ""
    echo "Environment Variables:"
    echo "  NEXT_PUBLIC_API_BASE_URL    API base URL (default: https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev)"
    echo "  NEXT_PUBLIC_CDN_URL         CDN URL (default: https://d1234567890.cloudfront.net)"
    echo ""
}

# Parse command line arguments
SKIP_CHECKS=false
SKIP_BACKUP=false
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        production|staging)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
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

# Main execution
echo "🚀 Gamarriando Frontend Local Deployment"
echo "========================================"
echo "Environment: $ENVIRONMENT"
echo "Date: $(date)"
echo "========================================"
echo ""

# Run deployment steps
check_prerequisites
install_dependencies

if [ "$SKIP_CHECKS" = false ]; then
    run_checks
else
    print_warning "Skipping pre-deployment checks"
fi

build_application

if [ "$ENVIRONMENT" = "production" ] && [ "$SKIP_BACKUP" = false ]; then
    create_backup $BUCKET_NAME
elif [ "$ENVIRONMENT" = "production" ] && [ "$SKIP_BACKUP" = true ]; then
    print_warning "Skipping backup creation"
fi

deploy $ENVIRONMENT

print_success "Deployment process completed successfully! 🎉"
