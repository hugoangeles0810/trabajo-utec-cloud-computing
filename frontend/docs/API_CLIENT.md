# Cliente API - Gamarriando Frontend

## Resumen

El cliente API de Gamarriando es un sistema robusto y completo para manejar todas las comunicaciones con los microservicios backend. Incluye manejo avanzado de errores, retry automático, cache inteligente, y funcionalidades de upload/download.

## Características Principales

### 🚀 **Funcionalidades Core**

- **Manejo de errores robusto** con tipos específicos y mensajes user-friendly
- **Retry automático** con exponential backoff para requests fallidos
- **Cache inteligente** para requests GET con TTL configurable
- **Token refresh automático** para manejo de autenticación
- **Request/Response interceptors** para logging y validación
- **Upload/Download** con progress tracking
- **TypeScript completo** con tipos seguros

### 🔧 **Configuración**

```typescript
import { api } from '@/lib/api';

// Configuración por defecto
const DEFAULT_CONFIG = {
  timeout: 10000, // 10 segundos
  retries: 3, // 3 reintentos
  retryDelay: 1000, // 1 segundo base
};

// Configuración personalizada
const customConfig = {
  timeout: 15000,
  retries: 5,
  cache: {
    enabled: true,
    ttl: 600000, // 10 minutos
  },
};
```

## Métodos de API

### 📥 **GET Request**

```typescript
// GET básico
const products = await api.get<Product[]>('/api/v1/products');

// GET con parámetros
const filteredProducts = await api.get<Product[]>('/api/v1/products', {
  params: { category: 'electronics', page: 1 },
  cache: { enabled: true, ttl: 300000 },
});

// GET con configuración personalizada
const product = await api.get<Product>('/api/v1/products/123', {
  timeout: 5000,
  retry: { retries: 2 },
});
```

### 📤 **POST Request**

```typescript
// POST básico
const newProduct = await api.post<Product>('/api/v1/products', {
  name: 'Nuevo Producto',
  price: 99.99,
  category: 'electronics',
});

// POST con configuración
const result = await api.post('/api/v1/orders', orderData, {
  retry: { retries: 5 },
  timeout: 20000,
});
```

### 🔄 **PUT/PATCH Request**

```typescript
// PUT request
const updatedProduct = await api.put<Product>('/api/v1/products/123', {
  name: 'Producto Actualizado',
  price: 149.99,
});

// PATCH request
const partialUpdate = await api.patch<Product>('/api/v1/products/123', {
  price: 199.99,
});
```

### 🗑️ **DELETE Request**

```typescript
// DELETE básico
await api.delete('/api/v1/products/123');

// DELETE con configuración
await api.delete('/api/v1/products/123', {
  timeout: 5000,
  retry: { retries: 2 },
});
```

### 📁 **Upload de Archivos**

```typescript
// Upload con progress tracking
const file = document.getElementById('fileInput').files[0];

const uploadResult = await api.upload<{ url: string }>('/api/v1/upload', file, {
  onProgress: progress => {
    console.log(`Upload progress: ${progress}%`);
    // Actualizar UI con progress
  },
});
```

### 📥 **Download de Archivos**

```typescript
// Download básico
await api.download('/api/v1/products/123/export', 'product-export.pdf');

// Download con progress tracking
await api.download('/api/v1/reports/monthly', 'monthly-report.xlsx', {
  onProgress: progress => {
    console.log(`Download progress: ${progress}%`);
  },
});
```

## Manejo de Errores

### 🚨 **Tipos de Error**

```typescript
import { ApiError, ErrorType } from '@/lib/api';

try {
  const data = await api.get('/api/v1/products');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        console.log('Error de conexión');
        break;
      case ErrorType.VALIDATION_ERROR:
        console.log('Error de validación:', error.details);
        break;
      case ErrorType.AUTHENTICATION_ERROR:
        console.log('Sesión expirada');
        break;
      case ErrorType.NOT_FOUND_ERROR:
        console.log('Recurso no encontrado');
        break;
    }
  }
}
```

### 📝 **Error Handling Utils**

```typescript
import { errorHandler } from '@/lib/api';

// Convertir error a mensaje user-friendly
const userMessage = errorHandler.getUserFriendlyMessage(error.message);

// Extraer errores de validación
const validationErrors = errorHandler.extractValidationErrors(error);

// Formatear error para UI
const { title, message, action } = errorHandler.formatForDisplay(error);

// Crear resumen para logging
const summary = errorHandler.createErrorSummary(error);
```

### 🔄 **Retry Configuration**

```typescript
// Configuración de retry personalizada
const retryConfig = {
  retries: 5,
  retryDelay: 2000,
  retryCondition: error => {
    // Solo reintentar en errores específicos
    return error.status >= 500 || error.type === ErrorType.NETWORK_ERROR;
  },
};

const data = await api.get('/api/v1/products', { retry: retryConfig });
```

## Cache Management

### 💾 **Cache Configuration**

```typescript
// Habilitar/deshabilitar cache
const data = await api.get('/api/v1/products', {
  cache: {
    enabled: true,
    ttl: 600000, // 10 minutos
  },
});

// Cache personalizado por request
const product = await api.get('/api/v1/products/123', {
  cache: {
    enabled: true,
    ttl: 1800000, // 30 minutos
    key: 'product-123', // Key personalizada
  },
});
```

### 🗑️ **Cache Management**

```typescript
import { api } from '@/lib/api';

// Limpiar cache específico
api.clearCache('/api/v1/products');

// Limpiar todo el cache
api.clearCache();

// Obtener info del cache
const cacheInfo = api.getCacheInfo();
console.log(`Cache size: ${cacheInfo.size}`);
```

