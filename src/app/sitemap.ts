import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "/products", priority: 0.9, freq: "weekly" },
  { path: "/samples", priority: 0.9, freq: "monthly" },
  { path: "/standard", priority: 0.8, freq: "weekly" },
  { path: "/coating", priority: 0.8, freq: "monthly" },
  { path: "/for-owners", priority: 0.8, freq: "monthly" },
  { path: "/story", priority: 0.6, freq: "monthly" },
  { path: "/faq", priority: 0.6, freq: "monthly" },
  { path: "/journal", priority: 0.5, freq: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
