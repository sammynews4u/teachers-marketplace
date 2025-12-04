/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore TypeScript Errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignore ESLint Errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. Ensure images from external sites (like Dicebear) work
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;