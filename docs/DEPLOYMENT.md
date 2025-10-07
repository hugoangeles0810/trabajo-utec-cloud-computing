# 🚀 Guía de Deployment - Gamarriando

Esta guía cubre el proceso completo de deployment del proyecto Gamarriando en AWS.

## 📋 Prerrequisitos

### Herramientas Requeridas
- **AWS CLI**: 2.0+ configurado
- **Serverless Framework**: 3.0+
- **Docker**: Para build de imágenes
- **Node.js**: 18+ para frontend
- **Python**: 3.11+ para servicios

### Configuración AWS
```bash
# Configurar AWS CLI
aws configure

# Verificar configuración
aws sts get-caller-identity

# Configurar perfil específico
aws configure --profile gamarriando
```

## 🏗️ Arquitectura de Deployment

### Componentes Desplegados
- **Frontend**: S3 + CloudFront
- **API Gateway**: AWS API Gateway
- **Microservicios**: AWS Lambda
- **Base de Datos**: RDS Aurora PostgreSQL
- **Storage**: S3 para archivos
- **Cache**: Redis (ElastiCache)

### Regiones y Ambientes
- **Desarrollo**: us-east-1
- **Producción**: us-east-1 (inicialmente)
- **Staging**: us-west-2 (futuro)

## 🚀 Deployment del Frontend

### 1. Build del Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Build de producción
npm run build

# Verificar build
ls -la out/
```

### 2. Configuración de S3
```bash
# Variables de entorno
export BUCKET_NAME="gamarriando-web-dev"
export AWS_REGION="us-east-1"
export AWS_PROFILE="personal"

# Crear bucket (si no existe)
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION --profile $AWS_PROFILE

# Configurar hosting web
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html \
  --profile $AWS_PROFILE
```

### 3. Configurar Acceso Público
```bash
# Desbloquear acceso público
aws s3api put-public-access-block --bucket $BUCKET_NAME \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --profile $AWS_PROFILE

# Política de bucket
aws s3api put-bucket-policy --bucket $BUCKET_NAME \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
      }
    ]
  }' \
  --profile $AWS_PROFILE
```

### 4. Deploy de Archivos
```bash
# Sincronizar archivos
aws s3 sync out/ s3://$BUCKET_NAME --delete --profile $AWS_PROFILE

# Verificar deployment
aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE
```

### 5. Configurar CloudFront (Opcional)
```bash
# Crear distribución CloudFront
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --profile $AWS_PROFILE
```

## 🔧 Deployment de Microservicios

### 1. Configurar Serverless Framework
```bash
# Instalar Serverless Framework
npm install -g serverless

# Instalar plugins
npm install -g serverless-python-requirements
npm install -g serverless-offline
```

### 2. Deploy Product Service
```bash
cd services/product-service

# Instalar dependencias
pip install -r requirements.txt

# Deploy a desarrollo
serverless deploy --stage dev --region us-east-1

# Deploy a producción
serverless deploy --stage prod --region us-east-1
```

### 3. Deploy User Service
```bash
cd services/user-service

# Deploy
serverless deploy --stage dev --region us-east-1
```

### 4. Deploy Otros Servicios
```bash
# Order Service
cd services/order-service
serverless deploy --stage dev --region us-east-1

# Payment Service
cd services/payment-service
serverless deploy --stage dev --region us-east-1

# Notification Service
cd services/notification-service
serverless deploy --stage dev --region us-east-1
```

## 🗄️ Configuración de Base de Datos

### 1. Crear RDS Aurora
```bash
# Crear cluster Aurora
aws rds create-db-cluster \
  --db-cluster-identifier gamarriando-aurora-dev \
  --engine aurora-postgresql \
  --engine-version 13.7 \
  --master-username gamarriando \
  --master-user-password 'YourSecurePassword123!' \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name gamarriando-subnet-group \
  --profile $AWS_PROFILE
```

### 2. Ejecutar Migraciones
```bash
# Configurar DATABASE_URL
export DATABASE_URL="postgresql://gamarriando:password@aurora-endpoint:5432/gamarriando"

# Ejecutar migraciones
cd services/product-service
alembic upgrade head

