# Sistema de Breakpoints Responsivos - Gamarriando

## Resumen

El sistema de breakpoints responsivos de Gamarriando está diseñado para proporcionar una experiencia de usuario consistente y optimizada en todos los dispositivos. Utiliza un enfoque mobile-first con breakpoints específicos para diferentes tipos de dispositivos y casos de uso.

## Breakpoints del Sistema

### 📱 **Breakpoints Estándar**

```css
xs: 475px   /* Extra small devices */
sm: 640px   /* Small devices (tablets) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### 📱 **Breakpoints Móviles**

```css
mobile-sm: 320px  /* iPhone SE, Android pequeños */
mobile-md: 375px  /* iPhone 12/13/14 */
mobile-lg: 414px  /* iPhone 12/13/14 Pro Max */
```

### 📱 **Breakpoints Tablets**

```css
tablet-sm: 640px  /* Tablets pequeñas (iPad Mini) */
tablet-md: 768px  /* Tablets estándar (iPad) */
tablet-lg: 896px  /* Tablets grandes (iPad Pro) */
```

### 💻 **Breakpoints Desktop**

```css
desktop-sm: 1024px  /* Laptops pequeños */
desktop-md: 1280px  /* Laptops estándar */
desktop-lg: 1440px  /* Laptops grandes/desktops */
desktop-xl: 1920px  /* Monitores grandes */
```

### 📦 **Breakpoints Contenedor**

```css
container-sm: 640px
container-md: 768px
container-lg: 1024px
container-xl: 1280px
container-2xl: 1536px
```

## Breakpoints Especiales

### 🎯 **Orientación**

```css
portrait: (orientation: portrait)   /* Modo vertical */
landscape: (orientation: landscape) /* Modo horizontal */
```

### 🖥️ **Alta Densidad de Píxeles**

```css
retina: (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi);
```

### 🖨️ **Impresión**

```css
print: print;
```

### ♿ **Accesibilidad**

```css
motion-reduce: (prefers-reduced-motion: reduce)  /* Animaciones reducidas */
dark: (prefers-color-scheme: dark)              /* Modo oscuro */
```

## Configuración de Contenedores

### 📦 **Contenedor Responsivo**

```css
.container {
  center: true;
  padding: {
    DEFAULT: '1rem',
    sm: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem',
  };
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
}
```

## Sistemas de Cuadrícula Responsivos

### 🛍️ **Cuadrícula de Productos**

```css
/* Mobile: 2 columnas */
/* Tablet: 3 columnas */
/* Desktop: 4 columnas */
/* Wide: 5 columnas */
grid-products-mobile: repeat(2, 1fr)
grid-products-tablet: repeat(3, 1fr)
grid-products-desktop: repeat(4, 1fr)
grid-products-wide: repeat(5, 1fr)
```

### 📂 **Cuadrícula de Categorías**

```css
/* Mobile: 3 columnas */
/* Tablet: 4 columnas */
/* Desktop: 6 columnas */
/* Wide: 8 columnas */
grid-categories-mobile: repeat(3, 1fr)
grid-categories-tablet: repeat(4, 1fr)
grid-categories-desktop: repeat(6, 1fr)
grid-categories-wide: repeat(8, 1fr)
```

### ⭐ **Cuadrícula de Características**

```css
/* Mobile: 1 columna */
/* Tablet: 2 columnas */
/* Desktop: 3 columnas */
grid-features-mobile: 1fr
grid-features-tablet: repeat(2, 1fr)
grid-features-desktop: repeat(3, 1fr)
```

### 🧭 **Cuadrícula de Navegación**

```css
/* Mobile: 1 columna */
/* Tablet: 2 columnas */
/* Desktop: 4 columnas */
grid-nav-mobile: 1fr
grid-nav-tablet: repeat(2, 1fr)
grid-nav-desktop: repeat(4, 1fr)
```

## Utilidades CSS Responsivas

### 📦 **Contenedores**

```html
<div class="container-responsive">Contenedor responsivo</div>
<div class="container-fluid">Contenedor fluido</div>
<div class="container-narrow">Contenedor estrecho</div>
<div class="container-wide">Contenedor ancho</div>
```

### 🔲 **Cuadrículas**

```html
<div class="grid-responsive-products">Productos responsivos</div>
<div class="grid-responsive-categories">Categorías responsivas</div>
<div class="grid-responsive-features">Características responsivas</div>
<div class="grid-responsive-navigation">Navegación responsiva</div>
```

### 📐 **Flexbox**

```html
<div class="flex-responsive">Flex responsivo</div>
<div class="flex-responsive-center">Flex centrado</div>
<div class="flex-responsive-between">Flex entre elementos</div>
<div class="flex-responsive-start">Flex inicio</div>
<div class="flex-responsive-end">Flex final</div>
```

### 📏 **Espaciado**

```html
<div class="spacing-responsive-section">Sección responsiva</div>
<div class="spacing-responsive-container">Contenedor responsivo</div>
<div class="spacing-responsive-card">Tarjeta responsiva</div>
<div class="spacing-responsive-grid">Cuadrícula responsiva</div>
```

### 🔤 **Tipografía**

```html
<h1 class="heading-responsive-1">Título responsivo 1</h1>
<h2 class="heading-responsive-2">Título responsivo 2</h3>
<h3 class="heading-responsive-3">Título responsivo 3</h3>

