#!/bin/bash

# Deploy Product Service to AWS Lambda
set -e

echo "🚀 Deploying Gamarriando Product Service to AWS Lambda..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework not installed. Installing..."
    npm install -g serverless
fi

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f "env.lambda.example" ]; then
        cp env.lambda.example .env
        echo "📝 Please edit .env file with your AWS configuration before deploying."
        exit 1
    else
        echo "❌ No environment example file found."
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("DB_HOST" "DB_PASSWORD" "JWT_SECRET_KEY" "VPC_ID" "SUBNET_ID_1" "SUBNET_ID_2")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set."
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Serverless plugins
echo "📦 Installing Serverless plugins..."
npm install

# Deploy to AWS
echo "🚀 Deploying to AWS Lambda..."
serverless deploy --stage ${STAGE:-dev} --region ${AWS_REGION:-us-east-1}

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "  - Service: gamarriando-product-service"
echo "  - Stage: ${STAGE:-dev}"
echo "  - Region: ${AWS_REGION:-us-east-1}"
echo ""
echo "🔗 API Endpoints:"
echo "  - Health Check: https://$(aws apigateway get-rest-apis --query 'items[?name==`gamarriando-product-service-${STAGE:-dev}`].id' --output text).execute-api.${AWS_REGION:-us-east-1}.amazonaws.com/${STAGE:-dev}/health"
echo "  - API Documentation: https://$(aws apigateway get-rest-apis --query 'items[?name==`gamarriando-product-service-${STAGE:-dev}`].id' --output text).execute-api.${AWS_REGION:-us-east-1}.amazonaws.com/${STAGE:-dev}/docs"
echo ""
echo "📊 Monitor your deployment:"
echo "  - CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION:-us-east-1}#logsV2:log-groups/log-group/\$252Faws\$252Flambda\$252Fgamarriando-product-service-${STAGE:-dev}-api"
echo "  - Lambda Console: https://console.aws.amazon.com/lambda/home?region=${AWS_REGION:-us-east-1}#/functions"
