"use client";

import { useActionState } from "react";
import { joinNewsletter } from "@/app/actions";
import type { FormState } from "@/lib/lead";

export function NewsletterForm({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(joinNewsletter, null);
  const dark = tone === "dark";

  if (state?.ok) {
    return (
      <p role="status" className={`${className} flex min-h-14 items-center gap-3 font-semibold ${dark ? "text-gold" : "text-terra"}`}>
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m4 10.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={className} noValidate>
      <label htmlFor={`nl-email-${tone}`} className="sr-only">
        Email address
      </label>
      <div
        className={`flex min-h-14 items-center gap-2 rounded-full p-1.5 pl-5 ring-1 ring-inset transition-shadow duration-200 focus-within:ring-2 ${
          dark ? "bg-linen/[0.06] ring-linen/20 focus-within:ring-gold" : "bg-linen ring-ink/15 focus-within:ring-terra"
        }`}
      >
        <input
          id={`nl-email-${tone}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@yourkitchen.com"
          aria-invalid={!!state?.errors?.email}
          aria-describedby={state?.errors?.email ? `nl-err-${tone}` : undefined}
          className={`min-w-0 flex-1 bg-transparent text-base outline-none placeholder:opacity-50 ${dark ? "text-linen" : "text-ink"}`}
        />
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={pending}
          className={`min-h-11 shrink-0 cursor-pointer rounded-full px-5 text-[0.92rem] font-semibold transition-[transform,background-color,opacity] duration-150 active:scale-[0.97] disabled:opacity-60 ${
            dark ? "bg-gold text-ink hover:bg-linen" : "bg-ink text-linen hover:bg-terra"
          }`}
        >
          {pending ? "Joining…" : "Join the newsletter"}
        </button>
      </div>
      {state && !state.ok ? (
        <p id={`nl-err-${tone}`} role="alert" className={`mt-3 pl-5 text-sm ${dark ? "text-gold" : "text-terra"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
