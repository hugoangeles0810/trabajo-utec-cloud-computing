# Sistema de Tipografía y Espaciado - Gamarriando

## Resumen

El sistema de tipografía y espaciado de Gamarriando está diseñado para crear una experiencia visual consistente y profesional en todo el marketplace. Utiliza la fuente Inter como tipografía principal y un sistema de espaciado basado en una cuadrícula de 4px para mantener la coherencia visual.

## Sistema de Tipografía

### 🎨 Fuentes

#### Inter (Fuente Principal)

- **Uso**: Texto del cuerpo, navegación, botones, formularios
- **Características**: Moderna, legible, optimizada para pantallas
- **Fallbacks**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

#### JetBrains Mono (Fuente Monoespaciada)

- **Uso**: Código, datos técnicos, precios
- **Características**: Monoespaciada, clara, fácil de leer
- **Fallbacks**: Fira Code, Monaco, Consolas

### 📏 Escalas de Tamaño

#### Display (Títulos y Encabezados)

- **Display 2XL**: 72px (4.5rem) - Títulos principales
- **Display XL**: 60px (3.75rem) - Títulos de sección
- **Display LG**: 48px (3rem) - Títulos de página
- **Display MD**: 36px (2.25rem) - Subtítulos
- **Display SM**: 30px (1.875rem) - Encabezados de tarjeta
- **Display XS**: 24px (1.5rem) - Encabezados pequeños

#### Text (Texto del Cuerpo)

- **Text XL**: 20px (1.25rem) - Texto grande
- **Text LG**: 18px (1.125rem) - Texto medio-grande
- **Text MD**: 16px (1rem) - Texto estándar
- **Text SM**: 14px (0.875rem) - Texto pequeño
- **Text XS**: 12px (0.75rem) - Texto muy pequeño

### ⚖️ Pesos de Fuente

- **Thin**: 100 - Texto muy ligero
- **Extra Light**: 200 - Texto ligero
- **Light**: 300 - Texto claro
- **Normal**: 400 - Texto estándar
- **Medium**: 500 - Texto medio
- **Semibold**: 600 - Texto semi-negrita
- **Bold**: 700 - Texto negrita
- **Extra Bold**: 800 - Texto muy negrita
- **Black**: 900 - Texto negro

### 📐 Alturas de Línea

- **None**: 1 - Sin espaciado entre líneas
- **Tight**: 1.25 - Espaciado ajustado
- **Snug**: 1.375 - Espaciado cómodo
- **Normal**: 1.5 - Espaciado estándar
- **Relaxed**: 1.625 - Espaciado relajado
- **Loose**: 2 - Espaciado amplio

### 🔤 Espaciado de Letras

- **Tighter**: -0.05em - Muy ajustado
- **Tight**: -0.025em - Ajustado
- **Normal**: 0em - Estándar
- **Wide**: 0.025em - Amplio
- **Wider**: 0.05em - Más amplio
- **Widest**: 0.1em - Muy amplio

## Sistema de Espaciado

### 📐 Cuadrícula Base

El sistema está basado en una cuadrícula de 4px para mantener la consistencia:

- **0.5**: 2px
- **1**: 4px
- **1.5**: 6px
- **2**: 8px
- **2.5**: 10px
- **3**: 12px
- **3.5**: 14px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px
- **24**: 96px
- **32**: 128px

### 🎯 Espaciado Semántico

#### Componentes

- **Tight**: 4px - Espaciado interno mínimo
- **Normal**: 8px - Espaciado interno estándar
- **Relaxed**: 16px - Espaciado interno cómodo
- **Loose**: 24px - Espaciado interno amplio

#### Layout

- **Section**: 64px - Espaciado entre secciones
- **Container**: 32px - Espaciado de contenedores
- **Grid**: 24px - Espaciado de cuadrículas
- **Card**: 16px - Espaciado de tarjetas

#### Formularios

- **Field**: 12px - Espaciado entre campos
- **Group**: 24px - Espaciado entre grupos
- **Section**: 32px - Espaciado entre secciones

#### Navegación

- **Item**: 16px - Espaciado entre elementos
- **Group**: 24px - Espaciado entre grupos
- **Section**: 32px - Espaciado entre secciones

#### Productos

- **Grid**: 24px - Espaciado de cuadrícula de productos
- **Card**: 16px - Espaciado de tarjetas de producto
- **Detail**: 32px - Espaciado de detalles de producto

## Implementación

### Tailwind CSS

#### Tipografía

```css
/* Display sizes */
.text-display-2xl {
  font-size: 4.5rem;
  line-height: 1.1;
}
.text-display-xl {
  font-size: 3.75rem;
  line-height: 1.1;
}
.text-display-lg {
  font-size: 3rem;
  line-height: 1.15;
}

/* Text sizes */
.text-text-xl {
  font-size: 1.25rem;
  line-height: 1.5;
}
.text-text-lg {
  font-size: 1.125rem;
  line-height: 1.5;
}
.text-text-md {
  font-size: 1rem;
  line-height: 1.5;
}
```

#### Espaciado

