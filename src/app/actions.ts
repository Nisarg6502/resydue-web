"use server";

/**
 * Lead capture (server build). Set LEAD_WEBHOOK_URL (Google Apps Script, Zapier,
 * Make, Formspree, a CRM inbound hook...) to receive every submission as JSON.
 * Without it, submissions are only logged on the server.
 *
 * The GitHub Pages build swaps this module for src/lib/actions-static.ts.
 */

import { isBot, parseEmail, parseSamples, samplesThanks, type FormState } from "@/lib/lead";

async function deliver(kind: "samples" | "newsletter", data: Record<string, unknown>) {
  const payload = { kind, submittedAt: new Date().toISOString(), ...data };
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    console.info("[lead] LEAD_WEBHOOK_URL not set. Submission:", JSON.stringify(payload));
    return true;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (e) {
    console.error("[lead] delivery failed", e);
    return false;
  }
}

export async function requestSamples(_: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true, message: "Thanks." };
  const { data, errors } = parseSamples(form);
  if (Object.keys(errors).length) return { ok: false, message: "A couple of things to fix.", errors, values: data };
  const sent = await deliver("samples", data);
  if (!sent) return { ok: false, message: "That did not go through. Please try again, or message us on WhatsApp.", values: data };
  return { ok: true, message: samplesThanks(data.name) };
}

export async function joinNewsletter(_: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true, message: "You're in." };
  const { email, valid } = parseEmail(form);
  if (!valid) return { ok: false, message: "That email doesn't look right.", errors: { email: "Check the address." } };
  const sent = await deliver("newsletter", { email });
  if (!sent) return { ok: false, message: "That did not go through. Please try again." };
  return { ok: true, message: "You're in. First email lands next month." };
}
