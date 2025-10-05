# 🏗️ Arquitectura del Product Service - Microservicios Individuales

## 📋 Resumen Ejecutivo

El **Gamarriando Product Service** implementa una arquitectura de microservicios verdaderos donde **cada endpoint REST es una función Lambda individual**. Esta arquitectura proporciona escalado granular, monitoreo detallado, deployment selectivo y debugging simplificado.

## 🎯 Principios Arquitectónicos

### **1. Microservicios Verdaderos**
- **Un endpoint = Una función Lambda**
- **Escalado independiente** por endpoint
- **Monitoreo granular** por función
- **Deployment selectivo** por endpoint

### **2. Separación de Responsabilidades**
- **Products**: Gestión de productos del marketplace
- **Categories**: Gestión de categorías de productos
- **Vendors**: Gestión de vendedores

### **3. Optimización por Tipo de Operación**
- **Operaciones Simples** (List/Get/Delete): 256 MB, 20s
- **Operaciones Complejas** (Create/Update): 512 MB, 30s

## 🏛️ Arquitectura de Alto Nivel

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
   │Functions│   │Functions │   │Functions│
   └─────────┘   └─────────┘   └─────────┘
        │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Lambda  │   │ Lambda  │   │ Lambda  │
   │Functions│   │Functions│   │Functions│
   │(5 funcs)│   │(5 funcs)│   │(5 funcs)│
   └─────────┘   └─────────┘   └─────────┘
```

## 🔧 Arquitectura Detallada

### **15 Lambda Functions Individuales**

#### 🛍️ **Products Domain (5 funciones)**

| Función | Endpoint | Método | Memoria | Timeout | Propósito |
|---------|----------|--------|---------|---------|-----------|
| `products_list` | `/api/v1/products` | GET | 256 MB | 20s | Listar productos con paginación |
| `products_create` | `/api/v1/products` | POST | 512 MB | 30s | Crear nuevo producto |
| `products_get` | `/api/v1/products/{id}` | GET | 256 MB | 20s | Obtener producto específico |
| `products_update` | `/api/v1/products/{id}` | PUT | 512 MB | 30s | Actualizar producto existente |
| `products_delete` | `/api/v1/products/{id}` | DELETE | 256 MB | 20s | Eliminar producto |

#### 📂 **Categories Domain (5 funciones)**

| Función | Endpoint | Método | Memoria | Timeout | Propósito |
|---------|----------|--------|---------|---------|-----------|
| `categories_list` | `/api/v1/categories` | GET | 256 MB | 20s | Listar categorías |
| `categories_create` | `/api/v1/categories` | POST | 512 MB | 30s | Crear nueva categoría |
| `categories_get` | `/api/v1/categories/{id}` | GET | 256 MB | 20s | Obtener categoría específica |
| `categories_update` | `/api/v1/categories/{id}` | PUT | 512 MB | 30s | Actualizar categoría existente |
| `categories_delete` | `/api/v1/categories/{id}` | DELETE | 256 MB | 20s | Eliminar categoría |

#### 🏪 **Vendors Domain (5 funciones)**

| Función | Endpoint | Método | Memoria | Timeout | Propósito |
|---------|----------|--------|---------|---------|-----------|
| `vendors_list` | `/api/v1/vendors` | GET | 256 MB | 20s | Listar vendedores |
| `vendors_create` | `/api/v1/vendors` | POST | 512 MB | 30s | Crear nuevo vendedor |
| `vendors_get` | `/api/v1/vendors/{id}` | GET | 256 MB | 20s | Obtener vendedor específico |
| `vendors_update` | `/api/v1/vendors/{id}` | PUT | 512 MB | 30s | Actualizar vendedor existente |
| `vendors_delete` | `/api/v1/vendors/{id}` | DELETE | 256 MB | 20s | Eliminar vendedor |

## 🔄 Flujo de Datos

### **Request Flow**

```
Client Request
     │
     ▼
┌─────────────┐
│ API Gateway │ ──► Route to specific Lambda function
└─────────────┘
     │
     ▼
