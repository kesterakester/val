import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  basePath: '/val', // Change this to your GitHub repo name
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
