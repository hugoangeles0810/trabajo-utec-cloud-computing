/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for static export
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Image optimization for static export
  images: {
    unoptimized: true,
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
