# 🚀 Plan de Despliegue en AWS S3 - Frontend Gamarriando

## 📋 Resumen Ejecutivo

Este documento presenta un plan integral para el despliegue del frontend de Gamarriando en Amazon S3 con CloudFront, incluyendo configuración de infraestructura, optimización de performance, CI/CD automatizado y estrategias de monitoreo.

## 🏗️ Arquitectura de Despliegue

### **Stack Tecnológico**

```
Frontend Next.js (Static Export)
├── Amazon S3 (gamarriando-web)
├── CloudFront CDN
├── Route 53 (DNS)
├── AWS Certificate Manager (SSL/TLS)
├── GitHub Actions (CI/CD)
└── AWS CloudWatch (Monitoreo)
```

### **Flujo de Despliegue**

```
Developer Push → GitHub → GitHub Actions → Build → Test → Deploy S3 → Invalidate CloudFront → Notify
```

## 🪣 Configuración de Infraestructura AWS

### **1. Amazon S3 Bucket**

#### **Configuración del Bucket**

```bash
# Crear bucket S3
aws s3 mb s3://gamarriando-web --region us-east-1

# Habilitar versionado
aws s3api put-bucket-versioning \
  --bucket gamarriando-web \
  --versioning-configuration Status=Enabled

# Configurar encriptación
aws s3api put-bucket-encryption \
  --bucket gamarriando-web \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

#### **Política de Bucket**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gamarriando-web/*"
    },
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E1EXAMPLE"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gamarriando-web/*"
    }
  ]
}
```

#### **Configuración CORS**

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "https://gamarriando.com",
        "https://www.gamarriando.com",
        "https://staging.gamarriando.com"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### **2. CloudFront Distribution**

#### **Configuración de Distribución**

```json
{
  "CallerReference": "gamarriando-frontend-2024",
  "Comment": "Gamarriando Frontend CDN",
  "DefaultRootObject": "index.html",
  "PriceClass": "PriceClass_100",
  "Enabled": true,
  "Aliases": {
    "Quantity": 2,
    "Items": ["gamarriando.com", "www.gamarriando.com"]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-gamarriando-web",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-gamarriando-web",
        "DomainName": "gamarriando-web.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/E1EXAMPLE"
        }
      }
    ]
  }
}
```

#### **Cache Behaviors Específicos**

```json
{
  "CacheBehaviors": {
    "Quantity": 3,
    "Items": [
      {
        "PathPattern": "/_next/static/*",
        "TargetOriginId": "S3-gamarriando-web",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 31536000,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "/images/*",
        "TargetOriginId": "S3-gamarriando-web",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "S3-gamarriando-web",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 0,
        "MaxTTL": 0,
        "Compress": false
      }
    ]
  }
}
```

### **3. Route 53 y Certificate Manager**

#### **Configuración de Dominio**

```bash
# Crear certificado SSL
aws acm request-certificate \
  --domain-name gamarriando.com \
  --subject-alternative-names www.gamarriando.com \
  --validation-method DNS \
  --region us-east-1

# Configurar registros DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "gamarriando.com",
          "Type": "A",
          "AliasTarget": {
            "DNSName": "d1234567890.cloudfront.net",
            "EvaluateTargetHealth": false,
            "HostedZoneId": "Z2FDTNDATAQYW2"
          }
        }
      }
    ]
  }'
```

## 🔧 Configuración de Build Optimizada

### **1. Next.js Configuration**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para exportación estática
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Optimización de imágenes
  images: {
    unoptimized: true,
    domains: [
      'gamarriando-web.s3.amazonaws.com',
      'd1234567890.cloudfront.net'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Asset prefix para CloudFront
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://d1234567890.cloudfront.net' 
    : '',

  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com;
              style-src 'self' 'unsafe-inline' fonts.googleapis.com;
              font-src 'self' fonts.gstatic.com;
              img-src 'self' *.amazonaws.com *.cloudfront.net data:;
              connect-src 'self' *.amazonaws.com *.google-analytics.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/productos',
        destination: '/products',
        permanent: true,
      },
    ];
  },

  // Optimizaciones experimentales
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zustand'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    // Optimizaciones de producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
```

### **2. Package.json Scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "build:production": "NODE_ENV=production next build",
    "build:analyze": "ANALYZE=true npm run build:production",
    "deploy": "npm run build:production && aws s3 sync out/ s3://gamarriando-web --delete",
    "deploy:staging": "npm run build && aws s3 sync out/ s3://gamarriando-web-staging --delete",
    "invalidate": "aws cloudfront create-invalidation --distribution-id E1EXAMPLE --paths '/*'",
    "deploy:full": "npm run deploy && npm run invalidate",
    "test": "jest",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "check-all": "npm run type-check && npm run lint && npm run test:ci"
  }
}
```

