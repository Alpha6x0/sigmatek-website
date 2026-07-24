/**
 * HTML'deki <img src="...jpg|png"> etiketlerini, aynı isimli .webp dosyası
 * varsa <picture><source webp><img jpg></picture> yapısına dönüştürür.
 * WebP desteklemeyen tarayıcılar orijinal JPG/PNG'ye düşer (fallback).
 *
 * Kullanım: node scripts/webp-picture.js
 * Çalıştırıldıktan sonra `npm run format` ile HTML'i düzenlemeniz önerilir.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = join(root, "index.html");
let html = readFileSync(htmlPath, "utf8");

let wrapped = 0;
let skipped = 0;

// Tüm <img ...> etiketlerini (çok satırlı dahil) yakala
html = html.replace(/<img\b[^>]*>/gs, (imgTag) => {
  // Zaten bir <picture>/<source> içinde değilse işle; srcset olan img'leri atla
  const srcMatch = imgTag.match(/src="(assets\/[^"]+\.(jpg|png))"/i);
  if (!srcMatch) return imgTag;

  const src = srcMatch[1];
  const webp = src.replace(/\.(jpg|png)$/i, ".webp");
  if (!existsSync(join(root, webp))) {
    skipped++;
    return imgTag;
  }

  wrapped++;
  return `<picture><source srcset="${webp}" type="image/webp" />${imgTag}</picture>`;
});

writeFileSync(htmlPath, html, "utf8");
console.log(`✓ ${wrapped} görsel <picture> ile sarıldı, ${skipped} atlandı (webp yok).`);
console.log("Not: 'npm run format' çalıştırarak HTML'i düzenleyin.");
