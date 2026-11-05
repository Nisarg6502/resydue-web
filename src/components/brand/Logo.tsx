import { favicon, mark, primary, secondary } from "./logo-paths";

type Variant = "primary" | "secondary" | "mark" | "favicon";
const sources = { primary, secondary, mark, favicon } as const;

/**
 * The official Resydue lockups, rendered from the supplied vector paths.
 * Colour comes from `currentColor` so it can only be set with a palette text-* class.
 * Guidelines: never stretch, skew, outline, shadow or gradient the logo.
 * Proportions are locked by the viewBox, so set only ONE of width/height via className.
 */
export function Logo({
  variant = "primary",
  className,
  title = "Resydue",
  decorative = false,
}: {
  variant?: Variant;
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  const src = sources[variant];
  return (
    <svg
      viewBox={src.viewBox}
      className={className}
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      {src.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
