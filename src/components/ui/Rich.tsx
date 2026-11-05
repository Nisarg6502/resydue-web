import { Fragment } from "react";

/**
 * Renders copy and turns every [bracketed placeholder] into a visible
 * "to be confirmed" token. No real figure is ever invented.
 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.endsWith("]") ? (
          <span key={i} className="tbd" title="To be confirmed: we only publish tested figures">
            {p.slice(1, -1)}
            <span className="sr-only"> (to be confirmed)</span>
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export const isPlaceholder = (s: string) => /^\[.*\]$/.test(s.trim());
