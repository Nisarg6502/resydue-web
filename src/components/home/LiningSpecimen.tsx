"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* deterministic PRNG so server and client draw identical fibres */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const W = 1000;
const H = 560;
const SAUCE_TOP = 70;
const LINE_Y = 214;

const fibres = (() => {
  const r = rng(7);
  const out: string[] = [];
  for (let i = 0; i < 150; i++) {
    const x = r() * W;
    const y = 250 + r() * 220;
    const len = 30 + r() * 110;
    const a = (r() - 0.5) * 0.5;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    const cx = (x + x2) / 2 + (r() - 0.5) * 30;
    const cy = (y + y2) / 2 + (r() - 0.5) * 18;
    out.push(`M${x.toFixed(1)} ${y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return out.join("");
})();

const droplets = (() => {
  const r = rng(21);
  return Array.from({ length: 22 }, () => ({ x: r() * W, y: SAUCE_TOP + 40 + r() * 90, r: 3 + r() * 9 }));
})();

const sauceTop = `M0 ${SAUCE_TOP + 18} C 120 ${SAUCE_TOP - 10}, 230 ${SAUCE_TOP + 40}, 360 ${SAUCE_TOP + 12} S 600 ${SAUCE_TOP - 6}, 720 ${SAUCE_TOP + 20} S 910 ${SAUCE_TOP + 30}, 1000 ${SAUCE_TOP + 4} V ${LINE_Y} H 0 Z`;
const paperBottom = `M0 ${LINE_Y} H ${W} V 474 C 900 486, 820 468, 700 480 S 480 470, 360 484 S 140 470, 0 482 Z`;

function Layer({ kind }: { kind: "typical" | "resydue" }) {
  const typical = kind === "typical";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id={`hatch-${kind}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="10" height="10" fill="#f3e9dc" />
          <rect width="4" height="10" fill="#e2cba2" opacity=".55" />
        </pattern>
        <pattern id={`dots-${kind}`} width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#ce8a39" />
          <circle cx="4.5" cy="4.5" r="1.4" fill="#a44819" opacity=".55" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={typical ? "#010101" : "#3e3f20"} />
      {/* sauce */}
      <path d={sauceTop} fill="#a44819" />
      {droplets.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ce8a39" opacity=".85" />
      ))}
      {/* paper fibre */}
      <path d={paperBottom} fill="#e2cba2" />
      <path d={fibres} stroke="#3e3f20" strokeOpacity=".28" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* the barrier layer */}
      {typical ? (
        <>
          <rect x="0" y={LINE_Y - 6} width={W} height="34" fill={`url(#hatch-${kind})`} />
          <rect x="0" y={LINE_Y - 6} width={W} height="3" fill="#f3e9dc" />
        </>
      ) : (
        <rect x="0" y={LINE_Y - 4} width={W} height="20" fill={`url(#dots-${kind})`} />
      )}
    </svg>
  );
}

