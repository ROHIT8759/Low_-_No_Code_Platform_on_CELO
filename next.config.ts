import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  
  
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    
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

    
    config.ignoreWarnings = [
      { module: /node_modules\/pako/ },
      { module: /node_modules\/jszip/ },
    ];

    return config;
  },
};

export default nextConfig;
