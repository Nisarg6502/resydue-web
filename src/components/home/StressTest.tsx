"use client";

import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { mark } from "@/components/brand/logo-paths";

type Cond = "rush" | "rain" | "ride" | "heat";
const CONDITIONS: { id: Cond; label: string; hint: string }[] = [
  { id: "rush", label: "Friday rush", hint: "Stack three high" },
  { id: "rain", label: "Rain", hint: "Wet bag, wet hands" },
  { id: "ride", label: "A 40-minute ride", hint: "Potholes included" },
  { id: "heat", label: "Oily noodles at 90°", hint: "Steam on" },
];

function Bowl({ steam }: { steam: boolean }) {
  return (
    <svg viewBox="0 0 240 170" className="block w-full overflow-visible" aria-hidden>
      {steam ? (
        <g stroke="#3e3f20" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none">
          {[78, 120, 162].map((x, i) => (
            <path
              key={x}
              d={`M${x} 18 c -10 -12, 10 -22, 0 -36 s 10 -22, 0 -34`}
              style={{ animation: `steam 2.4s ${i * 0.5}s var(--ease-out-strong) infinite`, transformBox: "fill-box", transformOrigin: "bottom" }}
            />
          ))}
        </g>
      ) : null}
      {/* body */}
      <path d="M22 50 H218 L198 150 Q196 162 182 162 H58 Q44 162 42 150 Z" fill="#f3e9dc" />
      <path d="M22 50 H218 L214 70 H26 Z" fill="#e2cba2" opacity=".7" />
      <path d="M150 56 L136 158" stroke="#e2cba2" strokeWidth="14" opacity=".55" />
      {/* lid */}
      <rect x="10" y="26" width="220" height="30" rx="13" fill="#f3e9dc" />
      <rect x="10" y="26" width="220" height="30" rx="13" fill="none" stroke="#3e3f20" strokeOpacity=".22" strokeWidth="2" />
      <rect x="92" y="16" width="56" height="14" rx="7" fill="#e2cba2" />
      {/* the mark as a seal */}
      <g transform="translate(103 86) scale(.138)">
        <path d={mark.paths[0]} fill="#3e3f20" />
      </g>
    </svg>
  );
}

