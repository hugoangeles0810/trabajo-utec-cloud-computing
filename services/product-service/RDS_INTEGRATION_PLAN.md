# 🗄️ Plan de Integración RDS Aurora PostgreSQL

## 📋 Resumen Ejecutivo

Plan completo para integrar **Amazon RDS Aurora PostgreSQL** con las **15 funciones Lambda individuales** del Product Service, reemplazando los datos hardcodeados con persistencia real.

## 🎯 Objetivos

1. **Reemplazar datos hardcodeados** con persistencia real en RDS Aurora
2. **Mantener arquitectura de microservicios** individuales
3. **Optimizar conexiones de base de datos** para Lambda
4. **Implementar migraciones** y esquemas de base de datos
5. **Configurar VPC y seguridad** para acceso a RDS

## 🏗️ Arquitectura Propuesta

### **Arquitectura Actual vs Propuesta**

```
ACTUAL (Datos Hardcodeados):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lambda Func   │    │   Lambda Func   │    │   Lambda Func   │
│  (Hardcoded)    │    │  (Hardcoded)    │    │  (Hardcoded)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PROPUESTA (RDS Aurora):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lambda Func   │    │   Lambda Func   │    │   Lambda Func   │
│   (RDS Client)  │    │   (RDS Client)  │    │   (RDS Client)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    RDS Aurora PostgreSQL  │
                    │    (Connection Pooling)   │
                    └───────────────────────────┘
```

## 📊 Análisis del Estado Actual

### **Problemas Identificados**

1. **Datos Hardcodeados**: Todas las funciones devuelven datos simulados
2. **Sin Persistencia**: Los datos no se guardan entre invocaciones
3. **Sin Validación Real**: No hay validación contra esquema de base de datos
4. **Sin Relaciones**: No hay relaciones reales entre entidades

### **Funciones Afectadas (15 total)**

#### **🛍️ Products Functions (5)**
- `products_list` - Lista hardcodeada de productos
- `products_create` - Simula creación (línea 59: "Simulate product creation")
- `products_get` - Devuelve producto hardcodeado
- `products_update` - Simula actualización
- `products_delete` - Simula eliminación

#### **📂 Categories Functions (5)**
- `categories_list` - Lista hardcodeada de categorías
- `categories_create` - Simula creación
- `categories_get` - Devuelve categoría hardcodeada
- `categories_update` - Simula actualización
- `categories_delete` - Simula eliminación

#### **🏪 Vendors Functions (5)**
- `vendors_list` - Lista hardcodeada de vendedores
- `vendors_create` - Simula creación
- `vendors_get` - Devuelve vendedor hardcodeado
- `vendors_update` - Simula actualización
- `vendors_delete` - Simula eliminación

## 🗄️ Diseño de Base de Datos

### **Esquema de Tablas**

```sql
-- Tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vendedores
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_products INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    category_id INTEGER REFERENCES categories(id),
    vendor_id INTEGER REFERENCES vendors(id),
    images JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_vendors_email ON vendors(email);
```

### **Datos de Prueba**

```sql
-- Insertar categorías de prueba
INSERT INTO categories (name, slug, description, order) VALUES
('Electrónicos', 'electronicos', 'Productos electrónicos y tecnología', 1),
('Ropa', 'ropa', 'Ropa y accesorios', 2),
('Hogar y Jardín', 'hogar-jardin', 'Productos para el hogar y jardín', 3),
('Smartphones', 'smartphones', 'Teléfonos inteligentes y accesorios', 1);

-- Insertar vendedores de prueba
INSERT INTO vendors (name, email, phone, address, description, is_verified, rating, total_products) VALUES
('Vendor Demo', 'vendor@demo.com', '+1234567890', 
 '{"street": "123 Demo Street", "city": "Demo City", "state": "Demo State", "zip_code": "12345", "country": "Demo Country"}',
 'Vendedor de demostración para el marketplace', true, 4.5, 25),
('Tech Store Pro', 'info@techstorepro.com', '+1987654321',
 '{"street": "456 Tech Avenue", "city": "Tech City", "state": "Tech State", "zip_code": "54321", "country": "Tech Country"}',
 'Especialistas en productos tecnológicos', true, 4.8, 150);

-- Insertar productos de prueba
INSERT INTO products (name, slug, description, price, stock, status, category_id, vendor_id, images) VALUES
('Producto de Ejemplo', 'producto-ejemplo', 'Un producto de ejemplo para demostración', 29.99, 10, 'active', 1, 1, '["https://example.com/image1.jpg"]'),
('Otro Producto', 'otro-producto', 'Otro producto de ejemplo', 49.99, 5, 'active', 2, 1, '["https://example.com/image2.jpg"]');
```

