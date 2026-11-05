import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { journalPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/journal", journalPage.meta);

const tones = ["bg-sand", "bg-olive text-linen", "bg-terra text-linen"];

export default function JournalPage() {
  const j = journalPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Journal", path: "/journal" }])} />
      <PageHero eyebrow="Journal" title={j.title} body={j.body} />

      <section aria-label="Upcoming articles" className="pb-24 sm:pb-32">
        <div className="container-x">
          <ul className="grid gap-4 md:grid-cols-3">
            {j.articles.map((a, i) => (
              <li key={a.title} data-reveal="up" suppressHydrationWarning style={{ "--d": i * 90 } as CSSProperties}>
                <article className={`flex h-full min-h-[24rem] flex-col justify-between rounded-[var(--radius-cell-lg)] p-7 sm:p-9 ${tones[i]}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="eyebrow opacity-70">{a.tag}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-current/25">Coming soon</span>
                  </div>
                  <div>
                    <h2 className="title text-[clamp(1.4rem,2.2vw,1.9rem)] leading-[1.15]">{a.title}</h2>
                    <p className="mt-5 text-sm font-semibold opacity-60">Under 5 min read</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="nl-title" className="bg-ink py-24 text-linen sm:py-32">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="eyebrow text-gold">{j.newsletter.title}</p>
            <h2 id="nl-title" className="display-lg mt-5">
              One email a month.
            </h2>
            <p className="lede mt-6 max-w-md text-linen/70">{j.newsletter.body}</p>
          </div>
          <NewsletterForm className="lg:col-span-5 lg:col-start-8" />
        </div>
      </section>
    </>
  );
}
