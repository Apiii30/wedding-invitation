// Konversi foto asli di folder `wedding/` menjadi WebP ringan di `public/images/`
// sekaligus membuat manifest (ukuran + blur placeholder) di `src/data/photos.json`.
// Jalankan: npm run images
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "wedding";
const OUT = "public/images";
const MANIFEST = "src/data/photos.json";
const MAX = 1600;

await fs.mkdir(OUT, { recursive: true });
const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g|png|heic|webp)$/i.test(f)).sort();
const manifest = {};

for (const file of files) {
  const id = path.parse(file).name.toLowerCase().replace(/\s*\(\d+\)$/, "").replace(/[^a-z0-9]+/g, "-");
  const input = sharp(path.join(SRC, file)).rotate();
  const { data, info } = await input
    .clone()
    .resize(MAX, MAX, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(OUT, `${id}.webp`), data);
  const blur = await input.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  manifest[id] = {
    src: `/images/${id}.webp`,
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
  console.log(`${file} -> ${id}.webp (${Math.round(data.length / 1024)} KB)`);
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${files.length} foto diproses.`);
