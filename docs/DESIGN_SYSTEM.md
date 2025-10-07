# 🎨 Sistema de Diseño - Gamarriando

Guía completa del sistema de diseño para el marketplace de streetwear peruano Gamarriando.

## 🎯 Principios de Diseño

### **Identidad Visual**
- **Moderno y Minimalista**: Diseño limpio que destaca los productos
- **Peruano y Auténtico**: Elementos que reflejan la cultura peruana
- **Streetwear**: Estética urbana y contemporánea
- **Accesible**: Diseño inclusivo para todos los usuarios

### **Valores de Marca**
- **Autenticidad**: Productos genuinos de diseñadores peruanos
- **Calidad**: Estándares altos en diseño y materiales
- **Comunidad**: Conectar diseñadores con consumidores
- **Innovación**: Tecnología moderna para experiencia superior

## 🎨 Paleta de Colores

### **Colores Primarios**
```css
:root {
  /* Azul Principal - Confianza y Profesionalismo */
  --primary-blue: #1e40af;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1e3a8a;
  
  /* Amarillo Secundario - Energía y Optimismo */
  --secondary-yellow: #fbbf24;
  --secondary-yellow-light: #fcd34d;
  --secondary-yellow-dark: #f59e0b;
}
```

### **Colores de Acento**
```css
:root {
  /* Verde - Éxito y Precios */
  --accent-green: #10b981;
  --accent-green-light: #34d399;
  --accent-green-dark: #059669;
  
  /* Rojo - Alertas y Errores */
  --accent-red: #ef4444;
  --accent-red-light: #f87171;
  --accent-red-dark: #dc2626;
  
  /* Naranja - Advertencias */
  --accent-orange: #f97316;
  --accent-orange-light: #fb923c;
  --accent-orange-dark: #ea580c;
}
```

### **Colores Neutros**
```css
:root {
  /* Grises para Texto */
  --text-dark: #1f2937;
  --text-gray: #6b7280;
  --text-light: #9ca3af;
  --text-muted: #d1d5db;
  
  /* Fondos */
  --background-white: #ffffff;
  --background-light: #f9fafb;
  --background-gray: #f3f4f6;
  --background-dark: #111827;
  
  /* Bordes */
  --border-light: #e5e7eb;
  --border-gray: #d1d5db;
  --border-dark: #9ca3af;
}
```

### **Colores Semánticos**
```css
:root {
  /* Estados */
  --success: var(--accent-green);
  --warning: var(--accent-orange);
  --error: var(--accent-red);
  --info: var(--primary-blue);
  
  /* Hover States */
  --hover-primary: #1d4ed8;
  --hover-secondary: #f59e0b;
  --hover-success: #059669;
  --hover-error: #dc2626;
}
```

## 📝 Tipografía

### **Fuentes**
```css
/* Fuente Principal - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### **Escala Tipográfica**
```css
:root {
  /* Tamaños de Fuente */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  
  /* Pesos de Fuente */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Altura de Línea */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### **Jerarquía Tipográfica**
```css
/* Headings */
.heading-1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-dark);
}

.heading-2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-dark);
}

.heading-3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--text-dark);
}

.heading-4 {
  font-size: var(--text-2xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--text-dark);
}

/* Body Text */
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-gray);
}

.body-base {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-gray);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-light);
}
```

## 📏 Espaciado

### **Sistema de Espaciado**
```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### **Aplicación de Espaciado**
```css
/* Padding */
.p-4 { padding: var(--space-4); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }

/* Margin */
.m-4 { margin: var(--space-4); }
.mx-4 { margin-left: var(--space-4); margin-right: var(--space-4); }
.my-4 { margin-top: var(--space-4); margin-bottom: var(--space-4); }

/* Gap */
.gap-4 { gap: var(--space-4); }
.gap-x-4 { column-gap: var(--space-4); }
.gap-y-4 { row-gap: var(--space-4); }
```

## 🧩 Componentes

### **Botones**

#### **Botón Primario**
```css
.btn-primary {
  background-color: var(--primary-blue);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--hover-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}
```

#### **Botón Secundario**
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: 2px solid var(--primary-blue);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--primary-blue);
  color: white;
}
```

#### **Botón de Acción**
```css
.btn-action {
  background-color: var(--secondary-yellow);
  color: var(--text-dark);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background-color: var(--hover-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}
```

### **Cards**

#### **Product Card**
```css
.product-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-card-content {
  padding: var(--space-4);
}

.product-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-dark);
  margin-bottom: var(--space-2);
}

.product-card-price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--accent-green);
}
```

### **Formularios**

#### **Input Field**
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-light);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  color: var(--text-dark);
  background: white;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.input-field::placeholder {
  color: var(--text-light);
}
```

#### **Label**
```css
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-dark);
  margin-bottom: var(--space-2);
}
```

### **Navegación**

#### **Header**
```css
.header {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
}
```

#### **Navigation Menu**
```css
.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-6);
}

