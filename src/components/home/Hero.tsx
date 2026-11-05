import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { home } from "@/content/site";
import { HeroParallax } from "./HeroParallax";

const ticker = [
  "No plastic lining",
  "No PFAS",
  "Built for hot, oily, busy kitchens",
  "Friday rush",
  "Rain",
  "A 40-minute ride",
  "Oily noodles at 90°",
  "Tested, then published",
];

export function Hero() {
  const h = home.hero;
  return (
    <section aria-labelledby="hero-title" className="relative overflow-clip pt-[calc(var(--header-h)+1.75rem)] sm:pt-[calc(var(--header-h)+2.5rem)]">
      <div className="container-x grid gap-10 pb-12 lg:grid-cols-12 lg:gap-8 lg:pb-16">
        {/* Copy */}
        <div className="flex flex-col lg:col-span-7 lg:pt-6">
          <p className="hero-fade eyebrow flex items-center gap-3 text-olive" style={{ "--d": 80 } as CSSProperties}>
            <span className="inline-block h-px w-8 bg-terra" aria-hidden />
            {h.eyebrow}
          </p>

          <h1 id="hero-title" className="display-xl mt-6 text-ink sm:mt-8">
            <span className="sr-only">{h.title.join(" ")}</span>
            <span aria-hidden className="block">
              {h.title.map((w, i) => (
                <Fragment key={i}>
                  <span className="line-mask">
                    <span className={`hero-word ${i >= 2 ? "text-olive" : ""}`} style={{ "--d": 80 + i * 55 } as CSSProperties}>
                      {w}
                    </span>
                  </span>
                  {i === 1 ? <br /> : i < h.title.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
          </h1>

          <div className="mt-8 grid gap-8 sm:mt-10 lg:mt-auto lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-end lg:pt-12">
            <p className="hero-fade lede max-w-[34rem] text-ink/75" style={{ "--d": 420 } as CSSProperties}>
              {h.body}
            </p>
          </div>
          <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": 500 } as CSSProperties}>
            <ButtonLink href={h.primary.href} tone="terra">
              {h.primary.label}
            </ButtonLink>
            <ButtonLink href={h.secondary.href} tone="outline">
              {h.secondary.label}
            </ButtonLink>
          </div>
        </div>

        {/* Bento: three compartments, the logo's partition plate as layout */}
        <HeroParallax className="lg:col-span-5">
          <div className="grid h-[min(78vh,46rem)] min-h-[30rem] grid-cols-[1.55fr_1fr] grid-rows-[1fr_1fr] gap-2.5 max-lg:h-auto max-lg:min-h-0 max-lg:aspect-[5/4] max-sm:aspect-[4/5] sm:gap-3">
            <figure className="hero-cell relative row-span-2 overflow-hidden rounded-[var(--radius-cell)] bg-gold" style={{ "--d": 120 } as CSSProperties}>
              <div data-depth="14" className="absolute -inset-4 will-change-transform">
                <Image
                  src="/images/box-held-paneer-salad.jpg"
                  alt="A hand carrying a Resydue box of paneer tikka salad"
                  fill
                  preload
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 26vw, 58vw"
                  className="object-cover object-[50%_30%]"
                />
              </div>
              <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-linen/90 py-1.5 pl-4 pr-1.5 text-[0.8rem] font-semibold text-ink backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-auto">
                Resydue Box
                <span className="rounded-full bg-olive px-2.5 py-1 text-[0.7rem] text-linen">Available</span>
              </figcaption>
            </figure>
            <figure className="hero-cell relative overflow-hidden rounded-[var(--radius-cell)] bg-gold" style={{ "--d": 200 } as CSSProperties}>
              <div data-depth="-10" className="absolute -inset-4 will-change-transform">
                <Image
                  src="/images/kraft-bowls-tower.jpg"
                  alt="Lidded Resydue bowls balanced in a tower"
                  fill
                  sizes="(min-width: 1024px) 16vw, 36vw"
                  className="object-cover object-[60%_35%]"
                />
              </div>
            </figure>
            <figure className="hero-cell relative overflow-hidden rounded-[var(--radius-cell)] bg-terra" style={{ "--d": 280 } as CSSProperties}>
              <div data-depth="8" className="absolute -inset-4 will-change-transform">
                <Image
                  src="/images/cups-balancing.jpg"
                  alt="Three Resydue cups stacked at an angle"
                  fill
                  sizes="(min-width: 1024px) 16vw, 36vw"
                  className="object-cover object-[50%_40%]"
                />
              </div>
              <figcaption className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-[0.72rem] font-semibold text-linen backdrop-blur-md">
                No plastic lining
              </figcaption>
            </figure>
          </div>
        </HeroParallax>
      </div>

      {/* Test-log ticker: the logomark used as a seal between claims */}
      <div className="hero-fade border-y border-ink/10 bg-linen" style={{ "--d": 650 } as CSSProperties}>
        <div className="marquee relative flex overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-hidden>
          <div className="marquee-track flex shrink-0 items-center" style={{ "--marquee-speed": "48s" } as CSSProperties}>
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {ticker.map((t) => (
                  <span key={t + k} className="flex items-center gap-6 pr-6 text-[0.95rem] font-semibold tracking-[-0.01em] text-olive sm:text-base">
                    {t}
                    <Logo variant="favicon" className="size-4 text-terra" decorative />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
