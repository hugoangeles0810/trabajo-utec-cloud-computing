#!/bin/bash

# Gamarriando Monorepo - Deploy All Services Script

set -e

# Default values
STAGE="dev"
REGION="us-east-1"
SERVICES="all"
SKIP_TESTS=false
SKIP_BUILD=false

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
        --services)
            SERVICES="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --stage STAGE        Deployment stage (dev, staging, prod) [default: dev]"
            echo "  --region REGION      AWS region [default: us-east-1]"
            echo "  --services SERVICES  Services to deploy (all, product, user, order, payment, notification, frontend) [default: all]"
            echo "  --skip-tests         Skip running tests before deployment"
            echo "  --skip-build         Skip building before deployment"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo "🚀 Deploying Gamarriando Monorepo..."
echo "Stage: $STAGE"
echo "Region: $REGION"
echo "Services: $SERVICES"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure'"
    exit 1
fi

echo "✅ AWS CLI configured"

# Function to deploy a service
deploy_service() {
    local service=$1
    local service_path="services/$service"
    
    if [ ! -d "$service_path" ]; then
        echo "⚠️  Service $service not found, skipping..."
        return
    fi
    
    echo "📦 Deploying $service service..."
    
    cd "$service_path"
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    
    if [ -f "package.json" ]; then
        npm install
    fi
    
    # Run tests if not skipped
    if [ "$SKIP_TESTS" = false ]; then
        if [ -f "requirements.txt" ] && command -v pytest &> /dev/null; then
            echo "🧪 Running tests for $service..."
            if ! python -m pytest tests/ -v; then
                echo "❌ Tests failed for $service. Deployment aborted."
                exit 1
            fi
        fi
    fi
    
    # Deploy
    if [ -f "serverless.yml" ]; then
        echo "🚀 Deploying $service to AWS Lambda..."
        if ! serverless deploy --stage "$STAGE" --region "$REGION"; then
            echo "❌ Deployment failed for $service"
            exit 1
        fi
    fi
    
    cd - > /dev/null
    echo "✅ $service deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    echo "📦 Deploying frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    
    # Build
    if [ "$SKIP_BUILD" = false ]; then
        echo "🔨 Building frontend..."
        npm run build
    fi
    
    # Deploy (this would depend on your frontend hosting solution)
    echo "🚀 Deploying frontend..."
    # Add your frontend deployment commands here
    # For example: npm run deploy or aws s3 sync dist/ s3://your-bucket
    
    cd - > /dev/null
    echo "✅ Frontend deployed successfully"
}

# Deploy shared packages first
echo "📦 Building shared packages..."
cd shared/types
npm install
npm run build
cd - > /dev/null

# Deploy services based on selection
case $SERVICES in
    "all")
        deploy_service "product-service"
        deploy_service "user-service"
        deploy_service "order-service"
        deploy_service "payment-service"
        deploy_service "notification-service"
        deploy_frontend
        ;;
    "services")
        deploy_service "product-service"
        deploy_service "user-service"
        deploy_service "order-service"
        deploy_service "payment-service"
        deploy_service "notification-service"
        ;;
    "frontend")
        deploy_frontend
        ;;
    *)
        # Deploy specific services
        IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"
        for service in "${SERVICE_ARRAY[@]}"; do
            if [ "$service" = "frontend" ]; then
                deploy_frontend
            else
                deploy_service "$service"
            fi
        done
        ;;
esac

echo "✅ All deployments completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: npm run migrate:all"
echo "2. Test the deployed services"
echo "3. Update DNS/domain configuration if needed"
echo ""
echo "Service URLs:"
echo "- Product Service: https://your-api-gateway-url/api/v1/products"
echo "- User Service: https://your-api-gateway-url/api/v1/users"
echo "- Order Service: https://your-api-gateway-url/api/v1/orders"
echo "- Payment Service: https://your-api-gateway-url/api/v1/payments"
echo "- Notification Service: https://your-api-gateway-url/api/v1/notifications"
echo "- Frontend: https://your-frontend-url"
