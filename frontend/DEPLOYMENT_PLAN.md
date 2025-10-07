# 🚀 Plan de Deployment - Frontend Gamarriando

## 📋 Resumen

Este documento detalla la estrategia de deployment del frontend de Gamarriando en Amazon S3 con CloudFront, incluyendo configuración de CI/CD, optimización de performance y monitoreo.

## 🏗️ Arquitectura de Deployment

### **Stack de Deployment**

```
Frontend Build (NextJS)
├── Amazon S3 (gamarriando-web)
├── CloudFront CDN
├── Route 53 (DNS)
├── AWS Certificate Manager (SSL)
└── GitHub Actions (CI/CD)
```

### **Flujo de Deployment**

```
Developer Push → GitHub → GitHub Actions → Build → Deploy to S3 → Invalidate CloudFront
```

## 🪣 Configuración de S3

### **Bucket Configuration**

```json
{
  "bucket": "gamarriando-web",
  "region": "us-east-1",
  "versioning": "enabled",
  "public_access": "blocked",
  "encryption": "AES256"
}
```

### **Website Configuration**

```json
{
  "website": {
    "indexDocument": "index.html",
    "errorDocument": "404.html"
  },
  "cors": {
    "AllowedOrigins": [
      "https://gamarriando.com",
      "https://www.gamarriando.com"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
}
```

