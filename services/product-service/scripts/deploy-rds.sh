#!/bin/bash

# Gamarriando Product Service - RDS Deployment Script
# This script deploys the Product Service with RDS Aurora PostgreSQL integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGE=${1:-dev}
REGION=${2:-us-east-1}
SERVICE_NAME="gamarriando-product-service"

echo -e "${BLUE}🚀 Starting RDS deployment for Gamarriando Product Service${NC}"
echo -e "${BLUE}Stage: ${STAGE}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo -e "${RED}❌ Serverless Framework is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    if [ -f "env.aws.example" ]; then
        cp env.aws.example .env
        echo -e "${YELLOW}📝 Please edit .env file with your configuration before continuing.${NC}"
        echo -e "${YELLOW}   Required variables: DB_PASSWORD, LAMBDA_SECURITY_GROUP_ID, LAMBDA_SUBNET_ID_1, LAMBDA_SUBNET_ID_2${NC}"
        read -p "Press Enter to continue after editing .env file..."
    else
        echo -e "${RED}❌ env.aws.example file not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required environment variables
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

REQUIRED_VARS=("DB_PASSWORD" "LAMBDA_SECURITY_GROUP_ID" "LAMBDA_SUBNET_ID_1" "LAMBDA_SUBNET_ID_2")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    echo -e "${YELLOW}Please set these variables in your .env file.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Deploy infrastructure
echo -e "${YELLOW}🏗️  Deploying infrastructure with RDS Aurora...${NC}"

# Deploy with RDS configuration
serverless deploy --config serverless-rds.yml --stage $STAGE --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Infrastructure deployment completed${NC}"
else
    echo -e "${RED}❌ Infrastructure deployment failed${NC}"
    exit 1
fi

# Get Aurora cluster endpoint
echo -e "${YELLOW}🔍 Getting Aurora cluster endpoint...${NC}"

AURORA_ENDPOINT=$(aws rds describe-db-clusters \
    --db-cluster-identifier "${SERVICE_NAME}-${STAGE}-aurora-cluster" \
    --region $REGION \
    --query 'DBClusters[0].Endpoint' \
    --output text 2>/dev/null || echo "")

if [ -z "$AURORA_ENDPOINT" ] || [ "$AURORA_ENDPOINT" = "None" ]; then
    echo -e "${RED}❌ Could not get Aurora cluster endpoint${NC}"
    echo -e "${YELLOW}Please check the RDS cluster status in AWS Console${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Aurora endpoint: $AURORA_ENDPOINT${NC}"

# Wait for Aurora cluster to be available
echo -e "${YELLOW}⏳ Waiting for Aurora cluster to be available...${NC}"

aws rds wait db-cluster-available \
    --db-cluster-identifier "${SERVICE_NAME}-${STAGE}-aurora-cluster" \
    --region $REGION

echo -e "${GREEN}✅ Aurora cluster is available${NC}"

# Update environment variables with Aurora endpoint
echo -e "${YELLOW}🔄 Updating Lambda functions with Aurora endpoint...${NC}"

# Update the .env file with the Aurora endpoint
sed -i.bak "s/DB_HOST=.*/DB_HOST=$AURORA_ENDPOINT/" .env

# Deploy Lambda functions with updated configuration
serverless deploy function --config serverless-rds.yml --stage $STAGE --region $REGION --all

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lambda functions updated with Aurora endpoint${NC}"
else
    echo -e "${RED}❌ Failed to update Lambda functions${NC}"
    exit 1
fi

# Initialize database
echo -e "${YELLOW}🗄️  Initializing database schema...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql not found. Please install PostgreSQL client or run the SQL script manually.${NC}"
    echo -e "${YELLOW}   SQL script location: migrations/init_database.sql${NC}"
    echo -e "${YELLOW}   Connection details:${NC}"
    echo -e "${YELLOW}   Host: $AURORA_ENDPOINT${NC}"
    echo -e "${YELLOW}   Port: 5432${NC}"
    echo -e "${YELLOW}   Database: gamarriando${NC}"
    echo -e "${YELLOW}   User: gamarriando${NC}"
    echo -e "${YELLOW}   Password: [from your .env file]${NC}"
else
    # Run the initialization script
    PGPASSWORD=$DB_PASSWORD psql \
        -h $AURORA_ENDPOINT \
        -p 5432 \
        -U gamarriando \
        -d gamarriando \
        -f migrations/init_database.sql

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema initialized${NC}"
    else
        echo -e "${RED}❌ Database initialization failed${NC}"
        echo -e "${YELLOW}Please run the SQL script manually: migrations/init_database.sql${NC}"
    fi
fi

# Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Get API Gateway URL
API_URL=$(serverless info --config serverless-rds.yml --stage $STAGE --region $REGION | grep "endpoints:" -A 1 | tail -1 | awk '{print $2}' || echo "")

if [ -n "$API_URL" ]; then
    echo -e "${GREEN}✅ API Gateway URL: $API_URL${NC}"
    
    # Test a simple endpoint
    echo -e "${YELLOW}Testing categories endpoint...${NC}"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/categories" || echo "000")
    
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ API test successful${NC}"
    else
        echo -e "${YELLOW}⚠️  API test returned status: $RESPONSE${NC}"
        echo -e "${YELLOW}   This might be expected if the database is not yet initialized.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not get API Gateway URL${NC}"
fi

# Display summary
echo ""
echo -e "${GREEN}🎉 RDS deployment completed!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "${BLUE}   Service: $SERVICE_NAME${NC}"
echo -e "${BLUE}   Stage: $STAGE${NC}"
echo -e "${BLUE}   Region: $REGION${NC}"
echo -e "${BLUE}   Aurora Endpoint: $AURORA_ENDPOINT${NC}"
if [ -n "$API_URL" ]; then
    echo -e "${BLUE}   API URL: $API_URL${NC}"
fi
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "${YELLOW}   1. Verify database initialization${NC}"
echo -e "${YELLOW}   2. Test all API endpoints${NC}"
echo -e "${YELLOW}   3. Monitor CloudWatch logs${NC}"
echo -e "${YELLOW}   4. Set up monitoring and alerts${NC}"
echo ""
echo -e "${GREEN}✅ Deployment script completed successfully!${NC}"
