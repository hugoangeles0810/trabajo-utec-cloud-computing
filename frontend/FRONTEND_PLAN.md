# 🎨 Plan de Construcción del Frontend - Gamarriando

## 📋 Resumen Ejecutivo

Este documento presenta el plan completo para la construcción del frontend de Gamarriando, un marketplace de streetwear peruano. El frontend será desarrollado con **NextJS 14** y estará alojado en **Amazon S3** con el bucket `gamarriando-web`.

## 🎯 Objetivos del Frontend

### **Funcionalidades Principales**

- ✅ **Catálogo de Productos**: Visualización, filtrado y búsqueda
- ✅ **Carrito de Compras**: Gestión de productos y cantidades
- ✅ **Proceso de Checkout**: Completar compras
- ✅ **Autenticación de Usuarios**: Login, registro y gestión de perfiles
- ✅ **Categorías**: Navegación por categorías de productos
- ✅ **Vendedores**: Información de tiendas y vendedores

### **Características del Diseño**

- 🎨 **Estilo Streetwear**: Diseño moderno y urbano
- 📱 **Responsive**: Compatible con móviles y desktop
- ⚡ **Performance**: Carga rápida y optimizada
- 🌐 **SEO**: Optimizado para motores de búsqueda

## 🏗️ Arquitectura del Frontend

### **Stack Tecnológico**

```
Frontend Stack:
├── NextJS 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
├── Zustand (State Management)
├── React Query (Data Fetching)
├── Axios (HTTP Client)
└── AWS SDK (S3 Integration)
```

### **Estructura de Carpetas**

```
frontend/
├── app/                          # NextJS App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/                   # Main routes group
│   │   ├── page.tsx              # Homepage
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── profile/
│   ├── api/                      # API routes (if needed)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Sidebar.tsx
│   ├── product/                  # Product components
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductDetails.tsx
│   ├── cart/                     # Cart components
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartDrawer.tsx
│   └── auth/                     # Auth components
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── UserMenu.tsx
├── lib/                          # Utilities and configs
│   ├── api/                      # API clients
│   │   ├── products.ts
│   │   ├── users.ts
│   │   ├── payments.ts
│   │   └── index.ts
│   ├── store/                    # State management
│   │   ├── cart.ts
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── types/                    # TypeScript types
│       ├── product.ts
│       ├── user.ts
│       ├── cart.ts
│       └── api.ts
├── hooks/                        # Custom React hooks
│   ├── useProducts.ts
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useLocalStorage.ts
├── styles/                       # Global styles
│   ├── globals.css
│   └── components.css
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Diseño y Componentes

### **1. Homepage (Página Principal)**

Basado en las imágenes proporcionadas, la homepage incluirá:

#### **Header**

- **Logo**: Gamarriando con colores amarillo y azul
- **Barra de Búsqueda**: "Buscar por polos, camisas, jeans..."
- **Botones de Auth**: "Ingresar" y "Registrarse"
- **Carrito**: Icono con contador de productos

#### **Banner Promocional**

- **Mensaje**: "Usa el cupón BIENVENIDO10 y obtén 10% de descuento"
- **Hero Section**: "NUEVA COLECCIÓN EZZETA"
- **Imágenes**: Modelos con streetwear
- **Navegación**: Flechas para carousel

#### **Categorías Populares**

- **Título**: "EXPLORA LAS CATEGORÍAS MÁS POPULARES"
- **Cards**: Hombre, Mujer, Niños, Niñas, Ropa Para Bebés
- **Imágenes**: Flat lay de productos por categoría

#### **Productos Destacados**

- **Título**: "LO MÁS VENDIDO"
- **Carousel**: Productos con precios, descuentos y ratings
- **Información**: Tienda, delivery, colores disponibles

### **2. Página de Productos**

- **Filtros Laterales**: Descuentos, colores, tallas
- **Ordenamiento**: "Ordenar por Menor precio"
- **Grid de Productos**: Cards con información completa
- **Paginación**: Navegación entre páginas

### **3. Componentes Clave**

#### **ProductCard Component**

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}
```

#### **CartDrawer Component**

```typescript
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}
```

## 🔌 Integración con Microservicios

### **APIs Disponibles**

#### **Product Service**

- **Base URL**: `https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev`
- **Endpoints**:
  - `GET /api/v1/products` - Listar productos
  - `GET /api/v1/products/{id}` - Obtener producto
  - `GET /api/v1/categories` - Listar categorías
  - `GET /api/v1/vendors` - Listar vendedores

#### **User Service**

- **Base URL**: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`
- **Endpoints**:
  - `POST /api/v1/auth/login` - Login
  - `POST /api/v1/auth/register` - Registro
  - `GET /api/v1/users/profile` - Perfil de usuario

#### **Payment Service**

- **Endpoints**:
  - `POST /api/v1/orders` - Crear orden
  - `POST /api/v1/payments` - Procesar pago

### **Cliente API**

```typescript
// lib/api/products.ts
export class ProductAPI {
  private baseURL =
    'https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev';

  async getProducts(params?: ProductFilters): Promise<ProductResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseURL}/api/v1/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}
```

## 🗃️ Gestión de Estado

### **Zustand Stores**

#### **Cart Store**

```typescript
interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
```

#### **Auth Store**

```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

#### **Product Store**

```typescript
interface ProductStore {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  filters: ProductFilters;
  loading: boolean;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
}
```

## 🎨 Sistema de Diseño

