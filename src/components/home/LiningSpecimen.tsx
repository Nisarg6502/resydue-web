"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * "Inside the wall": two cross-sections side by side (a typical lined box vs Resydue), labelled
 * on the layers themselves, with one switch that shows what is left after composting.
 * Claims stay inside what the site already says: the typical box hides a plastic film,
 * Resydue has none. No figures are invented here.
 */

type Kind = "typical" | "resydue";
type Stage = "use" | "compost";

/* deterministic PRNG so server and client draw identical fibres */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const W = 400;
const H = 300;
const FOOD_TOP = 22;
const BAR_Y = 112; // barrier top
const BAR_H = 20;
const PAPER_Y = BAR_Y + BAR_H;

const fibres = (() => {
  const r = rng(7);
  const out: string[] = [];
  for (let i = 0; i < 70; i++) {
    const x = r() * W;
    const y = PAPER_Y + 10 + r() * (H - PAPER_Y - 20);
    const len = 18 + r() * 60;
    const a = (r() - 0.5) * 0.5;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    const cx = (x + x2) / 2 + (r() - 0.5) * 16;
    const cy = (y + y2) / 2 + (r() - 0.5) * 10;
    out.push(`M${x.toFixed(1)} ${y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return out.join("");
})();

const droplets = (() => {
  const r = rng(21);
  return Array.from({ length: 12 }, () => ({ x: 12 + r() * (W - 24), y: FOOD_TOP + 26 + r() * 56, r: 2.5 + r() * 6 }));
})();

const soil = (() => {
  const r = rng(33);
  return Array.from({ length: 70 }, () => ({ x: r() * W, y: PAPER_Y - 6 + r() * (H - PAPER_Y + 6), r: 1 + r() * 3.2, gold: r() < 0.35 }));
})();

/** The barrier band, cut into pieces so it can break apart (plastic) or dissolve (coating). */
const PIECES = 7;
const flakes = (() => {
  const r = rng(51);
  return Array.from({ length: PIECES }, (_, i) => ({
    x: (W / PIECES) * i,
    dx: (r() - 0.5) * 26,
    dy: 34 + r() * 90,
    rot: (r() - 0.5) * 70,
    delay: 120 + i * 70,
  }));
})();

const foodTop = `M0 ${FOOD_TOP + 14} C 70 ${FOOD_TOP - 6}, 140 ${FOOD_TOP + 26}, 210 ${FOOD_TOP + 8} S 340 ${FOOD_TOP - 4}, 400 ${FOOD_TOP + 12} V ${BAR_Y} H 0 Z`;

function Section({ kind, stage }: { kind: Kind; stage: Stage }) {
  const typical = kind === "typical";
  const composted = stage === "compost";
  const t = (ms: number, extra = ""): CSSProperties => ({
    transition: `opacity 900ms var(--ease-out-strong) ${ms}ms, transform 1100ms var(--ease-out-strong) ${ms}ms${extra}`,
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id={`film-${kind}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#f3e9dc" />
          <rect width="3" height="8" fill="#e2cba2" opacity=".6" />
        </pattern>
        <pattern id={`coat-${kind}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ce8a39" />
          <circle cx="4" cy="4" r="1.3" fill="#a44819" opacity=".55" />
        </pattern>
      </defs>

      {/* soil (after composting) sits underneath everything */}
      <g style={{ ...t(composted ? 300 : 0), opacity: composted ? 1 : 0 }}>
        <rect x="0" y={PAPER_Y - 8} width={W} height={H} fill="#3e3f20" />
        {soil.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.gold ? "#ce8a39" : "#e2cba2"} opacity={s.gold ? 0.55 : 0.35} />
        ))}
      </g>

      {/* food */}
      <g style={{ ...t(0), opacity: composted ? 0 : 1, transform: composted ? "translateY(-18px)" : "none" }}>
        <path d={foodTop} fill="#a44819" />
        {droplets.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ce8a39" opacity=".85" />
        ))}
      </g>

      {/* paper fibre */}
      <g style={{ ...t(composted ? 150 : 250), opacity: composted ? 0 : 1 }}>
        <rect x="0" y={PAPER_Y} width={W} height={H - PAPER_Y} fill="#e2cba2" />
        <path d={fibres} stroke="#3e3f20" strokeOpacity=".28" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>

      {/* barrier: plastic film breaks into flakes and stays; coating leaves nothing behind */}
      {flakes.map((f, i) => {
        const moved = composted
          ? typical
            ? `translate(${f.dx}px, ${f.dy}px) rotate(${f.rot}deg)`
            : `translate(0px, ${f.dy * 0.4}px) scale(.4)`
          : "none";
        return (
          <rect
            key={i}
            x={f.x - 0.5}
            y={BAR_Y}
            width={W / PIECES + 1}
            height={BAR_H}
            fill={`url(#${typical ? "film" : "coat"}-${kind})`}
            style={{
              ...t(composted ? f.delay : 0),
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: moved,
              opacity: composted && !typical ? 0 : 1,
            }}
          />
        );
      })}
      {typical ? (
        <rect x="0" y={BAR_Y} width={W} height="2" fill="#f3e9dc" style={{ ...t(0), opacity: composted ? 0 : 1 }} />
      ) : null}
    </svg>
  );
}