```css
/* Padding */
.p-4 {
  padding: 1rem;
} /* 16px */
.p-6 {
  padding: 1.5rem;
} /* 24px */
.p-8 {
  padding: 2rem;
} /* 32px */

/* Margin */
.m-4 {
  margin: 1rem;
} /* 16px */
.m-6 {
  margin: 1.5rem;
} /* 24px */
.m-8 {
  margin: 2rem;
} /* 32px */

/* Gap */
.gap-4 {
  gap: 1rem;
} /* 16px */
.gap-6 {
  gap: 1.5rem;
} /* 24px */
.gap-8 {
  gap: 2rem;
} /* 32px */
```

### CSS Custom Properties

#### Tipografía

```css
:root {
  --font-family-sans: Inter, -apple-system, BlinkMacSystemFont, ...;
  --font-size-display-xl: 3.75rem;
  --font-size-text-lg: 1.125rem;
  --font-weight-semibold: 600;
  --line-height-normal: 1.5;
  --letter-spacing-tight: -0.025em;
}
```

#### Espaciado

```css
:root {
  --spacing-4: 1rem; /* 16px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-layout-section: 4rem; /* 64px */
}
```

### JavaScript/TypeScript

```typescript
import { TYPOGRAPHY, SPACING } from '@/lib/constants';

// Usar constantes de tipografía
const headingStyle = {
  fontSize: TYPOGRAPHY.FONT_SIZES.DISPLAY_XL,
  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT,
};

// Usar constantes de espaciado
const containerStyle = {
  padding: SPACING.BASE[8], // 32px
  margin: SPACING.BASE[16], // 64px
};
```

## Clases de Utilidad

### Tipografía

#### Encabezados

```html
<h1 class="heading-1">Título Principal</h1>
<h2 class="heading-2">Título de Sección</h2>
<h3 class="heading-3">Título de Página</h3>
<h4 class="heading-4">Subtítulo</h4>
<h5 class="heading-5">Encabezado de Tarjeta</h5>
<h6 class="heading-6">Encabezado Pequeño</h6>
```

#### Texto del Cuerpo

```html
<p class="body-large">Texto grande para contenido importante</p>
<p class="body-medium">Texto estándar para contenido regular</p>
<p class="body-small">Texto pequeño para información secundaria</p>
```

#### Etiquetas y Captiones

```html
<span class="label">Etiqueta de campo</span>
<span class="label-small">Etiqueta pequeña</span>
<p class="caption">Texto de ayuda o información adicional</p>
<p class="caption-large">Captión grande</p>
```

#### Enlaces

```html
<a href="#" class="link">Enlace estándar</a>
<a href="#" class="link-small">Enlace pequeño</a>
```

#### Código

```html
<code class="code">código inline</code>
<pre class="code-block">bloque de código</pre>
```

### Espaciado

#### Contenedores

```html
<div class="spacing-section">Sección con espaciado estándar</div>
<div class="spacing-container">Contenedor con espaciado interno</div>
<div class="spacing-card">Tarjeta con espaciado apropiado</div>
```

#### Formularios

```html
<form class="spacing-form">
  <div class="form-group-spacing">
    <input class="spacing-input" />
  </div>
</form>
```

#### Botones

```html
<button class="spacing-button">Botón estándar</button>
<button class="spacing-button-sm">Botón pequeño</button>
<button class="spacing-button-lg">Botón grande</button>
```

#### Cuadrículas

```html
<div class="grid grid-cols-3 gap-layout-grid">
  <div class="spacing-card">Elemento 1</div>
  <div class="spacing-card">Elemento 2</div>
  <div class="spacing-card">Elemento 3</div>
</div>
```

#### Stacks (Espaciado Vertical)

```html
<div class="stack-normal">
  <p>Primer elemento</p>
  <p>Segundo elemento</p>
  <p>Tercer elemento</p>
</div>
```

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Ajustes Responsivos

#### Tipografía

```css
@media (max-width: 640px) {
  .heading-1 {
    font-size: 3rem;
  } /* Reduce de 4.5rem */
  .heading-2 {
    font-size: 2.5rem;
  } /* Reduce de 3.75rem */
}
```

#### Espaciado

```css
@media (min-width: 640px) {
  .spacing-section {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .spacing-section {
    padding: 4rem 2rem;
  }
}
```

## Mejores Prácticas

### ✅ Tipografía

- Usar escalas de display para títulos y encabezados
- Mantener consistencia en pesos de fuente
- Asegurar legibilidad con alturas de línea apropiadas
- Usar espaciado de letras para mejorar legibilidad

### ✅ Espaciado

- Seguir la cuadrícula de 4px
- Usar espaciado semántico para diferentes contextos
- Mantener consistencia en espaciado relacionado
- Considerar espaciado responsivo

### ❌ Evitar

- Mezclar diferentes sistemas de espaciado
- Usar tamaños de fuente inconsistentes
- Ignorar la jerarquía tipográfica
- Sobrecargar con demasiado espaciado

## Accesibilidad

### Contraste

- Todos los tamaños de fuente cumplen con WCAG AA
- Alturas de línea optimizadas para legibilidad
- Espaciado adecuado para usuarios con dislexia

### Responsive

- Tipografía que escala apropiadamente
- Espaciado que se adapta a diferentes pantallas
- Texto que permanece legible en todos los dispositivos

## Herramientas

### Generadores

- [Type Scale](https://type-scale.com/) - Para generar escalas tipográficas
- [Modular Scale](https://www.modularscale.com/) - Para proporciones matemáticas

### Referencias

- [Inter Font](https://rsms.me/inter/) - Documentación oficial
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [WCAG Typography Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Diseño Gamarriando
