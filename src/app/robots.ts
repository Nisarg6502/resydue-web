import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Plain data, generated once at build time (required for the static Pages export).
export const dynamic = "force-static";

const noindex = process.env.NEXT_PUBLIC_NOINDEX === "true";

export default function robots(): MetadataRoute.Robots {
  return {
    // Preview hosts (GitHub Pages) stay out of search so they never compete with resydue.com.
    rules: [{ userAgent: "*", ...(noindex ? { disallow: "/" } : { allow: "/" }) }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
