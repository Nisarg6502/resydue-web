import type { MetadataRoute } from "next";

// Plain data, generated once at build time (required for the static Pages export).
export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Resydue",
    short_name: "Resydue",
    description: "Plastic-free food packaging with a bio-based coating. Built for hot, oily, busy kitchens.",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#f3e9dc",
    theme_color: "#f3e9dc",
    icons: [
      { src: `${base}/brand/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}/brand/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
