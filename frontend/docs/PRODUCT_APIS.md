# APIs de Productos - Gamarriando Frontend

## Resumen

Las APIs de productos de Gamarriando proporcionan una interfaz completa para gestionar productos, categorías y vendedores. Están diseñadas para consumir los microservicios backend y proporcionar una experiencia de desarrollo fluida con TypeScript.

## Estructura de APIs

### 🛍️ **ProductAPI** - Gestión de Productos

### 📂 **CategoryAPI** - Gestión de Categorías

### 🏪 **VendorAPI** - Gestión de Vendedores

---

## 🛍️ ProductAPI

### **Configuración Base**

```typescript
import { ProductAPI, productAPI } from '@/lib/api/products';

// Base URL: /api/v1/products
// Endpoints disponibles: 5 (4 operativos, 1 con error 500)
```

### **Métodos Principales**

#### 📋 **Listar Productos**

```typescript
// Obtener todos los productos
const products = await ProductAPI.getProducts();

// Con filtros
const filteredProducts = await ProductAPI.getProducts({
  page: 1,
  limit: 20,
  category_id: 'electronics',
  min_price: 100,
  max_price: 1000,
  search: 'iPhone',
  sort_by: 'price',
  sort_order: 'asc',
});
```

#### 🔍 **Obtener Producto Individual**

```typescript
// Obtener producto por ID
const product = await ProductAPI.getProduct('product-123');
```

#### ➕ **Crear Producto**

```typescript
// Crear nuevo producto
const newProduct = await ProductAPI.createProduct({
  name: 'iPhone 15',
  price: 999.99,
  description: 'Último modelo de iPhone',
  category_id: 'electronics',
  vendor_id: 'apple-store',
  stock: 100,
  images: ['https://example.com/iphone15.jpg'],
});
```

#### ✏️ **Actualizar Producto**

```typescript
// Actualizar producto existente
const updatedProduct = await ProductAPI.updateProduct('product-123', {
  name: 'iPhone 15 Pro',
  price: 1199.99,
  stock: 150,
});
```

#### 🗑️ **Eliminar Producto**

```typescript
// Eliminar producto
await ProductAPI.deleteProduct('product-123');
```

### **Métodos Especializados**

#### 🔎 **Búsqueda de Productos**

```typescript
// Búsqueda avanzada
const searchResults = await ProductAPI.searchProducts('iPhone', {
  category_id: 'electronics',
  min_price: 500,
  max_price: 1500,
});
```

#### ⭐ **Productos Destacados**

```typescript
// Obtener productos destacados
const featuredProducts = await ProductAPI.getFeaturedProducts(10);
```

#### 📂 **Productos por Categoría**

```typescript
// Productos de una categoría específica
const electronics = await ProductAPI.getProductsByCategory('electronics', {
  limit: 20,
  sort_by: 'price',
});
```

#### 🏪 **Productos por Vendedor**

```typescript
// Productos de un vendedor específico
const appleProducts = await ProductAPI.getProductsByVendor('apple-store', {
  limit: 50,
});
```

#### 💰 **Productos por Rango de Precio**

```typescript
// Productos en rango de precio
const affordableProducts = await ProductAPI.getProductsByPriceRange(100, 500);
```

#### 📦 **Gestión de Stock**

```typescript
// Productos con stock bajo
const lowStockProducts = await ProductAPI.getLowStockProducts(10);

// Productos sin stock
const outOfStockProducts = await ProductAPI.getOutOfStockProducts();
```

#### 🆕 **Productos Recientes**

```typescript
// Productos recién agregados
const recentProducts = await ProductAPI.getRecentProducts(10);
```

### **Métodos de Administración**

#### 📊 **Estadísticas de Productos**

```typescript
// Obtener estadísticas generales
const stats = await ProductAPI.getProductStats();
console.log(stats);
// {
//   totalProducts: 150,
//   activeProducts: 120,
//   inactiveProducts: 30,
//   totalCategories: 10,
//   totalVendors: 25,
//   averagePrice: 299.99,
//   totalStock: 5000
// }
```

