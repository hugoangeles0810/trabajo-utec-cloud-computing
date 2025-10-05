# Gamarriando Product Service - Architecture

## Overview

The Gamarriando Product Service is a microservice designed to handle all product-related operations for the Gamarriando marketplace. It's built with FastAPI and deployed on AWS Lambda, following modern microservices architecture principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Gamarriando Marketplace                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   NextJS App    │    │   Mobile App    │    │  Admin Panel │ │
│  │   (Frontend)    │    │   (React Native)│    │   (React)    │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │      │
│           └───────────────────────┼───────────────────────┘      │
│                                   │                              │
└───────────────────────────────────┼──────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────┐
│                    API Gateway (AWS)                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  /api/v1/products/*  →  Product Service (Lambda)           │ │
│  │  /api/v1/users/*     →  User Service (Lambda)              │ │
│  │  /api/v1/orders/*    →  Order Service (Lambda)             │ │
│  │  /api/v1/payments/*  →  Payment Service (Lambda)           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────┐
│                    Product Service (Lambda)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │   Products  │ │   Vendors   │ │ Categories  │           │ │
│  │  │   Endpoints │ │  Endpoints  │ │  Endpoints  │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │   Product   │ │   Vendor    │ │  Category   │           │ │
│  │  │   Service   │ │   Service   │ │   Service   │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │   Product   │ │   Vendor    │ │  Category   │           │ │
│  │  │    Model    │ │    Model    │ │    Model    │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────┐
│                    Data Layer                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  RDS Aurora PostgreSQL Cluster                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │  Products   │ │   Vendors   │ │ Categories  │           │ │
│  │  │    Table    │ │   Table     │ │   Table     │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │ Product     │ │ Product     │ │ Product     │           │ │
│  │  │ Images      │ │ Tags        │ │ Categories  │           │ │
│  │  │ Table       │ │ Table       │ │ Table       │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  S3 Bucket (Product Images)                                │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │   Product   │ │   Vendor    │ │  Category   │           │ │
│  │  │   Images    │ │   Logos     │ │   Images    │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Runtime**: AWS Lambda
- **API Gateway**: AWS API Gateway
- **Authentication**: JWT (JSON Web Tokens)

### Database
- **Primary Database**: AWS RDS Aurora PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Connection Pooling**: SQLAlchemy connection pooling

### Storage
- **File Storage**: AWS S3
- **Image Processing**: AWS Lambda (for image resizing/optimization)

### Infrastructure
- **Deployment**: Serverless Framework
- **Monitoring**: AWS CloudWatch
- **Logging**: AWS CloudWatch Logs
- **Secrets Management**: AWS Secrets Manager

## Service Architecture

### Core Components

1. **API Layer** (`app/api/`)
   - RESTful endpoints for products, vendors, and categories
   - Request/response validation with Pydantic
   - Authentication and authorization middleware

2. **Service Layer** (`app/services/`)
   - Business logic implementation
   - Data validation and transformation
   - External service integration

3. **Data Layer** (`app/models/`)
   - SQLAlchemy ORM models
   - Database relationships and constraints
   - Data validation rules

4. **Schema Layer** (`app/schemas/`)
   - Pydantic models for request/response validation
   - Data serialization and deserialization
   - API documentation generation

### Key Features

#### Product Management
- **CRUD Operations**: Create, read, update, delete products
- **Multi-vendor Support**: Products belong to specific vendors
- **Category Management**: Hierarchical category system
- **Inventory Tracking**: Stock levels and low stock alerts
- **Image Management**: Multiple images per product with S3 storage
- **Tagging System**: Flexible product tagging
- **Search & Filtering**: Advanced search with multiple filters

#### Vendor Management
- **Vendor Profiles**: Complete vendor information
- **Verification System**: Vendor verification workflow
- **Business Information**: Tax IDs, business types, addresses
- **Status Management**: Active/inactive vendor states

#### Category Management
- **Hierarchical Structure**: Parent-child category relationships
- **SEO Optimization**: Meta titles and descriptions
- **Sort Order**: Customizable category ordering
- **Product Counts**: Track products per category

## Data Models

### Product Model
```python
class Product:
    id: int
    name: str
    slug: str
    description: str
    sku: str
    vendor_id: int
    product_type: ProductType
    status: ProductStatus
    price: float
    compare_at_price: float
    inventory_quantity: int
    low_stock_threshold: int
    weight: float
    dimensions: dict
    meta_title: str
    meta_description: str
    attributes: dict
    created_at: datetime
    updated_at: datetime
```

### Vendor Model
```python
class Vendor:
    id: int
    name: str
    email: str
    phone: str
    description: str
    business_name: str
    business_type: str
    tax_id: str
    address: dict
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
```

### Category Model
```python
class Category:
    id: int
    name: str
    slug: str
    description: str
    parent_id: int
    sort_order: int
    meta_title: str
    meta_description: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

## API Design

### RESTful Endpoints

#### Products
- `GET /api/v1/products/` - List products with filtering
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/sku/{sku}` - Get product by SKU
- `GET /api/v1/products/slug/{slug}` - Get product by slug
- `POST /api/v1/products/` - Create product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `PATCH /api/v1/products/{id}/inventory` - Update inventory

#### Vendors
- `GET /api/v1/vendors/` - List vendors
- `GET /api/v1/vendors/{id}` - Get vendor by ID
- `POST /api/v1/vendors/` - Create vendor
- `PUT /api/v1/vendors/{id}` - Update vendor
- `DELETE /api/v1/vendors/{id}` - Delete vendor

#### Categories
- `GET /api/v1/categories/` - List categories
- `GET /api/v1/categories/tree` - Get category tree
- `GET /api/v1/categories/{id}` - Get category by ID
- `POST /api/v1/categories/` - Create category
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

### Authentication & Authorization

#### JWT Token Structure
```json
{
  "sub": "user_id",
  "vendor_id": "vendor_id",
  "roles": ["vendor", "admin"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

#### Permission Levels
- **Public**: Read-only access to products and categories
- **Vendor**: Full access to own products, read access to categories
- **Admin**: Full access to all resources

## Deployment Architecture

### AWS Lambda Configuration
- **Runtime**: Python 3.11
- **Memory**: 512MB - 3GB (configurable)
- **Timeout**: 30 seconds
- **Concurrency**: 1000 concurrent executions

### Database Configuration
- **Engine**: Aurora PostgreSQL 15.4
- **Instance Class**: db.r6g.large
- **Storage**: 100GB - 64TB (auto-scaling)
- **Backup**: 7-day retention
- **Multi-AZ**: Enabled for high availability

### Security
- **VPC**: Lambda functions in private subnets
- **Security Groups**: Restricted database access
- **IAM Roles**: Least privilege access
- **Encryption**: Data encrypted at rest and in transit

## Monitoring & Observability

### Logging
- **Application Logs**: CloudWatch Logs
- **Access Logs**: API Gateway logs
- **Error Tracking**: CloudWatch Alarms

### Metrics
- **Performance**: Response times, throughput
- **Business**: Product views, searches, conversions
- **Infrastructure**: Lambda invocations, database connections

### Health Checks
- **Endpoint**: `/health`
- **Database**: Connection health
- **Dependencies**: External service availability

## Scalability Considerations

### Horizontal Scaling
- **Lambda**: Automatic scaling based on demand
- **Aurora**: Read replicas for read-heavy workloads
- **API Gateway**: Built-in scaling and throttling

### Performance Optimization
- **Connection Pooling**: SQLAlchemy connection pooling
- **Caching**: Redis for frequently accessed data
- **CDN**: CloudFront for static assets
- **Database Indexing**: Optimized queries with proper indexes

### Cost Optimization
- **Lambda**: Pay-per-request pricing
- **Aurora**: Serverless v2 for variable workloads
- **S3**: Intelligent tiering for storage costs

## Development Workflow

### Local Development
1. **Setup**: Docker Compose for local services
2. **Database**: PostgreSQL container
3. **API**: FastAPI development server
4. **Testing**: pytest with test database

### CI/CD Pipeline
1. **Code Quality**: Linting, formatting, type checking
2. **Testing**: Unit tests, integration tests
3. **Security**: Dependency scanning, SAST
4. **Deployment**: Serverless Framework deployment
5. **Monitoring**: Health checks and alerts

## Future Enhancements

### Planned Features
- **Product Variants**: Size, color, material variations
- **Bundles**: Product bundles and packages
- **Reviews**: Customer reviews and ratings
- **Recommendations**: AI-powered product recommendations
- **Analytics**: Advanced product analytics
- **Multi-language**: Internationalization support

### Technical Improvements
- **GraphQL**: Alternative API interface
- **Event Sourcing**: Event-driven architecture
- **CQRS**: Command Query Responsibility Segregation
- **Microservices**: Further service decomposition
- **Kubernetes**: Container orchestration option
