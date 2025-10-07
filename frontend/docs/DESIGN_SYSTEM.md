# Sistema de Diseño - Gamarriando

## Resumen

El sistema de diseño de Gamarriando es un conjunto completo de tokens de diseño, componentes y utilidades que garantizan la consistencia visual y la experiencia de usuario en todo el marketplace. Está construido sobre Tailwind CSS y incluye patrones de diseño específicos para e-commerce.

## Arquitectura del Sistema

### 🎨 **Tokens de Diseño**

#### Border Radius

```css
/* Escala de border radius */
rounded-none    /* 0px */
rounded-sm      /* 2px */
rounded         /* 4px */
rounded-md      /* 6px */
rounded-lg      /* 8px */
rounded-xl      /* 12px */
rounded-2xl     /* 16px */
rounded-3xl     /* 24px */
rounded-4xl     /* 32px */
rounded-full    /* 9999px */
```

#### Box Shadows

```css
/* Sombras estándar */
shadow-none
shadow-xs       /* Sombra muy sutil */
shadow-sm       /* Sombra pequeña */
shadow          /* Sombra estándar */
shadow-md       /* Sombra media */
shadow-lg       /* Sombra grande */
shadow-xl       /* Sombra extra grande */
shadow-2xl      /* Sombra máxima */

/* Sombras personalizadas Gamarriando */
shadow-soft     /* Sombra suave para tarjetas */
shadow-medium   /* Sombra media para hover */
shadow-strong   /* Sombra fuerte para modales */

/* Sombras de colores */
shadow-primary-soft
shadow-secondary-soft
shadow-accent-soft
shadow-error-soft
shadow-success-soft
shadow-warning-soft
```

#### Animaciones

```css
/* Animaciones básicas */
animate-none
animate-spin
animate-ping
animate-pulse
animate-bounce

/* Animaciones personalizadas */
animate-fade-in
animate-fade-out
animate-slide-up
animate-slide-down
animate-slide-left
animate-slide-right
animate-scale-in
animate-scale-out
animate-bounce-soft
animate-shake
animate-wiggle

/* Animaciones de carga */
animate-loading-dots
animate-loading-spinner

/* Animaciones de hover */
animate-hover-lift
animate-hover-glow
```

#### Z-Index

```css
/* Sistema de capas */
z-auto
z-0, z-10, z-20, z-30, z-40, z-50
z-dropdown      /* 1000 */
z-sticky        /* 1020 */
z-fixed         /* 1030 */
z-modal         /* 1040 */
z-popover       /* 1050 */
z-tooltip       /* 1060 */
z-toast         /* 1070 */
```

#### Gradientes

```css
/* Gradientes estándar */
bg-gradient-radial
bg-gradient-conic

/* Gradientes personalizados Gamarriando */
bg-gradient-primary    /* Azul a púrpura */
bg-gradient-secondary  /* Amarillo a naranja */
bg-gradient-accent     /* Verde esmeralda */
bg-gradient-warm       /* Amarillo a rojo */
bg-gradient-cool       /* Azul a verde */
bg-gradient-sunset     /* Amarillo a púrpura */
```

## Componentes del Sistema

### 🔘 **Botones**

#### Variantes

```html
<!-- Botón primario -->
<button class="btn btn-primary">Agregar al carrito</button>

<!-- Botón secundario -->
<button class="btn btn-secondary">Ver detalles</button>

<!-- Botón outline -->
<button class="btn btn-outline">Cancelar</button>

<!-- Botón ghost -->
<button class="btn btn-ghost">Más opciones</button>

<!-- Botón destructivo -->
<button class="btn btn-destructive">Eliminar</button>
```

#### Tamaños

```html
<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary btn-md">Mediano</button>
<button class="btn btn-primary btn-lg">Grande</button>
```

### 📝 **Inputs**

#### Estados

```html
<!-- Input normal -->
<input class="input" placeholder="Buscar productos..." />

<!-- Input con error -->
<input class="input input-error" placeholder="Email" />

<!-- Input con éxito -->
<input class="input input-success" placeholder="Contraseña" />
```

### 🃏 **Tarjetas**

#### Tipos

