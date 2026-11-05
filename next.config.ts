import type { NextConfig } from "next";

/**
 * Two build targets:
 *  - default: full Next.js server (Vercel / Node). Image optimisation, Server Actions, headers.
 *  - GITHUB_PAGES=true: static export under /resydue-web for the GitHub Pages preview.
 *    Images use pre-generated WebP variants (scripts/build-image-variants.mjs) and the
 *    forms post from the browser (src/lib/actions-static.ts).
 */
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? (process.env.PAGES_BASE_PATH ?? "/resydue-web") : "";

const shared: NextConfig = {
  // Every route is fully static, so Cache Components is not needed (and it blocks `output: "export"`
  // for metadata routes like sitemap.xml).
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["motion"],
  },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

const cssRule = {
  "*.css": {
    loaders: ["@tailwindcss/turbopack"],
    as: "*.css",
  },
};

const server: NextConfig = {
  ...shared,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
    deviceSizes: [384, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 320],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: { rules: cssRule },
};

const staticExport: NextConfig = {
  ...shared,
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    qualities: [70, 75],
    deviceSizes: [384, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 320],
  },
  turbopack: {
    rules: cssRule,
    resolveAlias: { "@/app/actions": "./src/lib/actions-static.ts" },
  },
};

export default pages ? staticExport : server;
