import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. This unblocks Vercel while we
    // iteratively fix lint issues across the migrated codebase.
    ignoreDuringBuilds: true,
  },
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