<p class="body-responsive-large">Texto grande responsivo</p>
<p class="body-responsive-medium">Texto medio responsivo</p>
<p class="body-responsive-small">Texto pequeño responsivo</p>
```

### 🔘 **Botones**

```html
<button class="btn-responsive-sm">Botón pequeño</button>
<button class="btn-responsive-md">Botón mediano</button>
<button class="btn-responsive-lg">Botón grande</button>
```

### 🖼️ **Imágenes**

```html
<img class="img-responsive" src="image.jpg" alt="Imagen responsiva" />
<img class="img-responsive-square" src="image.jpg" alt="Imagen cuadrada" />
<img class="img-responsive-video" src="image.jpg" alt="Imagen video" />
```

### 🃏 **Tarjetas**

```html
<div class="card-responsive">Tarjeta responsiva</div>
<div class="card-responsive-hover">Tarjeta con hover</div>
<div class="card-responsive-clickable">Tarjeta clickeable</div>
```

### 🧭 **Navegación**

```html
<nav class="nav-responsive">Navegación responsiva</nav>
<nav class="nav-responsive-mobile">Navegación móvil</nav>
<nav class="nav-responsive-desktop">Navegación desktop</nav>
```

### 📝 **Formularios**

```html
<form class="form-responsive">
  <div class="form-group-responsive">
    <input class="form-input-responsive" placeholder="Input responsivo" />
  </div>
</form>
```

### 🪟 **Modales**

```html
<div class="modal-responsive">
  <div class="modal-content-responsive">
    <div class="modal-header-responsive">Header</div>
    <div class="modal-body-responsive">Contenido</div>
    <div class="modal-footer-responsive">Footer</div>
  </div>
</div>
```

### 📊 **Tablas**

```html
<div class="table-responsive">
  <table class="table-responsive-container">
    <thead class="table-responsive-header">
      <tr>
        <th class="table-responsive-cell">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="table-responsive-cell">Celda</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Hooks de React

### 🎯 **useBreakpoint**

```typescript
import { useBreakpoint } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const {
    breakpoint,
    deviceType,
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop
  } = useBreakpoint();

  return (
    <div>
      <p>Breakpoint actual: {breakpoint}</p>
      <p>Tipo de dispositivo: {deviceType}</p>
      <p>Ancho: {screenWidth}px</p>
      <p>Alto: {screenHeight}px</p>
    </div>
  );
};
```

### 📱 **useMediaQuery**

```typescript
import { useMediaQuery } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { matches: isMobile } = useMediaQuery('(max-width: 640px)');
  const { matches: isTablet } = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  return (
    <div>
      {isMobile && <div>Contenido móvil</div>}
      {isTablet && <div>Contenido tablet</div>}
    </div>
  );
};
```