export function StressTest() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<Record<Cond, boolean>>({ rush: true, rain: true, ride: false, heat: true });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const tilt = useSpring(useTransform(vx, [-2400, 0, 2400], [-22, 0, 22], { clamp: true }), { stiffness: 380, damping: 22 });
  const shadowScale = useTransform(y, [-200, 0, 80], [0.55, 1, 1.08]);
  const shadowOpacity = useTransform(y, [-200, 0], [0.12, 0.28]);

  const tiltEl = useRef<HTMLSpanElement>(null);
  const shakeEl = useRef<HTMLSpanElement>(null);
  const peak = useRef(0);

  useMotionValueEvent(tilt, "change", (v) => {
    if (tiltEl.current) tiltEl.current.textContent = `${Math.abs(v).toFixed(0)}°`;
  });
  useMotionValueEvent(vx, "change", (v) => {
    const speed = Math.hypot(v, vy.get());
    const g = speed / 650; // a toy unit, labelled as such
    if (g > peak.current) {
      peak.current = g;
      if (shakeEl.current) shakeEl.current.textContent = `${g.toFixed(1)} g*`;
    }
  });

  const shake = () => {
    if (reduce) return;
    animate(x, [0, -70, 64, -52, 40, -26, 12, 0], { duration: 1.1, ease: "easeInOut" });
    animate(y, [0, -26, 4, -18, 0, -8, 0], { duration: 1.1, ease: "easeInOut" });
  };

  const count = Object.values(on).filter(Boolean).length;
  const stack = on.rush ? 2 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* Controls */}
      <div className="flex flex-col gap-6 lg:col-span-4">
        <fieldset>
          <legend className="eyebrow text-olive">Pick your worst day</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-1">
            {CONDITIONS.map((c) => {
              const active = on[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setOn((s) => ({ ...s, [c.id]: !s[c.id] }))}
                  className={`group flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.98] ${
                    active ? "bg-ink text-linen" : "bg-linen text-ink ring-1 ring-inset ring-ink/12 hover:ring-ink/30"
                  }`}
                >
                  <span>
                    <span className="block text-[0.95rem] font-semibold leading-tight">{c.label}</span>
                    <span className={`mt-0.5 block text-xs ${active ? "text-linen/65" : "text-ink/65"}`}>{c.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-200 ${active ? "bg-gold text-ink" : "ring-1 ring-inset ring-ink/20"}`}
                  >
                    <svg viewBox="0 0 16 16" className={`size-3 transition-opacity duration-150 ${active ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Readout: spec-sheet style */}
        <div className="rounded-2xl bg-linen p-5 ring-1 ring-inset ring-ink/10">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-olive">Live readout</p>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-terra">
              <i className="size-1.5 animate-pulse rounded-full bg-terra" /> recording
            </span>
          </div>
          <dl>
          {[
            ["Conditions", <span key="c" className="tnum">{count}/4</span>],
            ["Tilt", <span key="t" ref={tiltEl} className="tnum">0°</span>],
            ["Peak shake", <span key="s" ref={shakeEl} className="tnum">0.0 g*</span>],
            ["Lid", "Closed"],
            ["Spilled", "Nothing"],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-baseline justify-between border-b border-dashed border-ink/15 py-2.5 text-[0.95rem] last:border-0">
              <dt className="text-ink/60">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
          </dl>
        </div>
        <p className="text-sm leading-relaxed text-ink/60">
          * A toy, not a test. The real heat, leak and transit numbers live in{" "}
          <Link href="/standard" className="font-semibold text-terra underline decoration-terra/30 underline-offset-4 hover:decoration-terra">
            the Resydue Standard
          </Link>
          .
        </p>
      </div>

      {/* Stage */}
      <div className="lg:col-span-8">
        <div
          ref={stage}
          className="grain relative aspect-[4/5] touch-none overflow-hidden rounded-[var(--radius-cell-lg)] bg-sand sm:aspect-[4/3]"
        >
          {/* rain */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -inset-[20%] transition-opacity duration-500 ${on.rain ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, transparent 0 22px, rgb(62 63 32 / .22) 22px 23.5px, transparent 23.5px 47px)",
              animation: on.rain && !reduce ? "rain .5s linear infinite" : undefined,
            }}
          />
          {/* road */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-olive/10 transition-opacity duration-500 ${on.ride ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, #a44819 0 70px, transparent 70px 120px)",
                backgroundSize: "240px 100%",
                animation: on.ride && !reduce ? "road .5s linear infinite" : undefined,
              }}
            />
          </div>

          <p className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 text-sm font-semibold text-olive sm:left-7 sm:top-6">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M9 11V6a2 2 0 1 1 4 0v5m0-1V5a2 2 0 1 1 4 0v7m-8-1V9a2 2 0 1 0-4 0v6a7 7 0 0 0 14 0v-3a2 2 0 1 0-4 0" />
            </svg>
            Grab it. Fling it.
          </p>

          <button
            type="button"
            onClick={shake}
            className="absolute right-4 top-4 z-10 min-h-11 cursor-pointer rounded-full bg-ink px-5 text-sm font-semibold text-linen transition-transform duration-150 active:scale-[0.96] sm:right-6 sm:top-5"
          >
            Shake it for me
          </button>

          {/* the pack */}
          <div className="absolute inset-x-0 bottom-[16%] mx-auto w-[46%] max-w-[17rem] sm:w-[34%]" style={{ animation: on.ride && !reduce ? "bob .32s ease-in-out infinite alternate" : undefined }}>
            <motion.div
              aria-hidden
              className="absolute -bottom-3 left-1/2 h-5 w-[86%] -translate-x-1/2 rounded-[50%] bg-ink blur-[6px]"
              style={{ scaleX: shadowScale, opacity: shadowOpacity }}
            />
            <motion.div
              drag
              dragConstraints={stage}
              dragElastic={0.18}
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 260, bounceDamping: 16 }}
              whileDrag={{ scale: 1.04, cursor: "grabbing" }}
              style={{ x, y, rotate: tilt, transformOrigin: "50% 90%" }}
              className="relative cursor-grab touch-none"
            >
              <Stack leader={x} count={stack} heat={on.heat} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** base bowl + springy followers (each one lags the one beneath it) */
function Stack({ leader, count, heat }: { leader: MotionValue<number>; count: number; heat: boolean }) {
  // Chained springs: each bowl lags the one beneath it, so the stack wobbles.
  const s1 = useSpring(leader, { stiffness: 220, damping: 12 });
  const s2 = useSpring(s1, { stiffness: 200, damping: 11 });
  const l1 = useTransform(() => s1.get() - leader.get());
  const l2 = useTransform(() => s2.get() - leader.get());
  const r1 = useTransform(l1, [-90, 90], [10, -10], { clamp: true });
  const r2 = useTransform(l2, [-90, 90], [16, -16], { clamp: true });
  const x1 = useTransform(l1, (v) => v * 0.5);
  const x2 = useTransform(l2, (v) => v * 0.8);
  // the top bowl sits inside the middle one, so subtract the middle one's motion
  const x2rel = useTransform(() => x2.get() - x1.get());
  const r2rel = useTransform(() => r2.get() - r1.get());

  return (
    <div className="relative">
      <Bowl steam={heat && count === 0} />
      {count > 0 ? (
        <>
          <motion.div
            className="absolute inset-x-0"
            style={{ bottom: "62%", x: x1, rotate: r1, transformOrigin: "50% 100%" }}
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.35 }}
          >
            <Bowl steam={false} />
            <motion.div
              className="absolute inset-x-0"
              style={{ bottom: "62%", x: x2rel, rotate: r2rel, transformOrigin: "50% 100%" }}
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.35, delay: 0.1 }}
            >
              <Bowl steam={heat} />
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
