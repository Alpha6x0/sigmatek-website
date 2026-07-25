/**
 * Vite yalnızca type="module" script'leri build grafiğine dahil ediyor.
 * js/script.js ve js/i18n.js klasik <script src="js/..."> ile çağrıldığı için
 * build sırasında dist/'e kopyalanmıyor. Bu script, build sonrası js/ klasörünü
 * dist/js/ içine olduğu gibi kopyalar.
 */
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "js");
const dest = join(root, "dist", "js");

if (!existsSync(src)) {
  console.error("HATA: js/ klasörü bulunamadı:", src);
  process.exit(1);
}

cpSync(src, dest, { recursive: true });
console.log(`✓ js/ -> dist/js/ kopyalandı`);
