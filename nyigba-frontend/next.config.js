/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress development warnings in console
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  images: {
    domains: ['ipfs.io', 'gateway.ipfs.io', 'cloudflare-ipfs.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Webpack configuration for reduced warnings
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    
    // Reduce dev warnings
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
