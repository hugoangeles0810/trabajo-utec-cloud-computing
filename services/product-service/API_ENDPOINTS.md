# 📚 API Endpoints - Product Service

## 🎯 Resumen

El Product Service expone **15 endpoints REST** organizados en **3 dominios** (Products, Categories, Vendors), donde cada endpoint es una **función Lambda individual**.

**Base URL**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev`

## 🛍️ Products Endpoints

### **1. List Products**
- **Function**: `products_list`
- **Endpoint**: `GET /api/v1/products`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ❌ Error 500 (investigación pendiente)

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products" \
  -H "Content-Type: application/json"
```

#### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Número de página |
| `limit` | integer | No | 10 | Elementos por página |

#### **Response (Expected)**
```json
{
  "products": [
    {
      "id": "1",
      "name": "Producto de Ejemplo",
      "price": 29.99,
      "description": "Un producto de ejemplo para demostración",
      "category": "Electrónicos",
      "vendor": "Vendor Demo",
      "status": "active",
      "stock": 10,
      "images": ["https://example.com/image1.jpg"],
      "created_at": "2024-10-04T21:00:00Z",
      "updated_at": "2024-10-04T21:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10
}
```

---

### **2. Create Product**
- **Function**: `products_create`
- **Endpoint**: `POST /api/v1/products`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X POST "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de Ejemplo",
    "price": 29.99,
    "description": "Descripción del producto",
    "category_id": "1",
    "vendor_id": "1",
    "stock": 10,
    "images": ["https://example.com/image1.jpg"]
  }'
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nombre del producto |
| `price` | number | ✅ | Precio del producto |
| `category_id` | string | ✅ | ID de la categoría |
| `vendor_id` | string | ✅ | ID del vendedor |
| `description` | string | No | Descripción del producto |
| `stock` | integer | No | Cantidad en stock |
| `images` | array | No | URLs de imágenes |

