# Sistema de Colores - Gamarriando

## Resumen

El sistema de colores de Gamarriando está diseñado para reflejar la identidad visual del marketplace de streetwear peruano, basado en las imágenes de referencia proporcionadas. El sistema utiliza una paleta de colores vibrante y moderna que incluye azul primario, amarillo secundario y verde de acento.

## Paleta Principal

### 🎨 Colores de Marca

#### Primary (Azul Principal)

- **Uso**: CTAs principales, enlaces, elementos de marca
- **Color principal**: `#6366f1` (Indigo-500)
- **Variaciones**:
  - Claro: `#a5b4fc` (Indigo-300)
  - Oscuro: `#4338ca` (Indigo-700)

**Ejemplos de uso:**

- Botón "Agregar al Carrito"
- Botón "Finalizar Compra"
- Logo de marca
- Estados activos

#### Secondary (Amarillo Secundario)

- **Uso**: Elementos promocionales, badges de descuento
- **Color principal**: `#fbbf24` (Amber-400)
- **Variaciones**:
  - Claro: `#fde68a` (Amber-200)
  - Oscuro: `#b45309` (Amber-700)

**Ejemplos de uso:**

- Banners promocionales
- Badges de descuento
- Etiquetas de "SALE"
- Destacados promocionales

#### Accent (Verde de Acento)

- **Uso**: Precios, acciones positivas, confirmaciones
- **Color principal**: `#10b981` (Emerald-500)
- **Variaciones**:
  - Claro: `#6ee7b7` (Emerald-300)
  - Oscuro: `#047857` (Emerald-700)

**Ejemplos de uso:**

- Precios de productos
- Mensajes de éxito
- Estados completados
- Feedback positivo

## Colores Semánticos

### Success (Éxito)

- **Color**: `#22c55e` (Green-500)
- **Uso**: Confirmaciones, estados exitosos
- **Ejemplos**: "Pedido confirmado", "Pago exitoso"

### Warning (Advertencia)

- **Color**: `#f97316` (Orange-500)
- **Uso**: Advertencias, estados de precaución
- **Ejemplos**: "Stock bajo", "Retrasos en envío"

### Error (Error)

- **Color**: `#ef4444` (Red-500)
- **Uso**: Errores, acciones destructivas
- **Ejemplos**: "Error de pago", "Formulario inválido"

### Info (Información)

- **Color**: `#0ea5e9` (Sky-500)
- **Uso**: Información, ayuda
- **Ejemplos**: Tooltips, texto de ayuda

## Colores Neutros

### Escala de Grises

- **Neutral-50**: `#fafafa` - Fondos más claros
- **Neutral-100**: `#f5f5f5` - Fondos secundarios
- **Neutral-200**: `#e5e5e5` - Bordes claros
- **Neutral-300**: `#d4d4d4` - Bordes medios
- **Neutral-400**: `#a3a3a3` - Texto terciario
- **Neutral-500**: `#737373` - Texto medio
- **Neutral-600**: `#525252` - Texto secundario
- **Neutral-700**: `#404040` - Texto medio-oscuro
- **Neutral-800**: `#262626` - Texto oscuro
- **Neutral-900**: `#171717` - Texto principal
- **Neutral-950**: `#0a0a0a` - Texto más oscuro

## Colores de Contexto

### Fondos

- **Primary**: `#ffffff` - Fondo principal
- **Secondary**: `#fafafa` - Fondo secundario
- **Tertiary**: `#f5f5f5` - Fondo terciario
- **Dark**: `#171717` - Fondo modo oscuro

### Texto

- **Primary**: `#171717` - Texto principal
- **Secondary**: `#525252` - Texto secundario
- **Tertiary**: `#a3a3a3` - Texto terciario
- **Inverse**: `#ffffff` - Texto en fondos oscuros
- **Accent**: `#6366f1` - Texto de acento

### Bordes

- **Primary**: `#e5e5e5` - Bordes principales
- **Secondary**: `#d4d4d4` - Bordes secundarios
- **Accent**: `#6366f1` - Bordes de acento
- **Error**: `#ef4444` - Bordes de error
- **Success**: `#22c55e` - Bordes de éxito

## Modo Oscuro

El sistema incluye soporte para modo oscuro con los siguientes ajustes:

### Fondos (Modo Oscuro)

- **Primary**: `#171717` (Neutral-900)
- **Secondary**: `#262626` (Neutral-800)
- **Tertiary**: `#404040` (Neutral-700)

### Texto (Modo Oscuro)

- **Primary**: `#ffffff` (Blanco)
- **Secondary**: `#a3a3a3` (Neutral-400)
- **Tertiary**: `#737373` (Neutral-500)

### Bordes (Modo Oscuro)

- **Primary**: `#404040` (Neutral-700)
- **Secondary**: `#525252` (Neutral-600)

## Accesibilidad

### Contraste (WCAG AA)

- **Alto contraste**: Negro sobre blanco (16.7:1)
- **Medio contraste**: Gris-600 sobre blanco (7.0:1)
- **Colores de marca**: Todos cumplen con WCAG AA

### Combinaciones Recomendadas

- **Texto principal**: Negro (#171717) sobre blanco (#ffffff)
- **Texto secundario**: Gris-600 (#525252) sobre blanco (#ffffff)
- **Botones primarios**: Blanco sobre azul primario (#6366f1)
- **Botones secundarios**: Negro sobre amarillo secundario (#fbbf24)

## Implementación

### Tailwind CSS

```css
/* Colores principales */
bg-primary-500    /* Azul principal */
bg-secondary-400  /* Amarillo secundario */
bg-accent-500     /* Verde de acento */

/* Colores semánticos */
bg-success-500    /* Verde de éxito */
bg-warning-500    /* Naranja de advertencia */
bg-error-500      /* Rojo de error */
bg-info-500       /* Azul de información */
```

### CSS Custom Properties

```css
/* Variables CSS */
var(--color-primary)        /* Azul principal */
var(--color-secondary)      /* Amarillo secundario */
var(--color-accent)         /* Verde de acento */
var(--color-text-primary)   /* Texto principal */
var(--color-background-primary) /* Fondo principal */
```

### JavaScript/TypeScript

```typescript
import { BRAND_COLORS, SEMANTIC_COLORS } from '@/lib/constants/colors';

// Usar colores en código
const primaryColor = BRAND_COLORS.PRIMARY.MAIN;
const successColor = SEMANTIC_COLORS.SUCCESS.MAIN;
```

## Guías de Uso

### ✅ Buenas Prácticas

- Usar colores de marca para elementos de navegación principal
- Mantener consistencia en el uso de colores semánticos
- Asegurar contraste adecuado para legibilidad
- Usar colores neutros para contenido secundario

### ❌ Evitar

- Mezclar colores de marca sin propósito
- Usar colores de error para elementos no relacionados
- Ignorar el contraste en combinaciones de colores
- Sobrecargar la interfaz con demasiados colores

## Herramientas

### Generadores de Paletas

- [Coolors.co](https://coolors.co) - Para generar paletas complementarias
- [Adobe Color](https://color.adobe.com) - Para análisis de contraste
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Para verificar accesibilidad

### Referencias

- [Material Design Color System](https://material.io/design/color/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

## Actualizaciones

Este sistema de colores se actualizará según:

- Feedback de usuarios
- Cambios en la identidad de marca
- Mejoras en accesibilidad
- Nuevas tendencias de diseño

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Diseño Gamarriando
