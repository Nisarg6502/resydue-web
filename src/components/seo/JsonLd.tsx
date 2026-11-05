import { site } from "@/content/site";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // escape "<" so content can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

/** Per-page metadata helper: canonical + OG/Twitter mirror the brief's search title and description. */
export function pageMeta(path: string, meta: { title: string; description: string }) {
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: "Resydue", locale: "en_IN", url: path, title: meta.title, description: meta.description },
    twitter: { title: meta.title, description: meta.description },
  };
}
