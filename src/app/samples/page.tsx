import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SamplesForm } from "@/components/forms/SamplesForm";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Rich } from "@/components/ui/Rich";
import { samplesPage, site } from "@/content/site";

export const metadata: Metadata = pageMeta("/samples", samplesPage.meta);

export default function SamplesPage() {
  const s = samplesPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Free samples", path: "/samples" }])} />
      <PageHero eyebrow="Free samples" title={s.title} body={s.body} />

      <section aria-label="Request samples" className="pb-24 sm:pb-32">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <SamplesForm />
          </div>

          <aside className="space-y-4 lg:col-span-4 lg:col-start-9">
            <div className="rounded-[var(--radius-cell-lg)] bg-ink p-7 text-linen sm:p-9">
              <h2 className="eyebrow text-gold">{s.next.title}</h2>
              <ol className="mt-6 space-y-6">
                {s.next.steps.map((step, i) => (
                  <li key={step} data-reveal="up" suppressHydrationWarning style={{ "--d": i * 90 } as CSSProperties} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-linen/10 text-sm font-semibold tnum text-gold">{i + 1}</span>
                    <span className="pt-1 text-[1.05rem] leading-snug">
                      <Rich text={step} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-[var(--radius-cell-lg)] bg-sand p-7 sm:p-9">
              <h2 className="title">{s.talk.title}</h2>
              <dl className="mt-5 space-y-3">
                {[
                  ["WhatsApp", site.contact.whatsapp],
                  ["Email", site.contact.email],
                  ["Phone", site.contact.phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/15 pb-3 last:border-0">
                    <dt className="text-ink/60">{k}</dt>
                    <dd className="font-semibold">
                      <Rich text={v} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
