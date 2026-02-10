import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental optimizations
  experimental: {
    optimizeCss: true,
  },

  // Add empty turbopack config to silence warning
  // (Turbopack is default in Next.js 16+)
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    // Add fallback for node modules that shouldn't run in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        child_process: false,
      };
    }

    // Ignore pako warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pako/ },
      { module: /node_modules\/jszip/ },
    ];

    return config;
  },
};

export default nextConfig;
