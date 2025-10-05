# 🚀 Deployment Guide - Product Service

## 📋 Resumen

Guía completa para el deployment del **Gamarriando Product Service** con arquitectura de microservicios individuales (15 funciones Lambda).

## 🏗️ Arquitectura de Deployment

### **15 Lambda Functions Individuales**

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway                                  │
│              (Single Entry Point)                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │Products │   │Categories│   │ Vendors │
   │(5 funcs)│   │(5 funcs)│   │(5 funcs)│
   └─────────┘   └─────────┘   └─────────┘
```

## 🔧 Prerrequisitos

### **Software Requerido**
- **Node.js**: 18+ y npm
- **Python**: 3.9+
- **AWS CLI**: Configurado con credenciales
- **Serverless Framework**: 3.x

### **AWS Requirements**
- **IAM Role**: `arn:aws:iam::238034776414:role/LabRole`
- **Region**: `us-east-1`
- **Account**: AWS Educate account

### **Instalación de Dependencias**

```bash
# Instalar Serverless Framework globalmente
npm install -g serverless

# Instalar dependencias del proyecto
cd services/product-service
npm install

# Verificar instalación
serverless --version
```

## ⚙️ Configuración

### **1. Variables de Entorno**

Crear archivo `.env` basado en `env.example`:

```bash
# Database Configuration
DATABASE_URL=sqlite:///./gamarriando.db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamarriando
DB_USER=gamarriando
DB_PASSWORD=gamarriando123

# JWT Configuration
JWT_SECRET_KEY=gamarriando-super-secret-jwt-key-dev
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# S3 Configuration
S3_BUCKET_NAME=gamarriando-product-images-dev
S3_REGION=us-east-1

# Application Settings
DEBUG=false
LOG_LEVEL=INFO
```

### **2. Configuración AWS CLI**

```bash
# Configurar AWS CLI
aws configure

# Verificar configuración
aws sts get-caller-identity
```

### **3. Configuración Serverless**

El archivo `serverless.yml` está configurado para:
- **Runtime**: Python 3.9
- **Region**: us-east-1
- **IAM Role**: LabRole (AWS Educate)
- **Memory**: 256-512 MB por función
- **Timeout**: 20-30 segundos por función

## 🚀 Deployment

### **Deployment Completo**

```bash
# Deploy a desarrollo
serverless deploy --stage dev

# Deploy a producción
serverless deploy --stage prod

# Deploy con configuración específica
serverless deploy --stage dev --region us-east-1
```

### **Deployment Selectivo por Función**

```bash
# Deploy solo una función específica
serverless deploy function --function products_list --stage dev

# Deploy múltiples funciones
serverless deploy function --function products_list --function products_create --stage dev
```

### **Deployment por Dominio**

```bash
# Deploy solo funciones de productos
serverless deploy function --function products_list --function products_create --function products_get --function products_update --function products_delete --stage dev

# Deploy solo funciones de categorías
serverless deploy function --function categories_list --function categories_create --function categories_get --function categories_update --function categories_delete --stage dev

# Deploy solo funciones de vendedores
serverless deploy function --function vendors_list --function vendors_create --function vendors_get --function vendors_update --function vendors_delete --stage dev
```

## 📊 Monitoreo del Deployment

### **Verificar Deployment**

```bash
# Verificar estado del deployment
serverless info --stage dev

# Ver logs del deployment
serverless logs --stage dev --tail

# Ver logs de función específica
serverless logs --function products_list --stage dev --tail
```

### **Testing Post-Deployment**

```bash
# Test de health check (si estuviera disponible)
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/health"

# Test de endpoints principales
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories"
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors"
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products/1"
```

## 🔄 Rollback y Recovery

### **Rollback Completo**

```bash
# Rollback a versión anterior
serverless rollback --stage dev

# Rollback a timestamp específico
serverless rollback --stage dev --timestamp 1234567890
```

### **Rollback Selectivo**

```bash
# Rollback solo una función
serverless rollback function --function products_list --stage dev

# Rollback múltiples funciones
serverless rollback function --function products_list --function products_create --stage dev
```

### **Recovery de Errores**

```bash
# Remover deployment fallido
serverless remove --stage dev

# Re-deploy después de limpiar
serverless deploy --stage dev
```

## 📈 Configuración por Ambiente

### **Desarrollo (dev)**

```yaml
# serverless.yml
provider:
  stage: dev
  region: us-east-1
  environment:
    DEBUG: true
    LOG_LEVEL: DEBUG
    DATABASE_URL: sqlite:///./gamarriando.db