#### 📈 **Analíticas de Producto**

```typescript
// Analíticas de un producto específico
const analytics = await ProductAPI.getProductAnalytics('product-123');
```

#### 🔄 **Operaciones en Lote**

```typescript
// Actualizar múltiples productos
const bulkUpdate = await ProductAPI.bulkUpdateProducts(
  ['product-1', 'product-2', 'product-3'],
  { status: 'active' }
);

// Eliminar múltiples productos
const bulkDelete = await ProductAPI.bulkDeleteProducts([
  'product-1',
  'product-2',
]);
```

#### 📸 **Subir Imágenes**

```typescript
// Subir imágenes de producto
const files = [file1, file2, file3];
const uploadResult = await ProductAPI.uploadProductImages(
  'product-123',
  files,
  progress => console.log(`Upload: ${progress}%`)
);
```

#### 💡 **Sugerencias de Productos**

```typescript
// Obtener sugerencias de búsqueda
const suggestions = await ProductAPI.getProductSuggestions('iPh');
// ['iPhone 15', 'iPhone 14', 'iPhone 13']
```

#### ✅ **Validación de Datos**

```typescript
// Validar datos antes de crear/actualizar
const validation = ProductAPI.validateProductData({
  name: 'iPhone 15',
  price: 999.99,
  category_id: 'electronics',
  vendor_id: 'apple-store',
});

if (!validation.isValid) {
  console.error('Errores:', validation.errors);
}
```

---

## 📂 CategoryAPI

### **Configuración Base**

```typescript
import { CategoryAPI, categoryAPI } from '@/lib/api/categories';

// Base URL: /api/v1/categories
// Endpoints disponibles: 5 (todos operativos)
```

### **Métodos Principales**

#### 📋 **Listar Categorías**

```typescript
// Obtener todas las categorías
const categories = await CategoryAPI.getCategories();

// Con filtros
const activeCategories = await CategoryAPI.getCategories({
  is_active: true,
  sort_by: 'order',
  sort_order: 'asc',
});
```

#### 🔍 **Obtener Categoría Individual**

```typescript
// Obtener categoría por ID
const category = await CategoryAPI.getCategory('electronics');
```

#### ➕ **Crear Categoría**

```typescript
// Crear nueva categoría
const newCategory = await CategoryAPI.createCategory({
  name: 'Tecnología',
  slug: 'tecnologia',
  description: 'Productos tecnológicos',
  order: 1,
  is_active: true,
});
```

#### ✏️ **Actualizar Categoría**

```typescript
// Actualizar categoría existente
const updatedCategory = await CategoryAPI.updateCategory('electronics', {
  name: 'Electrónicos y Tecnología',
  description: 'Descripción actualizada',
});
```

#### 🗑️ **Eliminar Categoría**

```typescript
// Eliminar categoría
await CategoryAPI.deleteCategory('electronics');
```

### **Métodos Especializados**

#### ✅ **Categorías Activas**

```typescript
// Solo categorías activas
const activeCategories = await CategoryAPI.getActiveCategories();
```

#### 🌳 **Estructura Jerárquica**

```typescript
// Categorías raíz (sin padre)
const rootCategories = await CategoryAPI.getRootCategories();

// Subcategorías de una categoría
const subcategories = await CategoryAPI.getSubcategories('electronics');

// Árbol completo de categorías
const categoryTree = await CategoryAPI.getCategoryTree();
```

#### 🔎 **Búsqueda de Categorías**

```typescript
// Buscar categorías por nombre
const searchResults = await CategoryAPI.searchCategories('electr');
```

#### 📋 **Categorías Ordenadas**

```typescript
// Categorías ordenadas por display order
const orderedCategories = await CategoryAPI.getOrderedCategories();
```

#### 📊 **Estadísticas de Categorías**

```typescript
// Estadísticas generales
const stats = await CategoryAPI.getCategoryStats();
```

#### 🔄 **Operaciones en Lote**