## 🔧 Implementación Técnica

### **1. Configuración de RDS Aurora**

#### **Parámetros de Instancia**
- **Engine**: Aurora PostgreSQL 15.4
- **Instance Class**: db.t3.medium (para desarrollo)
- **Storage**: 20 GB inicial
- **Multi-AZ**: Habilitado para alta disponibilidad
- **Backup**: 7 días de retención
- **Encryption**: Habilitado

#### **Configuración de Red**
- **VPC**: VPC personalizada para Lambda y RDS
- **Subnets**: Subnets privadas para RDS
- **Security Groups**: Reglas específicas para Lambda → RDS
- **Parameter Group**: Optimizado para Lambda

### **2. Configuración de Lambda**

#### **VPC Configuration**
```yaml
# serverless.yml
functions:
  products_list:
    handler: handlers/products_list.lambda_handler
    vpc:
      securityGroupIds:
        - sg-xxxxxxxxx  # Security Group para Lambda
      subnetIds:
        - subnet-xxxxxxxxx  # Subnet privada 1
        - subnet-yyyyyyyyy  # Subnet privada 2
```

#### **Environment Variables**
```yaml
environment:
  DATABASE_URL: postgresql://username:password@aurora-cluster-endpoint:5432/gamarriando
  DB_HOST: aurora-cluster-endpoint.cluster-xxxxx.us-east-1.rds.amazonaws.com
  DB_PORT: 5432
  DB_NAME: gamarriando
  DB_USER: gamarriando_user
  DB_PASSWORD: ${env:DB_PASSWORD}
  DB_POOL_SIZE: 5
  DB_MAX_OVERFLOW: 10
```

### **3. Connection Pooling para Lambda**

#### **Estrategia de Pooling**
- **Pool Size**: 5 conexiones por función
- **Max Overflow**: 10 conexiones adicionales
- **Pool Recycle**: 3600 segundos (1 hora)
- **Pool Pre-ping**: Habilitado para validar conexiones

#### **Implementación**
```python
# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL')

# Configuración optimizada para Lambda
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args={
        "connect_timeout": 10,
        "application_name": "gamarriando-product-service"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### **4. Refactorización de Handlers**

#### **Patrón de Refactorización**
```python
# Antes (Hardcoded)
def lambda_handler(event, context):
    # Simulate product creation
    new_product_id = f"product-{len(body) + 1}"
    return {"product_id": new_product_id}

# Después (RDS)
def lambda_handler(event, context):
    db = get_db()
    try:
        product = create_product(db, product_data)
        return {"product_id": product.id}
    finally:
        db.close()
