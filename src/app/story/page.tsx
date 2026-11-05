import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { BreakItPanel } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { PageHero, SectionHead } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { storyPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/story", storyPage.meta);

export default function StoryPage() {
  const s = storyPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Our story", path: "/story" }])} />
      <PageHero eyebrow="Our story" title={s.title} body={s.body} />

      {/* Two problems, one fix */}
      <section aria-label="Two problems, one fix" className="pb-24 sm:pb-32">
        <div className="container-x grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch md:gap-4">
          {[
            { k: "Problem one", v: "[Crop residue], burned in the field.", c: "bg-ink text-linen" },
            { k: "Problem two", v: "Leaking boxes, thrown away down the road.", c: "bg-sand" },
            { k: "One fix", v: "Resydue.", c: "bg-terra text-linen", logo: true },
          ].map((b, i) => (
            <div key={b.k} className="contents">
              <div data-reveal="up" suppressHydrationWarning style={{ "--d": i * 140 } as CSSProperties} className={`flex min-h-64 flex-col justify-between rounded-[var(--radius-cell-lg)] p-7 sm:p-9 ${b.c}`}>
                <span className="eyebrow opacity-60">{b.k}</span>
                {b.logo ? <Logo variant="mark" className="size-14 text-linen" decorative /> : null}
                <span className="title"><Rich text={b.v} /></span>
              </div>
              {i < 2 ? (
                <span aria-hidden className="hidden items-center text-3xl font-bold text-ink/30 md:flex">
                  {i === 0 ? "+" : "="}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Beliefs */}
      <section aria-labelledby="beliefs-title" className="bg-olive py-24 text-linen sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="Principles" title={s.beliefs.title} id="beliefs-title" dark />
          <ol className="mt-12 border-t border-linen/15 sm:mt-16">
            {s.beliefs.items.map((b, i) => (
              <li key={b} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-linen/15 py-8 sm:grid-cols-[5rem_1fr] sm:py-10">
                <span className="eyebrow tnum pt-3 text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p data-reveal="up" suppressHydrationWarning style={{ "--d": i * 80 } as CSSProperties} className="max-w-[26ch] text-[clamp(1.8rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
                  {b}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="team-title" className="py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHead eyebrow="People" title={s.team.title} id="team-title" />
            <Reveal as="p" className="text-ink/65">
              <Rich text={s.team.based} />
            </Reveal>
          </div>
          <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
            {s.team.people.map((p, i) => (
              <li key={p.role} data-reveal="up" suppressHydrationWarning style={{ "--d": i * 90 } as CSSProperties}>
                <div className="grid aspect-[4/5] place-items-center rounded-[var(--radius-cell-lg)] bg-sand text-olive/40">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Logo variant="mark" className="size-12" decorative />
                    <span className="text-sm font-semibold text-olive/70">Real photo to come</span>
                  </div>
                </div>
                <p className="title mt-5">
                  <Rich text={p.name} />
                </p>
                <p className="mt-1 text-ink/60">{p.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Goal */}
      <section aria-labelledby="goal-title" className="bg-sand py-24 sm:py-32">
        <div className="container-x">
          <Reveal as="p" className="eyebrow text-olive">
            {s.goal.title}
          </Reveal>
          <h2 id="goal-title" data-reveal="up" suppressHydrationWarning style={{ "--d": 80 } as CSSProperties} className="display-lg mt-6 max-w-[18ch]">
            <Rich text={s.goal.body} />
          </h2>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