cd ../user-service
alembic upgrade head
```

## 🔐 Configuración de Seguridad

### 1. Secrets Manager
```bash
# Crear secretos
aws secretsmanager create-secret \
  --name "gamarriando/database" \
  --description "Database credentials" \
  --secret-string '{"username":"gamarriando","password":"YourSecurePassword123!"}' \
  --profile $AWS_PROFILE

aws secretsmanager create-secret \
  --name "gamarriando/jwt" \
  --description "JWT secret key" \
  --secret-string "your-jwt-secret-key" \
  --profile $AWS_PROFILE
```

### 2. IAM Roles
```bash
# Crear rol para Lambda
aws iam create-role \
  --role-name gamarriando-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json \
  --profile $AWS_PROFILE

# Adjuntar políticas
aws iam attach-role-policy \
  --role-name gamarriando-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole \
  --profile $AWS_PROFILE
```

## 📊 Monitoreo y Logging

### 1. CloudWatch Logs
```bash
# Crear log groups
aws logs create-log-group \
  --log-group-name "/aws/lambda/gamarriando-product-service-dev" \
  --profile $AWS_PROFILE

aws logs create-log-group \
  --log-group-name "/aws/lambda/gamarriando-user-service-dev" \
  --profile $AWS_PROFILE
```

### 2. CloudWatch Alarms
```bash
# Crear alarmas
aws cloudwatch put-metric-alarm \
  --alarm-name "gamarriando-high-error-rate" \
  --alarm-description "High error rate in Lambda functions" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --profile $AWS_PROFILE
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build frontend
        run: cd frontend && npm run build
      - name: Deploy to S3
        run: aws s3 sync frontend/out/ s3://$BUCKET_NAME --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 2. Deploy Automático
```bash
# Configurar secrets en GitHub
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_REGION
```

## 🧪 Testing de Deployment

### 1. Health Checks
```bash
# Verificar frontend
curl -I http://gamarriando-web-dev.s3-website-us-east-1.amazonaws.com

# Verificar APIs
curl https://api-dev.gamarriando.com/health
curl https://api-dev.gamarriando.com/api/v1/products
```

### 2. Smoke Tests
```bash
# Test de funcionalidad básica
npm run test:smoke

# Test de integración
npm run test:integration
```

## 📈 Optimización de Performance

### 1. CloudFront
```bash
# Configurar cache headers
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*" \
  --profile $AWS_PROFILE
```

### 2. Lambda Optimization
```bash
# Configurar provisioned concurrency
aws lambda put-provisioned-concurrency-config \
  --function-name gamarriando-product-service-dev \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig={ProvisionedConcurrencyCount=10} \
  --profile $AWS_PROFILE
```

## 🔧 Comandos de Deployment

### Scripts Disponibles
```bash
# Deploy completo
make deploy:all

# Deploy frontend
make deploy:frontend

# Deploy servicios
make deploy:services

# Deploy específico
make deploy:product
make deploy:user
```

### Rollback
```bash
# Rollback de frontend
aws s3 sync s3://$BUCKET_NAME-backup/ s3://$BUCKET_NAME --delete

# Rollback de Lambda
serverless rollback --stage dev --timestamp 1234567890
```

## 📊 Monitoreo Post-Deployment

### 1. Métricas Clave
- **Response Time**: < 200ms
- **Error Rate**: < 1%
- **Availability**: > 99.9%
- **Throughput**: Requests/min

### 2. Alertas
- Error rate > 5%
- Response time > 1s
- Lambda cold starts
- Database connections

## 🆘 Troubleshooting

### Problemas Comunes

#### Frontend no carga
```bash
# Verificar bucket policy
aws s3api get-bucket-policy --bucket $BUCKET_NAME

# Verificar archivos
aws s3 ls s3://$BUCKET_NAME --recursive
```

#### Lambda timeout
```bash
# Verificar logs
aws logs describe-log-streams --log-group-name /aws/lambda/function-name

# Aumentar timeout
serverless deploy --stage dev --timeout 30
```

#### Base de datos no conecta
```bash
# Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Verificar VPC
aws ec2 describe-vpcs --vpc-ids vpc-xxxxxxxxx
```

## 📚 Recursos Adicionales

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [RDS Aurora Documentation](https://docs.aws.amazon.com/rds/aurora/)

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0
