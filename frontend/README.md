# 🎨 Frontend Gamarriando

**Marketplace de Streetwear Peruano - Interfaz de Usuario**

## 📋 Resumen

El frontend de Gamarriando es una aplicación web moderna construida con **NextJS 14** que permite a los usuarios explorar, comprar y gestionar productos de streetwear peruano. La aplicación está optimizada para performance, SEO y experiencia de usuario.

## 🏗️ Arquitectura

### **Stack Tecnológico**

- **Framework**: NextJS 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Data Fetching**: React Query
- **HTTP Client**: Axios
- **Testing**: Jest + Testing Library + Cypress

### **Hosting y Deployment**

- **Hosting**: Amazon S3 (gamarriando-web)
- **CDN**: CloudFront
- **DNS**: Route 53
- **SSL**: AWS Certificate Manager
- **CI/CD**: GitHub Actions

## 🚀 Inicio Rápido

### **Prerrequisitos**

- Node.js 18+
- npm o yarn
- AWS CLI (para deployment)

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/gamarriando/frontend.git
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en modo desarrollo
npm run dev
```

### **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run test         # Tests unitarios
npm run test:e2e     # Tests E2E

# Deployment
npm run deploy       # Deploy a producción
npm run deploy:staging # Deploy a staging
npm run invalidate   # Invalidar CloudFront cache
```

## 📁 Estructura del Proyecto

```
frontend/
├── app/                          # NextJS App Router
│   ├── (auth)/                   # Rutas de autenticación
│   ├── (main)/                   # Rutas principales
│   ├── api/                      # API routes
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes base
│   ├── layout/                   # Componentes de layout
│   ├── product/                  # Componentes de productos
│   ├── cart/                     # Componentes de carrito
│   └── auth/                     # Componentes de autenticación
├── lib/                          # Utilidades y configuración
│   ├── api/                      # Clientes API
│   ├── store/                    # Gestión de estado
│   ├── utils/                    # Funciones utilitarias
│   └── types/                    # Tipos TypeScript
├── hooks/                        # Custom React hooks
├── styles/                       # Estilos globales
├── public/                       # Assets estáticos
└── docs/                         # Documentación
```

## 🎨 Componentes Principales

### **Layout Components**

- **Header**: Navegación principal con logo, búsqueda y auth
- **Footer**: Información de la empresa y enlaces
- **Navigation**: Menú de categorías y navegación
- **Sidebar**: Filtros y navegación secundaria

### **Product Components**

- **ProductCard**: Tarjeta de producto con información completa
- **ProductList**: Lista de productos con grid responsivo
- **ProductFilters**: Filtros laterales para productos
- **ProductDetails**: Página de detalle de producto

### **Cart Components**

- **CartDrawer**: Drawer lateral del carrito
- **CartItem**: Item individual del carrito
- **CartSummary**: Resumen del carrito con totales
- **QuantitySelector**: Selector de cantidad

### **Auth Components**

- **LoginForm**: Formulario de login
- **RegisterForm**: Formulario de registro
- **UserMenu**: Menú de usuario autenticado
- **ProtectedRoute**: Ruta protegida por autenticación

## 🔌 Integración con APIs

### **Product Service**

```typescript
// Obtener productos
const { data: products } = useProducts(filters);

// Obtener producto específico
const { data: product } = useProduct(productId);
```

### **User Service**

```typescript
// Login
const login = useLogin();
await login.mutateAsync({ email, password });

// Obtener perfil
const { data: profile } = useProfile();
```

### **Payment Service**

```typescript
// Crear orden
const createOrder = useCreateOrder();
await createOrder.mutateAsync(orderData);

// Procesar pago
const processPayment = useProcessPayment();
await processPayment.mutateAsync(paymentData);
```

## 🎯 Funcionalidades

### **Catálogo de Productos**

- ✅ Lista de productos con paginación
- ✅ Filtrado por categorías, precios y vendedores
- ✅ Búsqueda de productos
- ✅ Ordenamiento por precio, nombre, fecha
- ✅ Vista de detalle de producto