/** Label pinned to a layer: a short rule from the left edge, then a pill. */
function Tag({ top, children, tone = "linen", show = true }: { top: string; children: ReactNode; tone?: "linen" | "gold" | "alert"; show?: boolean }) {
  const toneCls =
    tone === "gold" ? "bg-gold text-ink" : tone === "alert" ? "bg-linen text-ink ring-2 ring-terra" : "bg-linen/90 text-ink";
  return (
    <span
      className="pointer-events-none absolute left-0 flex -translate-y-1/2 items-center transition-[opacity,transform] duration-500 ease-[var(--ease-out-strong)]"
      style={{ top, opacity: show ? 1 : 0, transform: `translateY(-50%) translateX(${show ? 0 : -6}px)` }}
    >
      <i aria-hidden className="block h-px w-4 bg-linen/70 sm:w-6" />
      <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.72rem] font-semibold shadow-[0_4px_14px_-6px_rgb(1_1_1/0.6)] sm:text-[0.8rem] ${toneCls}`}>
        {children}
      </span>
    </span>
  );
}

const pct = (y: number) => `${((y / H) * 100).toFixed(1)}%`;

function Card({ kind, stage }: { kind: Kind; stage: Stage }) {
  const typical = kind === "typical";
  const composted = stage === "compost";
  const verdict = typical
    ? composted
      ? "The paper breaks down. The plastic film stays behind."
      : "Looks like paper. Lined with plastic."
    : composted
      ? "The paper breaks down. No plastic film is left behind."
      : "Paper fibre with a bio-based coating. No plastic.";

  return (
    <figure className="flex flex-col">
      <figcaption className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1.5 text-[0.78rem] font-semibold ${
            typical ? "bg-linen/10 text-linen ring-1 ring-inset ring-linen/20" : "bg-gold text-ink"
          }`}
        >
          {typical ? "A typical “paper” box" : "Resydue"}
        </span>
      </figcaption>
      <div className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-cell)] ${typical ? "bg-[#141412]" : "bg-olive/60"}`}>
        <Section kind={kind} stage={stage} />
        <Tag top={pct(FOOD_TOP + 48)} show={!composted}>
          Hot, oily food
        </Tag>
        {typical ? (
          <Tag top={composted ? pct(BAR_Y + 92) : pct(BAR_Y + BAR_H / 2)} tone="alert">
            <i aria-hidden className="size-2 rounded-full bg-terra" />
            {composted ? "Plastic film, still here" : "Plastic film"}
          </Tag>
        ) : (
          <Tag top={composted ? pct(BAR_Y + 60) : pct(BAR_Y + BAR_H / 2)} tone="gold">
            {composted ? "No film left" : "Bio-based coating"}
          </Tag>
        )}
        <Tag top={pct(PAPER_Y + 82)} show={!composted}>
          Paper fibre
        </Tag>
        <Tag top={pct(PAPER_Y + 150)} show={composted}>
          Broken down into soil
        </Tag>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[2.8em] text-[0.95rem] leading-snug text-linen/75">
        {verdict}
      </p>
    </figure>
  );
}

/** Small clamshell with a magnifier on its wall: "this is where we cut". */
function WallCue() {
  return (
    <svg viewBox="0 0 120 72" className="h-12 w-20 shrink-0 sm:h-14 sm:w-24" fill="none" aria-hidden>
      {/* lid */}
      <path d="M14 30 L60 14 L106 30 L60 46 Z" stroke="#f3e9dc" strokeOpacity=".55" strokeWidth="2" strokeLinejoin="round" />
      {/* base walls */}
      <path d="M14 30 V44 L60 60 L106 44 V30" stroke="#f3e9dc" strokeOpacity=".55" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 46 V60" stroke="#f3e9dc" strokeOpacity=".35" strokeWidth="2" />
      {/* magnifier on the front wall */}
      <circle cx="84" cy="46" r="11" stroke="#ce8a39" strokeWidth="2.5" fill="#ce8a39" fillOpacity=".15" />
      <path d="M92 54 L100 62" stroke="#ce8a39" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** How long each state holds before the loop moves on (ms). A click restarts with a longer hold. */
const HOLD: Record<Stage, number> = { use: 3000, compost: 3000 };
const HOLD_AFTER_CLICK = 4500;

export function LiningSpecimen() {
  const [stage, setStage] = useState<Stage>("use");
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hold, setHold] = useState(HOLD.use);
  // bumps on every change so the timer and progress bar restart
  const [cycle, setCycle] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  // Loop only while on screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // In use → after composting → in use … forever, with a pause on each.
  useEffect(() => {
    if (!visible || reduced) return;
    const t = window.setTimeout(() => {
      const next: Stage = stage === "use" ? "compost" : "use";
      setStage(next);
      setHold(HOLD[next]);
      setCycle((c) => c + 1);
    }, hold);
    return () => window.clearTimeout(t);
  }, [stage, visible, reduced, hold, cycle]);

  const pick = (s: Stage) => {
    setStage(s);
    setHold(HOLD_AFTER_CLICK);
    setCycle((c) => c + 1);
  };

  const looping = visible && !reduced;

  return (
    <div ref={wrap}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <WallCue />
          <p className="max-w-[22ch] text-[0.95rem] font-semibold leading-snug text-linen/80">A slice through the wall, where food touches the pack.</p>
        </div>
        <div role="radiogroup" aria-label="Show the wall" className="relative grid shrink-0 grid-cols-2 rounded-full bg-linen/10 p-1 ring-1 ring-inset ring-linen/15">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] overflow-hidden rounded-full bg-linen transition-transform duration-500 ease-[var(--ease-out-strong)]"
            style={{ transform: stage === "compost" ? "translateX(100%)" : "none" }}
          >
            {looping ? (
              <i
                key={cycle}
                className="loop-progress absolute inset-x-3 bottom-1 block h-[2px] origin-left rounded-full bg-terra/70"
                style={{ animationDuration: `${hold}ms` }}
              />
            ) : null}
          </span>
          {(
            [
              ["use", "In use"],
              ["compost", "After composting"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={stage === v}
              onClick={() => pick(v)}
              className={`relative z-10 min-h-10 whitespace-nowrap rounded-full px-4 text-[0.88rem] font-semibold transition-colors duration-300 ${
                stage === v ? "text-ink" : "text-linen/75 hover:text-linen"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Card kind="typical" stage={stage} />
        <Card kind="resydue" stage={stage} />
      </div>
      <p className="mt-4 text-[0.8rem] text-linen/50">Illustration only, not to scale. Simplified to show where the lining sits.</p>
    </div>
  );
}
