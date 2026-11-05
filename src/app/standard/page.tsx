import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BreakItPanel } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero, SectionHead } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { standardPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/standard", standardPage.meta);

const icons = [
  // material: fibre strands
  <path key="m" d="M4 18c4-6 8-10 16-12M4 12c5-3 9-4 16-4M6 21c3-8 7-12 14-14" />,
  // performance: thermometer
  <path key="p" d="M10 4a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0V4ZM12 15v-5" />,
  // end of life: soil line + sprout-free arrow down
  <path key="e" d="M12 3v11m0 0-4-4m4 4 4-4M3 19h18M6 22h12" />,
];

export default function StandardPage() {
  const s = standardPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "The Resydue Standard", path: "/standard" }])} />
      <PageHero eyebrow="The Resydue Standard" title={s.title} body={s.body} />

      <section aria-labelledby="promise3-title" className="pb-24 sm:pb-32">
        <div className="container-x">
          <SectionHead eyebrow="The rule" title={s.promise.title} id="promise3-title" />
          <ol className="mt-12 grid gap-3 sm:mt-16 md:grid-cols-3 md:gap-4">
            {s.promise.items.map((p, i) => (
              <li
                key={p.k}
                data-reveal="up" suppressHydrationWarning
                style={{ "--d": i * 100 } as CSSProperties}
                className={`flex min-h-[20rem] flex-col justify-between rounded-[var(--radius-cell-lg)] p-7 sm:p-9 ${
                  i === 0 ? "bg-sand" : i === 1 ? "bg-olive text-linen" : "bg-terra text-linen"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow tnum opacity-60">Line {i + 1}</span>
                  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {icons[i]}
                  </svg>
                </div>
                <div>
                  <h3 className="display-md">{p.k}</h3>
                  <p className="mt-4 text-[1.08rem] leading-relaxed opacity-85">{p.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="docs-title" className="bg-ink py-24 text-linen sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow="Proof" title={s.documents.title} id="docs-title" dark />
            <Reveal as="p" delay={120} className="lede mt-6 max-w-md text-linen/65">
              Reports are published here as each test is completed. Nothing is listed as proof until the document behind it is live.
            </Reveal>
          </div>
          <ul className="lg:col-span-7">
            {s.documents.items.map((d, i) => (
              <li key={d.name} data-reveal="up" suppressHydrationWarning style={{ "--d": i * 80 } as CSSProperties} className="border-b border-linen/15 first:border-t">
                <div className="flex min-h-20 items-center justify-between gap-6 py-5">
                  <span className="flex items-center gap-4">
                    <span className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-linen/10 text-[0.65rem] font-semibold tracking-wider text-linen/70 ring-1 ring-inset ring-linen/15">
                      {d.type}
                    </span>
                    <span className="title">{d.name}</span>
                  </span>
                  {d.href ? (
                    <a href={d.href} className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink" download>
                      Download
                    </a>
                  ) : (
                    <span className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-linen/60 ring-1 ring-inset ring-linen/20">
                      Publishing soon
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BreakItPanel title={s.yourTurn.title} body={s.yourTurn.body} />
    </>
  );
}
