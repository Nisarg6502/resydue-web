import type { Metadata } from "next";
import { BreakItPanel } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Rich } from "@/components/ui/Rich";
import { faqPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/faq", faqPage.meta);

const hasPlaceholder = (s: string) => /\[[^\]]+\]/.test(s);

export default function FaqPage() {
  const f = faqPage;
  // Only fully-confirmed answers go into structured data, never placeholders.
  const confirmed = f.groups.flatMap((g) => g.items).filter((i) => !hasPlaceholder(i.a));
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "FAQ", path: "/faq" }])} />
      {confirmed.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: confirmed.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          }}
        />
      ) : null}
      <PageHero eyebrow="FAQ" title={f.title} body="Heat, cost, compost and ordering. If your question is not here, ask us on WhatsApp." />

      <section aria-label="Questions" className="pb-24 sm:pb-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <nav aria-label="FAQ topics" className="hidden lg:col-span-3 lg:block">
            <ul className="sticky top-28 space-y-1">
              {f.groups.map((g, i) => (
                <li key={g.title}>
                  <a href={`#faq-${i}`} className="flex items-center gap-3 rounded-full py-2 font-semibold text-ink/60 transition-colors hover:text-ink">
                    <span className="eyebrow tnum text-terra">{String(i + 1).padStart(2, "0")}</span>
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16 lg:col-span-9">
            {f.groups.map((g, gi) => (
              <div key={g.title} id={`faq-${gi}`} className="scroll-mt-28">
                <h2 className="eyebrow text-terra">{g.title}</h2>
                <div className="mt-5 border-t border-ink/15">
                  {g.items.map((it) => (
                    <details key={it.q} className="faq group border-b border-ink/15">
                      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
                        <span className="title">{it.q}</span>
                        <span aria-hidden className="plus grid size-10 shrink-0 place-items-center rounded-full bg-sand text-ink transition-colors group-hover:bg-ink group-hover:text-linen">
                          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M8 3v10M3 8h10" />
                          </svg>
                        </span>
                      </summary>
                      <p className="max-w-2xl pb-7 text-[1.08rem] leading-relaxed text-ink/75">
                        <Rich text={it.a} />
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