```

#### **Funciones por Refactorizar (15 total)**

1. **Products Functions**:
   - `products_list` → Query con paginación
   - `products_create` → INSERT con validación
   - `products_get` → SELECT por ID
   - `products_update` → UPDATE con validación
   - `products_delete` → DELETE con validación

2. **Categories Functions**:
   - `categories_list` → Query con filtros
   - `categories_create` → INSERT con validación
   - `categories_get` → SELECT por ID
   - `categories_update` → UPDATE con validación
   - `categories_delete` → DELETE con validación

3. **Vendors Functions**:
   - `vendors_list` → Query con filtros
   - `vendors_create` → INSERT con validación
   - `vendors_get` → SELECT por ID
   - `vendors_update` → UPDATE con validación
   - `vendors_delete` → DELETE con validación

## 📋 Plan de Implementación

### **Fase 1: Infraestructura (Semana 1)**
- [ ] Crear RDS Aurora PostgreSQL cluster
- [ ] Configurar VPC y Security Groups
- [ ] Configurar parámetros de base de datos
- [ ] Crear usuario y permisos de base de datos

### **Fase 2: Configuración Lambda (Semana 1)**
- [ ] Actualizar serverless.yml con VPC
- [ ] Configurar environment variables
- [ ] Implementar connection pooling
- [ ] Crear database utilities

### **Fase 3: Migraciones (Semana 2)**
- [ ] Crear esquema de base de datos
- [ ] Implementar migraciones con Alembic
- [ ] Insertar datos de prueba
- [ ] Validar esquema

### **Fase 4: Refactorización Handlers (Semana 2-3)**
- [ ] Refactorizar Products functions (5)
- [ ] Refactorizar Categories functions (5)
- [ ] Refactorizar Vendors functions (5)
- [ ] Implementar validaciones

### **Fase 5: Testing y Optimización (Semana 3)**
- [ ] Tests de integración
- [ ] Optimización de queries
- [ ] Monitoreo de performance
- [ ] Ajuste de connection pooling

## 🔐 Consideraciones de Seguridad

### **VPC y Network Security**
- **Lambda en subnets privadas** con NAT Gateway
- **RDS en subnets privadas** sin acceso público
- **Security Groups** restrictivos entre Lambda y RDS
- **Encryption in transit** entre Lambda y RDS

### **Database Security**
- **Encryption at rest** habilitado
- **IAM Database Authentication** (opcional)
- **Parameter Groups** con configuración segura
- **Backup encryption** habilitado

### **Application Security**
- **Connection pooling** para prevenir connection exhaustion
- **SQL injection prevention** con SQLAlchemy ORM
- **Input validation** en todos los endpoints
- **Error handling** sin exposición de información sensible

## 📊 Métricas y Monitoreo

### **Database Metrics**
- **Connection count** por Lambda function
- **Query performance** y slow queries
- **Connection pool utilization**
- **Database CPU y Memory usage**

### **Lambda Metrics**
- **Cold start impact** con RDS connections
- **Function duration** con database operations
- **Error rates** por database operations
- **Memory usage** con connection pooling

## 💰 Estimación de Costos

### **RDS Aurora PostgreSQL**
- **db.t3.medium**: ~$50/mes
- **Storage (20GB)**: ~$5/mes
- **Backup storage**: ~$2/mes
- **Total RDS**: ~$57/mes

### **Lambda (15 funciones)**
- **Invocaciones**: Sin costo adicional
- **Duration**: +100ms promedio por database operation
- **Memory**: Sin cambio significativo
- **Total Lambda**: Impacto mínimo

### **VPC y Networking**
- **NAT Gateway**: ~$45/mes
- **Data transfer**: ~$5/mes
- **Total Networking**: ~$50/mes

### **Total Estimado**: ~$107/mes

## 🚀 Beneficios Esperados

### **Funcionalidad**
- **Persistencia real** de datos
- **Relaciones entre entidades** funcionales
- **Validación de datos** contra esquema
- **Consistencia de datos** garantizada

### **Performance**
- **Connection pooling** optimizado
- **Queries optimizadas** con índices
- **Caching** a nivel de aplicación
- **Escalado horizontal** de base de datos

### **Mantenibilidad**
- **Migraciones automatizadas** con Alembic
- **Backup y recovery** automatizados
- **Monitoreo detallado** de performance
- **Debugging simplificado** con logs estructurados

## 🎯 Próximos Pasos Inmediatos

1. **🔧 Crear RDS Aurora cluster** con configuración básica
2. **🌐 Configurar VPC** y Security Groups
3. **📝 Implementar database utilities** y connection pooling
4. **🗄️ Crear esquema** y migraciones iniciales
5. **🔄 Refactorizar primera función** como prueba de concepto

---

**Gamarriando Product Service** - Plan de Integración RDS Aurora PostgreSQL 🗄️
