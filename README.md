# Gamarriando

Gamarriando marketplace monorepo containing frontend and microservices architecture.

## 🏗️ Architecture Overview

This monorepo contains:
- **Frontend**: Next.js application
- **Microservices**: Python + FastAPI services deployed on AWS Lambda
- **Shared Packages**: Common types and utilities
- **Infrastructure**: Deployment and configuration files

## 📁 Project Structure

```
gamarriando/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── services/                    # Microservices
│   ├── product-service/         # Product management service
│   ├── user-service/           # User management service
│   ├── order-service/          # Order management service
│   ├── payment-service/        # Payment processing service
│   └── notification-service/   # Notification service
├── shared/                     # Shared packages
│   ├── types/                  # TypeScript types and schemas
│   ├── utils/                  # Common utilities
│   ├── config/                 # Shared configuration
│   └── constants/              # Shared constants
├── infrastructure/             # Infrastructure as Code
│   ├── terraform/              # Terraform configurations
│   ├── cloudformation/         # CloudFormation templates
│   └── scripts/                # Deployment scripts
├── docs/                       # Documentation
├── scripts/                    # Monorepo scripts
├── package.json                # Root package.json
├── nx.json                     # Nx configuration
├── workspace.json              # Workspace configuration
├── docker-compose.yml          # Local development
├── Makefile                    # Development commands
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- AWS CLI (for deployment)

### Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd gamarriando
   make setup
   ```

2. **Environment Configuration**:
   ```bash
   # Copy environment files
   cp services/product-service/env.example services/product-service/.env
   cp services/user-service/env.example services/user-service/.env
   # ... repeat for other services
   
   # Edit .env files with your configuration
   ```

3. **Start Development Environment**:
   ```bash
   # Start all services with Docker
   make docker:up
   
   # Or start services individually
   make dev:services
   make dev:frontend
   ```

## 🛠️ Development

### Available Commands

```bash
# Setup and Installation
make setup              # Initial setup
make install            # Install all dependencies
make install:shared     # Install shared packages
make install:services   # Install service dependencies
make install:frontend   # Install frontend dependencies

# Development
make dev                # Start all services
make dev:services       # Start microservices only
make dev:frontend       # Start frontend only
make dev:product        # Start product service only
make dev:user           # Start user service only
make dev:order          # Start order service only
make dev:payment        # Start payment service only
make dev:notification   # Start notification service only

# Building
make build              # Build all packages
make build:shared       # Build shared packages
make build:services     # Build services
make build:frontend     # Build frontend

# Testing
make test               # Run all tests
make test:services      # Run service tests
make test:frontend      # Run frontend tests
make test:coverage      # Run tests with coverage

# Code Quality
make lint               # Run linting
make format             # Format code

# Database
make migrate            # Run migrations
make migrate:create     # Create new migration
make migrate:reset      # Reset databases

# Docker
make docker:build       # Build Docker images
make docker:up          # Start with Docker Compose
make docker:down        # Stop Docker containers
make docker:logs        # View Docker logs

# Deployment
make deploy:dev         # Deploy to development
make deploy:prod        # Deploy to production
make deploy:services    # Deploy services only
make deploy:frontend    # Deploy frontend only

# Utilities
make clean              # Clean temporary files
make logs               # View service logs
make health             # Check service health
```

### Service URLs (Local Development)

- **Frontend**: http://localhost:3000
- **Product Service**: http://localhost:8000
- **User Service**: http://localhost:8001
- **Order Service**: http://localhost:8002
- **Payment Service**: http://localhost:8003
- **Notification Service**: http://localhost:8004
- **API Gateway (Nginx)**: http://localhost:80

## 🏢 Services

### Product Service
- **Port**: 8000
- **Description**: Product management, categories, inventory
- **Endpoints**: `/api/v1/products/*`, `/api/v1/categories/*`, `/api/v1/vendors/*`

### User Service
- **Port**: 8001
- **Description**: User management, authentication, profiles
- **Endpoints**: `/api/v1/users/*`, `/api/v1/auth/*`

### Order Service
- **Port**: 8002
- **Description**: Order management, order processing
- **Endpoints**: `/api/v1/orders/*`

### Payment Service
- **Port**: 8003
- **Description**: Payment processing, payment methods
- **Endpoints**: `/api/v1/payments/*`

### Notification Service
- **Port**: 8004
- **Description**: Notifications, email, SMS, push notifications
- **Endpoints**: `/api/v1/notifications/*`

## 📦 Shared Packages

### @gamarriando/shared-types
Common TypeScript types and Zod schemas used across all services.

```typescript
import { ProductCreate, UserResponse, OrderStatus } from '@gamarriando/shared-types';
```

### @gamarriando/shared-utils
Common utilities and helper functions.

```typescript
import { formatCurrency, validateEmail } from '@gamarriando/shared-utils';
```

## 🐳 Docker Development

### Start All Services
```bash
make docker:up
```

### View Logs
```bash
make docker:logs
```

### Stop Services
```bash
make docker:down
```

### Individual Service Development
```bash
# Start only specific services
docker-compose up postgres redis product-service
```

## 🚀 Deployment

### AWS Lambda Deployment

1. **Configure AWS CLI**:
   ```bash
   aws configure
   ```

2. **Deploy All Services**:
   ```bash
   make deploy:dev    # Development
   make deploy:prod   # Production
   ```

3. **Deploy Specific Services**:
   ```bash
   make deploy:services  # Only microservices
   make deploy:frontend  # Only frontend
   ```

### Environment Variables

Set these in your AWS Lambda environment or `.env` files:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS
AWS_REGION=us-east-1
VPC_ID=vpc-xxxxxxxxx
SUBNET_ID_1=subnet-xxxxxxxxx
SUBNET_ID_2=subnet-yyyyyyyyy

# S3
S3_BUCKET=gamarriando-dev-product-images

# Payment Providers
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Notification Providers
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Run Service Tests
```bash
make test:services
```

### Run Frontend Tests
```bash
make test:frontend
```

### Run with Coverage
```bash
make test:coverage
```

## 📊 Monitoring

### Health Checks
```bash
make health
```

### Service Logs
```bash
make logs
```

### AWS CloudWatch
- Lambda function logs
- API Gateway logs
- RDS Aurora logs
- S3 access logs

## 🔧 Configuration

### Nx Workspace
The monorepo uses Nx for workspace management:
- **nx.json**: Nx configuration
- **workspace.json**: Project definitions
- **package.json**: Workspace scripts

### TypeScript
- Shared types in `shared/types/`
- Service-specific types in each service
- Strict type checking enabled

### ESLint & Prettier
- Consistent code formatting
- TypeScript-specific rules
- Import organization

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linting
6. Submit a pull request

### Development Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**:
   ```bash
   # Make your changes
   make format  # Format code
   make lint    # Check linting
   make test    # Run tests
   ```

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

4. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/gamarriando/monorepo/issues)
- **Email**: support@gamarriando.com

## 🏆 Team

- **Backend Team**: Microservices development
- **Frontend Team**: Next.js application
- **DevOps Team**: Infrastructure and deployment
- **QA Team**: Testing and quality assurance

---

**Gamarriando Team** - Building the future of marketplace technology 🚀