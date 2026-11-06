/** Validation shared by the server action (Vercel/Node) and the static client handler (GitHub Pages). */

export type FormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
} | null;

const clean = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const isBot = (form: FormData) => !!clean(form.get("company_website"));

/** Only a small JPEG data URL made by the studio is accepted (about 60-150 KB). */
const mockup = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.startsWith("data:image/jpeg;base64,") && v.length <= 400_000 ? v : "";

export function parseSamples(form: FormData) {
  const data = {
    name: clean(form.get("name"), 120),
    business: clean(form.get("business"), 160),
    businessType: clean(form.get("businessType"), 40),
    serves: form
      .getAll("serves")
      .map((v) => clean(v, 40))
      .filter(Boolean),
    city: clean(form.get("city"), 80),
    contact: clean(form.get("contact"), 40),
    volume: clean(form.get("volume"), 40),
    intent: clean(form.get("intent"), 20) || "samples",
    /** From the logo studio: a plain-text summary, a link that reopens the setup, and (opt-in) the mockup image. */
    design: clean(form.get("design"), 300),
    designLink: /^https?:\/\//.test(clean(form.get("designLink"), 500)) ? clean(form.get("designLink"), 500) : "",
    mockup: mockup(form.get("mockup")),
  };
  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = "Tell us who to send them to.";
  if (data.business.length < 2) errors.business = "Add your business name.";
  if (!data.businessType) errors.businessType = "Pick the closest one.";
  if (data.serves.length === 0) errors.serves = "Pick at least one.";
  if (data.city.length < 2) errors.city = "Which city should we ship to?";
  if (data.contact.replace(/\D/g, "").length < 7) errors.contact = "A phone or WhatsApp number we can reach.";
  return { data, errors };
}

export function parseEmail(form: FormData) {
  const email = clean(form.get("email"), 160);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  return { email, valid };
}

export const samplesThanks = (name: string, intent = "samples") =>
  `Thanks, ${name.split(" ")[0]}. Your ${intent === "custom" ? "custom quote" : "samples"} request is in.`;
