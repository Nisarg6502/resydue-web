"use client";

import { useEffect, useRef } from "react";
import { mark } from "@/components/brand/logo-paths";

function tile(color: string, size = 96, markSize = 30) {
  const s = markSize / 246.28;
  const o = (size - markSize) / 2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path transform='translate(${o} ${o}) scale(${s})' fill='${color}' d='${mark.paths[0]}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const dim = tile("#3e3f20");
const lit = tile("#ce8a39");

/**
 * The packaging pattern from the brand mockups, as a living surface.
 * A gold copy of the pattern is revealed through a radial mask that follows
 * the pointer (spring-smoothed). On touch it drifts on its own while visible.
 */
export function PatternField({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const g = glow.current;
    if (!el || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let tx = 0.5,
      ty = 0.5,
      x = 0.5,
      y = 0.5,
      raf = 0,
      visible = false,
      pointerInside = false,
      t0 = performance.now();

    const set = () => {
      const r = el.getBoundingClientRect();
      const px = x * r.width;
      const py = y * r.height;
      const m = `radial-gradient(240px 240px at ${px}px ${py}px, #000 0%, rgb(0 0 0 / .55) 38%, transparent 72%)`;
      g.style.maskImage = m;
      g.style.webkitMaskImage = m;
    };

    const loop = (now: number) => {
      if (!pointerInside && !reduce) {
        const t = (now - t0) / 1000;
        tx = 0.5 + Math.sin(t * 0.35) * 0.38;
        ty = 0.5 + Math.sin(t * 0.61 + 1) * 0.3;
      }
      // critically-damped-ish follow: feels weighted, never snaps
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      set();
      if (visible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        t0 = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      const r = el.getBoundingClientRect();
      pointerInside = true;
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    const onLeave = () => {
      pointerInside = false;
      t0 = performance.now();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    set();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ backgroundImage: dim, backgroundSize: "96px 96px", backgroundPosition: "center" }} />
      <div
        ref={glow}
        className="absolute inset-0"
        style={{ backgroundImage: lit, backgroundSize: "96px 96px", backgroundPosition: "center" }}
      />
    </div>
  );
}
