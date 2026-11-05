// Pre-generates responsive WebP variants for the static (GitHub Pages) build.
// Usage: node scripts/build-image-variants.mjs
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("public/images");
const OUT = path.join(SRC, "_w");
const WIDTHS = [320, 640, 960, 1280, 1600]; // keep in sync with src/lib/image-loader.ts

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));

let made = 0;
await Promise.all(
  files.map(async (file) => {
    const name = file.replace(/\.(jpe?g|png)$/i, "");
    const input = path.join(SRC, file);
    for (const w of WIDTHS) {
      const out = path.join(OUT, `${name}-${w}.webp`);
      const fresh = await stat(out)
        .then(async (o) => o.mtimeMs >= (await stat(input)).mtimeMs)
        .catch(() => false);
      if (fresh) continue;
      await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(out);
      made++;
    }
  }),
);
console.log(`image variants: ${made} written, ${files.length * WIDTHS.length - made} up to date`);
