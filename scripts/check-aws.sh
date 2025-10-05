#!/bin/bash

# Script para verificar la configuración de AWS
# Autor: Gamarriando Team

set -e

echo "🔍 Verificando configuración de AWS para Gamarriando..."

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

print_success "AWS CLI está instalado"

# Verificar que Serverless esté instalado
if ! command -v serverless &> /dev/null; then
    print_error "Serverless Framework no está instalado. Instálalo con: npm install -g serverless"
    exit 1
fi

print_success "Serverless Framework está instalado"

# Verificar configuración de AWS CLI
print_status "Verificando configuración de AWS CLI..."

if ! aws sts get-caller-identity &> /dev/null; then
    print_warning "AWS CLI no está configurado. Ejecuta: aws configure"
    print_status "Necesitarás:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (recomendado: us-east-1)"
    echo "  - Default output format (recomendado: json)"
    echo ""
    print_status "Para obtener credenciales:"
    echo "  1. Ve a AWS Console → IAM → Users"
    echo "  2. Crea un usuario con permisos de administrador"
    echo "  3. Ve a Security credentials → Create access key"
    echo "  4. Descarga las credenciales"
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

# Verificar permisos necesarios
print_status "Verificando permisos necesarios..."

# Lista de servicios que necesitamos
SERVICES=("ec2" "rds" "s3" "lambda" "iam" "cloudformation")

for service in "${SERVICES[@]}"; do
    if aws $service describe-regions &> /dev/null; then
        print_success "Permisos para $service: OK"
    else
        print_warning "Permisos para $service: Verificar"
    fi
done

# Verificar que el Product Service esté listo
print_status "Verificando Product Service..."

if [ -f "services/product-service/serverless.yml" ]; then
    print_success "serverless.yml encontrado"
else
    print_error "serverless.yml no encontrado en services/product-service/"
    exit 1
fi

if [ -f "services/product-service/requirements.txt" ]; then
    print_success "requirements.txt encontrado"
else
    print_error "requirements.txt no encontrado en services/product-service/"
    exit 1
fi

if [ -f "services/product-service/lambda_handler.py" ]; then
    print_success "lambda_handler.py encontrado"
else
    print_error "lambda_handler.py no encontrado en services/product-service/"
    exit 1
fi

# Verificar dependencias de Node.js
print_status "Verificando dependencias de Node.js..."

if [ -f "services/product-service/package.json" ]; then
    print_success "package.json encontrado"
    
    # Verificar si node_modules existe
    if [ -d "services/product-service/node_modules" ]; then
        print_success "Dependencias de Node.js instaladas"
    else
        print_warning "Dependencias de Node.js no instaladas. Ejecuta: cd services/product-service && npm install"
    fi
else
    print_error "package.json no encontrado en services/product-service/"
    exit 1
fi

print_success "🎉 ¡Configuración de AWS verificada exitosamente!"
print_status "Estás listo para desplegar Gamarriando a AWS."
echo ""
print_status "Próximos pasos:"
echo "  1. Ejecutar: ./scripts/setup-aws.sh (para crear recursos AWS)"
echo "  2. O ejecutar: cd services/product-service && serverless deploy --stage dev"
echo ""
print_status "Para más información, consulta:"
echo "  - services/product-service/LAMBDA_DEPLOYMENT.md"
echo "  - services/product-service/README.md"

