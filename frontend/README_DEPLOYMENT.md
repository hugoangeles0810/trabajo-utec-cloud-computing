# 🚀 Guía de Despliegue Local - Frontend Gamarriando

## 📋 Resumen

Esta guía te ayudará a configurar y desplegar el frontend de Gamarriando desde tu máquina local hacia AWS S3 con CloudFront, sin necesidad de GitHub Actions.

## 🛠️ Prerrequisitos

### **Software Requerido**

- **Node.js** (versión 18 o superior)
- **npm** (versión 8 o superior)
- **AWS CLI** (versión 2)
- **Git**

### **Cuenta AWS**

- Acceso a AWS con permisos para:
  - S3 (crear buckets, subir archivos)
  - CloudFront (crear distribuciones, invalidar cache)
  - Route 53 (configurar DNS)
  - Certificate Manager (certificados SSL)

## 🔧 Configuración Inicial

### **1. Configurar AWS CLI**

```bash
# Instalar AWS CLI (macOS con Homebrew)
brew install awscli

# Instalar AWS CLI (Linux)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciales
aws configure
```

### **2. Ejecutar Script de Configuración**

```bash
# Desde el directorio frontend
cd frontend
chmod +x scripts/setup/setup-aws.sh
./scripts/setup/setup-aws.sh
```

Este script te ayudará a:
- Verificar la instalación de AWS CLI
- Configurar credenciales AWS
- Crear archivos de configuración
- Verificar recursos AWS existentes

### **3. Configurar Variables de Entorno**