```typescript
// Actualizar múltiples categorías
const bulkUpdate = await CategoryAPI.bulkUpdateCategories(['cat-1', 'cat-2'], {
  is_active: true,
});

// Eliminar múltiples categorías
const bulkDelete = await CategoryAPI.bulkDeleteCategories(['cat-1', 'cat-2']);
```

#### ✅ **Validación de Datos**

```typescript
// Validar datos de categoría
const validation = CategoryAPI.validateCategoryData({
  name: 'Tecnología',
  slug: 'tecnologia',
});

if (!validation.isValid) {
  console.error('Errores:', validation.errors);
}
```

#### 🔗 **Generar Slug**

```typescript
// Generar slug automáticamente
const slug = CategoryAPI.generateSlug('Electrónicos y Tecnología');
// 'electronicos-y-tecnologia'
```

#### 🍞 **Breadcrumbs**

```typescript
// Obtener breadcrumb de una categoría
const breadcrumb = await CategoryAPI.getCategoryBreadcrumb('smartphones');
// [Electrónicos, Teléfonos, Smartphones]
```

#### ❓ **Verificar Eliminación**

```typescript
// Verificar si se puede eliminar una categoría
const canDelete = await CategoryAPI.canDeleteCategory('electronics');
if (!canDelete.canDelete) {
  console.log('No se puede eliminar:', canDelete.reason);
}
```

---

## 🏪 VendorAPI

### **Configuración Base**

```typescript
import { VendorAPI, vendorAPI } from '@/lib/api/vendors';

// Base URL: /api/v1/vendors
// Endpoints disponibles: 5 (todos operativos)
```

### **Métodos Principales**

#### 📋 **Listar Vendedores**

```typescript
// Obtener todos los vendedores
const vendors = await VendorAPI.getVendors();

// Con filtros
const verifiedVendors = await VendorAPI.getVendors({
  is_active: true,
  is_verified: true,
  min_rating: 4.0,
  sort_by: 'rating',
  sort_order: 'desc',
});
```

#### 🔍 **Obtener Vendedor Individual**

```typescript
// Obtener vendedor por ID
const vendor = await VendorAPI.getVendor('vendor-123');
```

#### ➕ **Crear Vendedor**

```typescript
// Crear nuevo vendedor
const newVendor = await VendorAPI.createVendor({
  name: 'Apple Store',
  email: 'contact@apple.com',
  phone: '+1-800-APL-CARE',
  address: {
    street: '1 Infinite Loop',
    city: 'Cupertino',
    state: 'CA',
    zip_code: '95014',
    country: 'USA',
  },
  description: 'Tienda oficial de Apple',
  is_active: true,
  is_verified: true,
});
```

#### ✏️ **Actualizar Vendedor**

```typescript
// Actualizar vendedor existente
const updatedVendor = await VendorAPI.updateVendor('vendor-123', {
  name: 'Apple Store Premium',
  rating: 4.8,
  is_verified: true,
});
```

#### 🗑️ **Eliminar Vendedor**

```typescript
// Eliminar vendedor
await VendorAPI.deleteVendor('vendor-123');
```

### **Métodos Especializados**

#### ✅ **Filtros de Vendedores**

```typescript
// Vendedores activos
const activeVendors = await VendorAPI.getActiveVendors();

// Vendedores verificados
const verifiedVendors = await VendorAPI.getVerifiedVendors();

// Vendedores mejor calificados
const topRatedVendors = await VendorAPI.getTopRatedVendors(10);

// Vendedores con más productos
const topVendors = await VendorAPI.getVendorsWithMostProducts(10);
```

#### 🔎 **Búsqueda de Vendedores**

```typescript
// Buscar vendedores
const searchResults = await VendorAPI.searchVendors('Apple');
```

#### ⭐ **Vendedores por Calificación**

```typescript
// Vendedores con calificación mínima
const highRatedVendors = await VendorAPI.getVendorsByRating(4.5);
```

#### 📊 **Estadísticas de Vendedores**

```typescript
// Estadísticas generales
const stats = await VendorAPI.getVendorStats();
```

