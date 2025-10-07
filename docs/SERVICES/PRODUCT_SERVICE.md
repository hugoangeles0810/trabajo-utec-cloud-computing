# 🛍️ Product Service - Gamarriando

Microservicio de productos para el marketplace Gamarriando, implementado con arquitectura de microservicios verdaderos donde cada endpoint REST es una función Lambda individual.

## 🏗️ Arquitectura

### **Microservicios Individuales por Endpoint**

Cada endpoint REST es una función Lambda independiente, proporcionando:
- **Escalado Granular**: Cada endpoint escala según su demanda específica
- **Monitoreo Detallado**: Métricas individuales por endpoint
- **Deployment Selectivo**: Actualizar solo funciones específicas
- **Debugging Simplificado**: Errores aislados por función
- **Desarrollo Paralelo**: Equipos pueden trabajar independientemente

### **15 Lambda Functions Individuales**

#### 🛍️ **Products Functions (5 funciones)**
- `products_list` - `GET /api/v1/products`
- `products_create` - `POST /api/v1/products`
- `products_get` - `GET /api/v1/products/{id}`
- `products_update` - `PUT /api/v1/products/{id}`
- `products_delete` - `DELETE /api/v1/products/{id}`

#### 📂 **Categories Functions (5 funciones)**
- `categories_list` - `GET /api/v1/categories`
- `categories_create` - `POST /api/v1/categories`
- `categories_get` - `GET /api/v1/categories/{id}`
- `categories_update` - `PUT /api/v1/categories/{id}`
- `categories_delete` - `DELETE /api/v1/categories/{id}`

#### 🏪 **Vendors Functions (5 funciones)**
- `vendors_list` - `GET /api/v1/vendors`
- `vendors_create` - `POST /api/v1/vendors`
- `vendors_get` - `GET /api/v1/vendors/{id}`
- `vendors_update` - `PUT /api/v1/vendors/{id}`
- `vendors_delete` - `DELETE /api/v1/vendors/{id}`

## 🚀 Deployment

### **URLs de Deployment**
- **API Base**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/`
- **Products API**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products`
- **Categories API**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories`
- **Vendors API**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors`

### **Configuración por Función**

| Tipo de Operación | Memoria | Timeout | Razón |
|------------------|---------|---------|-------|
| **List/Get/Delete** | 256 MB | 20s | Operaciones simples y rápidas |
| **Create/Update** | 512 MB | 30s | Operaciones complejas con validación |

## 📊 Estado de Endpoints

#### ✅ **Categorías (100% operativo)**
- ✅ `GET /api/v1/categories` - Lista de categorías
- ✅ `POST /api/v1/categories` - Crear categoría
- ✅ `GET /api/v1/categories/{id}` - Obtener categoría
- ✅ `PUT /api/v1/categories/{id}` - Actualizar categoría
- ✅ `DELETE /api/v1/categories/{id}` - Eliminar categoría

#### ✅ **Vendedores (100% operativo)**
- ✅ `GET /api/v1/vendors` - Lista de vendedores
- ✅ `POST /api/v1/vendors` - Crear vendedor
- ✅ `GET /api/v1/vendors/{id}` - Obtener vendedor
- ✅ `PUT /api/v1/vendors/{id}` - Actualizar vendedor
- ✅ `DELETE /api/v1/vendors/{id}` - Eliminar vendedor

#### ✅ **Productos (80% operativo)**
- ❌ `GET /api/v1/products` - Lista de productos (error 500)
- ✅ `POST /api/v1/products` - Crear producto
- ✅ `GET /api/v1/products/{id}` - Obtener producto
- ✅ `PUT /api/v1/products/{id}` - Actualizar producto
- ✅ `DELETE /api/v1/products/{id}` - Eliminar producto

## 🗄️ Base de Datos

### **Tablas Principales**
- `products` - Información de productos
- `categories` - Categorías de productos
- `vendors` - Información de vendedores
- `product_images` - Imágenes de productos
- `product_tags` - Tags de productos
- `product_categories` - Relación productos-categorías