Edita el archivo `.env.local` creado:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Payment (opcional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Monitoring (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### **4. Configurar Deployment**

Edita el archivo `deployment-config.sh`:

```bash
# S3 Bucket Configuration
export BUCKET_NAME="gamarriando-web"
export STAGING_BUCKET_NAME="gamarriando-web-staging"
export BACKUP_BUCKET_NAME="gamarriando-web-backup"

# AWS Region
export AWS_REGION="us-east-1"

# CloudFront Distribution IDs (actualiza con tus IDs reales)
export CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
export STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"
```

## 🏗️ Configuración de Infraestructura

### **1. Crear Infraestructura con Terraform**

```bash
# Desde el directorio infrastructure/terraform
cd infrastructure/terraform

# Copiar archivo de variables
cp terraform.tfvars.example terraform.tfvars

# Editar variables según tu configuración
nano terraform.tfvars

# Inicializar Terraform
terraform init

# Planificar cambios
terraform plan

# Aplicar cambios
terraform apply
```

### **2. Crear Buckets S3 Manualmente (Alternativa)**

```bash
# Crear buckets S3
aws s3 mb s3://gamarriando-web --region us-east-1
aws s3 mb s3://gamarriando-web-staging --region us-east-1
aws s3 mb s3://gamarriando-web-backup --region us-east-1

# Configurar buckets para hosting web
aws s3 website s3://gamarriando-web --index-document index.html --error-document 404.html
aws s3 website s3://gamarriando-web-staging --index-document index.html --error-document 404.html
```

## 🚀 Proceso de Despliegue

### **1. Despliegue Completo (Recomendado)**

```bash
# Despliegue a staging
./scripts/deploy/deploy-local.sh staging

# Despliegue a producción
./scripts/deploy/deploy-local.sh production
```

### **2. Despliegue Rápido**

```bash
# Despliegue rápido a staging
./scripts/deploy/quick-deploy.sh staging

# Despliegue rápido a producción
./scripts/deploy/quick-deploy.sh prod
```

### **3. Build Optimizado**

```bash
# Build para producción con análisis
./scripts/build/build-optimized.sh --production --analyze

# Build para staging sin tests
./scripts/build/build-optimized.sh --staging --skip-tests
```

## 📝 Comandos Útiles

### **Verificar Estado**

```bash
# Verificar configuración AWS
aws sts get-caller-identity

# Listar buckets S3
aws s3 ls

# Verificar distribución CloudFront
aws cloudfront list-distributions

# Verificar contenido del bucket
aws s3 ls s3://gamarriando-web --recursive
```

### **Gestión de Cache**

```bash
# Invalidar cache CloudFront manualmente
aws cloudfront create-invalidation --distribution-id E1EXAMPLE --paths "/*"

# Ver estado de invalidación
aws cloudfront get-invalidation --distribution-id E1EXAMPLE --id INVALIDATION_ID
```

### **Backup y Rollback**

```bash
# Crear backup manual
./scripts/deploy/backup.sh

# Rollback a versión anterior
./scripts/deploy/rollback.sh
```

## 🔍 Troubleshooting

### **Problemas Comunes**

#### **1. Error de Permisos AWS**

```bash
# Verificar credenciales
aws sts get-caller-identity

# Verificar políticas IAM
aws iam list-attached-user-policies --user-name tu-usuario
```

#### **2. Build Fallido**

```bash
# Limpiar cache
rm -rf .next out node_modules
npm ci

# Verificar variables de entorno
cat .env.local

# Build con verbose
npm run build -- --debug
```

#### **3. CloudFront No Actualiza**

```bash
# Verificar TTL de cache
aws cloudfront get-distribution --id E1EXAMPLE

# Invalidar cache completo
aws cloudfront create-invalidation --distribution-id E1EXAMPLE --paths "/*"

# Esperar propagación (puede tomar 15-20 minutos)
```

#### **4. S3 Bucket No Accesible**

```bash
# Verificar política del bucket
aws s3api get-bucket-policy --bucket gamarriando-web

# Verificar configuración CORS
aws s3api get-bucket-cors --bucket gamarriando-web

# Verificar configuración de website
aws s3api get-bucket-website --bucket gamarriando-web
```

## 📊 Monitoreo

### **Verificar Deployment**

```bash
# Test de conectividad
curl -I https://gamarriando.com
curl -I https://www.gamarriando.com

# Verificar headers de cache
curl -I https://gamarriando.com/_next/static/chunks/main.js

# Verificar SSL
openssl s_client -connect gamarriando.com:443 -servername gamarriando.com
```

### **Métricas de Performance**

```bash
# Tamaño del build
du -sh out/

# Análisis de bundle
npm run build:analyze

# Lighthouse CI (si está configurado)
npx lighthouse https://gamarriando.com --output=json
```

## 🔄 Flujo de Trabajo Recomendado

### **1. Desarrollo Local**

```bash
# Desarrollo
npm run dev

# Tests
npm run test

# Linting
npm run lint

# Type checking
npm run type-check
```

### **2. Despliegue a Staging**

```bash
# Build y deploy a staging
./scripts/deploy/deploy-local.sh staging

# Verificar en staging
open https://staging.gamarriando.com
```

### **3. Despliegue a Producción**

```bash
# Crear backup
./scripts/deploy/backup.sh

# Deploy a producción
./scripts/deploy/deploy-local.sh production

# Verificar en producción
open https://gamarriando.com
```

## 📚 Recursos Adicionales

### **Documentación AWS**

- [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/)
- [S3 Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/latest/DeveloperGuide/)

### **Next.js Static Export**

- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### **Scripts Disponibles**

- `deploy-local.sh` - Despliegue completo con verificaciones
- `quick-deploy.sh` - Despliegue rápido para updates menores
- `build-optimized.sh` - Build optimizado con análisis
- `backup.sh` - Crear backup del deployment actual
- `rollback.sh` - Rollback a versión anterior
- `setup-aws.sh` - Configuración inicial de AWS

---

**Guía de Despliegue Local - Frontend Gamarriando** 🚀

*Esta guía te permitirá desplegar el frontend de Gamarriando de manera eficiente desde tu máquina local hacia AWS S3 con CloudFront.*
