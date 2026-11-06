"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Rich } from "@/components/ui/Rich";
import type { Ink, Paper, ProductKey, Studio } from "./scene";
import { loadLogo, placeholderLogo, type Logo } from "./logo";

/** fibre = the finish each pack is photographed in; lid = label pair for the lid button */
const PRODUCTS: { key: ProductKey; label: string; where: string; fibre: Paper; lid?: [string, string] }[] = [
  { key: "bowl", label: "Bowl", where: "Printed round the wall", fibre: "natural", lid: ["Lift lid", "Lid on"] },
  { key: "box", label: "Box", where: "Printed on the lid panel", fibre: "natural", lid: ["Open lid", "Close lid"] },
  { key: "cup", label: "Cup", where: "Printed round the wall", fibre: "white", lid: ["Lift lid", "Lid on"] },
  { key: "tray", label: "Tray", where: "Printed on the front wall", fibre: "white" },
];

const INKS: { key: Exclude<Ink, "original">; label: string; swatch: string }[] = [
  { key: "ink", label: "Black", swatch: "bg-ink" },
  { key: "olive", label: "Olive", swatch: "bg-olive" },
  { key: "terra", label: "Terra", swatch: "bg-terra" },
  { key: "linen", label: "White", swatch: "bg-linen" },
];

type Status = "idle" | "loading" | "ready" | "error";

