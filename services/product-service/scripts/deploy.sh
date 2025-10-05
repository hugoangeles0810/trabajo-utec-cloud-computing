#!/bin/bash

# Gamarriando Product Service Deployment Script

set -e

# Default values
STAGE="dev"
REGION="us-east-1"
SKIP_TESTS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --stage)
            STAGE="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--stage STAGE] [--region REGION] [--skip-tests]"
            echo "  --stage: Deployment stage (dev, staging, prod) [default: dev]"
            echo "  --region: AWS region [default: us-east-1]"
            echo "  --skip-tests: Skip running tests before deployment"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo "🚀 Deploying Gamarriando Product Service..."
echo "Stage: $STAGE"
echo "Region: $REGION"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env.example"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure'"
    exit 1
fi

echo "✅ AWS CLI configured"

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
    echo "🧪 Running tests..."
    if ! python -m pytest tests/ -v; then
        echo "❌ Tests failed. Deployment aborted."
        exit 1
    fi
    echo "✅ Tests passed"
fi

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Virtual environment not activated. Activating..."
    source venv/bin/activate
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt
npm install

# Run linting
echo "🔍 Running linting..."
if ! python -m flake8 app/ --max-line-length=100; then
    echo "⚠️  Linting issues found, but continuing deployment..."
fi

# Deploy with Serverless Framework
echo "🚀 Deploying to AWS..."
if ! serverless deploy --stage "$STAGE" --region "$REGION"; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: python app/db_migrations.py migrate"
echo "2. Test the deployed API"
echo "3. Update your frontend to use the new API endpoints"
echo ""
echo "API Documentation: https://your-api-gateway-url/docs"
