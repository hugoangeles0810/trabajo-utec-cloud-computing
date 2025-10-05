# Gamarriando Product Service

Product management microservice for the Gamarriando marketplace, built with FastAPI and deployed on AWS Lambda.

## Features

- **Product Management**: Complete CRUD operations for products
- **Multi-vendor Support**: Handle products from multiple vendors
- **Category Management**: Hierarchical category system
- **Advanced Search**: Full-text search with filters
- **Inventory Management**: Track stock levels and low stock alerts
- **Image Management**: Handle product images with S3 integration
- **Tagging System**: Flexible product tagging
- **JWT Authentication**: Secure API access
- **AWS Integration**: Lambda, RDS Aurora PostgreSQL, S3

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NextJS App    │    │   API Gateway   │    │   Lambda        │
│   (Frontend)    │◄──►│   (AWS)         │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   RDS Aurora    │◄─────────────┘
                       │   PostgreSQL    │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   S3 Bucket     │
                       │   (Images)      │
                       └─────────────────┘
```

## Tech Stack

- **Backend**: Python 3.11, FastAPI
- **Database**: PostgreSQL (AWS RDS Aurora)
- **Authentication**: JWT
- **Storage**: AWS S3 (product images)
- **Deployment**: AWS Lambda + API Gateway
- **Infrastructure**: Serverless Framework
- **ORM**: SQLAlchemy
- **Migrations**: Alembic

## Project Structure

```
product-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── products.py
│   │       │   ├── vendors.py
│   │       │   └── categories.py
│   │       └── api.py
│   ├── auth/
│   │   ├── jwt_handler.py
│   │   ├── dependencies.py
│   │   └── schemas.py
│   ├── models/
│   │   ├── product.py
│   │   ├── vendor.py
│   │   ├── category.py
│   │   └── base.py
│   ├── schemas/
│   │   ├── product.py
│   │   ├── vendor.py
│   │   ├── category.py
│   │   └── common.py
│   ├── services/
│   │   ├── product_service.py
│   │   ├── vendor_service.py
│   │   ├── category_service.py
│   │   └── base_service.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   └── db_migrations.py
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── tests/
├── serverless.yml
├── requirements.txt
├── alembic.ini
├── main.py
└── README.md
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS CLI configured
- PostgreSQL (for local development)

### Installation

1. **Clone and setup**:
   ```bash
   cd product-service
   pip install -r requirements.txt
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**:
   ```bash
   # For local development
   python app/db_migrations.py init
   
   # Or run migrations
   python app/db_migrations.py migrate
   ```

### Local Development

1. **Start the development server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API**:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_products.py
```

## Deployment

### AWS Setup

1. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

2. **Deploy to AWS**:
   ```bash
   # Deploy to development
   npm run deploy:dev
   
   # Deploy to production
   npm run deploy:prod
   ```

3. **Run migrations**:
   ```bash
   # After deployment, run migrations
   python app/db_migrations.py migrate
   ```

### Environment Variables

Set these in your AWS Lambda environment or `.env` file:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DB_MASTER_USERNAME=gamarriando
DB_MASTER_PASSWORD=your_secure_password

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
```

## API Endpoints

### Products

- `GET /api/v1/products/` - List products with filtering
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/sku/{sku}` - Get product by SKU
- `GET /api/v1/products/slug/{slug}` - Get product by slug
- `POST /api/v1/products/` - Create product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `PATCH /api/v1/products/{id}/inventory` - Update inventory

### Vendors

- `GET /api/v1/vendors/` - List vendors
- `GET /api/v1/vendors/{id}` - Get vendor by ID
- `POST /api/v1/vendors/` - Create vendor
- `PUT /api/v1/vendors/{id}` - Update vendor
- `DELETE /api/v1/vendors/{id}` - Delete vendor

### Categories

- `GET /api/v1/categories/` - List categories
- `GET /api/v1/categories/tree` - Get category tree
- `GET /api/v1/categories/{id}` - Get category by ID
- `POST /api/v1/categories/` - Create category
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

## Database Migrations

```bash
# Create a new migration
python app/db_migrations.py create "Add product variants table"

# Run migrations
python app/db_migrations.py migrate

# Downgrade migration
python app/db_migrations.py downgrade

# Show current revision
python app/db_migrations.py current

# Show migration history
python app/db_migrations.py history
```

## Monitoring and Logs

```bash
# View Lambda logs
npm run logs

# Invoke function locally
npm run invoke

# Run offline for testing
npm run offline
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@gamarriando.com or create an issue in the repository.