```html
<!-- Tarjeta básica -->
<div class="card card-padding-md">
  <h3>Título</h3>
  <p>Contenido de la tarjeta</p>
</div>

<!-- Tarjeta con hover -->
<div class="card card-hover card-padding-lg">
  <h3>Tarjeta interactiva</h3>
  <p>Se eleva al hacer hover</p>
</div>

<!-- Tarjeta clickeable -->
<div class="card card-clickable card-padding-md">
  <h3>Tarjeta clickeable</h3>
  <p>Se escala al hacer clic</p>
</div>
```

### 🏷️ **Badges**

#### Variantes

```html
<!-- Badges de estado -->
<span class="badge badge-primary">Nuevo</span>
<span class="badge badge-secondary">Oferta</span>
<span class="badge badge-success">Disponible</span>
<span class="badge badge-warning">Poco stock</span>
<span class="badge badge-error">Agotado</span>
<span class="badge badge-info">Información</span>
```

### 🪟 **Modales**

#### Estructura

```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Título del modal</h2>
      <button>×</button>
    </div>
    <div class="modal-body">
      <p>Contenido del modal</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline">Cancelar</button>
      <button class="btn btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

## Patrones de Layout

### 📦 **Contenedores**

#### Contenedor principal

```html
<div class="container">
  <!-- Contenido centrado con padding responsivo -->
</div>
```

#### Sección

```html
<section class="section">
  <!-- Sección con espaciado estándar -->
</section>
```

### 🔲 **Grids**

#### Grid de productos

```html
<div class="grid-products">
  <!-- Grid responsivo para productos -->
</div>
```

#### Grid de categorías

```html
<div class="grid-categories">
  <!-- Grid responsivo para categorías -->
</div>
```

#### Grid de características

```html
<div class="grid-features">
  <!-- Grid para características -->
</div>
```

### 📐 **Flexbox**

#### Utilidades flex

```html
<!-- Centrar contenido -->
<div class="flex-center">Contenido centrado</div>

<!-- Espacio entre elementos -->
<div class="flex-between">
  <span>Izquierda</span>
  <span>Derecha</span>
</div>

<!-- Columna centrada -->
<div class="flex-col-center">
  <h2>Título</h2>
  <p>Descripción</p>
</div>
```

### 📚 **Stacks**

#### Espaciado vertical

```html
<!-- Stack normal -->
<div class="stack">
  <p>Elemento 1</p>
  <p>Elemento 2</p>
  <p>Elemento 3</p>
</div>

<!-- Stack pequeño -->
<div class="stack-sm">
  <span>Item 1</span>
  <span>Item 2</span>
</div>

<!-- Stack grande -->
<div class="stack-lg">
  <section>Sección 1</section>
  <section>Sección 2</section>
</div>
```

#### Espaciado horizontal

```html
<!-- Stack horizontal -->
<div class="stack-h">
  <button>Botón 1</button>
  <button>Botón 2</button>
</div>
```

## Componentes Específicos de E-commerce

### 🛍️ **Productos**

#### Tarjeta de producto

```html
<div class="product-card">
  <img class="product-image" src="product.jpg" alt="Producto" />
  <h3 class="product-title">Nombre del producto</h3>
  <div class="flex-between">
    <span class="product-price">$99.99</span>
    <span class="product-discount">-20%</span>
  </div>
  <div class="flex-between">
    <span class="product-price-original">$124.99</span>
    <button class="btn btn-primary btn-sm">Agregar</button>
  </div>
</div>
```

### 🧭 **Navegación**

#### Enlaces de navegación

```html
<nav>
  <a href="#" class="nav-link">Inicio</a>
  <a href="#" class="nav-link nav-link-active">Productos</a>
  <a href="#" class="nav-link">Categorías</a>
</nav>
```

#### Dropdown

```html
<div class="relative">
  <button>Menú</button>
  <div class="nav-dropdown">
    <a href="#" class="block px-4 py-2">Opción 1</a>
    <a href="#" class="block px-4 py-2">Opción 2</a>
  </div>
</div>
```

## Utilidades de Animación

### ✨ **Animaciones de entrada**

```html
<!-- Fade in -->
<div class="animate-enter">Aparece suavemente</div>

<!-- Slide up -->
<div class="animate-slide-up">Se desliza hacia arriba</div>

<!-- Scale in -->
<div class="animate-scale-in">Se escala al aparecer</div>
```

### 🎭 **Animaciones de hover**

```html
<!-- Hover lift -->
<div class="hover-lift">Se eleva al hacer hover</div>

