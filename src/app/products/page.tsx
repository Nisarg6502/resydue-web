import type { Metadata } from "next";
import Image from "next/image";
import { BreakItPanel, StatusPill } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { LogoStudio } from "@/components/studio/LogoStudio";
import { products, productsPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/products", productsPage.meta);

export default function ProductsPage() {
  const c = productsPage.custom;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Range", path: "/products" }])} />
      <PageHero
        eyebrow="The range"
        title={productsPage.title}
        body={productsPage.body}
        aside={
          <nav aria-label="Jump to product" className="lg:pt-14">
            <p className="eyebrow flex items-center justify-between text-ink/60">
              <span>In the range</span>
              <span className="tnum">{String(products.length).padStart(2, "0")}</span>
            </p>
            <ul className="mt-4 border-t border-ink/15">
              {products.map((p, i) => (
                <li key={p.slug}>
                  <a
                    href={`#${p.slug}`}
                    className="group flex items-center gap-4 border-b border-ink/15 py-3 transition-colors duration-200 sm:gap-5"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-gold sm:size-16">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-strong)] group-hover:scale-110"
                      />
                    </span>
                    <span className="eyebrow tnum w-6 shrink-0 text-terra">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.05rem] font-semibold tracking-[-0.01em]">{p.name.replace("Resydue ", "")}</span>
                      <span className="block truncate text-[0.9rem] text-ink/60">{p.forWhat}</span>
                    </span>
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-ink/15 transition-[background-color,color,box-shadow] duration-300 group-hover:bg-ink group-hover:text-linen group-hover:ring-ink"
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5 rotate-90" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="#studio" className="group mt-5 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-terra">
              <span className="underline decoration-terra/30 underline-offset-4 transition-[text-decoration-color] group-hover:decoration-terra">
                Preview your logo on the range in 3D
              </span>
              <span aria-hidden>↓</span>
            </a>
          </nav>
        }
      />

      <section aria-label="Products" className="pb-24 sm:pb-32">
        <div className="container-x space-y-20 sm:space-y-28">
          {products.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <article id={p.slug} key={p.slug} className="grid scroll-mt-28 items-center gap-8 border-t border-ink/12 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-12">
                <Reveal kind="clip" className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius-cell-lg)] bg-gold lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 1024px) 46vw, 92vw" className="object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  <StatusPill status={p.status} className="absolute left-5 top-5" />
                </Reveal>
                <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
                  <Reveal as="p" className="eyebrow tnum text-terra">
                    {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                  </Reveal>
                  <Reveal as="h2" delay={60} className="display-md mt-4">
                    {p.name}
                  </Reveal>
                  <Reveal as="p" delay={120} className="lede mt-4 text-ink/70">
                    {p.forWhat}
                  </Reveal>
                  <Reveal delay={180} className="mt-8 rounded-[var(--radius-cell)] bg-sand/50 p-2">
                    <div className="flex items-center justify-between px-4 pb-2 pt-3">
                      <span className="eyebrow text-olive">Spec sheet</span>
                      <span className="text-xs text-ink/70">Dashed = to be confirmed by test</span>
                    </div>
                    <dl className="rounded-[1.25rem] bg-linen px-4">
                      {p.specs.map((s) => (
                        <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-dashed border-ink/15 py-3.5 last:border-0">
                          <dt className="text-ink/60">{s.label}</dt>
                          <dd className="text-right font-semibold">
                            <Rich text={s.value} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                  <Reveal delay={240} className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href="/samples" tone="terra">
                      Sample the {p.name.replace("Resydue ", "").toLowerCase()}
                    </ButtonLink>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Custom branding + 3D logo studio */}
      <section aria-labelledby="custom-title" className="bg-olive py-20 text-linen sm:py-28">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal as="p" className="eyebrow text-gold">
                Custom runs
              </Reveal>
              <Reveal as="h2" id="custom-title" delay={60} className="display-lg mt-5 max-w-[13ch]">
                {c.title}
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <Reveal as="p" delay={120} className="lede text-linen/80">
                <Rich text={c.body} /> Try it below: drop in your logo and see it on the pack before you ask us for a quote.
              </Reveal>
              <Reveal delay={180} className="mt-6">
                <ButtonLink href={c.secondary.href} tone="outline-linen">
                  {c.secondary.label}
                </ButtonLink>
              </Reveal>
            </div>
          </div>
          <Reveal delay={120} className="mt-12 sm:mt-16">
            <LogoStudio quoteHref={c.primary.href} terms={c.terms} />
          </Reveal>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
