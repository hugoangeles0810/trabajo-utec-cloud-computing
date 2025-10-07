/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for static export (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
  }),

  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable styled-jsx completely
  compiler: {
    styledJsx: false,
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Disable styled-jsx completely
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx': false,
      'styled-jsx/style': false,
    };

    // Remove styled-jsx plugin
    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'StyledJsxPlugin';
    });

    return config;
  },
};

module.exports = nextConfig;