function bodyFont() {
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

export function LogoStudio({ quoteHref, terms }: { quoteHref: string; terms: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<Studio | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ids = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [product, setProduct] = useState<ProductKey>("box");
  const [paper, setPaper] = useState<Paper>("natural");
  const [inkMode, setInkMode] = useState<"original" | "one">("original");
  const [ink, setInk] = useState<Exclude<Ink, "original">>("ink");
  const [scale, setScale] = useState(0.72);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lidOpen, setLidOpen] = useState(false);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const effectiveInk: Ink = inkMode === "original" ? "original" : ink;

  // Boot three.js only when the studio is about to be seen.
  useEffect(() => {
    const el = wrapRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    let cancelled = false;
    let studio: Studio | null = null;

    const boot = async () => {
      setStatus("loading");
      try {
        await document.fonts?.ready;
        const [{ createStudio }] = await Promise.all([import("./scene")]);
        if (cancelled) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const initialLogo = placeholderLogo(bodyFont());
        setLogo((l) => l ?? initialLogo);
        studio = createStudio(canvas, {
          product: "box",
          paper: "natural",
          ink: "original",
          scale: 0.72,
          autoRotate: !reducedMotion,
          lidOpen: false,
          logo: initialLogo.canvas,
          reducedMotion,
        });
        if (reducedMotion) setAutoRotate(false);
        studio.onInteract(() => setTouched(true));
        studioRef.current = studio;
        setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("error");
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          boot();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      studio?.dispose();
      studioRef.current = null;
    };
  }, []);

  // Push UI state into the scene
  useEffect(() => {
    studioRef.current?.set({ product, paper, ink: effectiveInk, scale, autoRotate, lidOpen });
  }, [status, product, paper, effectiveInk, scale, autoRotate, lidOpen]);

  useEffect(() => {
    if (logo) studioRef.current?.set({ logo: logo.canvas });
  }, [logo, status]);

  const takeFile = useCallback(async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const l = await loadLogo(file);
      setLogo(l);
      // a wide wordmark reads best a little larger than a square badge
      setScale(l.canvas.width / l.canvas.height > 2.2 ? 0.86 : 0.72);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong reading that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  // Paste an image straight from the clipboard while the studio is on screen.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (item) takeFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [takeFile]);

  const removeLogo = () => {
    setLogo(placeholderLogo(bodyFont()));
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    const s = studioRef.current;
    if (!s) return;
    setSaving(true);
    try {
      const label = `Resydue ${PRODUCTS.find((p) => p.key === product)!.label} · illustration, not to scale`;
      const blob = await s.snapshot({ font: bodyFont(), label });
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `resydue-${product}-${logo && !logo.placeholder ? "with-your-logo" : "preview"}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally {
      setSaving(false);
    }
  };

  const current = PRODUCTS.find((p) => p.key === product)!;
  const hasLogo = !!logo && !logo.placeholder;

  return (
    <div
      id="studio"
      ref={wrapRef}
      className="scroll-mt-28 rounded-[var(--radius-cell-lg)] bg-linen p-2 text-ink"
      onDragEnter={(e) => {
        if (e.dataTransfer.types.includes("Files")) setDragging(true);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        takeFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="grid gap-2 lg:grid-cols-12 lg:items-start">
        {/* ── Stage ───────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden rounded-[calc(var(--radius-cell-lg)-0.5rem)] bg-[radial-gradient(120%_90%_at_50%_30%,var(--color-linen)_0%,color-mix(in_oklab,var(--color-sand)_55%,var(--color-linen))_70%,color-mix(in_oklab,var(--color-sand)_85%,var(--color-linen))_100%)] sm:aspect-[4/3] lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:col-span-8 lg:aspect-auto lg:h-[clamp(32rem,calc(100svh-var(--header-h)-3rem),46rem)]">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`3D preview of the Resydue ${current.label.toLowerCase()} ${hasLogo ? "with your logo" : "with a placeholder logo"}. Drag to turn it.`}
            className={`absolute inset-0 size-full touch-none cursor-grab outline-none transition-opacity duration-700 active:cursor-grabbing ${status === "ready" ? "opacity-100" : "opacity-0"}`}
          />

          {/* product switcher */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
            <div role="radiogroup" aria-label="Product" className="flex rounded-full bg-linen/80 p-1 shadow-[0_1px_0_rgb(1_1_1/0.04),0_8px_24px_-12px_rgb(62_63_32/0.35)] ring-1 ring-ink/8 backdrop-blur-md">
              {PRODUCTS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={product === p.key}
                  onClick={() => {
                    if (p.key === product) return;
                    setProduct(p.key);
                    setPaper(p.fibre);
                    setLidOpen(false);
                  }}
                  className={`min-h-9 rounded-full px-3.5 text-[0.85rem] font-semibold transition-[background-color,color] duration-200 sm:px-4 ${
                    product === p.key ? "bg-ink text-linen" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="eyebrow hidden rounded-full bg-linen/70 px-3 py-2 text-[0.65rem] text-ink/60 backdrop-blur-md sm:inline-block">
              Illustration · not to scale
            </span>
          </div>

          {/* bottom bar */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4">
            <p
              aria-live="polite"
              className={`hidden items-center gap-2 whitespace-nowrap rounded-full bg-linen/70 px-3 py-2 text-[0.8rem] sm:flex font-semibold text-ink/70 backdrop-blur-md transition-opacity duration-500 ${
                status === "ready" && !touched ? "opacity-100" : "opacity-0"
              }`}
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 10a7 3 0 0 0 14 0M3 10a7 3 0 0 1 14 0" opacity=".4" />
                <path d="m14.5 7.5 2.5 2.5-2.5 2.5M5.5 7.5 3 10l2.5 2.5" />
              </svg>
              Drag to turn
            </p>
            <div className="pointer-events-auto ml-auto flex gap-1.5 rounded-full bg-linen/80 p-1 ring-1 ring-ink/8 backdrop-blur-md">
              {current.lid ? (
                <IconBtn label={lidOpen ? current.lid[1] : current.lid[0]} pressed={lidOpen} onClick={() => setLidOpen((v) => !v)} wide>
                  <span className="whitespace-nowrap px-1 text-[0.8rem] font-semibold">{lidOpen ? current.lid[1] : current.lid[0]}</span>
                </IconBtn>
              ) : null}
              <IconBtn label={autoRotate ? "Pause turntable" : "Play turntable"} pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
                {autoRotate ? (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                    <rect x="4" y="3" width="2.6" height="10" rx=".8" />
                    <rect x="9.4" y="3" width="2.6" height="10" rx=".8" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                    <path d="M5 3.2v9.6a.7.7 0 0 0 1.05.6l7.6-4.8a.7.7 0 0 0 0-1.2L6.05 2.6A.7.7 0 0 0 5 3.2Z" />
                  </svg>
                )}
              </IconBtn>
              <IconBtn label="Reset view" onClick={() => studioRef.current?.resetView()}>
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75M2.6 2.2v3h3" />
                </svg>
              </IconBtn>
              <IconBtn label="Download image" onClick={save} disabled={status !== "ready" || saving}>
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 2.5v8M4.8 7.5 8 10.7l3.2-3.2M3 13.5h10" />
                </svg>
              </IconBtn>
            </div>
          </div>

          {/* loading / fallback */}
          {status !== "ready" ? (
            <div className="absolute inset-0 grid place-items-center">
              {status === "error" ? (
                <p className="max-w-xs text-center text-ink/70">
                  Your browser could not start the 3D preview. Send us your logo with a quote request and we will mock it up for you.
                </p>
              ) : (
                <div className="flex flex-col items-center gap-4 text-ink/60">
                  <span className="size-9 animate-spin rounded-full border-2 border-ink/15 border-t-terra" aria-hidden />
                  <span className="eyebrow">Setting up the studio</span>
                </div>
              )}
            </div>
          ) : null}

          {/* drop overlay */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-3 grid place-items-center rounded-[calc(var(--radius-cell-lg)-1rem)] border-2 border-dashed border-terra bg-linen/75 backdrop-blur-sm transition-opacity duration-200 ${
              dragging ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="title text-terra">Drop it. We will print it.</p>
          </div>
        </div>

        {/* ── Controls ───────────────────────────── */}
        <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:col-span-4">
          <div>
            <p className="eyebrow text-terra">Logo studio</p>
            <h3 className="title mt-3">See your brand on the {current.label.toLowerCase()}</h3>
            <p className="mt-2 text-[0.95rem] text-ink/65">{current.where}. Pick a pack, drop in your logo, turn it in your hand.</p>
          </div>

          {/* upload */}
          <Field n="01" label="Your logo">
            <input
              ref={fileRef}
              id={`${ids}-file`}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => takeFile(e.target.files?.[0])}
            />
            {hasLogo && logo.preview ? (
              <div className="flex items-center gap-4 rounded-2xl bg-sand/45 p-3">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[conic-gradient(rgb(1_1_1/0.06)_25%,transparent_0_50%,rgb(1_1_1/0.06)_0_75%,transparent_0)] bg-[length:12px_12px] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.preview} alt="Your uploaded logo" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-semibold">{logo.name}</span>
                  <span className="block truncate text-[0.82rem] text-ink/60">{logo.keyed ? "Background removed" : "Ready to print"}</span>
                  <span className="mt-1 flex gap-3 text-[0.82rem] font-semibold">
                    <label htmlFor={`${ids}-file`} className="cursor-pointer text-terra hover:underline">
                      Replace
                    </label>
                    <button type="button" onClick={removeLogo} className="text-ink/55 hover:text-ink">
                      Remove
                    </button>
                  </span>
                </span>
              </div>
            ) : (
              <label
                htmlFor={`${ids}-file`}
                className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 ${
                  dragging ? "border-terra bg-terra/5" : "border-ink/20 hover:border-terra/60 hover:bg-sand/30"
                }`}
              >
                <span className="grid size-11 place-items-center rounded-full bg-ink text-linen transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5">
                  {busy ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-linen/30 border-t-linen" aria-hidden />
                  ) : (
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M8 12.5v-9M4.8 6.5 8 3.3l3.2 3.2" />
                    </svg>
                  )}
                </span>
                <span className="text-[0.98rem] font-semibold">
                  Drop your logo here, or <span className="text-terra underline decoration-terra/30 underline-offset-4">browse</span>
                </span>
                <span className="text-[0.82rem] text-ink/55">PNG with a transparent background works best. SVG and JPG too.</span>
              </label>
            )}
            {error ? (
              <p role="alert" className="mt-2 text-[0.88rem] font-semibold text-terra">
                {error}
              </p>
            ) : null}
            <p className="mt-2 flex items-center gap-1.5 text-[0.8rem] text-ink/55">
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="7" width="10" height="7" rx="1.6" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
              Your file stays on this device. Nothing is uploaded.
            </p>
          </Field>

          {/* print */}
          <Field n="02" label="Print">
            <Segmented
              label="Print colours"
              value={inkMode}
              onChange={setInkMode}
              options={[
                { value: "original", label: "Full colour" },
                { value: "one", label: "One colour" },
              ]}
            />
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-strong)] ${
                inkMode === "one" ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div role="radiogroup" aria-label="Ink colour" className="grid grid-cols-4 gap-1.5 p-0.5">
                  {INKS.map((i) => (
                    <button
                      key={i.key}
                      type="button"
                      role="radio"
                      aria-checked={ink === i.key}
                      tabIndex={inkMode === "one" ? 0 : -1}
                      onClick={() => setInk(i.key)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl py-2 text-[0.78rem] font-semibold ring-1 ring-inset transition-[box-shadow,background-color] duration-200 ${
                        ink === i.key ? "bg-ink/[0.06] ring-ink/60" : "ring-ink/12 hover:ring-ink/35"
                      }`}
                    >
                      <span className={`size-6 rounded-full ring-1 ring-inset ring-ink/15 ${i.swatch}`} aria-hidden />
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Field>

          {/* size */}
          <Field n="03" label="Logo size" aside={<span className="tnum text-ink/60">{Math.round(scale * 100)}%</span>}>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              aria-label="Logo size"
              className="studio-range w-full"
              style={{ "--fill": `${((scale - 0.3) / 0.7) * 100}%` } as CSSProperties}
            />
          </Field>

          {/* paper */}
          <Field n="04" label="Fibre">
            <Segmented
              label="Fibre colour"
              value={paper}
              onChange={setPaper}
              options={[
                { value: "natural", label: "Natural", swatch: "bg-[color-mix(in_oklab,var(--color-linen)_86%,var(--color-olive))]" },
                { value: "white", label: "White", swatch: "bg-linen" },
              ]}
            />
          </Field>

          <div className="mt-auto border-t border-ink/12 pt-6">
            <ButtonLink href={quoteHref} tone="terra" className="w-full justify-between">
              {hasLogo ? "Quote this design" : "Request a custom quote"}
            </ButtonLink>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink/60">
              <Rich text={terms} /> This preview is an illustration for presentation only, not to scale. Shapes, colours and print placement are approximate; every custom run is proofed with you first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ n, label, aside, children }: { n: string; label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="flex items-baseline gap-2.5 text-[0.95rem] font-semibold">
          <span className="eyebrow tnum text-terra">{n}</span>
          {label}
        </p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; swatch?: string }[];
}) {
  const i = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div role="radiogroup" aria-label={label} className="relative grid rounded-full bg-ink/[0.06] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-ink transition-transform duration-300 ease-[var(--ease-out-strong)]"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${i * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 flex min-h-10 items-center justify-center gap-2 rounded-full text-[0.88rem] font-semibold transition-colors duration-300 ${
            value === o.value ? "text-linen" : "text-ink/70 hover:text-ink"
          }`}
        >
          {o.swatch ? <span className={`size-3.5 rounded-full ring-1 ring-inset ring-ink/20 ${o.swatch}`} aria-hidden /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  pressed,
  disabled,
  wide,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 place-items-center rounded-full text-ink transition-[background-color,transform] duration-150 hover:bg-ink/[0.07] active:scale-[0.94] disabled:opacity-40 ${wide ? "px-3" : "w-9"}`}
    >
      {children}
    </button>
  );
}