## 🚀 Despliegue Local a AWS S3

### **1. Configuración de Despliegue Local**

En lugar de usar GitHub Actions, utilizaremos scripts de despliegue local que se ejecutan desde tu máquina de desarrollo.

#### **Scripts de Despliegue Disponibles**

```bash
# Despliegue completo con verificaciones
./scripts/deploy/deploy-local.sh production
./scripts/deploy/deploy-local.sh staging

# Despliegue rápido para updates menores
./scripts/deploy/quick-deploy.sh prod
./scripts/deploy/quick-deploy.sh staging

# Build optimizado
./scripts/build/build-optimized.sh --production --analyze

# Gestión de backups
./scripts/deploy/backup.sh
./scripts/deploy/rollback.sh
```

### **2. Configuración Inicial**

```bash
# Configurar AWS CLI y entorno
./scripts/setup/setup-aws.sh

# Esto creará:
# - .env.local (variables de entorno)
# - deployment-config.sh (configuración de despliegue)
```

### **3. Variables de Entorno Locales**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### **4. Configuración de Despliegue**

```bash
# deployment-config.sh
export BUCKET_NAME="gamarriando-web"
export STAGING_BUCKET_NAME="gamarriando-web-staging"
export BACKUP_BUCKET_NAME="gamarriando-web-backup"
export AWS_REGION="us-east-1"
export CLOUDFRONT_DISTRIBUTION_ID="E1EXAMPLE"
export STAGING_CLOUDFRONT_DISTRIBUTION_ID="E2EXAMPLE"
```

## 🚀 Scripts de Deployment Local

### **1. Script de Deployment Principal**

El script `deploy-local.sh` maneja el despliegue completo con verificaciones:

```bash
# Despliegue a producción
./scripts/deploy/deploy-local.sh production

# Despliegue a staging
./scripts/deploy/deploy-local.sh staging

# Opciones disponibles
./scripts/deploy/deploy-local.sh production --skip-checks
./scripts/deploy/deploy-local.sh production --skip-backup
```

**Características:**
- ✅ Verificación de prerrequisitos
- ✅ Instalación de dependencias
- ✅ Ejecución de tests, linting y type checking
- ✅ Build optimizado para producción
- ✅ Creación automática de backup
- ✅ Configuración de headers de cache
- ✅ Invalidación de CloudFront
- ✅ Tests de smoke
- ✅ Colores y logging detallado

### **2. Script de Deployment Rápido**

El script `quick-deploy.sh` para updates rápidos:

```bash
# Despliegue rápido a producción
./scripts/deploy/quick-deploy.sh prod

# Despliegue rápido a staging
./scripts/deploy/quick-deploy.sh staging

# Opciones disponibles
./scripts/deploy/quick-deploy.sh prod --no-build
./scripts/deploy/quick-deploy.sh prod --no-cache
./scripts/deploy/quick-deploy.sh prod --no-invalidate
```

**Características:**
- ⚡ Despliegue rápido sin verificaciones extensas
- 🔧 Opciones para saltar pasos específicos
- 📊 Ideal para updates menores

### **3. Script de Build Optimizado**

El script `build-optimized.sh` para builds con análisis:

```bash
# Build para producción con análisis
./scripts/build/build-optimized.sh --production --analyze

# Build para staging sin tests
./scripts/build/build-optimized.sh --staging --skip-tests

# Build con opciones personalizadas
./scripts/build/build-optimized.sh --production --skip-lint --skip-type-check
```

**Características:**
- 🏗️ Build optimizado para S3
- 📊 Análisis de bundle opcional
- 🧪 Opciones para saltar verificaciones
- 📈 Estadísticas detalladas del build

### **4. Scripts de Gestión**

```bash
# Crear backup
./scripts/deploy/backup.sh

# Rollback a versión anterior
./scripts/deploy/rollback.sh

# Configuración inicial
./scripts/setup/setup-aws.sh
```

### **5. Configuración de Scripts**

Todos los scripts utilizan el archivo `deployment-config.sh` para configuración:

```bash
# Cargar configuración
source deployment-config.sh

# Variables disponibles
echo $BUCKET_NAME
echo $CLOUDFRONT_DISTRIBUTION_ID
echo $AWS_REGION
```