### **Bucket Policy**

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
    }
  ]
}
```

## ☁️ CloudFront Configuration

### **Distribution Settings**

```json
{
  "distribution": {
    "comment": "Gamarriando Frontend CDN",
    "defaultRootObject": "index.html",
    "priceClass": "PriceClass_100",
    "enabled": true,
    "aliases": ["gamarriando.com", "www.gamarriando.com"],
    "defaultCacheBehavior": {
      "targetOriginId": "S3-gamarriando-web",
      "viewerProtocolPolicy": "redirect-to-https",
      "compress": true,
      "cachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
      "originRequestPolicyId": "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    },
    "customErrorResponses": [
      {
        "errorCode": 404,
        "responseCode": 200,
        "responsePagePath": "/404.html"
      },
      {
        "errorCode": 403,
        "responseCode": 200,
        "responsePagePath": "/404.html"
      }
    ],
    "origins": [
      {
        "id": "S3-gamarriando-web",
        "domainName": "gamarriando-web.s3.amazonaws.com",
        "s3OriginConfig": {
          "originAccessIdentity": "E1EXAMPLE"
        }
      }
    ]
  }
}
```

### **Cache Behaviors**

```json
{
  "cacheBehaviors": [
    {
      "pathPattern": "/_next/static/*",
      "targetOriginId": "S3-gamarriando-web",
      "viewerProtocolPolicy": "redirect-to-https",
      "cachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
      "ttl": {
        "defaultTTL": 31536000,
        "maxTTL": 31536000
      }
    },
    {
      "pathPattern": "/images/*",
      "targetOriginId": "S3-gamarriando-web",
      "viewerProtocolPolicy": "redirect-to-https",
      "cachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
      "ttl": {
        "defaultTTL": 86400,
        "maxTTL": 31536000
      }
    }
  ]
}
```

## 🔧 NextJS Build Configuration

### **next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ['gamarriando-web.s3.amazonaws.com'],
  },
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? 'https://d1234567890.cloudfront.net'
      : '',
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
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
};

module.exports = nextConfig;
```

### **package.json Scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "build:production": "NODE_ENV=production next build",
    "deploy": "npm run build:production && aws s3 sync out/ s3://gamarriando-web --delete",
    "deploy:staging": "npm run build && aws s3 sync out/ s3://gamarriando-web-staging --delete",
    "invalidate": "aws cloudfront create-invalidation --distribution-id E1EXAMPLE --paths '/*'",
    "deploy:full": "npm run deploy && npm run invalidate"
  }
}
```

## 🔄 CI/CD con GitHub Actions

### **Workflow de Deployment**

```yaml
# .github/workflows/deploy.yml
name: Deploy to S3 and CloudFront

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  AWS_REGION: us-east-1
  S3_BUCKET: gamarriando-web
  CLOUDFRONT_DISTRIBUTION_ID: E1EXAMPLE

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run linting
        run: npm run lint

      - name: Type check
        run: npm run type-check

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:production
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          NEXT_PUBLIC_CDN_URL: ${{ secrets.CDN_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: out/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync out/ s3://${{ env.S3_BUCKET }} --delete
          aws s3 cp out/index.html s3://${{ env.S3_BUCKET }}/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"

      - name: Deploy notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### **Environment Variables**

```bash
# GitHub Secrets
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
CDN_URL=https://d1234567890.cloudfront.net
SLACK_WEBHOOK=https://hooks.slack.com/...
```

## 🚀 Deployment Scripts

### **Deploy Script**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Error: Must be on main branch to deploy"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build for production
echo "🏗️ Building for production..."
NODE_ENV=production npm run build

# Deploy to S3
echo "📤 Deploying to S3..."
aws s3 sync out/ s3://gamarriando-web --delete

# Update index.html with no-cache
echo "🔄 Updating index.html cache headers..."
aws s3 cp out/index.html s3://gamarriando-web/index.html \
  --metadata-directive REPLACE \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type "text/html"

# Invalidate CloudFront
echo "☁️ Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E1EXAMPLE \
  --paths "/*"

echo "✅ Deployment completed successfully!"
echo "🌐 Website: https://gamarriando.com"
```

### **Staging Deploy Script**

```bash
#!/bin/bash
# scripts/deploy-staging.sh

set -e

echo "🚀 Starting staging deployment..."

# Build for staging
echo "🏗️ Building for staging..."
npm run build

# Deploy to staging S3 bucket
echo "📤 Deploying to staging S3..."
aws s3 sync out/ s3://gamarriando-web-staging --delete

echo "✅ Staging deployment completed!"
echo "🌐 Staging URL: https://staging.gamarriando.com"
```

## 📊 Performance Optimization

### **Bundle Analysis**

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "BUNDLE_ANALYZE=browser npm run build"
  }
}
```

### **Image Optimization**

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
  images: {
    domains: ['gamarriando-web.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
});
```

### **Compression Configuration**

```javascript
// next.config.js
const withCompression = require('next-compress');

module.exports = withCompression({
  // ... other config
  compress: true,
  gzip: true,
  brotli: true,
});
```

## 🔒 Security Configuration

### **Security Headers**

```javascript
// next.config.js
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
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com;
      img-src 'self' *.amazonaws.com *.cloudfront.net data:;
      connect-src 'self' *.amazonaws.com *.google-analytics.com;
    `
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### **Environment Variables Security**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net

# .env.production
NEXT_PUBLIC_API_BASE_URL=https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net
```

## 📈 Monitoring y Analytics

### **Google Analytics**

```javascript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

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

### **Error Tracking**

```javascript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### **Performance Monitoring**

```javascript
// lib/performance.ts
export const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    // Send to analytics
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
};
```

## 🔄 Rollback Strategy

### **Rollback Script**

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

echo "🔄 Starting rollback process..."

# Get previous version from S3
echo "📥 Downloading previous version..."
aws s3 sync s3://gamarriando-web-backup/ s3://gamarriando-web/

# Invalidate CloudFront
echo "☁️ Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E1EXAMPLE \
  --paths "/*"

echo "✅ Rollback completed successfully!"
```

### **Backup Strategy**

```bash
#!/bin/bash
# scripts/backup.sh

set -e

echo "💾 Creating backup..."

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Sync current version to backup
aws s3 sync s3://gamarriando-web/ s3://gamarriando-web-backup/$TIMESTAMP/

# Keep only last 5 backups
aws s3 ls s3://gamarriando-web-backup/ | sort -r | tail -n +6 | awk '{print $2}' | xargs -I {} aws s3 rm s3://gamarriando-web-backup/{} --recursive

echo "✅ Backup completed: $TIMESTAMP"
```

## 📋 Deployment Checklist

### **Pre-Deployment**

- [ ] All tests passing
- [ ] Linting clean
- [ ] Type checking clean
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Security headers configured

### **Deployment**

- [ ] Deploy to S3
- [ ] Update cache headers
- [ ] Invalidate CloudFront
- [ ] Verify deployment
- [ ] Run smoke tests

### **Post-Deployment**

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Update documentation
- [ ] Notify team

## 🎯 Performance Targets

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

---

**Gamarriando Frontend Deployment Plan** - Versión 1.0 🚀
