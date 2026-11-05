"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * The stress test pulls in Motion (springs, drag). It lives well below the fold,
 * so its code loads only as the section approaches the viewport. Keeps the
 * initial bundle and main-thread work small on phones.
 */
const StressTest = dynamic(() => import("./StressTest").then((m) => m.StressTest), {
  ssr: false,
  loading: () => <Placeholder />,
});

function Placeholder() {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8" aria-hidden>
      <div className="flex flex-col gap-2.5 lg:col-span-4">
        <div className="h-3 w-40 rounded bg-ink/10" />
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-ink/[0.06]" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-ink/[0.04]" />
      </div>
      <div className="lg:col-span-8">
        <div className="aspect-[4/5] rounded-[var(--radius-cell-lg)] bg-sand sm:aspect-[4/3]" />
      </div>
    </div>
  );
}

export function LazyStressTest() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{show ? <StressTest /> : <Placeholder />}</div>;
}
