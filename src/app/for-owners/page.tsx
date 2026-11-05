import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { BreakItPanel } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero, SectionHead } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { ownersPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/for-owners", ownersPage.meta);

const chain = ["A refund", "A bad review", "A customer who never comes back"];

export default function OwnersPage() {
  const o = ownersPage;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "For owners", path: "/for-owners" }])} />
      <PageHero
        eyebrow="For cafés, restaurants and cloud kitchens"
        title={o.title}
        body={o.body}
        aside={
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-cell-lg)] bg-terra">
            <Image
              src="/images/tray-held-curry-rice.jpg"
              alt="A Resydue tray of curry and rice being carried"
              fill
              preload
              sizes="(min-width: 1024px) 38vw, 92vw"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-linen/90 px-4 py-3 backdrop-blur-md">
              <span className="text-sm font-semibold">Kitchen to customer</span>
              <span className="text-sm font-semibold tnum text-terra">40 min in a bag</span>
            </div>
          </div>
        }
      >
        <ButtonLink href="/samples" tone="terra">
          Get free samples
        </ButtonLink>
      </PageHero>

      {/* One leak, three costs */}
      <section aria-labelledby="leak-title" className="bg-ink py-24 text-linen sm:py-32">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <SectionHead eyebrow="The real price" title={o.leaks.title} id="leak-title" dark className="lg:col-span-6" />
            <Reveal as="p" delay={120} className="lede self-end text-linen/70 lg:col-span-5 lg:col-start-8">
              {o.leaks.body}
            </Reveal>
          </div>
          <ol className="mt-14 grid gap-3 sm:mt-20 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            <li data-reveal="up" suppressHydrationWarning className="flex items-center gap-4 rounded-[var(--radius-cell)] bg-terra p-6 md:col-span-5 md:mb-3">
              <span className="title">One soggy delivery</span>
              <span className="text-linen/70">leads to…</span>
            </li>
            {chain.map((c, i) => (
              <li key={c} className="contents">
                <div data-reveal="up" suppressHydrationWarning style={{ "--d": 120 + i * 120 } as CSSProperties} className="flex min-h-36 flex-col justify-between rounded-[var(--radius-cell)] bg-linen/[0.06] p-6 ring-1 ring-inset ring-linen/12">
                  <span className="eyebrow tnum text-gold">Cost {i + 1}</span>
                  <span className="title mt-6">{c}</span>
                </div>
                {i < chain.length - 1 ? (
                  <span aria-hidden className="hidden items-center px-1 text-gold md:flex">
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 12h16m-5-5 5 5-5 5" />
                    </svg>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <Reveal as="p" className="mt-10 max-w-xl text-lg font-semibold text-gold">
            A pack that holds is the cheapest thing you can fix.
          </Reveal>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="asks-title" className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="Straight answers" title={o.asks.title} id="asks-title" />
          <dl className="mt-12 grid gap-3 sm:mt-16 md:grid-cols-2 md:gap-4">
            {o.asks.items.map((a, i) => (
              <div
                key={a.q}
                data-reveal="up" suppressHydrationWarning
                style={{ "--d": (i % 2) * 90 } as CSSProperties}
                className="rounded-[var(--radius-cell-lg)] bg-sand/60 p-7 sm:p-9"
              >
                <dt className="display-md text-[clamp(1.6rem,2.6vw,2.4rem)]">“{a.q}”</dt>
                <dd className="mt-5 text-[1.08rem] leading-relaxed text-ink/75">
                  <Rich text={a.a} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
