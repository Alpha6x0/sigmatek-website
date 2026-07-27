/**
 * Vite yalnızca <img src>/<source srcset> gibi tanınan HTML özniteliklerinden
 * referans verilen görselleri işleyip dist/assets/build/ altına kopyalar.
 * Servis modallarındaki <template data-img="assets/..."> gibi özel data-*
 * özniteliklerinden JS ile okunan ham yollar Vite tarafından tanınmadığı için
 * build sırasında dist/'e kopyalanmıyor ve canlıda 404 veriyor. Bu script,
 * build sonrası assets/ klasörünün tamamını olduğu gibi dist/assets/ içine
 * kopyalayarak hem hash'lenmiş build çıktısı hem de orijinal ham yolların
 * aynı anda çalışmasını sağlar.
 */
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "assets");
const dest = join(root, "dist", "assets");

if (!existsSync(src)) {
  console.error("HATA: assets/ klasörü bulunamadı:", src);
  process.exit(1);
}

cpSync(src, dest, { recursive: true });
console.log(`✓ assets/ -> dist/assets/ kopyalandı (ham yollar için)`);
