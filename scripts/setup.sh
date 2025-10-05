#!/bin/bash

# Gamarriando Monorepo Setup Script

set -e

echo "🚀 Setting up Gamarriando Monorepo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js $NODE_VERSION detected"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker for local development."
    exit 1
fi

echo "✅ Docker detected"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed. Please install it for deployment."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install shared packages
echo "📦 Installing shared packages..."
cd shared/types
npm install
npm run build
cd - > /dev/null

# Install service dependencies
echo "📦 Installing service dependencies..."

# Product Service
if [ -d "services/product-service" ]; then
    echo "  Installing Product Service dependencies..."
    cd services/product-service
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    if [ -f "package.json" ]; then
        npm install
    fi
    cd - > /dev/null
fi

# Create environment files
echo "📝 Creating environment files..."

# Product Service
if [ -d "services/product-service" ] && [ ! -f "services/product-service/.env" ]; then
    if [ -f "services/product-service/env.example" ]; then
        cp services/product-service/env.example services/product-service/.env
        echo "  Created services/product-service/.env"
    fi
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p infrastructure/scripts
mkdir -p infrastructure/nginx
mkdir -p infrastructure/terraform
mkdir -p infrastructure/cloudformation

echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env files in each service with your configuration"
echo "2. Start development environment: make docker:up"
echo "3. Or start services individually: make dev:services"
echo "4. Access services at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Product Service: http://localhost:8000"
echo "   - User Service: http://localhost:8001"
echo "   - Order Service: http://localhost:8002"
echo "   - Payment Service: http://localhost:8003"
echo "   - Notification Service: http://localhost:8004"
echo ""
echo "For deployment:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Deploy: make deploy:dev"
echo ""
echo "For more information, see README.md"