/**
 * Görsel optimizasyonu: assets/ altındaki JPG/PNG dosyalarının yanına
 * optimize edilmiş .webp sürümleri üretir. Orijinaller korunur.
 *
 * Kullanım: npm run optimize:img
 */
import { readdir, stat } from "node:fs/promises";
import { join, extname, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "assets");
const RASTER = new Set([".jpg", ".jpeg", ".png"]);
const MAX_WIDTH = 1600; // hero/kart görselleri için yeterli
const WEBP_QUALITY = 80;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "build") continue; // vite build çıktısı
      files.push(...(await walk(full)));
    } else if (RASTER.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function run() {
  let converted = 0;
  let savedBytes = 0;
  const files = await walk(ASSETS_DIR);
  console.log(`${files.length} raster görsel bulundu.\n`);

  for (const file of files) {
    const out = join(dirname(file), basename(file, extname(file)) + ".webp");
    try {
      const srcSize = (await stat(file)).size;
      await sharp(file)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(out);
      const outSize = (await stat(out)).size;
      const pct = Math.round((1 - outSize / srcSize) * 100);
      savedBytes += srcSize - outSize;
      converted++;
      console.log(
        `✓ ${basename(out)}  (${(srcSize / 1024).toFixed(0)}KB → ${(outSize / 1024).toFixed(0)}KB, %${pct} küçültme)`
      );
    } catch (err) {
      console.warn(`✗ ${basename(file)} atlandı: ${err.message}`);
    }
  }

  console.log(`\nToplam ${converted} görsel dönüştürüldü, ~${(savedBytes / 1024 / 1024).toFixed(1)}MB tasarruf.`);
  console.log("Not: HTML'de <picture> ile .webp sunmak istersen söyle, otomatik dönüştürebilirim.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