#### **Response**
```json
{
  "message": "Producto creado exitosamente",
  "product_id": "product-5",
  "product": {
    "id": "product-5",
    "name": "Producto de Ejemplo",
    "price": 29.99,
    "description": "Descripción del producto",
    "category_id": "1",
    "vendor_id": "1",
    "stock": 10,
    "status": "active",
    "images": ["https://example.com/image1.jpg"],
    "created_at": "2024-10-04T21:00:00Z",
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **3. Get Product**
- **Function**: `products_get`
- **Endpoint**: `GET /api/v1/products/{product_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products/1" \
  -H "Content-Type: application/json"
```

#### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | string | ✅ | ID del producto |

#### **Response**
```json
{
  "id": "1",
  "name": "Producto 1",
  "price": 29.99,
  "description": "Descripción del producto 1",
  "category": "Electrónicos",
  "vendor": "Vendor Demo",
  "status": "active",
  "stock": 5,
  "images": ["https://example.com/image1.jpg"],
  "created_at": "2024-10-04T21:00:00Z",
  "updated_at": "2024-10-04T21:00:00Z"
}
```

---

### **4. Update Product**
- **Function**: `products_update`
- **Endpoint**: `PUT /api/v1/products/{product_id}`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X PUT "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Actualizado",
    "price": 39.99,
    "description": "Nueva descripción",
    "stock": 15
  }'
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Nombre del producto |
| `price` | number | No | Precio del producto |
| `description` | string | No | Descripción del producto |
| `stock` | integer | No | Cantidad en stock |
| `status` | string | No | Estado del producto |
| `images` | array | No | URLs de imágenes |

#### **Response**
```json
{
  "message": "Producto 1 actualizado exitosamente",
  "product_id": "1",
  "updated_fields": ["name", "price", "description", "stock"],
  "product": {
    "id": "1",
    "name": "Producto Actualizado",
    "price": 39.99,
    "description": "Nueva descripción",
    "stock": 15,
    "status": "active",
    "images": [],
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **5. Delete Product**
- **Function**: `products_delete`
- **Endpoint**: `DELETE /api/v1/products/{product_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X DELETE "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/products/1" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "message": "Producto 1 eliminado exitosamente",
  "product_id": "1",
  "deleted_at": "2024-10-04T21:00:00Z"
}
```

---

## 📂 Categories Endpoints

### **1. List Categories**
- **Function**: `categories_list`
- **Endpoint**: `GET /api/v1/categories`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "categories": [
    {
      "id": "1",
      "name": "Electrónicos",
      "slug": "electronicos",
      "description": "Productos electrónicos y tecnología",
      "parent_id": null,
      "order": 1,
      "is_active": true,
      "created_at": "2024-10-04T21:00:00Z",
      "updated_at": "2024-10-04T21:00:00Z"
    },
    {
      "id": "2",
      "name": "Ropa",
      "slug": "ropa",
      "description": "Ropa y accesorios",
      "parent_id": null,
      "order": 2,
      "is_active": true,
      "created_at": "2024-10-04T21:00:00Z",
      "updated_at": "2024-10-04T21:00:00Z"
    }
  ],
  "total": 4
}
```

---

### **2. Create Category**
- **Function**: `categories_create`
- **Endpoint**: `POST /api/v1/categories`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X POST "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nueva Categoría",
    "slug": "nueva-categoria",
    "description": "Descripción de la nueva categoría",
    "parent_id": null,
    "order": 5,
    "is_active": true
  }'
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nombre de la categoría |
| `slug` | string | ✅ | Slug único de la categoría |
| `description` | string | No | Descripción de la categoría |
| `parent_id` | string | No | ID de la categoría padre |
| `order` | integer | No | Orden de visualización |
| `is_active` | boolean | No | Estado activo/inactivo |

#### **Response**
```json
{
  "message": "Categoría creada exitosamente",
  "category_id": "category-3",
  "category": {
    "id": "category-3",
    "name": "Nueva Categoría",
    "slug": "nueva-categoria",
    "description": "Descripción de la nueva categoría",
    "parent_id": null,
    "order": 5,
    "is_active": true,
    "created_at": "2024-10-04T21:00:00Z",
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **3. Get Category**
- **Function**: `categories_get`
- **Endpoint**: `GET /api/v1/categories/{category_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories/1" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "id": "1",
  "name": "Categoría 1",
  "slug": "categoria-1",
  "description": "Descripción de la categoría 1",
  "parent_id": null,
  "order": 1,
  "is_active": true,
  "created_at": "2024-10-04T21:00:00Z",
  "updated_at": "2024-10-04T21:00:00Z"
}
```

---

### **4. Update Category**
- **Function**: `categories_update`
- **Endpoint**: `PUT /api/v1/categories/{category_id}`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X PUT "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Categoría Actualizada",
    "description": "Nueva descripción",
    "is_active": false
  }'
```

#### **Response**
```json
{
  "message": "Categoría 1 actualizada exitosamente",
  "category_id": "1",
  "updated_fields": ["name", "description", "is_active"],
  "category": {
    "id": "1",
    "name": "Categoría Actualizada",
    "slug": "categoria-1",
    "description": "Nueva descripción",
    "parent_id": null,
    "order": 1,
    "is_active": false,
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **5. Delete Category**
- **Function**: `categories_delete`
- **Endpoint**: `DELETE /api/v1/categories/{category_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X DELETE "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories/1" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "message": "Categoría 1 eliminada exitosamente",
  "category_id": "1",
  "deleted_at": "2024-10-04T21:00:00Z"
}
```

---

## 🏪 Vendors Endpoints

### **1. List Vendors**
- **Function**: `vendors_list`
- **Endpoint**: `GET /api/v1/vendors`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "vendors": [
    {
      "id": "1",
      "name": "Vendor Demo",
      "email": "vendor@demo.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Demo Street",
        "city": "Demo City",
        "state": "Demo State",
        "zip_code": "12345",
        "country": "Demo Country"
      },
      "description": "Vendedor de demostración para el marketplace",
      "is_active": true,
      "is_verified": true,
      "rating": 4.5,
      "total_products": 25,
      "created_at": "2024-10-04T21:00:00Z",
      "updated_at": "2024-10-04T21:00:00Z"
    }
  ],
  "total": 3
}
```

---

### **2. Create Vendor**
- **Function**: `vendors_create`
- **Endpoint**: `POST /api/v1/vendors`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X POST "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Vendedor",
    "email": "nuevo@vendedor.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "Demo City",
      "state": "Demo State",
      "zip_code": "12345",
      "country": "Demo Country"
    },
    "description": "Descripción del nuevo vendedor",
    "is_active": true,
    "is_verified": false
  }'
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nombre del vendedor |
| `email` | string | ✅ | Email del vendedor |
| `phone` | string | No | Teléfono del vendedor |
| `address` | object | No | Dirección del vendedor |
| `description` | string | No | Descripción del vendedor |
| `is_active` | boolean | No | Estado activo/inactivo |
| `is_verified` | boolean | No | Estado verificado/no verificado |

#### **Response**
```json
{
  "message": "Vendedor creado exitosamente",
  "vendor_id": "vendor-4",
  "vendor": {
    "id": "vendor-4",
    "name": "Nuevo Vendedor",
    "email": "nuevo@vendedor.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main Street",
      "city": "Demo City",
      "state": "Demo State",
      "zip_code": "12345",
      "country": "Demo Country"
    },
    "description": "Descripción del nuevo vendedor",
    "is_active": true,
    "is_verified": false,
    "rating": 0.0,
    "total_products": 0,
    "created_at": "2024-10-04T21:00:00Z",
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **3. Get Vendor**
- **Function**: `vendors_get`
- **Endpoint**: `GET /api/v1/vendors/{vendor_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X GET "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors/1" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "id": "1",
  "name": "Vendedor 1",
  "email": "vendor1@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main Street",
    "city": "Demo City",
    "state": "Demo State",
    "zip_code": "12345",
    "country": "Demo Country"
  },
  "description": "Descripción del vendedor 1",
  "is_active": true,
  "is_verified": true,
  "rating": 4.5,
  "total_products": 25,
  "created_at": "2024-10-04T21:00:00Z",
  "updated_at": "2024-10-04T21:00:00Z"
}
```

---

### **4. Update Vendor**
- **Function**: `vendors_update`
- **Endpoint**: `PUT /api/v1/vendors/{vendor_id}`
- **Memory**: 512 MB
- **Timeout**: 30s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X PUT "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendedor Actualizado",
    "rating": 4.8,
    "is_verified": true
  }'
```

#### **Response**
```json
{
  "message": "Vendedor 1 actualizado exitosamente",
  "vendor_id": "1",
  "updated_fields": ["name", "rating", "is_verified"],
  "vendor": {
    "id": "1",
    "name": "Vendedor Actualizado",
    "email": "vendor1@example.com",
    "phone": "+1234567890",
    "address": {},
    "description": "",
    "is_active": true,
    "is_verified": true,
    "rating": 4.8,
    "total_products": 25,
    "updated_at": "2024-10-04T21:00:00Z"
  }
}
```

---

### **5. Delete Vendor**
- **Function**: `vendors_delete`
- **Endpoint**: `DELETE /api/v1/vendors/{vendor_id}`
- **Memory**: 256 MB
- **Timeout**: 20s
- **Status**: ✅ Operativo

#### **Request**
```bash
curl -X DELETE "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/vendors/1" \
  -H "Content-Type: application/json"
```

#### **Response**
```json
{
  "message": "Vendedor 1 eliminado exitosamente",
  "vendor_id": "1",
  "deleted_at": "2024-10-04T21:00:00Z"
}
```

---

## 🔧 Error Handling

### **Error Response Format**
```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "requestId": "aws-request-id",
  "timestamp": "2024-10-04T21:00:00Z"
}
```

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **500**: Internal Server Error

### **Common Error Scenarios**
1. **Missing Required Fields**: 400 Bad Request
2. **Invalid JSON**: 400 Bad Request
3. **Resource Not Found**: 404 Not Found
4. **Internal Server Error**: 500 Internal Server Error

---

## 🔐 CORS Configuration

Todos los endpoints incluyen headers CORS:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization`

---

## 📊 Status Summary

| Domain | Endpoints | Status | Success Rate |
|--------|-----------|--------|--------------|
| **Products** | 5 | ⚠️ 4/5 operativos | 80% |
| **Categories** | 5 | ✅ 5/5 operativos | 100% |
| **Vendors** | 5 | ✅ 5/5 operativos | 100% |
| **Total** | 15 | ✅ 14/15 operativos | 93.3% |

---

**Gamarriando Product Service API** - Documentación de Endpoints Individuales 📚
