"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { nav } from "@/content/site";

const mobileNav = [{ href: "/", label: "Home" }, ...nav, { href: "/journal", label: "Journal" }, { href: "/faq", label: "FAQ" }];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        // hide on a deliberate scroll down, reveal on any scroll up
        if (y > 320 && y - lastY.current > 6) setHidden(true);
        else if (lastY.current - y > 6 || y < 320) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // close the sheet whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-linen"
      >
        Skip to content
      </a>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-strong)]"
        style={{ transform: hidden && !open ? "translate3d(0,-110%,0)" : "none" }}
      >
        <div className="container-x pt-3">
          <div
            className={`relative flex h-14 items-center justify-between gap-4 rounded-full pl-5 pr-1.5 transition-[background-color,box-shadow] duration-300 sm:h-[3.75rem] sm:pl-6 ${
              scrolled && !open
                ? "bg-linen/85 shadow-[0_1px_0_rgb(1_1_1/0.05),0_14px_36px_-20px_rgb(62_63_32/0.45)] backdrop-blur-xl backdrop-saturate-150"
                : "bg-transparent"
            }`}
          >
            <Link
              href="/"
              aria-label="Resydue home"
              className={`relative z-10 -m-2 p-2 transition-colors duration-300 ${open ? "text-linen" : "text-olive"}`}
            >
              <Logo variant="primary" className="h-[1.3rem] w-auto sm:h-6" decorative />
            </Link>

            <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
              <ul className="flex items-center gap-0.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="group relative block whitespace-nowrap rounded-full px-3 py-2.5 text-[0.92rem] xl:px-4 font-semibold text-ink/70 transition-colors duration-200 hover:text-ink aria-[current=page]:text-ink"
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-4 bottom-1.5 h-[1.5px] origin-left scale-x-0 rounded-full bg-terra transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="relative z-10 flex items-center gap-2">
              <Link
                href="/samples"
                className={`hidden min-h-11 items-center rounded-full bg-terra px-5 text-[0.9rem] font-semibold text-linen transition-[transform,background-color,opacity] duration-200 hover:bg-ink active:scale-[0.97] sm:inline-flex ${open ? "opacity-0" : ""}`}
              >
                Get free samples
              </Link>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className={`grid size-11 cursor-pointer place-items-center rounded-full transition-[transform,background-color,color] duration-200 active:scale-[0.94] lg:hidden ${open ? "bg-linen text-ink" : "bg-ink text-linen"}`}
              >
                <span aria-hidden className="relative block h-3 w-[1.15rem]">
                  <span
                    className={`absolute left-0 top-1/2 h-[1.5px] w-full bg-current transition-transform duration-300 ease-[var(--ease-out-strong)] ${open ? "rotate-45" : "-translate-y-[5px]"}`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 h-[1.5px] w-full bg-current transition-transform duration-300 ease-[var(--ease-out-strong)] ${open ? "-rotate-45" : "translate-y-[5px]"}`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sheet. CSS transitions so it stays interruptible mid-open. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 overflow-y-auto bg-ink text-linen transition-[clip-path] duration-700 ease-[var(--ease-in-out-strong)] lg:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav aria-label="Mobile" className="container-x flex min-h-full flex-col justify-between gap-10 pb-8 pt-24">
          <ul>
            {mobileNav.map((item, i) => (
              <li key={item.href} className="overflow-hidden border-b border-linen/10">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`flex items-baseline gap-4 py-3 text-[clamp(2rem,9vw,3.2rem)] font-bold leading-none tracking-[-0.04em] transition-[transform,opacity] duration-700 ease-[var(--ease-out-strong)] aria-[current=page]:text-gold ${
                    open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${140 + i * 40}ms` : "0ms" } as CSSProperties}
                >
                  <span className="eyebrow w-7 text-linen/65 tnum">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/samples"
            className={`flex min-h-14 items-center justify-between rounded-full bg-terra px-6 text-lg font-semibold transition-[opacity,transform] duration-700 ease-[var(--ease-out-strong)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: open ? "480ms" : "0ms" }}
          >
            Get free samples <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
