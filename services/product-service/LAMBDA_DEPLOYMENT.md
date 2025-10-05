# 🚀 AWS Lambda Deployment Guide

## 📋 Overview

This guide explains how to deploy the Gamarriando Product Service to AWS Lambda using the Serverless Framework.

## 🏗️ Architecture

The Product Service is deployed as a serverless function with the following components:

- **AWS Lambda**: FastAPI application wrapped with Mangum
- **API Gateway**: HTTP API for REST endpoints
- **RDS Aurora PostgreSQL**: Database for data persistence
- **VPC**: Network isolation for security
- **S3**: Storage for product images
- **CloudWatch**: Logging and monitoring

## 📦 Prerequisites

### 1. AWS Account Setup
```bash
# Configure AWS CLI
aws configure

# Verify configuration
aws sts get-caller-identity
```

### 2. Required Tools
```bash
# Install Serverless Framework
npm install -g serverless

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.lambda.example .env

# Edit with your AWS configuration
nano .env
```

## 🔧 Configuration

### Environment Variables

Required environment variables in `.env`:

```bash
# Database Configuration
DB_HOST=your-aurora-cluster-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=gamarriando
DB_USER=gamarriando
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS Configuration
AWS_REGION=us-east-1
VPC_ID=vpc-xxxxxxxxx
SUBNET_ID_1=subnet-xxxxxxxxx
SUBNET_ID_2=subnet-yyyyyyyyy

# Application Configuration
STAGE=dev
DEBUG=false
LOG_LEVEL=INFO

# S3 Configuration
S3_BUCKET=gamarriando-dev-product-images
S3_REGION=us-east-1
```

## 🚀 Deployment

### Quick Deployment
```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# Or use the deployment script
./scripts/deploy-lambda.sh
```

### Manual Deployment
```bash
# Deploy with specific stage
serverless deploy --stage dev --region us-east-1

# Deploy with verbose output
serverless deploy --stage dev --verbose
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
npm run deploy:logs

# Or using serverless
serverless logs -f api --tail
```

### Check Deployment Status
```bash
# Get deployment information
npm run deploy:info

# Or using serverless
serverless info --stage dev
```

### Test Lambda Function
```bash
# Invoke function locally
npm run lambda:invoke:local

# Invoke deployed function
npm run lambda:invoke
```

## 🔍 API Endpoints

After deployment, your API will be available at:

```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}/
```

### Available Endpoints:
- `GET /health` - Health check
- `GET /docs` - API documentation (Swagger UI)
- `GET /api/v1/products/` - List products
- `POST /api/v1/products/` - Create product
- `GET /api/v1/products/{id}` - Get product by ID
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `GET /api/v1/categories/` - List categories
- `GET /api/v1/vendors/` - List vendors

## 🗄️ Database Setup

### 1. Create RDS Aurora Cluster
The Serverless configuration will create:
- Aurora PostgreSQL cluster
- Security groups
- Subnet groups
- Database instance

### 2. Run Migrations
```bash
# After deployment, run migrations
npm run migrate
```

### 3. Seed Data (Optional)
```bash
# Add sample data
python scripts/seed_data.py
```

## 🔒 Security

### VPC Configuration
- Lambda functions run in private subnets
- RDS Aurora in private subnets
- Security groups restrict access

### IAM Permissions
The service has permissions for:
- RDS access
- S3 bucket access
- CloudWatch logging

### Environment Variables
- Sensitive data stored in environment variables
- JWT secrets should be rotated regularly
- Database credentials managed by AWS Secrets Manager (recommended)

## 🚨 Troubleshooting

### Common Issues

#### 1. VPC Configuration
```bash
# Check VPC and subnet IDs
aws ec2 describe-vpcs
aws ec2 describe-subnets
```

#### 2. Database Connection
```bash
# Test database connectivity
aws rds describe-db-clusters
```

#### 3. Lambda Timeout
```bash
# Increase timeout in serverless.yml
timeout: 60  # seconds
```

#### 4. Memory Issues
```bash
# Increase memory allocation
memorySize: 1024  # MB
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
serverless deploy --stage dev --verbose
```

## 📈 Performance Optimization

### Lambda Configuration
- **Memory**: 512MB (adjust based on usage)
- **Timeout**: 30 seconds
- **Concurrency**: Auto-scaling

### Database Optimization
- Connection pooling configured for Lambda
- Minimal pool size (1 connection)
- Connection recycling enabled

### Cold Start Optimization
- Mangum with lifespan="off"
- Optimized imports
- Minimal dependencies

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to AWS Lambda
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          npm install
      - name: Deploy to AWS
        run: npm run deploy:prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📚 Additional Resources

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Python Guide](https://docs.aws.amazon.com/lambda/latest/dg/python-programming-model.html)
- [FastAPI on AWS Lambda](https://fastapi.tiangolo.com/deployment/serverless/)
- [Mangum Documentation](https://mangum.io/)

## 🆘 Support

For issues or questions:
1. Check CloudWatch logs
2. Review serverless deployment logs
3. Verify AWS permissions
4. Check environment variables

---

**Happy Deploying! 🚀**
