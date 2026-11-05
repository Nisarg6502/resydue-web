"use server";

/**
 * Lead capture. Set LEAD_WEBHOOK_URL (Google Apps Script, Zapier, Make,
 * Formspree, a CRM inbound hook...) to receive every submission as JSON.
 * Without it, submissions are only logged on the server.
 */

export type FormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
} | null;

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

const clean = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function requestSamples(_: FormState, form: FormData): Promise<FormState> {
  // honeypot: real people never see this field
  if (clean(form.get("company_website"))) return { ok: true, message: "Thanks." };

  const data = {
    name: clean(form.get("name"), 120),
    business: clean(form.get("business"), 160),
    businessType: clean(form.get("businessType"), 40),
    serves: form.getAll("serves").map((v) => clean(v, 40)).filter(Boolean),
    city: clean(form.get("city"), 80),
    contact: clean(form.get("contact"), 40),
    volume: clean(form.get("volume"), 40),
    intent: clean(form.get("intent"), 20) || "samples",
  };

  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = "Tell us who to send them to.";
  if (data.business.length < 2) errors.business = "Add your business name.";
  if (!data.businessType) errors.businessType = "Pick the closest one.";
  if (data.serves.length === 0) errors.serves = "Pick at least one.";
  if (data.city.length < 2) errors.city = "Which city should we ship to?";
  if (data.contact.replace(/\D/g, "").length < 7) errors.contact = "A phone or WhatsApp number we can reach.";
  if (Object.keys(errors).length) return { ok: false, message: "A couple of things to fix.", errors, values: data };

  const sent = await deliver("samples", data);
  if (!sent) return { ok: false, message: "That did not go through. Please try again, or message us on WhatsApp.", values: data };
  return { ok: true, message: `Thanks, ${data.name.split(" ")[0]}. Your samples request is in.` };
}

export async function joinNewsletter(_: FormState, form: FormData): Promise<FormState> {
  if (clean(form.get("company_website"))) return { ok: true, message: "You're in." };
  const email = clean(form.get("email"), 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, message: "That email doesn't look right.", errors: { email: "Check the address." } };
  }
  const sent = await deliver("newsletter", { email });
  if (!sent) return { ok: false, message: "That did not go through. Please try again." };
  return { ok: true, message: "You're in. First email lands next month." };
}
