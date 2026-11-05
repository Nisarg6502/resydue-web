"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Weighted wheel scrolling on mouse/trackpad only. Touch keeps native momentum. */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;
    const l = new Lenis({ lerp: 0.12, anchors: true });
    lenis.current = l;
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const obs = new MutationObserver(() => {
      if (document.documentElement.hasAttribute("data-menu-open")) l.stop();
      else l.start();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-menu-open"] });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      l.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
