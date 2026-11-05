import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Marks an element for the shared reveal observer (see RevealObserver).
 * Pure server component; motion is CSS so it stays off the main thread.
 */
export function Reveal({
  as: Tag = "div",
  kind = "up",
  delay = 0,
  className,
  children,
  style,
  ...rest
}: {
  as?: ElementType;
  kind?: "up" | "fade" | "clip";
  delay?: number;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  return (
    <Tag data-reveal={kind} suppressHydrationWarning className={className} style={{ ...style, "--d": delay } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}

/** Headline that rises word-by-word behind a mask when scrolled into view. */
export function WordsReveal({
  text,
  as: Tag = "h2",
  className,
  step = 55,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  step?: number;
  id?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag data-reveal-words="" suppressHydrationWarning className={className} id={id}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="line-mask">
            <span style={{ "--d": i * step } as CSSProperties}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
