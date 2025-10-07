# ☁️ Configuración AWS - Gamarriando

Guía completa para configurar la infraestructura AWS del proyecto Gamarriando.

## 📋 Resumen

### **Estado Actual**
- ✅ **S3 Bucket**: `gamarriando-web-dev` configurado
- ✅ **API Gateway**: Configurado para microservicios
- ✅ **Lambda Functions**: 56 funciones desplegadas
- ✅ **RDS Aurora**: PostgreSQL configurado
- ✅ **Frontend**: Desplegado en S3

### **URLs Activas**
- **Frontend**: http://gamarriando-web-dev.s3-website-us-east-1.amazonaws.com
- **API**: https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/

## 🏗️ Arquitectura AWS

### **Componentes Desplegados**
```
AWS Infrastructure:
├── S3 Bucket (gamarriando-web-dev)
│   ├── Frontend hosting
│   ├── Static assets
│   └── Public access configured
├── API Gateway
│   ├── Product Service endpoints
│   ├── User Service endpoints
│   └── Payment Service endpoints
├── Lambda Functions (56 total)
│   ├── Product Service (15 functions)
│   ├── User Service (21 functions)
│   ├── Payment Service (15 functions)
│   └── Other services (5 functions)
├── RDS Aurora PostgreSQL
│   ├── Database: gamarriando
│   ├── Tables: products, users, orders, payments
│   └── Connection pooling configured
└── CloudWatch
    ├── Logs for all services
    ├── Metrics and monitoring
    └── Alarms configured
```

## 🪣 Configuración S3

### **Bucket Creado**
```bash
# Información del bucket
Bucket Name: gamarriando-web-dev
Region: us-east-1
Profile: personal
Resource Group: gamarriando
Environment: dev
```

### **Configuración de Hosting Web**
```bash
# Configuración aplicada
Index Document: index.html
Error Document: 404.html
Public Access: Enabled for read
Bucket Policy: Public read access
```

### **Comandos de Configuración**
```bash
# 1. Crear bucket
aws s3 mb s3://gamarriando-web-dev --region us-east-1 --profile personal

# 2. Configurar tags
aws s3api put-bucket-tagging --bucket gamarriando-web-dev \
  --tagging 'TagSet=[{Key=ResourceGroup,Value=gamarriando},{Key=Environment,Value=dev},{Key=Project,Value=gamarriando-frontend}]' \
  --profile personal

# 3. Configurar hosting web
aws s3 website s3://gamarriando-web-dev \
  --index-document index.html \
  --error-document 404.html \
  --profile personal

# 4. Desbloquear acceso público
aws s3api put-public-access-block --bucket gamarriando-web-dev \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --profile personal

# 5. Política de bucket
aws s3api put-bucket-policy --bucket gamarriando-web-dev \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::gamarriando-web-dev/*"
      }
    ]
  }' \
  --profile personal
```

## 🚀 Lambda Functions

### **Product Service (15 functions)**
```bash
# Endpoints disponibles
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}

GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/categories/{id}
PUT    /api/v1/categories/{id}
DELETE /api/v1/categories/{id}

GET    /api/v1/vendors
POST   /api/v1/vendors
GET    /api/v1/vendors/{id}
PUT    /api/v1/vendors/{id}
DELETE /api/v1/vendors/{id}
```

### **User Service (21 functions)**
```bash
# Authentication endpoints
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# User management endpoints
POST   /api/v1/users
GET    /api/v1/users/{id}
GET    /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
POST   /api/v1/users/verify-email
PUT    /api/v1/users/change-password
GET    /api/v1/users/profile

# Role management endpoints
POST   /api/v1/roles/assign
DELETE /api/v1/roles/remove
GET    /api/v1/roles
GET    /api/v1/roles/all

# Session management endpoints
GET    /api/v1/sessions
DELETE /api/v1/sessions/{id}
DELETE /api/v1/sessions/all
```

### **Payment Service (15 functions)**
```bash
# Order endpoints
POST   /api/v1/orders
GET    /api/v1/orders/{order_id}
GET    /api/v1/orders
PUT    /api/v1/orders/{order_id}
DELETE /api/v1/orders/{order_id}

# Payment endpoints
POST   /api/v1/payments
GET    /api/v1/payments/{payment_id}
GET    /api/v1/payments
PUT    /api/v1/payments/{payment_id}
DELETE /api/v1/payments/{payment_id}
POST   /api/v1/payments/{payment_id}/process
POST   /api/v1/payments/{payment_id}/refund

# Transaction endpoints
POST   /api/v1/transactions
GET    /api/v1/transactions/{transaction_id}
GET    /api/v1/transactions
```

## 🗄️ Base de Datos RDS

### **Configuración Aurora PostgreSQL**
```bash
# Información de la instancia
DB Instance: gamarriando-product-service-dev
Engine: aurora-postgresql
Version: 13.7
Endpoint: gamarriando-product-service-dev.cgb6u24c81zq.us-east-1.rds.amazonaws.com
Port: 5432
Database: gamarriando
Username: gamarriando
```