export function LiningSpecimen() {
  const wrap = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useRef(0.5);
  const [value, setValue] = useState(50);
  const dragging = useRef(false);
  const introDone = useRef(false);

  const apply = useCallback((p: number) => {
    p = Math.min(0.97, Math.max(0.03, p));
    pos.current = p;
    if (top.current) top.current.style.clipPath = `inset(0 0 0 ${(p * 100).toFixed(2)}%)`;
    if (handle.current) handle.current.style.transform = `translate3d(${(p * 100).toFixed(2)}cqw,0,0)`;
  }, []);

  const commit = useCallback(() => setValue(Math.round(pos.current * 100)), []);

  // Intro: slide from the right to the middle once, so people see it moves.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    apply(0.86);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || introDone.current) return;
        introDone.current = true;
        io.disconnect();
        if (reduce) return apply(0.5), commit();
        const from = 0.86,
          to = 0.5,
          dur = 1400,
          t0 = performance.now();
        const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now: number) => {
          if (dragging.current) return;
          const t = Math.min(1, (now - t0) / dur);
          apply(from + (to - from) * ease(t));
          if (t < 1) requestAnimationFrame(step);
          else commit();
        };
        setTimeout(() => requestAnimationFrame(step), 250);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [apply, commit]);

  const fromEvent = (e: React.PointerEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    apply((e.clientX - r.left) / r.width);
  };

  return (
    <div className="relative">
      <div
        ref={wrap}
        className="relative aspect-square w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[var(--radius-cell-lg)] [container-type:inline-size] sm:aspect-[16/10]"
        onPointerDown={(e) => {
          dragging.current = true;
          introDone.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          fromEvent(e);
        }}
        onPointerMove={(e) => dragging.current && fromEvent(e)}
        onPointerUp={() => {
          dragging.current = false;
          commit();
        }}
        onPointerCancel={() => {
          dragging.current = false;
          commit();
        }}
      >
        <Layer kind="typical" />
        <div ref={top} className="absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}>
          <Layer kind="resydue" />
        </div>

        {/* corner labels */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 sm:p-6">
          <span className="rounded-full bg-linen/10 px-3 py-1.5 text-[0.72rem] font-semibold text-linen ring-1 ring-inset ring-linen/20 backdrop-blur-sm sm:text-xs">
            A typical “paper” box
          </span>
          <span className="rounded-full bg-gold px-3 py-1.5 text-[0.72rem] font-semibold text-ink sm:text-xs">Resydue</span>
        </div>

        {/* layer legend, left (typical) and right (resydue) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 p-4 text-[0.7rem] font-semibold sm:p-6 sm:text-[0.8rem]">
          <ul className="flex flex-col items-start gap-1.5 text-ink">
            <li className="flex items-center gap-2 rounded-full bg-linen/90 py-1 pl-2 pr-3 backdrop-blur-sm">
              <i className="size-2.5 rounded-sm bg-linen ring-1 ring-ink/30" />
              Plastic skin
            </li>
            <li className="flex items-center gap-2 rounded-full bg-linen/90 py-1 pl-2 pr-3 backdrop-blur-sm">
              <i className="size-2.5 rounded-sm bg-sand ring-1 ring-ink/30" />
              Paper
            </li>
          </ul>
          <ul className="flex flex-col items-end gap-1.5 justify-self-end text-right text-ink">
            <li className="flex items-center justify-end gap-2 rounded-full bg-linen/90 py-1 pl-3 pr-2 backdrop-blur-sm">
              Bio-based coating
              <i className="size-2.5 rounded-sm bg-gold ring-1 ring-ink/30" />
            </li>
            <li className="flex items-center justify-end gap-2 rounded-full bg-linen/90 py-1 pl-3 pr-2 backdrop-blur-sm">
              Paper fibre
              <i className="size-2.5 rounded-sm bg-sand ring-1 ring-ink/30" />
            </li>
          </ul>
        </div>

        {/* handle */}
        <div ref={handle} className="pointer-events-none absolute inset-y-0 left-0 w-0" style={{ transform: "translate3d(50cqw,0,0)" }}>
          <div className="absolute inset-y-0 -left-px w-[2px] bg-linen" />
          <div className="absolute left-0 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-linen text-ink shadow-[0_8px_28px_-6px_rgb(1_1_1/0.6)] [.group:focus-within_&]:ring-2">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Keyboard + screen reader control, mirrors the drag */}
      <label className="mt-4 flex items-center gap-4 text-sm text-linen/60">
        <span className="shrink-0">Typical</span>
        <input
          type="range"
          min={3}
          max={97}
          value={value}
          aria-label="Compare a typical paper box with Resydue"
          aria-valuetext={value < 50 ? "Showing more of Resydue" : "Showing more of a typical box"}
          onChange={(e) => {
            const v = Number(e.target.value);
            setValue(v);
            introDone.current = true;
            apply(v / 100);
          }}
          className="h-11 w-full cursor-pointer accent-gold"
        />
        <span className="shrink-0">Resydue</span>
      </label>
    </div>
  );
}
