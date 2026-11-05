import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, WordsReveal } from "@/components/ui/Reveal";
import { Rich, isPlaceholder } from "@/components/ui/Rich";
import { home, products, type Product } from "@/content/site";

export function StatusPill({ status, className = "" }: { status: Product["status"]; className?: string }) {
  const confirmed = status === "Available";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold backdrop-blur-md ${
        confirmed ? "bg-olive text-linen" : "bg-linen/90 text-ink"
      } ${className}`}
    >
      <i className={`size-1.5 rounded-full ${confirmed ? "bg-gold" : "bg-terra"}`} aria-hidden />
      {isPlaceholder(status) ? <Rich text={status} /> : status}
    </span>
  );
}

export function ProductCard({ p, index, priority = false }: { p: Product; index: number; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/products#${p.slug}`} className="absolute inset-0 z-10 rounded-[var(--radius-cell)]" aria-label={`${p.name}: see specs`} />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-cell)] bg-gold">
        <Image
          src={p.image}
          alt={p.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 82vw"
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-strong)] group-hover:scale-[1.04]"
        />
        <StatusPill status={p.status} className="absolute left-4 top-4" />
        <span
          aria-hidden
          className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-linen text-ink transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:-rotate-45"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
          </svg>
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-6">
        <p className="eyebrow tnum text-ink/65">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="title mt-3">{p.name}</h3>
        <p className="mt-2 text-[1.02rem] leading-relaxed text-ink/70">{p.short}</p>
        {p.homeSpecs.length ? (
          <ul className="mt-5 border-t border-ink/12 text-[0.95rem]">
            {p.homeSpecs.map((s) => (
              <li key={s} className="flex gap-3 border-b border-ink/12 py-2.5">
                <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-terra" />
                <span>
                  <Rich text={s} />
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export function RangeSection() {
  const r = home.range;
  const shown = products.slice(0, 3);
  return (
    <section aria-labelledby="range-title" className="bg-linen py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal as="p" className="eyebrow text-terra">
              {r.eyebrow}
            </Reveal>
            <WordsReveal text={r.title} id="range-title" className="display-lg mt-5" />
          </div>
          <Reveal delay={150}>
            <ButtonLink href={r.cta.href} tone="outline">
              {r.cta.label}
            </ButtonLink>
          </Reveal>
        </div>

        <ul className="-mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] sm:mt-16 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {shown.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 90} className="w-[82%] shrink-0 snap-start xs:w-[70%] md:w-auto">
              <ProductCard p={p} index={i} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const strip = [
  { src: "/images/clamshell-sandwich-fries.jpg", alt: "Resydue box with sandwiches and fries" },
  { src: "/images/kraft-bowls-stacked-meal.jpg", alt: "Stacked kraft Resydue bowls with a meal inside" },
  { src: "/images/tray-noodles-dark.jpg", alt: "Noodles lifted from a Resydue compartment tray" },
  { src: "/images/boxes-stacked-salad-cutlery.jpg", alt: "A stack of Resydue boxes with salad" },
  { src: "/images/cups-trio.jpg", alt: "Three Resydue cups" },
  { src: "/images/clamshell-closed.jpg", alt: "A closed Resydue box" },
  { src: "/images/boxes-flatlay-meals.jpg", alt: "Overhead view of Resydue boxes and bowls holding meals" },
  { src: "/images/tray-curry-rice.jpg", alt: "Curry and rice in a Resydue tray" },
];

export function PhotoStrip() {
  return (
    <section aria-label="Resydue packs on real menus" className="overflow-hidden bg-ink py-20 text-linen sm:py-28">
      <div className="container-x mb-10 flex items-end justify-between gap-6 sm:mb-14">
        <Reveal as="p" className="display-md max-w-[16ch]">
          Real food. Real sauce. <span className="text-gold">Real menus.</span>
        </Reveal>
        <Reveal as="p" delay={120} className="hidden max-w-xs text-right text-linen/60 md:block">
          Shot full, not empty. Every pack here is holding the meal it was made for.
        </Reveal>
      </div>
      <div className="marquee flex">
        <ul className="marquee-track flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4" style={{ "--marquee-speed": "70s" } as CSSProperties}>
          {[...strip, ...strip].map((s, i) => (
            <li
              key={i}
              aria-hidden={i >= strip.length || undefined}
              className={`relative w-[58vw] shrink-0 overflow-hidden rounded-[var(--radius-cell)] bg-olive sm:w-[30vw] lg:w-[21vw] ${i % 2 ? "aspect-[4/5] sm:mt-14" : "aspect-[4/5]"}`}
            >
              <Image src={s.src} alt={i >= strip.length ? "" : s.alt} fill sizes="(min-width: 1024px) 21vw, (min-width: 640px) 30vw, 58vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PromisesSection() {
  const s = home.standard;
  return (
    <section aria-labelledby="promise-title" className="bg-sand py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal as="p" className="eyebrow text-olive">
              {s.eyebrow}
            </Reveal>
            <WordsReveal text={s.title} id="promise-title" className="display-lg mt-5 max-w-[12ch]" />
          </div>
          <Reveal as="p" delay={120} className="lede self-end text-ink/75 lg:col-span-6 lg:col-start-7">
            {s.body}
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-ink/20 sm:mt-24">
          {s.lines.map((l, i) => (
            <li key={l.k} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-2 border-b border-ink/20 py-6 sm:grid-cols-[4rem_1fr_auto] sm:py-8">
              <span className="eyebrow tnum text-olive">{String(i + 1).padStart(2, "0")}</span>
              <span
                className="ink-fill w-fit pr-[0.04em] text-[clamp(2.6rem,9vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.05em]"
                style={{ "--ink-off": "rgb(1 1 1 / 0.16)" } as CSSProperties}
              >
                {l.k}
              </span>
              <span className="col-start-2 text-[1.05rem] text-ink/70 sm:col-start-3 sm:max-w-[16ch] sm:text-right">{l.q}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-start gap-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-ink/70">If we cannot answer all three with proof, it does not ship.</p>
          <ButtonLink href={s.cta.href} tone="ink">
            {s.cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function BreakItPanel({ title = home.breakIt.title, body = home.breakIt.body }: { title?: string; body?: string }) {
  return (
    <section aria-labelledby="break-title" className="bg-linen py-6 sm:py-10">
      <div className="container-x">
        <Reveal kind="clip" className="grain relative overflow-hidden rounded-[var(--radius-cell-lg)] bg-terra px-6 py-16 text-linen sm:px-12 sm:py-24 lg:px-20 lg:py-28">
          {/* a crack that draws itself across the panel */}
          <svg
            aria-hidden
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            className="crack pointer-events-none absolute inset-0 h-full w-full text-gold"
            fill="none"
          >
            <path
              d="M-10 250 L180 232 L230 268 L360 210 L420 236 L540 170 L600 204 L700 150 L760 182 L880 120 L940 150 L1060 92 L1210 110"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
            />
          </svg>
          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 id="break-title" className="display-xl [text-wrap:balance] lg:col-span-8">
              {title}
            </h2>
            <div className="lg:col-span-4">
              <p className="lede text-linen/85">
                <Rich text={body} />
              </p>
              <ButtonLink href={home.breakIt.cta.href} tone="linen" className="mt-8">
                {home.breakIt.cta.label}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