.nav-item {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-gray);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: var(--primary-blue);
}
```

## 📱 Responsive Design

### **Breakpoints**
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### **Media Queries**
```css
/* Mobile First Approach */
.container {
  padding: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### **Grid System**
```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive Grid */
@media (min-width: 768px) {
  .grid-cols-1 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-2 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1024px) {
  .grid-cols-1 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-2 { grid-template-columns: repeat(4, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(5, 1fr); }
}
```

## 🎭 Estados y Interacciones

### **Hover States**
```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### **Focus States**
```css
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}
```

### **Loading States**
```css
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

## 🌙 Tema Oscuro

### **Variables de Tema Oscuro**
```css
[data-theme="dark"] {
  --text-dark: #f9fafb;
  --text-gray: #d1d5db;
  --text-light: #9ca3af;
  --text-muted: #6b7280;
  
  --background-white: #111827;
  --background-light: #1f2937;
  --background-gray: #374151;
  --background-dark: #000000;
  
  --border-light: #374151;
  --border-gray: #4b5563;
  --border-dark: #6b7280;
}
```

## 📊 Iconografía

### **Iconos del Sistema**
- **Material Icons**: Para iconos generales
- **Heroicons**: Para iconos de interfaz
- **Custom Icons**: Para elementos específicos de Gamarriando

### **Tamaños de Iconos**
```css
.icon-xs { width: 1rem; height: 1rem; }
.icon-sm { width: 1.25rem; height: 1.25rem; }
.icon-base { width: 1.5rem; height: 1.5rem; }
.icon-lg { width: 2rem; height: 2rem; }
.icon-xl { width: 2.5rem; height: 2.5rem; }
```

## 🎨 Animaciones

### **Transiciones**
```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

### **Animaciones Comunes**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## 📋 Guías de Uso

### **Do's**
- ✅ Usar colores consistentes con la paleta
- ✅ Mantener espaciado uniforme
- ✅ Aplicar tipografía jerárquica
- ✅ Diseñar mobile-first
- ✅ Usar estados de hover y focus
- ✅ Mantener accesibilidad

### **Don'ts**
- ❌ Mezclar estilos inconsistentes
- ❌ Usar colores fuera de la paleta
- ❌ Ignorar responsive design
- ❌ Olvidar estados de interacción
- ❌ Usar tipografías no definidas
- ❌ Ignorar contraste de colores

## 🛠️ Implementación

### **Tailwind CSS**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#1e40af',
          'blue-light': '#3b82f6',
          'blue-dark': '#1e3a8a',
        },
        secondary: {
          yellow: '#fbbf24',
          'yellow-light': '#fcd34d',
          'yellow-dark': '#f59e0b',
        },
        accent: {
          green: '#10b981',
          red: '#ef4444',
          orange: '#f97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

### **CSS Custom Properties**
```css
/* styles/design-system.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Colores */
  --primary-blue: #1e40af;
  --secondary-yellow: #fbbf24;
  --accent-green: #10b981;
  
  /* Tipografía */
  --font-family-primary: 'Inter', sans-serif;
  --text-base: 1rem;
  --font-medium: 500;
  
  /* Espaciado */
  --space-4: 1rem;
  --space-6: 1.5rem;
}
```

---

**Sistema de Diseño Gamarriando** - Diseño Consistente y Escalable 🎨
