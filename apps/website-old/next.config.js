/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@agent-vfs/core'],
  webpack: (config) => {
    // Required for sql.js (WASM SQLite in browser)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
