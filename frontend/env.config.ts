// Environment configuration for Gamarriando Frontend
export const envConfig = {
  // API Configuration
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://nq0kfvcazc.execute-api.us-east-1.amazonaws.com/dev',
  CDN_URL:
    process.env.NEXT_PUBLIC_CDN_URL ||
    'https://gamarriando-web.s3.amazonaws.com',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // Authentication
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

  // External Services
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',

  // Analytics & Monitoring
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || '',
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true',
  ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',

  // App Configuration
  APP_NAME: 'Gamarriando',
  APP_VERSION: process.env.npm_package_version || '1.0.0',
  APP_DESCRIPTION: 'Marketplace de Streetwear Peruano',
} as const;

// Type-safe environment configuration
export type EnvConfig = typeof envConfig;

// Validation function to check required environment variables
export const validateEnvConfig = (): void => {
  const requiredVars = ['NEXT_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_CDN_URL'];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0 && envConfig.IS_PRODUCTION) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Validate configuration on import in production
if (envConfig.IS_PRODUCTION) {
  validateEnvConfig();
}

export default envConfig;
