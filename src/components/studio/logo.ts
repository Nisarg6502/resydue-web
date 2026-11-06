/**
 * Turns an uploaded file into a clean, trimmed logo canvas. Runs entirely in the browser:
 * the file is never uploaded anywhere.
 */

const MAX = 1024;
const ACCEPT = /^image\/(png|jpeg|webp|svg\+xml|gif|avif)$/;

export type Logo = { canvas: HTMLCanvasElement; name: string; keyed: boolean; placeholder?: boolean; preview?: string };

export async function loadLogo(file: File): Promise<Logo> {
  if (!ACCEPT.test(file.type)) throw new Error("That file type will not print. Use a PNG, SVG, JPG or WebP.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That file is over 15 MB. Try a smaller export of your logo.");

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const isSvg = file.type === "image/svg+xml";
    let w = img.naturalWidth || MAX;
    let h = img.naturalHeight || MAX;
    // Fit the long side to MAX: shrink big rasters, scale vectors up for crisp edges.
    const k = isSvg || Math.max(w, h) > MAX ? MAX / Math.max(w, h) : 1;
    w = Math.max(1, Math.round(w * k));
    h = Math.max(1, Math.round(h * k));

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, w, h);

    const keyed = knockOutWhite(g, w, h);
    const out = trim(c);
    return { canvas: out, name: file.name, keyed, preview: out.toDataURL("image/png") };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("That")) throw e;
    throw new Error("We could not read that image. Try exporting it again as a PNG.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** If the artwork sits on a solid white box (typical JPG), lift the white out so it prints like ink. */
function knockOutWhite(g: CanvasRenderingContext2D, w: number, h: number): boolean {
  const data = g.getImageData(0, 0, w, h);
  const d = data.data;
  const corner = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return d[i + 3] > 250 && d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235;
  };
  if (!(corner(0, 0) && corner(w - 1, 0) && corner(0, h - 1) && corner(w - 1, h - 1))) return false;
  for (let i = 0; i < d.length; i += 4) {
    const m = Math.min(d[i], d[i + 1], d[i + 2]);
    if (m >= 246) d[i + 3] = 0;
    else if (m > 214) d[i + 3] = Math.round(d[i + 3] * ((246 - m) / 32));
  }
  g.putImageData(data, 0, 0);
  return true;
}

/** Crop to visible pixels so "size" means the same thing for every logo. */
function trim(c: HTMLCanvasElement): HTMLCanvasElement {
  const g = c.getContext("2d", { willReadFrequently: true })!;
  const { width: w, height: h } = c;
  const d = g.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 10) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("That image looks empty. Check it has a visible logo.");
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  if (cw === w && ch === h) return c;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d")!.drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
  return out;
}

/** The stand-in mark shown before anyone uploads: a simple stamp that reads as "your logo here". */
export function placeholderLogo(font: string): Logo {
  const s = 720;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  const ink = "#010101";
  g.strokeStyle = ink;
  g.fillStyle = ink;
  g.lineWidth = 16;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 12, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 4;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 48, 0, Math.PI * 2);
  g.stroke();

  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 150px ${font}`;
  g.fillText("YOUR", s / 2, s / 2 - 72);
  g.fillText("LOGO", s / 2, s / 2 + 72);
  g.font = `600 34px ${font}`;
  // letter-spaced small caps line
  const line = "HERE";
  const gap = 18;
  const widths = [...line].map((ch) => g.measureText(ch).width);
  let x = s / 2 - (widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1)) / 2;
  g.textAlign = "left";
  [...line].forEach((ch, i) => {
    g.fillText(ch, x, s / 2 + 196);
    x += widths[i] + gap;
  });
  for (const dx of [-150, 150]) {
    g.beginPath();
    g.arc(s / 2 + dx, s / 2 + 196, 6, 0, Math.PI * 2);
    g.fill();
  }
  return { canvas: c, name: "Placeholder", keyed: false, placeholder: true };
}