┌─────────────┐
│ Lambda      │ ──► Process request
│ Function    │ ──► Validate input
│ (Individual)│ ──► Execute business logic
└─────────────┘
     │
     ▼
┌─────────────┐
│ Response    │ ──► Return JSON response
│ (JSON)      │ ──► Include CORS headers
└─────────────┘
```

### **Error Handling Flow**

```
Error Occurs
     │
     ▼
┌─────────────┐
│ Lambda      │ ──► Catch exception
│ Function    │ ──► Log error details
│ (Individual)│ ──► Return structured error
└─────────────┘
     │
     ▼
┌─────────────┐
│ Error       │ ──► HTTP status code
│ Response    │ ──► Error message
│ (JSON)      │ ──► Request ID for tracking
└─────────────┘
```

## 🏗️ Estructura de Código

### **Handler Pattern**

Cada función Lambda sigue un patrón consistente:

```python
import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    [Function Name] Lambda function - [HTTP_METHOD] [ENDPOINT]
    """
    try:
        # 1. Log request
        logger.info(f"[Function] request: {json.dumps(event)}")
        
        # 2. Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # 3. Extract parameters
        path_parameters = event.get('pathParameters', {})
        query_params = event.get('queryStringParameters', {})
        body = event.get('body')
        
        # 4. Validate input
        # ... validation logic ...
        
        # 5. Execute business logic
        # ... business logic ...
        
        # 6. Return success response
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(result)
        }
    
    except Exception as e:
        # 7. Handle errors
        logger.error(f"[Function] error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e)
            })
        }
```

### **CORS Configuration**

Todas las funciones incluyen headers CORS consistentes:

```python
def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
```

## 📊 Configuración de Recursos

### **Memoria y Timeout por Tipo de Operación**

#### **Operaciones Simples (256 MB, 20s)**
- **List**: Obtener listas de recursos
- **Get**: Obtener recurso específico
- **Delete**: Eliminar recurso

**Justificación**: Operaciones rápidas con poca lógica de negocio

#### **Operaciones Complejas (512 MB, 30s)**
- **Create**: Crear nuevos recursos con validación
- **Update**: Actualizar recursos existentes

**Justificación**: Operaciones que requieren validación extensa y procesamiento de datos

### **Configuración de Deployment**

```yaml
# serverless.yml
functions:
  products_list:
    handler: handlers/products_list.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/products
          method: GET
          cors: true
```

## 🔐 Seguridad

### **CORS Configuration**
- **Origin**: `*` (configurable por ambiente)
- **Methods**: `GET,POST,PUT,DELETE,OPTIONS`
- **Headers**: `Content-Type,Authorization`

### **IAM Permissions**
- **Role**: `arn:aws:iam::238034776414:role/LabRole`
- **Permissions**: Acceso mínimo necesario a servicios AWS

### **Input Validation**
- **Required Fields**: Validación en cada función
- **Data Types**: Validación de tipos de datos
- **Business Rules**: Validación de reglas de negocio

## 📈 Monitoreo y Observabilidad

### **CloudWatch Metrics por Función**

#### **Métricas Automáticas**
- **Invocations**: Número de llamadas por función
- **Duration**: Tiempo de ejecución por función
- **Errors**: Rate de errores por función
- **Throttles**: Limitaciones de concurrencia

#### **Métricas Personalizadas**
- **Business Metrics**: Métricas específicas del negocio
- **Performance Metrics**: Métricas de rendimiento
- **Error Metrics**: Métricas de errores detalladas

### **Logging Strategy**

```python
# Logging levels por función
logger.info(f"Function request: {json.dumps(event)}")      # Request logging
logger.error(f"Function error: {str(e)}")                  # Error logging
logger.debug(f"Function debug: {debug_info}")              # Debug logging
```

### **Error Tracking**

```python
# Error response structure
{
    "statusCode": 500,
    "headers": cors_headers(),
    "body": json.dumps({
        "message": "Internal server error",
        "error": str(e),
        "requestId": context.aws_request_id,
        "timestamp": "2024-10-04T21:00:00Z"
    })
}
```

## 🚀 Beneficios de la Arquitectura

### **1. Escalado Independiente**
- **Demanda Específica**: Cada endpoint escala según su uso
- **Recursos Optimizados**: No hay sobre-provisioning
- **Costos Eficientes**: Pago solo por uso real

### **2. Monitoreo Granular**
- **Métricas Detalladas**: Por endpoint específico
- **Alertas Precisas**: Por función individual
- **Debugging Simplificado**: Errores aislados

### **3. Deployment Selectivo**
- **Actualizaciones Granulares**: Solo funciones modificadas
- **Rollback Preciso**: Por función individual
- **Testing Independiente**: Por endpoint

### **4. Desarrollo Paralelo**
- **Equipos Independientes**: Trabajo en funciones separadas
- **Menos Conflictos**: Merge conflicts reducidos
- **Desarrollo Ágil**: Iteración rápida

### **5. Mantenibilidad**
- **Código Enfocado**: Una responsabilidad por función
- **Testing Simplificado**: Tests unitarios por función
- **Documentación Clara**: Por endpoint específico

## 🔄 Comparación: Antes vs Después

| Aspecto | Arquitectura Anterior | Arquitectura Actual |
|---------|----------------------|-------------------|
| **Funciones Lambda** | 3 funciones consolidadas | 15 funciones individuales |
| **Granularidad** | Por dominio (Products/Categories/Vendors) | Por endpoint específico |
| **Escalado** | Todo el dominio escala junto | Cada endpoint escala independientemente |
| **Monitoreo** | Métricas agregadas por dominio | Métricas detalladas por endpoint |
| **Deployment** | Todo o nada por dominio | Selectivo por función |
| **Debugging** | Complejo (múltiples endpoints) | Simple (1 endpoint por función) |
| **Desarrollo** | Secuencial por dominio | Paralelo por función |
| **Testing** | Tests integrados complejos | Tests unitarios simples |
| **Mantenimiento** | Cambios afectan múltiples endpoints | Cambios aislados por función |

## 🎯 Estado Actual

### **Deployment Status**
- **Total Functions**: 15 funciones Lambda
- **Deployment Time**: 92 segundos
- **Function Size**: 13 MB cada una
- **Success Rate**: 93.3% (14/15 funciones operativas)

### **Endpoints Status**

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

#### ⚠️ **Productos (80% operativo)**
- ❌ `GET /api/v1/products` - Lista de productos (error 500)
- ✅ `POST /api/v1/products` - Crear producto
- ✅ `GET /api/v1/products/{id}` - Obtener producto
- ✅ `PUT /api/v1/products/{id}` - Actualizar producto
- ✅ `DELETE /api/v1/products/{id}` - Eliminar producto

## 🔮 Próximos Pasos

### **Corto Plazo (1-2 semanas)**
1. **🔧 Resolver products_list**: Investigar y corregir error 500
2. **📊 Monitoreo Básico**: Configurar CloudWatch dashboards
3. **🧪 Testing**: Tests unitarios por función

### **Mediano Plazo (1-2 meses)**
1. **💾 Integración RDS**: Conectar cada función con Aurora PostgreSQL
2. **🔐 Autenticación JWT**: Implementar middleware por función
3. **📈 Performance**: Optimización de cold starts
4. **🔄 CI/CD**: Pipeline automatizado por función

### **Largo Plazo (3-6 meses)**
1. **🌐 Multi-región**: Deployment en múltiples regiones
2. **📊 Analytics**: Métricas avanzadas de negocio
3. **🔒 Seguridad**: Implementación de WAF y rate limiting
4. **🚀 Auto-scaling**: Configuración avanzada de escalado

## 📚 Referencias

- **AWS Lambda Documentation**: https://docs.aws.amazon.com/lambda/
- **Serverless Framework**: https://www.serverless.com/
- **API Gateway**: https://docs.aws.amazon.com/apigateway/
- **CloudWatch**: https://docs.aws.amazon.com/cloudwatch/

---

**Gamarriando Product Service** - Arquitectura de Microservicios Verdaderos 🚀