/**
 * A studio "design" is the pack setup without the logo: which pack, which fibre, how it is printed
 * and how big. It travels two ways:
 *  - in a share link (URL params), so anyone can reopen the same setup. The logo never goes in a URL.
 *  - to the quote form (sessionStorage, same tab only), together with a small mockup image that the
 *    person can choose to send with their request.
 */

import type { Ink, Paper, ProductKey } from "./scene";

export type Design = { product: ProductKey; paper: Paper; ink: Ink; scale: number };

export type Handoff = {
  summary: string;
  link: string;
  logoName: string;
  /** JPEG data URL of the mockup, about 720 px wide */
  image: string;
};

const PRODUCTS: Record<ProductKey, string> = { bowl: "Bowl", box: "Box", cup: "Cup", tray: "Tray" };
const PAPERS: Record<Paper, string> = { natural: "natural fibre", white: "white fibre" };
const INKS: Record<Ink, string> = { original: "full colour", ink: "black", olive: "olive", terra: "terra", linen: "white" };

const KEY = "resydue:design";
const EVENT = "resydue:design";

const pick = <T extends string>(v: string | null, from: Record<T, string>): T | undefined =>
  v && Object.hasOwn(from, v) ? (v as T) : undefined;

export function encodeDesign(d: Design) {
  return new URLSearchParams({ pack: d.product, fibre: d.paper, print: d.ink, size: String(Math.round(d.scale * 100)) });
}

/** Reads a shared setup from a query string. Returns null when there is nothing usable. */
export function decodeDesign(search: string): Partial<Design> | null {
  const q = new URLSearchParams(search);
  const out: Partial<Design> = {};
  const product = pick(q.get("pack"), PRODUCTS);
  const paper = pick(q.get("fibre"), PAPERS);
  const ink = pick(q.get("print"), INKS);
  const size = Number(q.get("size"));
  if (product) out.product = product;
  if (paper) out.paper = paper;
  if (ink) out.ink = ink;
  if (Number.isFinite(size) && size >= 30 && size <= 100) out.scale = size / 100;
  return Object.keys(out).length ? out : null;
}

export function describeDesign(d: Design) {
  const print = d.ink === "original" ? "full-colour print" : `one-colour print in ${INKS[d.ink]}`;
  return `${PRODUCTS[d.product]}, ${PAPERS[d.paper]}, ${print}, logo at ${Math.round(d.scale * 100)}%`;
}

/** Link back to this exact setup on the page the studio lives on. */
export function shareLink(d: Design) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?${encodeDesign(d)}#studio`;
}

/** Shrinks the full-size snapshot to something small enough for sessionStorage and a form post. */
export async function toJpeg(blob: Blob, max = 720) {
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, max / bmp.width);
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.84);
}

export function saveHandoff(h: Handoff) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(h));
    return true;
  } catch {
    return false; // storage full or blocked: the quote form still works without it
  }
}

export function clearHandoff() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: the raw stored string (stable between reads). */
export function readHandoffRaw() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function subscribeHandoff(fn: () => void) {
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
  };
}

export function parseHandoff(raw: string | null): Handoff | null {
  if (!raw) return null;
  try {
    const h = JSON.parse(raw) as Handoff;
    if (typeof h.summary !== "string" || typeof h.image !== "string" || !h.image.startsWith("data:image/jpeg;base64,")) return null;
    return h;
  } catch {
    return null;
  }
}
