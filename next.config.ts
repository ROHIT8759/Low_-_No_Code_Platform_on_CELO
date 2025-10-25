import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
