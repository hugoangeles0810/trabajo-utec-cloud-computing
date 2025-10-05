#!/bin/bash

# Script para configurar AWS y desplegar Gamarriando
# Autor: Gamarriando Team
# Fecha: $(date)

set -e

echo "🚀 Configurando AWS para Gamarriando..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que AWS CLI esté instalado
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI no está instalado. Instálalo con: brew install awscli"
    exit 1
fi

# Verificar que Serverless esté instalado
if ! command -v serverless &> /dev/null; then
    print_error "Serverless Framework no está instalado. Instálalo con: npm install -g serverless"
    exit 1
fi

print_status "Verificando configuración de AWS CLI..."

# Verificar si AWS CLI está configurado
if ! aws sts get-caller-identity &> /dev/null; then
    print_warning "AWS CLI no está configurado. Ejecuta: aws configure"
    print_status "Necesitarás:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (recomendado: us-east-1)"
    echo "  - Default output format (recomendado: json)"
    exit 1
fi

print_success "AWS CLI configurado correctamente"

# Obtener información del usuario AWS
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text)

print_status "Cuenta AWS: $AWS_ACCOUNT_ID"
print_status "Región: $AWS_REGION"
print_status "Usuario: $AWS_USER"

# Crear VPC
print_status "Creando VPC para Gamarriando..."
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=gamarriando-vpc
print_success "VPC creada: $VPC_ID"

# Crear Internet Gateway
print_status "Creando Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=gamarriando-igw
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
print_success "Internet Gateway creado: $IGW_ID"

# Crear subnets
print_status "Creando subnets..."
SUBNET_1_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ${AWS_REGION}a --query 'Subnet.SubnetId' --output text)
SUBNET_2_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ${AWS_REGION}b --query 'Subnet.SubnetId' --output text)

aws ec2 create-tags --resources $SUBNET_1_ID --tags Key=Name,Value=gamarriando-subnet-1
aws ec2 create-tags --resources $SUBNET_2_ID --tags Key=Name,Value=gamarriando-subnet-2

# Habilitar auto-assign public IP
aws ec2 modify-subnet-attribute --subnet-id $SUBNET_1_ID --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $SUBNET_2_ID --map-public-ip-on-launch

print_success "Subnets creadas: $SUBNET_1_ID, $SUBNET_2_ID"

# Crear Route Table
print_status "Creando Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-tags --resources $ROUTE_TABLE_ID --tags Key=Name,Value=gamarriando-route-table
aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $SUBNET_1_ID --route-table-id $ROUTE_TABLE_ID
aws ec2 associate-route-table --subnet-id $SUBNET_2_ID --route-table-id $ROUTE_TABLE_ID
print_success "Route Table creada: $ROUTE_TABLE_ID"

# Crear Security Groups
print_status "Creando Security Groups..."

