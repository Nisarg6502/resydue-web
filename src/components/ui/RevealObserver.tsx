"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page. Sets data-in once; CSS animates.
 * Clip reveals start fully clipped, and Chrome intersects using the target's own
 * clip-path, so for those we observe the parent instead.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in]),[data-reveal-words]:not([data-in])"),
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    const targets = new Map<Element, HTMLElement[]>();
    for (const el of els) {
      const watch = el.dataset.reveal === "clip" && el.parentElement ? el.parentElement : el;
      targets.set(watch, [...(targets.get(watch) ?? []), el]);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          targets.get(e.target)?.forEach((el) => el.setAttribute("data-in", ""));
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    targets.forEach((_, t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
