import type { Metadata } from "next";
import Image from "next/image";
import { BreakItPanel, StatusPill } from "@/components/home/Sections";
import { JsonLd, breadcrumbs, pageMeta } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { products, productsPage } from "@/content/site";

export const metadata: Metadata = pageMeta("/products", productsPage.meta);

export default function ProductsPage() {
  const c = productsPage.custom;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Range", path: "/products" }])} />
      <PageHero eyebrow="The range" title={productsPage.title} body={productsPage.body}>
        <nav aria-label="Jump to product" className="flex flex-wrap gap-2">
          {products.map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="inline-flex min-h-11 items-center rounded-full px-5 text-[0.92rem] font-semibold ring-1 ring-inset ring-ink/15 transition-[box-shadow,background-color] duration-200 hover:bg-ink hover:text-linen hover:ring-ink"
            >
              {p.name.replace("Resydue ", "")}
            </a>
          ))}
        </nav>
      </PageHero>

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

      {/* Custom branding */}
      <section aria-labelledby="custom-title" className="bg-olive py-24 text-linen sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Reveal as="p" className="eyebrow text-gold">
              Custom runs
            </Reveal>
            <Reveal as="h2" id="custom-title" delay={60} className="display-lg mt-5 max-w-[12ch]">
              {c.title}
            </Reveal>
            <Reveal as="p" delay={120} className="lede mt-6 text-linen/80">
              <Rich text={c.body} />
            </Reveal>
            <Reveal as="p" delay={160} className="mt-3 text-linen/65">
              <Rich text={c.terms} />
            </Reveal>
            <Reveal delay={220} className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={c.primary.href} tone="linen">
                {c.primary.label}
              </ButtonLink>
              <ButtonLink href={c.secondary.href} tone="outline-linen">
                {c.secondary.label}
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal kind="clip" className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-cell-lg)] bg-gold lg:col-span-6">
            <Image
              src="/images/boxes-stack-sandwich.jpg"
              alt="Stacked Resydue boxes beside an open box with a sandwich and fries"
              fill
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      <BreakItPanel />
    </>
  );
}
