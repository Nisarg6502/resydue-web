import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Resydue",
    short_name: "Resydue",
    description: "Plastic-free food packaging with a bio-based coating. Built for hot, oily, busy kitchens.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3e9dc",
    theme_color: "#f3e9dc",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