## 📊 Monitoreo y Analytics

### **1. Google Analytics 4**

```javascript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

### **2. Error Tracking con Sentry**

```javascript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  beforeSend(event) {
    // Filtrar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### **3. Performance Monitoring**

```javascript
// lib/performance.ts
export const reportWebVitals = (metric: any) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Sentry
    if (metric.label === 'web-vital') {
      Sentry.addBreadcrumb({
        category: 'web-vital',
        message: `${metric.name}: ${metric.value}`,
        level: 'info',
      });
    }
  }
};
```

## 🔒 Configuración de Seguridad

### **1. Security Headers**

```javascript
// next.config.js - Headers de seguridad
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com;
      img-src 'self' *.amazonaws.com *.cloudfront.net data: *.google-analytics.com;
      connect-src 'self' *.amazonaws.com *.google-analytics.com *.analytics.google.com;
      frame-src 'self' *.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];
```

### **2. Environment Variables Security**

```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Variables privadas (no NEXT_PUBLIC_)
STRIPE_SECRET_KEY=sk_live_...
SENTRY_AUTH_TOKEN=...
```

## 📈 Optimización de Performance

### **1. Bundle Analysis**

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build:production",
    "analyze:server": "BUNDLE_ANALYZE=server npm run build:production",
    "analyze:browser": "BUNDLE_ANALYZE=browser npm run build:production"
  }
}
```

### **2. Image Optimization**

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['gamarriando-web.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
});
```

### **3. Compression Configuration**

```javascript
// next.config.js
const withCompression = require('next-compress');

module.exports = withCompression({
  compress: true,
  gzip: true,
  brotli: true,
});
```

## 📋 Checklist de Deployment

### **Pre-Deployment**

- [ ] Todos los tests pasando
- [ ] Linting limpio
- [ ] Type checking limpio
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Headers de seguridad configurados
- [ ] Backup del estado actual creado

### **Deployment**

- [ ] Deploy a S3
- [ ] Headers de cache configurados
- [ ] CloudFront invalidado
- [ ] Verificación de deployment
- [ ] Tests de smoke ejecutados

### **Post-Deployment**

- [ ] Monitoreo de tasas de error
- [ ] Verificación de métricas de performance
- [ ] Verificación de funcionalidades
- [ ] Actualización de documentación
- [ ] Notificación al equipo

## 🎯 Objetivos de Performance

### **Core Web Vitals**

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **Lighthouse Scores**

- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### **Load Times**

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB gzipped

## 🔄 Estrategia de Rollback

### **Backup Automático**

```bash
#!/bin/bash
# scripts/backup.sh

set -e

BUCKET_NAME="gamarriando-web"
BACKUP_BUCKET="gamarriando-web-backup"
REGION="us-east-1"

echo "💾 Creating automatic backup..."

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
aws s3 sync s3://$BUCKET_NAME/ s3://$BACKUP_BUCKET/$TIMESTAMP/ --region $REGION

# Mantener solo los últimos 10 backups
aws s3 ls s3://$BACKUP_BUCKET/ --region $REGION | \
  sort -r | \
  tail -n +11 | \
  awk '{print $2}' | \
  xargs -I {} aws s3 rm s3://$BACKUP_BUCKET/{} --recursive --region $REGION

echo "✅ Backup completed: $TIMESTAMP"
```

## 📚 Documentación Adicional

### **Comandos Útiles**

```bash
# Verificar estado del deployment
aws s3 ls s3://gamarriando-web/ --recursive

# Ver logs de CloudFront
aws logs describe-log-groups --log-group-name-prefix /aws/cloudfront

# Verificar certificados SSL
aws acm list-certificates --region us-east-1

# Verificar distribución CloudFront
aws cloudfront get-distribution --id E1EXAMPLE
```

### **Troubleshooting**

```bash
# Problemas comunes y soluciones

# 1. Error 403 en S3
# Verificar bucket policy y CORS

# 2. CloudFront no actualiza
# Verificar invalidación y TTL

# 3. Build falla
# Verificar variables de entorno y dependencias

# 4. Performance lenta
# Verificar bundle size y optimizaciones
```

---

**Plan de Despliegue AWS S3 - Frontend Gamarriando** - Versión 1.0 🚀

*Este documento proporciona una guía completa para el despliegue del frontend de Gamarriando en AWS S3 con CloudFront, incluyendo todas las configuraciones necesarias, scripts de automatización y estrategias de monitoreo.*