## 🔧 Desarrollo Local

### **Estructura del Proyecto**
```
services/product-service/
├── handlers/                    # Lambda handlers individuales
│   ├── products_list.py        # GET /api/v1/products
│   ├── products_create.py      # POST /api/v1/products
│   ├── products_get.py         # GET /api/v1/products/{id}
│   ├── products_update.py      # PUT /api/v1/products/{id}
│   ├── products_delete.py      # DELETE /api/v1/products/{id}
│   ├── categories_list.py      # GET /api/v1/categories
│   ├── categories_create.py    # POST /api/v1/categories
│   ├── categories_get.py       # GET /api/v1/categories/{id}
│   ├── categories_update.py    # PUT /api/v1/categories/{id}
│   ├── categories_delete.py    # DELETE /api/v1/categories/{id}
│   ├── vendors_list.py         # GET /api/v1/vendors
│   ├── vendors_create.py       # POST /api/v1/vendors
│   ├── vendors_get.py          # GET /api/v1/vendors/{id}
│   ├── vendors_update.py       # PUT /api/v1/vendors/{id}
│   └── vendors_delete.py       # DELETE /api/v1/vendors/{id}
├── serverless.yml              # Configuración de deployment
├── requirements.txt            # Dependencias Python
└── README.md                   # Documentación
```

### **Testing Local**
```bash
# Test individual de función
serverless invoke local --function products_list

# Test con datos específicos
serverless invoke local --function products_create --data '{"name": "Test Product", "price": 19.99}'
```

## 📈 Monitoreo y Logs

### **CloudWatch Logs**
```bash
# Ver logs de función específica
serverless logs --function products_list --stage dev --tail

# Ver logs de todas las funciones
serverless logs --stage dev --tail
```

### **Métricas por Función**
- **Invocaciones**: Número de llamadas por endpoint
- **Duración**: Tiempo de ejecución por función
- **Errores**: Rate de errores por endpoint
- **Throttles**: Limitaciones de concurrencia

## 🔐 Seguridad

### **CORS Configurado**
Todos los endpoints incluyen headers CORS:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization`

### **IAM Permissions**
- **Role**: `arn:aws:iam::238034776414:role/LabRole`
- **Permisos**: Acceso a S3, CloudWatch, y otros servicios AWS necesarios

## 🧪 Ejemplos de Uso

### **Crear Producto**
```bash
curl -X POST "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de Ejemplo",
    "price": 29.99,
    "description": "Descripción del producto",
    "category_id": "1",
    "vendor_id": "1",
    "stock": 10
  }'
```

### **Obtener Categorías**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories" \
  -H "Content-Type: application/json"
```

### **Actualizar Vendedor**
```bash
curl -X PUT "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendedor Actualizado",
    "rating": 4.8
  }'
```

## 🚀 Beneficios de la Arquitectura Individual

### **Escalado Independiente**
- Cada endpoint escala según su demanda específica
- No hay sobre-provisioning de recursos
- Costos optimizados por uso real

### **Monitoreo Granular**
- Métricas detalladas por endpoint
- Alertas específicas por función
- Debugging simplificado

### **Deployment Selectivo**
- Actualizar solo funciones modificadas
- Rollback granular por función
- Testing independiente

### **Desarrollo Paralelo**
- Equipos pueden trabajar en funciones independientes
- Menos conflictos de merge
- Desarrollo más ágil

## 🔄 Próximos Pasos

1. **🔧 Resolver products_list**: Investigar y corregir error 500
2. **💾 Integración RDS**: Conectar cada función con Aurora PostgreSQL
3. **🔐 Autenticación JWT**: Implementar middleware por función
4. **📊 Monitoreo Avanzado**: CloudWatch dashboards por función
5. **🧪 Testing Automatizado**: CI/CD pipeline por función
6. **📈 Performance**: Optimización de cold starts

---

**Gamarriando Product Service** - Arquitectura de Microservicios Verdaderos con AWS Lambda 🚀