```

### **Producción (prod)**

```yaml
# serverless.yml
provider:
  stage: prod
  region: us-east-1
  environment:
    DEBUG: false
    LOG_LEVEL: INFO
    DATABASE_URL: postgresql://user:pass@rds-endpoint:5432/gamarriando
```

## 🔧 Configuración Avanzada

### **Memoria y Timeout por Función**

```yaml
functions:
  # Operaciones simples
  products_list:
    memorySize: 256
    timeout: 20
  
  # Operaciones complejas
  products_create:
    memorySize: 512
    timeout: 30
```

### **Variables de Entorno por Función**

```yaml
functions:
  products_create:
    environment:
      MAX_PRODUCTS_PER_VENDOR: 1000
      REQUIRED_FIELDS: name,price,category_id,vendor_id
```

### **Configuración de CORS**

```yaml
functions:
  products_list:
    events:
      - http:
          path: /api/v1/products
          method: GET
          cors: true
```

## 📊 Métricas de Deployment

### **Tiempos de Deployment**

| Tipo de Deployment | Tiempo Estimado | Funciones |
|-------------------|-----------------|-----------|
| **Completo** | 90-120 segundos | 15 funciones |
| **Por Dominio** | 30-45 segundos | 5 funciones |
| **Por Función** | 10-15 segundos | 1 función |

### **Tamaño de Deployment**

| Componente | Tamaño |
|------------|--------|
| **Por Función** | 13 MB |
| **Total Deployment** | ~195 MB |
| **Dependencies** | ~2 MB |

## 🚨 Troubleshooting

### **Errores Comunes**

#### **1. IAM Permissions Error**
```bash
Error: User is not authorized to perform: iam:CreateRole
```
**Solución**: Usar el LabRole existente en `serverless.yml`

#### **2. Runtime Not Found**
```bash
Error: python3.11 not found
```
**Solución**: Cambiar runtime a `python3.9` en `serverless.yml`

#### **3. Function Timeout**
```bash
Error: Task timed out after 30.00 seconds
```
**Solución**: Aumentar timeout en configuración de función

#### **4. Memory Limit Exceeded**
```bash
Error: Runtime exited with error: signal: killed
```
**Solución**: Aumentar memoria en configuración de función

### **Debugging Commands**

```bash
# Ver logs detallados
serverless logs --function products_list --stage dev --tail

# Invocar función localmente
serverless invoke local --function products_list

# Ver información de función
serverless info --function products_list --stage dev

# Ver métricas de CloudWatch
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=gamarriando-product-service-dev-products_list --start-time 2024-10-04T00:00:00Z --end-time 2024-10-04T23:59:59Z --period 3600 --statistics Average
```

## 🔐 Seguridad

### **IAM Permissions**

El deployment usa el LabRole con permisos mínimos:
- **Lambda**: Crear, actualizar, invocar funciones
- **API Gateway**: Crear, actualizar endpoints
- **CloudWatch**: Escribir logs y métricas
- **S3**: Acceso al bucket de imágenes

### **Variables de Entorno**

- **Sensibles**: JWT_SECRET_KEY, DB_PASSWORD
- **Públicas**: DEBUG, LOG_LEVEL, S3_BUCKET_NAME
- **Configurables**: Por ambiente (dev/prod)

## 📋 Checklist de Deployment

### **Pre-Deployment**
- [ ] AWS CLI configurado
- [ ] Serverless Framework instalado
- [ ] Variables de entorno configuradas
- [ ] Código probado localmente
- [ ] Tests unitarios pasando

### **Deployment**
- [ ] Deploy ejecutado exitosamente
- [ ] Todas las funciones creadas
- [ ] API Gateway configurado
- [ ] CORS habilitado
- [ ] Variables de entorno aplicadas

### **Post-Deployment**
- [ ] Endpoints respondiendo
- [ ] Logs generándose
- [ ] Métricas disponibles
- [ ] Tests de integración pasando
- [ ] Monitoreo configurado

## 🎯 Próximos Pasos

### **Corto Plazo**
1. **🔧 Resolver products_list**: Corregir error 500
2. **📊 Monitoreo**: Configurar CloudWatch dashboards
3. **🧪 Testing**: Tests automatizados por función

### **Mediano Plazo**
1. **💾 RDS Integration**: Conectar con Aurora PostgreSQL
2. **🔐 Authentication**: Implementar JWT middleware
3. **🔄 CI/CD**: Pipeline automatizado

### **Largo Plazo**
1. **🌐 Multi-region**: Deployment en múltiples regiones
2. **📈 Auto-scaling**: Configuración avanzada
3. **🔒 Security**: WAF y rate limiting

---

**Gamarriando Product Service** - Guía de Deployment para Microservicios Individuales 🚀
