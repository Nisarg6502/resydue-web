import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ExplodedLayers } from "@/components/coating/ExplodedLayers";
import { BreakItPanel } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero, SectionHead } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { coatingPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/coating", coatingPage.meta);

const trace = [
  { step: "Source", detail: "[Where the fibre comes from]" },
  { step: "Fibre", detail: "[How it is pulped and formed]" },
  { step: "Coating", detail: "[What the bio-based coating is made of]" },
  { step: "Your kitchen", detail: "Hot, oily, saucy, carried 40 minutes." },
  { step: "Back to soil", detail: "[Where it goes, how long, under what conditions]" },
];

export default function CoatingPage() {
  const c = coatingPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "The coating", path: "/coating" }])} />
      <PageHero eyebrow={c.eyebrow} title={c.title} body={c.body} />

      {/* What is not in it */}
      <section aria-labelledby="notin-title" className="bg-ink py-24 text-linen sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="The short list" title={c.notIn.title} id="notin-title" dark />
          <ul className="mt-12 border-t border-linen/15 sm:mt-16">
            {c.notIn.items.map((item, i) => {
              const thing = item.replace(/^No\s+/i, "");
              return (
                <li key={item} className="flex items-baseline justify-between gap-6 border-b border-linen/15 py-6 sm:py-10">
                  <span data-reveal="up" suppressHydrationWarning style={{ "--d": i * 120 } as CSSProperties} className="text-[clamp(2.6rem,10vw,9rem)] font-bold leading-[0.9] tracking-[-0.05em]">
                    <span className="strike">{thing.charAt(0).toUpperCase() + thing.slice(1)}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink sm:text-base">{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Layers */}
      <section aria-labelledby="layers-title" className="overflow-clip bg-sand py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="Cross-section" title="Three layers. None of them plastic." id="layers-title" onSand className="mb-12 sm:mb-16" />
          <ExplodedLayers />
        </div>
      </section>

      {/* Trace */}
      <section aria-labelledby="trace-title" className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="Trace it" title="From a field to your counter, and back." id="trace-title" />
          <ol className="relative mt-14 grid gap-4 sm:mt-20 md:grid-cols-5 md:gap-3">
            <span aria-hidden className="absolute left-[1.15rem] top-0 h-full w-px bg-ink/15 md:left-0 md:top-[1.15rem] md:h-px md:w-full" />
            {trace.map((t, i) => (
              <li key={t.step} data-reveal="up" suppressHydrationWarning style={{ "--d": i * 90 } as CSSProperties} className="relative flex gap-5 md:block">
                <span className={`relative z-10 grid size-[2.3rem] shrink-0 place-items-center rounded-full text-sm font-semibold tnum ${i === 4 ? "bg-olive text-linen" : i === 3 ? "bg-terra text-linen" : "bg-ink text-linen"}`}>
                  {i + 1}
                </span>
                <span className="block md:mt-6 md:pr-4">
                  <span className="title block">{t.step}</span>
                  <span className="mt-2 block text-ink/65">
                    <Rich text={t.detail} />
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <Reveal as="p" className="mt-14 max-w-xl text-ink/60">
            Every step above gets a named source and a document behind it before it goes live. Until then, it stays marked as to be confirmed.
          </Reveal>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
