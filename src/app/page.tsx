import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LiningSpecimen } from "@/components/home/LiningSpecimen";
import { BreakItPanel, PhotoStrip, PromisesSection, RangeSection } from "@/components/home/Sections";
import { LazyStressTest } from "@/components/home/LazyStressTest";
import { pageMeta } from "@/components/seo/JsonLd";
import { Reveal, WordsReveal } from "@/components/ui/Reveal";
import { home } from "@/content/site";

export const metadata: Metadata = pageMeta("/", home.meta);

export default function HomePage() {
  const l = home.lining;
  const w = home.worstDay;
  return (
    <>
      <Hero />

      {/* 01 — The lining */}
      <section aria-labelledby="lining-title" className="bg-ink py-24 text-linen sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 lg:pt-4">
            <Reveal as="p" className="eyebrow text-gold">
              {l.eyebrow}
            </Reveal>
            <WordsReveal text={l.title} id="lining-title" className="display-md mt-5 max-w-[14ch]" />
            <Reveal as="p" delay={160} className="lede mt-6 text-linen/70">
              {l.body}
            </Reveal>
            <Reveal as="p" delay={240} className="mt-8 flex items-center gap-3 text-sm font-semibold text-linen/65">
              <span aria-hidden className="inline-block h-px w-8 bg-gold" />
              Compare the two walls, then see what is left after composting
            </Reveal>
          </div>
          <Reveal kind="fade" delay={120} className="lg:col-span-8">
            <LiningSpecimen />
          </Reveal>
        </div>
      </section>

      {/* 02 — The worst day */}
      <section aria-labelledby="worst-title" className="bg-linen py-24 sm:py-32">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal as="p" className="eyebrow text-terra">
                {w.eyebrow}
              </Reveal>
              <WordsReveal text={w.title} id="worst-title" className="display-lg mt-5 max-w-[15ch]" />
            </div>
            <Reveal as="p" delay={140} className="lede self-end text-ink/75 lg:col-span-5">
              {w.body}
            </Reveal>
          </div>
          <Reveal kind="fade" delay={100} className="mt-14 sm:mt-20">
            <LazyStressTest />
          </Reveal>
        </div>
      </section>

      <RangeSection />
      <PhotoStrip />
      <PromisesSection />
      <BreakItPanel />
    </>
  );
}
