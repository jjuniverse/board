import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: process.env.NODE_ENV !== "production",
      fileName: false,
      pure: true,
      transpileTemplateLiterals: true,
      meaninglessFileNames: ["index"],
    },
  },
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
    ],
  },
};

export default nextConfig;