### **Colores (Basado en las imágenes)**

```css
:root {
  --primary-blue: #1e40af; /* Azul principal */
  --secondary-yellow: #fbbf24; /* Amarillo secundario */
  --accent-green: #10b981; /* Verde para precios */
  --text-dark: #1f2937; /* Texto oscuro */
  --text-gray: #6b7280; /* Texto gris */
  --background-light: #f9fafb; /* Fondo claro */
  --white: #ffffff; /* Blanco */
  --border-light: #e5e7eb; /* Bordes claros */
}
```

### **Tipografía**

- **Headings**: Inter, Bold
- **Body**: Inter, Regular
- **Buttons**: Inter, Medium

### **Espaciado**

- **Base unit**: 4px
- **Common spacings**: 8px, 16px, 24px, 32px, 48px, 64px

## 📱 Responsive Design

### **Breakpoints**

```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### **Mobile First Approach**

- **Mobile**: Stack layout, simplified navigation
- **Tablet**: Two-column layouts, expanded navigation
- **Desktop**: Full grid layouts, sidebar navigation

## 🚀 Deployment en S3

### **Configuración de S3**

```json
{
  "bucket": "gamarriando-web",
  "region": "us-east-1",
  "website": {
    "indexDocument": "index.html",
    "errorDocument": "404.html"
  },
  "cors": {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"]
  }
}
```

### **Build y Deploy Script**

```json
{
  "scripts": {
    "build": "next build",
    "export": "next export",
    "deploy": "npm run build && npm run export && aws s3 sync out/ s3://gamarriando-web --delete",
    "deploy:dev": "npm run build && npm run export && aws s3 sync out/ s3://gamarriando-web-dev --delete"
  }
}
```

### **CDN Configuration**

- **CloudFront Distribution** para mejorar performance
- **Custom Domain**: `gamarriando.com`
- **SSL Certificate** via AWS Certificate Manager

## 🧪 Testing Strategy

### **Testing Stack**

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0"
  }
}
```

### **Test Coverage**

- **Unit Tests**: Componentes individuales
- **Integration Tests**: Flujos completos
- **E2E Tests**: Cypress para flujos críticos
- **API Tests**: Validación de endpoints

## 📊 Performance Optimization

### **NextJS Optimizations**

- **Image Optimization**: `next/image` para imágenes
- **Code Splitting**: Lazy loading de componentes
- **Static Generation**: ISG para páginas de productos
- **API Caching**: React Query para cache de datos

### **Bundle Optimization**

- **Tree Shaking**: Eliminar código no usado
- **Compression**: Gzip/Brotli compression
- **Minification**: CSS y JS minificados
- **CDN**: CloudFront para assets estáticos

## 🔒 Seguridad

### **Frontend Security**

- **XSS Protection**: Sanitización de inputs
- **CSRF Protection**: Tokens CSRF
- **Content Security Policy**: Headers de seguridad
- **HTTPS Only**: Redirección automática

### **API Security**

- **JWT Tokens**: Autenticación segura
- **Rate Limiting**: Prevenir abuse
- **Input Validation**: Validación en cliente y servidor

## 📈 Analytics y Monitoreo

### **Analytics**

- **Google Analytics**: Tracking de usuarios
- **Hotjar**: Heatmaps y grabaciones
- **Conversion Tracking**: E-commerce tracking

### **Error Monitoring**

- **Sentry**: Error tracking y reporting
- **AWS CloudWatch**: Logs y métricas
- **Performance Monitoring**: Core Web Vitals

## 🗓️ Cronograma de Desarrollo

### **Fase 1: Setup y Componentes Base (Semana 1-2)**

- ✅ Configuración de NextJS
- ✅ Setup de Tailwind CSS
- ✅ Componentes UI base
- ✅ Sistema de routing

### **Fase 2: Páginas Principales (Semana 3-4)**

- ✅ Homepage completa
- ✅ Página de productos
- ✅ Página de categorías
- ✅ Integración con APIs

### **Fase 3: Funcionalidades Avanzadas (Semana 5-6)**

- ✅ Carrito de compras
- ✅ Autenticación
- ✅ Proceso de checkout
- ✅ Gestión de perfil

### **Fase 4: Optimización y Deploy (Semana 7-8)**

- ✅ Testing completo
- ✅ Performance optimization
- ✅ Deploy a S3
- ✅ Configuración de CDN

## 🎯 Métricas de Éxito

### **Performance**

- **Lighthouse Score**: >90 en todas las métricas
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

### **User Experience**

- **Conversion Rate**: >3%
- **Cart Abandonment**: <70%
- **Page Load Time**: <3s
- **Mobile Usability**: 100%

### **Technical**

- **Test Coverage**: >80%
- **Bundle Size**: <500KB gzipped
- **API Response Time**: <500ms
- **Uptime**: >99.9%

## 📚 Recursos y Referencias

### **Documentación**

- [NextJS 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)

### **APIs Disponibles**

- [Product Service API](./services/product-service/API_ENDPOINTS.md)
- [User Service Architecture](./services/user-service/ARCHITECTURE.md)
- [Payment Service Documentation](./services/payment-service/README.md)

### **Diseño**

- [Figma Design System](https://figma.com/gamarriando-design-system)
- [Brand Guidelines](./docs/BRAND_GUIDELINES.md)
- [Component Library](./docs/COMPONENT_LIBRARY.md)

---

**Gamarriando Frontend Development Plan** - Versión 1.0 📚
