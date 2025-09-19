import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds to fix all issues properly
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignore TypeScript errors in temp folders during builds
    ignoreBuildErrors: false,
  },
  typedRoutes: false, // Moved from experimental
  // distDir: 'build', // Only needed for production builds, not development
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    // External images (JDA domains) are handled directly with regular img tags
    // Only ImageKit and placeholder URLs use Next.js Image optimization
    unoptimized: false,
  },
};

export default nextConfig;