# Security Group para Lambda
LAMBDA_SG_ID=$(aws ec2 create-security-group --group-name gamarriando-lambda-sg --description "Security group for Lambda functions" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 create-tags --resources $LAMBDA_SG_ID --tags Key=Name,Value=gamarriando-lambda-sg
print_success "Security Group para Lambda creada: $LAMBDA_SG_ID"

# Security Group para RDS
RDS_SG_ID=$(aws ec2 create-security-group --group-name gamarriando-rds-sg --description "Security group for RDS database" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 create-tags --resources $RDS_SG_ID --tags Key=Name,Value=gamarriando-rds-sg

# Permitir acceso desde Lambda a RDS
aws ec2 authorize-security-group-ingress --group-id $RDS_SG_ID --protocol tcp --port 5432 --source-group $LAMBDA_SG_ID
print_success "Security Group para RDS creada: $RDS_SG_ID"

# Crear DB Subnet Group
print_status "Creando DB Subnet Group..."
aws rds create-db-subnet-group \
  --db-subnet-group-name gamarriando-subnet-group \
  --db-subnet-group-description "Subnet group for Gamarriando RDS" \
  --subnet-ids $SUBNET_1_ID $SUBNET_2_ID
print_success "DB Subnet Group creado"

# Crear RDS Aurora PostgreSQL
print_status "Creando RDS Aurora PostgreSQL cluster..."
aws rds create-db-cluster \
  --db-cluster-identifier gamarriando-db-cluster \
  --engine aurora-postgresql \
  --engine-version 15.4 \
  --master-username gamarriando \
  --master-user-password gamarriando123 \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name gamarriando-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --storage-encrypted \
  --deletion-protection

print_success "RDS Aurora PostgreSQL cluster creado"

# Crear instancia de base de datos
print_status "Creando instancia de base de datos..."
aws rds create-db-instance \
  --db-instance-identifier gamarriando-db-instance \
  --db-cluster-identifier gamarriando-db-cluster \
  --db-instance-class db.t3.medium \
  --engine aurora-postgresql \
  --publicly-accessible \
  --tags Key=Name,Value=gamarriando-db-instance

print_success "Instancia de base de datos creada"

# Crear bucket S3 para imágenes
print_status "Creando bucket S3 para imágenes de productos..."
S3_BUCKET_NAME="gamarriando-product-images-$(date +%s)"
aws s3 mb s3://$S3_BUCKET_NAME --region $AWS_REGION
aws s3api put-bucket-cors --bucket $S3_BUCKET_NAME --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'
print_success "Bucket S3 creado: $S3_BUCKET_NAME"

# Esperar a que RDS esté disponible
print_status "Esperando a que RDS esté disponible (esto puede tomar varios minutos)..."
aws rds wait db-instance-available --db-instance-identifier gamarriando-db-instance
print_success "RDS está disponible"

# Obtener endpoint de RDS
RDS_ENDPOINT=$(aws rds describe-db-clusters --db-cluster-identifier gamarriando-db-cluster --query 'DBClusters[0].Endpoint' --output text)
print_success "RDS Endpoint: $RDS_ENDPOINT"

# Crear archivo de configuración
print_status "Creando archivo de configuración..."
cat > services/product-service/.env << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
STAGE=dev

# Database Configuration (RDS Aurora PostgreSQL)
DATABASE_URL=postgresql://gamarriando:gamarriando123@$RDS_ENDPOINT:5432/gamarriando
DB_HOST=$RDS_ENDPOINT
DB_PORT=5432
DB_NAME=gamarriando
DB_USER=gamarriando
DB_PASSWORD=gamarriando123

# JWT Configuration
JWT_SECRET_KEY=gamarriando-super-secret-jwt-key-$(date +%s)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# S3 Configuration (for product images)
S3_BUCKET_NAME=$S3_BUCKET_NAME
S3_REGION=$AWS_REGION

# Application Settings
DEBUG=false
LOG_LEVEL=INFO

# VPC Configuration
VPC_ID=$VPC_ID
SUBNET_ID_1=$SUBNET_1_ID
SUBNET_ID_2=$SUBNET_2_ID
SECURITY_GROUP_ID=$LAMBDA_SG_ID
EOF

print_success "Archivo de configuración creado: services/product-service/.env"

# Instalar dependencias del Product Service
print_status "Instalando dependencias del Product Service..."
cd services/product-service
npm install
cd ../..

print_success "Dependencias instaladas"

# Deploy del Product Service
print_status "Desplegando Product Service a AWS Lambda..."
cd services/product-service
serverless deploy --stage dev
cd ../..

print_success "Product Service desplegado exitosamente"

# Mostrar información del deployment
print_status "Obteniendo información del deployment..."
cd services/product-service
serverless info --stage dev
cd ../..

print_success "🎉 ¡Gamarriando Product Service desplegado exitosamente en AWS!"
print_status "Recursos creados:"
echo "  - VPC: $VPC_ID"
echo "  - Subnets: $SUBNET_1_ID, $SUBNET_2_ID"
echo "  - Security Groups: $LAMBDA_SG_ID, $RDS_SG_ID"
echo "  - RDS Endpoint: $RDS_ENDPOINT"
echo "  - S3 Bucket: $S3_BUCKET_NAME"
echo ""
print_status "Próximos pasos:"
echo "  1. Ejecutar migraciones de base de datos"
echo "  2. Probar los endpoints de la API"
echo "  3. Configurar el frontend para usar la nueva API"

