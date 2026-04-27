import type { NextConfig } from 'next';

const repoName = 'board';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: process.env.NODE_ENV !== 'production',
      fileName: false,
      pure: true,
      transpileTemplateLiterals: true,
      meaninglessFileNames: ['index'],
    },
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/system'],
  },
  output: 'export',
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
