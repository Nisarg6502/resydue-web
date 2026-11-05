import type { CSSProperties, ReactNode } from "react";
import { Rich } from "./Rich";

/** Shared inner-page opener. Words rise on load (CSS only), body fades after. */
export function PageHero({
  eyebrow,
  title,
  body,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  const words = title.split(" ");
  return (
    <section className="pt-[calc(var(--header-h)+3rem)] sm:pt-[calc(var(--header-h)+5rem)]">
      <div className="container-x grid gap-10 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-8">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
          <p className="hero-fade eyebrow flex items-center gap-3 text-terra" style={{ "--d": 60 } as CSSProperties}>
            <span className="inline-block h-px w-8 bg-terra" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="display-lg mt-6 max-w-[16ch] sm:mt-8">
            <span className="sr-only">{title}</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <span key={i} className="line-mask">
                  <span className="hero-word" style={{ "--d": 120 + i * 60 } as CSSProperties}>
                    {w}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </span>
          </h1>
          {body ? (
            <p className="hero-fade lede mt-8 max-w-[38rem] text-ink/75" style={{ "--d": 120 + words.length * 60 + 120 } as CSSProperties}>
              <Rich text={body} />
            </p>
          ) : null}
          {children ? (
            <div className="hero-fade mt-10" style={{ "--d": 120 + words.length * 60 + 220 } as CSSProperties}>
              {children}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="hero-fade lg:col-span-5" style={{ "--d": 300 } as CSSProperties}>
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  id,
  dark = false,
  onSand = false,
  className = "",
}: {
  eyebrow: string;
  title: string;
  id: string;
  dark?: boolean;
  onSand?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p data-reveal="up" suppressHydrationWarning className={`eyebrow ${dark ? "text-gold" : onSand ? "text-olive" : "text-terra"}`}>
        {eyebrow}
      </p>
      <h2 id={id} data-reveal="up" suppressHydrationWarning style={{ "--d": 80 } as CSSProperties} className="display-md mt-5 max-w-[18ch]">
        {title}
      </h2>
    </div>
  );
}
