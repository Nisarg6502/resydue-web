import type { CSSProperties } from "react";
import { Rich } from "@/components/ui/Rich";
import { coatingPage } from "@/content/site";

/**
 * Isometric exploded view of a pack wall. Pure CSS 3D.
 * Layers separate with a scroll-driven animation where supported, and sit
 * pre-separated elsewhere, so it always reads correctly.
 */
const fills = ["bg-terra", "bg-gold", "bg-sand"];

export function ExplodedLayers() {
  const layers = coatingPage.layers;
  return (
    <div className="grid items-center gap-10 lg:grid-cols-12">
      <div className="explode relative mx-auto aspect-square w-full max-w-[34rem] [perspective:1600px] lg:col-span-7">
        <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
          {layers.map((l, i) => (
            <div
              key={l.name}
              className={`layer absolute h-[52%] w-[52%] rounded-[2rem] ${fills[i]} shadow-[0_30px_60px_-30px_rgb(1_1_1/0.45)] ring-1 ring-inset ring-ink/10`}
              style={{ "--i": i, zIndex: layers.length - i } as CSSProperties}
            >
              {i === 2 ? (
                <svg viewBox="0 0 100 100" className="h-full w-full rounded-[2rem] opacity-40" preserveAspectRatio="none" aria-hidden>
                  {Array.from({ length: 26 }, (_, k) => (
                    <path key={k} d={`M${(k * 37) % 100} ${(k * 53) % 100} q 8 ${k % 2 ? 4 : -4} 18 ${k % 3 ? 2 : -3}`} stroke="#3e3f20" strokeWidth=".7" fill="none" />
                  ))}
                </svg>
              ) : i === 1 ? (
                <div className="h-full w-full rounded-[2rem] bg-[radial-gradient(circle,rgb(164_72_25/.45)_1.2px,transparent_1.4px)] [background-size:10px_10px]" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <ol className="space-y-3 lg:col-span-5">
        {layers.map((l, i) => (
          <li
            key={l.name}
            data-reveal="up" suppressHydrationWarning
            style={{ "--d": i * 90 } as CSSProperties}
            className="flex items-start gap-4 rounded-[var(--radius-cell)] bg-linen p-5 ring-1 ring-inset ring-ink/10"
          >
            <span className={`mt-1 size-5 shrink-0 rounded-md ${fills[i]} ring-1 ring-inset ring-ink/15`} aria-hidden />
            <span>
              <span className="eyebrow tnum text-ink/65">Layer {String(i + 1).padStart(2, "0")}</span>
              <span className="title mt-2 block">{l.name}</span>
              <span className="mt-1 block text-ink/65">
                <Rich text={l.note} />
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
