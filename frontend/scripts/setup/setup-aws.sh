#!/bin/bash

# AWS Setup Script for Gamarriando Frontend
# This script helps set up AWS CLI and configure the environment for local deployments

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

# Function to check if AWS CLI is installed
check_aws_cli() {
    if command -v aws &> /dev/null; then
        local version=$(aws --version | cut -d' ' -f1 | cut -d'/' -f2)
        print_success "AWS CLI is installed (version: $version)"
        return 0
    else
        print_error "AWS CLI is not installed"
        return 1
    fi
}

# Function to install AWS CLI on macOS
install_aws_cli_macos() {
    print_status "Installing AWS CLI on macOS..."
    
    if command -v brew &> /dev/null; then
        print_status "Using Homebrew to install AWS CLI..."
        brew install awscli
    else
        print_status "Homebrew not found. Installing AWS CLI manually..."
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
    fi
    
    print_success "AWS CLI installed successfully"
}

# Function to install AWS CLI on Linux
install_aws_cli_linux() {
    print_status "Installing AWS CLI on Linux..."
    
    # Download and install AWS CLI
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    print_success "AWS CLI installed successfully"
}

# Function to configure AWS CLI
configure_aws_cli() {
    print_status "Configuring AWS CLI..."
    
    echo "Please provide your AWS credentials:"
    echo ""
    
    read -p "AWS Access Key ID: " aws_access_key_id
    read -s -p "AWS Secret Access Key: " aws_secret_access_key
    echo ""
    read -p "Default region name [us-east-1]: " aws_region
    read -p "Default output format [json]: " aws_output_format
    
    # Set defaults
    aws_region=${aws_region:-us-east-1}
    aws_output_format=${aws_output_format:-json}
    
    # Configure AWS CLI
    aws configure set aws_access_key_id "$aws_access_key_id"
    aws configure set aws_secret_access_key "$aws_secret_access_key"
    aws configure set default.region "$aws_region"
    aws configure set default.output "$aws_output_format"
    
    print_success "AWS CLI configured successfully"
}

# Function to test AWS configuration
test_aws_config() {
    print_status "Testing AWS configuration..."
    
    if aws sts get-caller-identity &> /dev/null; then
        local account_id=$(aws sts get-caller-identity --query Account --output text)
        local user_arn=$(aws sts get-caller-identity --query Arn --output text)
        
        print_success "AWS configuration is working"
        print_status "Account ID: $account_id"
        print_status "User ARN: $user_arn"
        return 0
    else
        print_error "AWS configuration test failed"
        return 1
    fi
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration file..."
    
    cat > .env.local << EOF
# Gamarriando Frontend Environment Configuration
# Generated on $(date)

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Payment (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MONITORING=true
NEXT_PUBLIC_ENABLE_PWA=false
EOF
    
    print_success "Environment file created: .env.local"
    print_warning "Please update the values in .env.local according to your setup"
}

# Function to create deployment configuration
create_deployment_config() {
    print_status "Creating deployment configuration..."
    
    cat > deployment-config.sh << EOF
#!/bin/bash

# Gamarriando Frontend Deployment Configuration
# Update these values according to your AWS setup

# S3 Bucket Configuration
export BUCKET_NAME="gamarriando-web-dev"
export STAGING_BUCKET_NAME="gamarriando-web-staging"
export BACKUP_BUCKET_NAME="gamarriando-web-backup"

# AWS Region
export AWS_REGION="us-east-1"

# CloudFront Distribution IDs (update with your actual IDs)
export CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
export STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"

# Domain Configuration
export DOMAIN_NAME="gamarriando.com"
export WWW_DOMAIN_NAME="www.gamarriando.com"
export STAGING_DOMAIN_NAME="staging.gamarriando.com"

# API Configuration
export API_BASE_URL="https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev"
export CDN_URL="https://d1234567890.cloudfront.net"
EOF
    
    chmod +x deployment-config.sh
    
    print_success "Deployment configuration created: deployment-config.sh"
    print_warning "Please update the values in deployment-config.sh according to your AWS setup"
}

# Function to check S3 buckets
check_s3_buckets() {
    print_status "Checking S3 buckets..."
    
    local buckets=("gamarriando-web" "gamarriando-web-staging" "gamarriando-web-backup")
    
    for bucket in "${buckets[@]}"; do
        if aws s3 ls "s3://$bucket" &> /dev/null; then
            print_success "Bucket '$bucket' exists and is accessible"
        else
            print_warning "Bucket '$bucket' does not exist or is not accessible"
        fi
    done
}

# Function to check CloudFront distributions
check_cloudfront_distributions() {
    print_status "Checking CloudFront distributions..."
    
    local distributions=$(aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status}' --output table)
    
    if [ ! -z "$distributions" ]; then
        echo "$distributions"
        print_success "CloudFront distributions found"
    else
        print_warning "No CloudFront distributions found"
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "=========================================="
    print_success "SETUP COMPLETED SUCCESSFULLY!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update the values in .env.local with your actual configuration"
    echo "2. Update the values in deployment-config.sh with your AWS resources"
    echo "3. Create S3 buckets if they don't exist:"
    echo "   aws s3 mb s3://gamarriando-web"
    echo "   aws s3 mb s3://gamarriando-web-staging"
    echo "   aws s3 mb s3://gamarriando-web-backup"
    echo "4. Set up CloudFront distributions (see infrastructure/terraform/)"
    echo "5. Test deployment with: ./scripts/deploy/deploy-local.sh staging"
    echo ""
    echo "Useful commands:"
    echo "  Deploy to staging: ./scripts/deploy/deploy-local.sh staging"
    echo "  Deploy to production: ./scripts/deploy/deploy-local.sh production"
    echo "  Check AWS status: aws sts get-caller-identity"
    echo "  List S3 buckets: aws s3 ls"
    echo "  List CloudFront distributions: aws cloudfront list-distributions"
    echo ""
}

# Main setup function
main() {
    echo "🔧 Gamarriando Frontend AWS Setup"
    echo "=================================="
    echo ""
    
    # Check if AWS CLI is installed
    if ! check_aws_cli; then
        print_status "Installing AWS CLI..."
        
        # Detect operating system
        if [[ "$OSTYPE" == "darwin"* ]]; then
            install_aws_cli_macos
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            install_aws_cli_linux
        else
            print_error "Unsupported operating system. Please install AWS CLI manually."
            print_status "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
            exit 1
        fi
    fi
    
    # Configure AWS CLI if not already configured
    if ! test_aws_config; then
        configure_aws_cli
        
        # Test configuration again
        if ! test_aws_config; then
            print_error "AWS configuration failed. Please check your credentials."
            exit 1
        fi
    fi
    
    # Create configuration files
    create_env_file
    create_deployment_config
    
    # Check AWS resources
    check_s3_buckets
    check_cloudfront_distributions
    
    # Show next steps
    show_next_steps
}

# Run main function
main