<!-- Hover glow -->
<div class="hover-glow">Brilla al hacer hover</div>

<!-- Hover scale -->
<div class="hover-scale">Se escala al hacer hover</div>
```

### ⚡ **Estados de carga**

```html
<!-- Spinner de carga -->
<div class="loading-spinner">Cargando...</div>

<!-- Dots de carga -->
<div class="loading-dots">Procesando...</div>

<!-- Overlay de carga -->
<div class="loading-overlay">
  <div class="loading-spinner"></div>
</div>
```

## Utilidades de Accesibilidad

### 🎯 **Focus**

```html
<!-- Ring de focus estándar -->
<button class="focus-ring">Botón accesible</button>

<!-- Ring de focus con error -->
<input class="focus-ring-error" />

<!-- Ring de focus con éxito -->
<input class="focus-ring-success" />
```

### 👁️ **Screen Reader**

```html
<!-- Solo para lectores de pantalla -->
<span class="sr-only">Información adicional</span>

<!-- Focus visible -->
<button class="focus-visible">Botón con focus visible</button>
```

## Utilidades Responsivas

### 📱 **Texto responsivo**

```html
<p class="responsive-text">Se adapta al tamaño de pantalla</p>
```

### 📦 **Padding responsivo**

```html
<div class="responsive-padding">Espaciado adaptativo</div>
```

### 🔲 **Grid responsivo**

```html
<div class="grid responsive-grid">
  <!-- Grid que se adapta a diferentes pantallas -->
</div>
```

## Utilidades de Estado

### 🔴 **Estados visuales**

```html
<!-- Elemento deshabilitado -->
<button class="disabled">No disponible</button>

<!-- Elemento cargando -->
<div class="loading">Cargando...</div>

<!-- Estado de error -->
<input class="error" placeholder="Error" />

<!-- Estado de éxito -->
<input class="success" placeholder="Éxito" />

<!-- Estado de advertencia -->
<div class="warning">Advertencia</div>
```

## Modo Oscuro

### 🌙 **Utilidades de modo oscuro**

```html
<!-- Contenedor con modo oscuro -->
<div class="dark-mode">Contenido adaptable</div>

<!-- Tarjeta con modo oscuro -->
<div class="card dark-mode-card">Tarjeta oscura</div>

<!-- Input con modo oscuro -->
<input class="input dark-mode-input" />
```

## Utilidades de Impresión

### 🖨️ **Estilos de impresión**

```html
<!-- Oculto en impresión -->
<div class="print-hidden">Solo en pantalla</div>

<!-- Solo en impresión -->
<div class="print-only">Solo al imprimir</div>
```

## Mejores Prácticas

### ✅ **Do's**

- Usar las clases de utilidad del sistema de diseño
- Mantener consistencia en espaciado y tipografía
- Aplicar animaciones sutiles y funcionales
- Considerar accesibilidad en todos los componentes
- Usar estados de carga apropiados
- Implementar feedback visual para interacciones

### ❌ **Don'ts**

- No crear estilos personalizados fuera del sistema
- No usar colores que no estén en la paleta
- No aplicar animaciones excesivas o molestas
- No ignorar los estados de focus
- No usar tamaños de fuente inconsistentes
- No mezclar diferentes sistemas de espaciado

## Implementación

### Tailwind CSS

```css
/* Las clases están disponibles automáticamente */
.btn-primary {
  /* Estilos aplicados */
}
.card-hover {
  /* Estilos aplicados */
}
.animate-fade-in {
  /* Animación aplicada */
}
```

### CSS Custom Properties

```css
:root {
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07);
  --animation-fade-in: fadeIn 0.5s ease-in-out;
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}
```

### JavaScript/TypeScript

```typescript
import { DESIGN_SYSTEM } from '@/lib/constants';

const buttonStyle = {
  boxShadow: DESIGN_SYSTEM.BOX_SHADOW.SOFT,
  animation: DESIGN_SYSTEM.ANIMATION.FADE_IN,
  backgroundImage: DESIGN_SYSTEM.GRADIENTS.PRIMARY,
};
```

## Herramientas

### Generadores

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Headless UI](https://headlessui.com/) - Componentes sin estilos
- [Radix UI](https://www.radix-ui.com/) - Componentes primitivos

### Referencias

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design System Best Practices](https://designsystemsrepo.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Diseño Gamarriando
