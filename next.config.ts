import type { NextConfig } from "next";

const publicCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
  },
  compress: true,
  async headers() {
    return [
      { source: "/branding/:path*", headers: publicCacheHeaders },
      { source: "/uploads/:path*", headers: publicCacheHeaders },
      { source: "/favicon.ico", headers: publicCacheHeaders },
    ];
  },
};

export default nextConfig;
