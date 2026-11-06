/**
 * Lead capture for the static (GitHub Pages) build, where Server Actions cannot run.
 * Aliased in place of src/app/actions.ts by next.config.ts when GITHUB_PAGES=true.
 *
 * Set NEXT_PUBLIC_LEAD_ENDPOINT at build time to a public form endpoint that accepts
 * JSON from browsers (Formspree, Getform, Basin, a Google Apps Script web app...).
 * Without it, the form validates but says plainly that online delivery is not connected.
 */

import { isBot, parseEmail, parseSamples, samplesThanks, type FormState } from "@/lib/lead";

export type { FormState };

const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

const notConnected =
  "Online requests are not switched on for this preview yet. Please reach us on WhatsApp or email for now.";

async function deliver(kind: "samples" | "newsletter", data: Record<string, unknown>) {
  if (!endpoint) return false;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ kind, submittedAt: new Date().toISOString(), ...data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function requestSamples(_: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true, message: "Thanks." };
  const { data, errors } = parseSamples(form);
  if (Object.keys(errors).length) return { ok: false, message: "A couple of things to fix.", errors, values: data };
  if (!endpoint) return { ok: false, message: notConnected, values: data };
  const sent = await deliver("samples", data);
  if (!sent) return { ok: false, message: "That did not go through. Please try again, or message us on WhatsApp.", values: data };
  return { ok: true, message: samplesThanks(data.name, data.intent) };
}

export async function joinNewsletter(_: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true, message: "You're in." };
  const { email, valid } = parseEmail(form);
  if (!valid) return { ok: false, message: "That email doesn't look right.", errors: { email: "Check the address." } };
  if (!endpoint) return { ok: false, message: notConnected };
  const sent = await deliver("newsletter", { email });
  if (!sent) return { ok: false, message: "That did not go through. Please try again." };
  return { ok: true, message: "You're in. First email lands next month." };
}