#### 📈 **Analíticas de Vendedor**

```typescript
// Analíticas de un vendedor específico
const analytics = await VendorAPI.getVendorAnalytics('vendor-123');
```

### **Métodos de Gestión**

#### ✅ **Verificación de Vendedores**

```typescript
// Verificar vendedor
await VendorAPI.verifyVendor('vendor-123');

// Desverificar vendedor
await VendorAPI.unverifyVendor('vendor-123');
```

#### 🔄 **Estado de Vendedores**

```typescript
// Activar vendedor
await VendorAPI.activateVendor('vendor-123');

// Desactivar vendedor
await VendorAPI.deactivateVendor('vendor-123');
```

#### ⭐ **Calificaciones**

```typescript
// Actualizar calificación
await VendorAPI.updateVendorRating('vendor-123', 4.8);
```

#### 🔄 **Operaciones en Lote**

```typescript
// Actualizar múltiples vendedores
const bulkUpdate = await VendorAPI.bulkUpdateVendors(['vendor-1', 'vendor-2'], {
  is_verified: true,
});

// Eliminar múltiples vendedores
const bulkDelete = await VendorAPI.bulkDeleteVendors(['vendor-1', 'vendor-2']);
```

#### ✅ **Validación de Datos**

```typescript
// Validar datos de vendedor
const validation = VendorAPI.validateVendorData({
  name: 'Apple Store',
  email: 'contact@apple.com',
});

if (!validation.isValid) {
  console.error('Errores:', validation.errors);
}
```

#### ❓ **Verificar Eliminación**

```typescript
// Verificar si se puede eliminar un vendedor
const canDelete = await VendorAPI.canDeleteVendor('vendor-123');
if (!canDelete.canDelete) {
  console.log('No se puede eliminar:', canDelete.reason);
}
```

#### 💡 **Sugerencias de Vendedores**

```typescript
// Obtener sugerencias de búsqueda
const suggestions = await VendorAPI.getVendorSuggestions('Appl');
// ['Apple Store', 'Apple Reseller']
```

---

## 🔧 Configuración y Uso

### **Importación de APIs**

```typescript
// Importar APIs individuales
import { ProductAPI, CategoryAPI, VendorAPI } from '@/lib/api';

// Importar instancias
import { productAPI, categoryAPI, vendorAPI } from '@/lib/api';

// Importar tipos
import { Product, Category, Vendor, ProductFilters } from '@/lib/types';
```

### **Manejo de Errores**

```typescript
import { ApiError, ErrorType } from '@/lib/api';

try {
  const products = await ProductAPI.getProducts();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.NOT_FOUND_ERROR:
        console.log('Productos no encontrados');
        break;
      case ErrorType.VALIDATION_ERROR:
        console.log('Error de validación:', error.details);
        break;
      default:
        console.log('Error:', error.message);
    }
  }
}
```

### **Configuración de Cache**

```typescript
// Las APIs usan cache automáticamente para requests GET
// El cache se puede limpiar manualmente:
api.clearCache('/api/v1/products');
api.clearCache(); // Limpiar todo el cache
```

### **Configuración de Retry**

```typescript
// Las APIs incluyen retry automático para errores de red
// Se puede configurar en el cliente base si es necesario
```

---

## 📊 Estado de los Endpoints

| API            | Endpoints | Estado              | Tasa de Éxito |
| -------------- | --------- | ------------------- | ------------- |
| **Products**   | 5         | ⚠️ 4/5 operativos   | 80%           |
| **Categories** | 5         | ✅ 5/5 operativos   | 100%          |
| **Vendors**    | 5         | ✅ 5/5 operativos   | 100%          |
| **Total**      | 15        | ✅ 14/15 operativos | 93.3%         |

---

## 🚀 Próximos Pasos

1. **Implementar React Query hooks** para cache y sincronización
2. **Crear stores Zustand** para estado global
3. **Implementar componentes UI** que consuman estas APIs
4. **Agregar tests unitarios** para las APIs
5. **Implementar paginación avanzada** en los componentes

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Gamarriando
