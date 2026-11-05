import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { JsonLd } from "@/components/seo/JsonLd";
import { home, site } from "@/content/site";
import "./globals.css";

// Brand typeface (guidelines p.18): Raleway only. Variable font = one file for 400/600/700.
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: home.meta.title, template: "%s" },
  description: home.meta.description,
  applicationName: "Resydue",
  keywords: [
    "plastic-free food packaging",
    "compostable food containers",
    "no plastic lining",
    "PFAS-free packaging",
    "bio-based coating",
    "takeaway packaging",
    "cloud kitchen packaging",
    "biodegradable bowls",
    "delivery boxes",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Resydue",
    locale: "en_IN",
    url: "/",
    title: home.meta.title,
    description: home.meta.description,
  },
  twitter: { card: "summary_large_image", title: home.meta.title, description: home.meta.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f3e9dc",
  width: "device-width",
  initialScale: 1,
};

const org = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#org`,
      name: "Resydue",
      url: site.url,
      logo: `${site.url}/brand/resydue-logomark.png`,
      slogan: site.tagline,
      description: home.meta.description,
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: "Resydue",
      publisher: { "@id": `${site.url}/#org` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={raleway.variable} suppressHydrationWarning>
      <head>
        {/* Enables reveal styles only when JS runs, so no-JS visitors and crawlers see everything. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd data={org} />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <Header />
        <main id="main">
          {children}
        </main>
        <Footer />
        <SmoothScroll />
        <RevealObserver />
      </body>
    </html>
  );
}