## Request/Response Interceptors

### 🔍 **Request Interceptors**

Los interceptors se ejecutan automáticamente y proporcionan:

- **Request ID** único para tracking
- **Timestamp** para medición de performance
- **User Agent** y versión de app
- **Validación** de configuración
- **Token de autenticación** automático
- **Cache checking** para requests GET

### 📊 **Response Interceptors**

Los interceptors de respuesta proporcionan:

- **Cache storage** para responses exitosos
- **Token refresh** automático en 401
- **Error conversion** a ApiError
- **Request/Response logging** en desarrollo

## Configuración Avanzada

### ⚙️ **Custom Configuration**

```typescript
import { apiClient } from '@/lib/api';

// Configuración global del cliente
apiClient.defaults.timeout = 15000;
apiClient.defaults.headers.common['X-Custom-Header'] = 'value';

// Interceptors personalizados
apiClient.interceptors.request.use(
  config => {
    // Custom logic
    return config;
  },
  error => {
    // Custom error handling
    return Promise.reject(error);
  }
);
```

### 🔐 **Authentication**

```typescript
// El cliente maneja automáticamente:
// 1. Agregar token a headers
// 2. Refresh token en 401
// 3. Redirect a login en refresh fallido

// Para logout manual:
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### 📈 **Performance Monitoring**

```typescript
import { requestUtils } from '@/lib/api';

// Logging automático en desarrollo
requestUtils.logRequest(config, response);

// Crear resumen de request
const summary = requestUtils.createRequestSummary(config, response, error);

// Sanitizar datos sensibles
const sanitizedData = requestUtils.sanitizeData(requestData);
```

## Mejores Prácticas

### ✅ **Do's**

- Usar tipos TypeScript específicos
- Configurar cache apropiadamente
- Manejar errores con try/catch
- Usar retry para operaciones críticas
- Implementar progress tracking para uploads
- Limpiar cache cuando sea necesario

### ❌ **Don'ts**

- No ignorar errores de API
- No usar cache para datos sensibles
- No hacer requests sin timeout
- No hardcodear URLs de API
- No exponer tokens en logs
- No hacer requests innecesarios

## Ejemplos de Uso

### 🛍️ **Product API**

```typescript
// Obtener productos con filtros
const products = await api.get<PaginatedResponse<Product>>('/api/v1/products', {
  params: {
    category: 'electronics',
    min_price: 100,
    max_price: 1000,
    page: 1,
    limit: 20,
  },
  cache: { enabled: true, ttl: 300000 },
});

// Crear producto
const newProduct = await api.post<Product>('/api/v1/products', {
  name: 'iPhone 15',
  price: 999.99,
  category: 'electronics',
  stock: 100,
});

// Actualizar producto
const updated = await api.put<Product>(`/api/v1/products/${productId}`, {
  price: 899.99,
  stock: 150,
});

// Eliminar producto
await api.delete(`/api/v1/products/${productId}`);
```

### 👤 **User API**

```typescript
// Login
const loginResponse = await api.post<{
  access_token: string;
  refresh_token: string;
}>('/api/v1/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

// Obtener perfil
const profile = await api.get<User>('/api/v1/users/profile', {
  cache: { enabled: true, ttl: 600000 },
});

// Actualizar perfil
const updatedProfile = await api.put<User>('/api/v1/users/profile', {
  first_name: 'Juan',
  last_name: 'Pérez',
  phone: '+1234567890',
});
```

### 🛒 **Cart API**

```typescript
// Agregar al carrito
await api.post('/api/v1/cart/items', {
  product_id: '123',
  quantity: 2,
});

// Obtener carrito
const cart = await api.get<Cart>('/api/v1/cart', {
  cache: { enabled: false }, // Siempre datos frescos
});

// Actualizar cantidad
await api.put(`/api/v1/cart/items/${itemId}`, {
  quantity: 3,
});

// Eliminar del carrito
await api.delete(`/api/v1/cart/items/${itemId}`);
```

## Debugging y Troubleshooting

### 🔍 **Logs de Desarrollo**

En modo desarrollo, el cliente automáticamente logea:

```typescript
// Request logs
🚀 API Request req_1234567890_abc123def
Method: GET
URL: /api/v1/products
Headers: { Authorization: "Bearer ...", ... }
Data: { category: "electronics" }

// Response logs
✅ API Response: 200 /api/v1/products
Response Data: { data: [...], total: 100 }
Duration: 245ms
```

### 🐛 **Error Debugging**

```typescript
import { errorHandler } from '@/lib/api';

// Log error details
errorHandler.logError(error, 'ProductService');

// Get error summary
const summary = errorHandler.createErrorSummary(error);
console.log('Error Summary:', summary);

// Check if retryable
const canRetry = errorHandler.isRetryableError(error);
console.log('Can retry:', canRetry);
```

### 📊 **Performance Monitoring**

```typescript
// Request timing
const startTime = Date.now();
const data = await api.get('/api/v1/products');
const duration = Date.now() - startTime;
console.log(`Request took ${duration}ms`);

// Cache hit rate
const cacheInfo = api.getCacheInfo();
console.log(`Cache size: ${cacheInfo.size} items`);
```

## Referencias

### 📚 **Documentación**

- [Axios Documentation](https://axios-http.com/docs/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### 🛠️ **Herramientas**

- [Axios DevTools](https://github.com/axios/axios-devtools)
- [Network Tab](https://developer.chrome.com/docs/devtools/network/)
- [Postman](https://www.postman.com/)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Gamarriando