### 📐 **useOrientation**

```typescript
import { useOrientation } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { orientation, isPortrait, isLandscape } = useOrientation();

  return (
    <div>
      <p>Orientación: {orientation}</p>
      {isPortrait && <div>Modo vertical</div>}
      {isLandscape && <div>Modo horizontal</div>}
    </div>
  );
};
```

### ♿ **useReducedMotion**

```typescript
import { useReducedMotion } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { prefersReducedMotion, shouldReduceMotion } = useReducedMotion();

  return (
    <div className={shouldReduceMotion ? 'no-animation' : 'animate-bounce'}>
      Contenido con animación condicional
    </div>
  );
};
```

### 🌙 **useDarkMode**

```typescript
import { useDarkMode } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { prefersDarkMode, isDarkMode } = useDarkMode();

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      Contenido adaptable al modo oscuro
    </div>
  );
};
```

### 🔲 **useResponsiveGrid**

```typescript
import { useResponsiveGrid } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { gridColumns } = useResponsiveGrid('products');

  return (
    <div className={`grid ${gridColumns} gap-4`}>
      {/* Productos */}
    </div>
  );
};
```

### 📏 **useResponsiveSpacing**

```typescript
import { useResponsiveSpacing } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { spacing } = useResponsiveSpacing('section');

  return (
    <section className={spacing}>
      Contenido con espaciado responsivo
    </section>
  );
};
```

### 🔤 **useResponsiveTypography**

```typescript
import { useResponsiveTypography } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { typography } = useResponsiveTypography('heading');

  return (
    <h1 className={typography}>
      Título con tipografía responsiva
    </h1>
  );
};
```

## Patrones de Diseño Responsivo

### 📱 **Mobile-First**

```css
/* Base: Mobile */
.component {
  @apply text-sm p-4;
}

/* Tablet y superior */
@screen sm {
  .component {
    @apply text-base p-6;
  }
}

/* Desktop y superior */
@screen lg {
  .component {
    @apply text-lg p-8;
  }
}
```

### 🔄 **Progressive Enhancement**

```css
/* Base: Funcionalidad básica */
.button {
  @apply bg-primary-500 text-white px-4 py-2;
}

/* Mejoras para pantallas más grandes */
@screen md {
  .button {
    @apply hover:bg-primary-600 transition-colors;
  }
}

@screen lg {
  .button {
    @apply shadow-lg hover:shadow-xl;
  }
}
```

### 📐 **Fluid Typography**

```css
.heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.2;
}
```

### 🖼️ **Responsive Images**

```css
.image {
  @apply w-full h-auto;
  max-width: 100%;
  height: auto;
}

.image-container {
  @apply relative overflow-hidden;
  aspect-ratio: 16 / 9;
}
```

## Mejores Prácticas

### ✅ **Do's**

- Usar enfoque mobile-first
- Probar en dispositivos reales
- Considerar orientación del dispositivo
- Optimizar para touch en móviles
- Usar breakpoints semánticos
- Implementar lazy loading
- Considerar accesibilidad
- Usar unidades relativas

### ❌ **Don'ts**

- No usar breakpoints fijos
- No ignorar la orientación
- No asumir tamaños de pantalla
- No usar solo breakpoints de dispositivo
- No ignorar la accesibilidad
- No usar imágenes no optimizadas
- No ignorar el rendimiento
- No usar breakpoints no estándar

## Herramientas de Desarrollo

### 🛠️ **DevTools**

- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Web Inspector
- Edge DevTools

### 📱 **Dispositivos de Prueba**

- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPad (768px)
- iPad Pro (1024px)
- Laptop (1280px)
- Desktop (1920px)

### 🧪 **Herramientas de Testing**

- BrowserStack
- Sauce Labs
- LambdaTest
- CrossBrowserTesting

## Referencias

### 📚 **Documentación**

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)

### 🎨 **Diseño**

- [Material Design Responsive Layout](https://material.io/design/layout/responsive-layout-grid.html)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Design Guidelines](https://design.google/)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Diseño Gamarriando