### **Carrito de Compras**

- ✅ Agregar/remover productos
- ✅ Actualizar cantidades
- ✅ Persistencia en localStorage
- ✅ Cálculo de totales
- ✅ Aplicación de cupones

### **Autenticación**

- ✅ Login/registro de usuarios
- ✅ Recuperación de contraseña
- ✅ Gestión de sesiones
- ✅ Perfil de usuario
- ✅ Historial de órdenes

### **Checkout**

- ✅ Formulario de envío
- ✅ Selección de método de pago
- ✅ Confirmación de orden
- ✅ Integración con pasarela de pagos

## 🎨 Sistema de Diseño

### **Colores**

```css
:root {
  --primary-blue: #1e40af; /* Azul principal */
  --secondary-yellow: #fbbf24; /* Amarillo secundario */
  --accent-green: #10b981; /* Verde para precios */
  --text-dark: #1f2937; /* Texto oscuro */
  --text-gray: #6b7280; /* Texto gris */
  --background-light: #f9fafb; /* Fondo claro */
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

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### **Mobile First**

- Diseño optimizado para móviles
- Navegación adaptativa
- Touch-friendly interfaces
- Performance optimizada

## 🧪 Testing

### **Unit Tests**

```bash
npm run test
```

### **E2E Tests**

```bash
npm run test:e2e
```

### **Coverage**

```bash
npm run test:coverage
```

## 🚀 Deployment

### **Desarrollo**

```bash
npm run dev
```

### **Producción**

```bash
npm run build
npm run deploy
```

### **Staging**

```bash
npm run deploy:staging
```

## 📊 Performance

### **Métricas Objetivo**

- **Lighthouse Score**: > 90
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### **Optimizaciones**

- ✅ Image optimization con next/image
- ✅ Code splitting y lazy loading
- ✅ Bundle optimization
- ✅ CDN con CloudFront
- ✅ Gzip/Brotli compression

## 🔒 Seguridad

### **Frontend Security**

- ✅ XSS protection
- ✅ CSRF protection
- ✅ Content Security Policy
- ✅ HTTPS only
- ✅ Secure headers

### **API Security**

- ✅ JWT authentication
- ✅ Token refresh
- ✅ Rate limiting
- ✅ Input validation

## 📈 Analytics y Monitoreo

### **Google Analytics**

- Tracking de usuarios
- E-commerce tracking
- Conversion tracking
- Custom events

### **Error Monitoring**

- Sentry integration
- Error tracking
- Performance monitoring
- User feedback

## 🤝 Contribución

### **Git Flow**

1. Crear feature branch
2. Desarrollar funcionalidad
3. Ejecutar tests
4. Crear pull request
5. Code review
6. Merge a main

### **Estándares de Código**

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Conventional commits

## 📚 Documentación

### **Documentos Principales**

- [Plan de Desarrollo](./FRONTEND_PLAN.md)
- [Roadmap de Implementación](./IMPLEMENTATION_ROADMAP.md)
- [Plan de Integración API](./API_INTEGRATION_PLAN.md)
- [Plan de Deployment](./DEPLOYMENT_PLAN.md)

### **APIs Disponibles**

- [Product Service API](../services/product-service/API_ENDPOINTS.md)
- [User Service Architecture](../services/user-service/ARCHITECTURE.md)
- [Payment Service Documentation](../services/payment-service/README.md)

## 🆘 Soporte

### **Issues**

- Crear issue en GitHub
- Describir problema detalladamente
- Incluir pasos para reproducir
- Adjuntar screenshots si es necesario

### **Contacto**

- **Email**: dev@gamarriando.com
- **Slack**: #frontend-team
- **Documentación**: [docs.gamarriando.com](https://docs.gamarriando.com)

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para más detalles.

---

**Gamarriando Frontend** - Marketplace de Streetwear Peruano 🎨
