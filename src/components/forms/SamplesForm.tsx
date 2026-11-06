"use client";

import { useActionState, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { clearHandoff, parseHandoff, readHandoffRaw, subscribeHandoff, type Handoff } from "@/components/studio/design";
import { requestSamples } from "@/app/actions";
import type { FormState } from "@/lib/lead";
import { Button } from "@/components/ui/Button";
import { samplesPage } from "@/content/site";

const field =
  "block min-h-14 w-full rounded-2xl bg-linen px-5 text-base text-ink ring-1 ring-inset ring-ink/15 outline-none transition-shadow duration-200 placeholder:text-ink/35 focus:ring-2 focus:ring-terra aria-[invalid=true]:ring-terra";

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-2 pl-1 text-sm font-semibold text-terra">
      {msg}
    </p>
  );
}

function Chips({
  name,
  options,
  type,
  error,
  legend,
  value,
}: {
  name: string;
  options: readonly string[];
  type: "radio" | "checkbox";
  error?: string;
  legend: string;
  value?: string | string[];
}) {
  const picked = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o);
  return (
    <fieldset aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="mb-3 pl-1 text-[0.95rem] font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="relative cursor-pointer">
            <input type={type} name={name} value={o} defaultChecked={picked(o)} className="peer sr-only" />
            <span className="flex min-h-12 items-center gap-2 rounded-full bg-linen px-5 text-[0.95rem] font-semibold ring-1 ring-inset ring-ink/15 transition-[background-color,color,box-shadow,transform] duration-150 select-none peer-checked:bg-ink peer-checked:text-linen peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-terra active:scale-[0.97] hover:ring-ink/40">
              {o}
            </span>
          </label>
        ))}
      </div>
      <Err id={`${name}-err`} msg={error} />
    </fieldset>
  );
}

const noop = () => () => {};

/** The mockup someone made in the logo studio, carried over so they do not start from scratch. */
function DesignCard({ design, sendDefault }: { design: Handoff; sendDefault: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-linen ring-1 ring-inset ring-olive/20">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={design.image} alt="Your mockup from the logo studio" className="aspect-[4/3] w-full rounded-xl object-cover sm:w-40" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-terra">Your design</p>
          <p className="mt-2 text-[1.02rem] font-semibold leading-snug">{design.summary}</p>
          <p className="mt-1 truncate text-[0.85rem] text-ink/60">Logo file: {design.logoName}</p>
          <button type="button" onClick={clearHandoff} className="mt-2 text-[0.85rem] font-semibold text-ink/55 hover:text-ink">
            Remove design
          </button>
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 border-t border-ink/10 bg-sand/30 px-4 py-3.5 sm:px-5">
        <input type="checkbox" name="mockup" value={design.image} defaultChecked={sendDefault} className="mt-0.5 size-5 shrink-0 accent-terra" />
        <span className="text-[0.9rem] leading-snug">
          <span className="font-semibold">Send this mockup image with my request.</span>{" "}
          <span className="text-ink/60">Untick it and we will ask for your artwork on WhatsApp or email instead. Your original logo file is never sent.</span>
        </span>
      </label>
      <input type="hidden" name="design" value={`${design.summary}. Logo: ${design.logoName}`} />
      <input type="hidden" name="designLink" value={design.link} />
    </div>
  );
}

export function SamplesForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestSamples, null);
  const intent = useSyncExternalStore(
    noop,
    () => (new URLSearchParams(window.location.search).get("intent") === "custom" ? "custom" : "samples"),
    () => "samples",
  );
  const wantsDesign = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).has("design"),
    () => false,
  );
  const raw = useSyncExternalStore(subscribeHandoff, readHandoffRaw, () => null);
  const design = useMemo(() => (intent === "custom" && wantsDesign ? parseHandoff(raw) : null), [intent, wantsDesign, raw]);
  const done = useRef<HTMLDivElement>(null);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const val = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : undefined);

  useEffect(() => {
    if (state?.ok) {
      done.current?.focus();
      clearHandoff();
    }
    else if (state?.errors) {
      const first = document.querySelector<HTMLElement>("[aria-invalid=true]");
      first?.focus?.();
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div ref={done} tabIndex={-1} role="status" className="rounded-[var(--radius-cell-lg)] bg-olive p-8 text-linen outline-none sm:p-12">
        <svg viewBox="0 0 48 48" className="size-12 text-gold" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <circle cx="24" cy="24" r="21" opacity=".35" />
          <path d="m14 25 7 7 13-15" strokeLinecap="round" strokeLinejoin="round" className="[stroke-dasharray:40] [animation:draw_700ms_var(--ease-out-strong)_both]" />
        </svg>
        <p className="display-md mt-8">{state.message}</p>
        <p className="lede mt-4 text-linen/75">Now go find your worst Friday.</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-8 rounded-[var(--radius-cell-lg)] bg-sand/60 p-5 sm:p-10">
      <input type="hidden" name="intent" value={intent} />
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {design ? (
        <DesignCard design={design} sendDefault={state ? !!val("mockup") : true} />
      ) : intent === "custom" ? (
        <p className="rounded-2xl bg-linen px-5 py-4 text-[0.95rem] font-semibold text-olive ring-1 ring-inset ring-olive/20">
          Custom quote request: we will include branding options in our reply.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block pl-1 text-[0.95rem] font-semibold">
            Name
          </label>
          <input id="name" name="name" defaultValue={val("name")} autoComplete="name" className={field} aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} />
          <Err id="name-err" msg={e.name} />
        </div>
        <div>
          <label htmlFor="business" className="mb-2 block pl-1 text-[0.95rem] font-semibold">
            Business name
          </label>
          <input id="business" name="business" defaultValue={val("business")} autoComplete="organization" className={field} aria-invalid={!!e.business} aria-describedby={e.business ? "business-err" : undefined} />
          <Err id="business-err" msg={e.business} />
        </div>
      </div>

      <Chips name="businessType" legend="Business type" options={samplesPage.businessTypes} type="radio" error={e.businessType} value={v.businessType} />
      <Chips name="serves" legend="What you serve" options={samplesPage.serves} type="checkbox" error={e.serves} value={v.serves} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-2 block pl-1 text-[0.95rem] font-semibold">
            City
          </label>
          <input id="city" name="city" defaultValue={val("city")} autoComplete="address-level2" className={field} aria-invalid={!!e.city} aria-describedby={e.city ? "city-err" : undefined} />
          <Err id="city-err" msg={e.city} />
        </div>
        <div>
          <label htmlFor="contact" className="mb-2 block pl-1 text-[0.95rem] font-semibold">
            Phone or WhatsApp
          </label>
          <input
            id="contact"
            name="contact"
            defaultValue={val("contact")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={field}
            aria-invalid={!!e.contact}
            aria-describedby={e.contact ? "contact-err" : undefined}
          />
          <Err id="contact-err" msg={e.contact} />
        </div>
      </div>

      <Chips name="volume" legend="Monthly pack volume (approximate)" options={samplesPage.volumes} type="radio" value={v.volume} />

      <div className="flex flex-col gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/60">We only use this to send your samples and follow up.</p>
        <Button type="submit" tone="terra" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : samplesPage.submit}
        </Button>
      </div>
      {state && !state.ok ? (
        <p role="alert" className="text-sm font-semibold text-terra">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
