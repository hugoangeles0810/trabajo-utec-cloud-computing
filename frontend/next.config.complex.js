/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Image optimization for static export
  images: {
    unoptimized: true,
    domains: [
      'gamarriando-web.s3.amazonaws.com',
      'd1234567890.cloudfront.net',
      'c8ydsj3r02.execute-api.us-east-1.amazonaws.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Asset prefix for CloudFront
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://d1234567890.cloudfront.net' 
    : '',

  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_MONITORING,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
  },

  // Output configuration for static export
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Disable error pages generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zustand'],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer (only in development)
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

    // Disable styled-jsx completely for static export
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx': false,
      'styled-jsx/style': false,
    };

    // Remove styled-jsx plugin
    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'StyledJsxPlugin';
    });

    // Disable styled-jsx babel plugin
    if (config.module && config.module.rules) {
      config.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(use => {
            if (use.loader && use.loader.includes('next-babel-loader')) {
              if (!use.options) use.options = {};
              if (!use.options.plugins) use.options.plugins = [];
              use.options.plugins = use.options.plugins.filter(plugin => {
                return !(Array.isArray(plugin) && plugin[0] && plugin[0].includes('styled-jsx'));
              });
            }
          });
        }
      });
    }

    return config;
  },
};

module.exports = nextConfig;