### **Tablas Principales**
```sql
-- Product Service Tables
products
categories
vendors
product_images
product_tags
product_categories

-- User Service Tables
users
user_roles
user_sessions
password_reset_tokens
email_verification_tokens

-- Payment Service Tables
orders
order_items
payments
transactions
```

### **Conexión**
```bash
# Connection string
DATABASE_URL=postgresql://gamarriando:Gamarriando2024!@gamarriando-product-service-dev.cgb6u24c81zq.us-east-1.rds.amazonaws.com:5432/gamarriando
```

## 🔐 Seguridad

### **IAM Roles**
```bash
# Lambda Execution Role
Role: arn:aws:iam::331005567943:role/GamarriandoLambdaRole

# Permissions:
- VPC access
- RDS access
- S3 access
- CloudWatch logs
- Secrets Manager
```

### **VPC Configuration**
```bash
# Security Groups
Security Group: sg-0b7776e36a7150695

# Subnets
Subnet 1: subnet-0d8b3798c4f2897be (us-east-1a)
Subnet 2: subnet-0f56032e6c45bd02d (us-east-1b)
```

### **Secrets Management**
```bash
# Secrets en AWS Secrets Manager
gamarriando/database - Database credentials
gamarriando/jwt - JWT secret key
gamarriando/stripe - Stripe API keys
gamarriando/paypal - PayPal API keys
```

## 📊 Monitoreo

### **CloudWatch Logs**
```bash
# Log Groups
/aws/lambda/gamarriando-product-service-dev-*
/aws/lambda/gamarriando-user-service-dev-*
/aws/lambda/gamarriando-payment-service-dev-*
```

### **Métricas Clave**
- **Lambda Invocations**: Número de invocaciones por función
- **Lambda Duration**: Tiempo de ejecución
- **Lambda Errors**: Rate de errores
- **RDS Connections**: Conexiones activas
- **S3 Requests**: Requests al bucket

### **Alarmas Configuradas**
- **High Error Rate**: > 5% de errores
- **High Latency**: > 1 segundo de respuesta
- **Database Connections**: > 80% de conexiones
- **S3 4xx Errors**: > 10 errores por minuto

## 🚀 Deployment

### **Frontend Deployment**
```bash
# Build y deploy
cd frontend
npm run build
aws s3 sync out/ s3://gamarriando-web-dev --delete --profile personal
```

### **Services Deployment**
```bash
# Deploy individual
cd services/product-service
serverless deploy --stage dev --region us-east-1

cd services/user-service
serverless deploy --stage dev --region us-east-1

cd services/payment-service
serverless deploy --stage dev --region us-east-1
```

### **Deploy All**
```bash
# Deploy completo
make deploy:all
```

## 🔧 Comandos Útiles

### **Verificar Estado**
```bash
# Verificar bucket
aws s3 ls s3://gamarriando-web-dev --recursive --profile personal

# Verificar Lambda functions
aws lambda list-functions --profile personal

# Verificar RDS
aws rds describe-db-instances --profile personal

# Verificar logs
aws logs describe-log-groups --profile personal
```

### **Troubleshooting**
```bash
# Ver logs de Lambda
aws logs tail /aws/lambda/gamarriando-product-service-dev-products_list --follow --profile personal

# Verificar health check
curl https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/health

# Verificar frontend
curl -I http://gamarriando-web-dev.s3-website-us-east-1.amazonaws.com
```

## 📈 Costos

### **Estimación Mensual**
- **Lambda**: ~$10-20 (basado en uso)
- **RDS Aurora**: ~$50-100 (dependiendo del tamaño)
- **S3**: ~$5-10 (storage y requests)
- **API Gateway**: ~$5-15 (requests)
- **CloudWatch**: ~$5-10 (logs y métricas)

### **Optimización de Costos**
- **Lambda**: Provisioned concurrency solo cuando necesario
- **RDS**: Auto-scaling habilitado
- **S3**: Lifecycle policies para archivos antiguos
- **CloudWatch**: Retención de logs optimizada

## 🔄 Próximos Pasos

### **Mejoras Planificadas**
1. **CloudFront CDN**: Para mejor performance
2. **Route 53**: Para dominio personalizado
3. **Certificate Manager**: Para HTTPS
4. **WAF**: Para seguridad adicional
5. **Multi-region**: Para alta disponibilidad

### **Monitoreo Avanzado**
1. **X-Ray Tracing**: Para debugging distribuido
2. **Custom Dashboards**: Para métricas de negocio
3. **Automated Alerts**: Para notificaciones proactivas
4. **Cost Optimization**: Para optimización continua

---

**Infraestructura AWS Configurada** ✅  
*Sistema completo desplegado y funcionando*
