/**
 * index.html + css/style.css + js/script.js dosyalarını tek bir bağımsız
 * Artifact HTML'ine gömer: CSS/JS inline, görseller (webp) ve fontlar base64
 * veri URI, wrapper etiketleri (doctype/html/head/body) kaldırılmış.
 *
 * Not: İletişim formu formsubmit.co'ya fetch ile gönderiyor — Artifact'ın
 * CSP'si harici istekleri engellediği için bu önizlemede form gönderimi
 * çalışmaz. Site canlıya alındığında (GitHub Pages/Vercel) sorunsuz çalışır.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontsDir = "C:/Users/Administrator/AppData/Local/Temp/fonts";

function mime(path) {
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

function toDataUri(relPath) {
  const webp = relPath.replace(/\.(jpg|png)$/i, ".webp");
  const finalPath = existsSync(join(root, webp)) ? webp : relPath;
  const buf = readFileSync(join(root, finalPath));
  return `data:${mime(finalPath)};base64,${buf.toString("base64")}`;
}

let html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "css/style.css"), "utf8");
const js = readFileSync(join(root, "js/script.js"), "utf8");

// 1) <link rel="stylesheet" href="css/style.css"> -> inline <style>
html = html.replace(/<link rel="stylesheet" href="css\/style\.css"\s*\/?>/, `<style>\n${css}\n</style>`);

// 2) <script src="js/script.js"></script> -> inline <script>
html = html.replace(/<script src="js\/script\.js"><\/script>/, `<script>\n${js}\n</script>`);

// 3) Google Fonts <link>'lerini kaldır, veri URI @font-face ile değiştir
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, "");
html = html.replace(/<link\s+href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, "");
const b64 = (f) => readFileSync(join(fontsDir, f)).toString("base64");
const fontFaces = `
@font-face { font-family:"DM Sans"; font-style:normal; font-weight:400 700; font-display:swap;
  src:url(data:font/woff2;base64,${b64("dmsans-ext.woff2")}) format("woff2");
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
@font-face { font-family:"DM Sans"; font-style:normal; font-weight:400 700; font-display:swap;
  src:url(data:font/woff2;base64,${b64("dmsans-latin.woff2")}) format("woff2");
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
@font-face { font-family:"Space Grotesk"; font-style:normal; font-weight:500 700; font-display:swap;
  src:url(data:font/woff2;base64,${b64("spacegrotesk-ext.woff2")}) format("woff2");
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
@font-face { font-family:"Space Grotesk"; font-style:normal; font-weight:500 700; font-display:swap;
  src:url(data:font/woff2;base64,${b64("spacegrotesk-latin.woff2")}) format("woff2");
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
`;
html = html.replace("<style>\n", `<style>\n${fontFaces}\n`);

// 4) Tüm assets/... src, srcset ve data-img değerlerini webp veri URI ile değiştir
html = html.replace(/(src|srcset|data-img)="(assets\/[^"]+\.(jpg|png|webp|svg))"/g, (m, attr, p) => {
  return `${attr}="${toDataUri(p)}"`;
});

// 5) Wrapper etiketlerini kaldır
html = html.replace(/^<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, "");
html = html.replace(/<title>[^<]*<\/title>\s*/i, "");
html = html.replace(/<meta charset="UTF-8"\s*\/?>\s*/i, "");
html = html.replace(/<meta\s+name="viewport"[\s\S]*?\/>\s*/i, "");
html = html.replace(/<meta\s+name="description"[\s\S]*?\/>\s*/i, "");
html = html.replace(/<\/head>\s*<body>\s*/i, "");
html = html.replace(/\s*<\/body>\s*<\/html>\s*$/i, "");

writeFileSync(join(root, "site-artifact.html"), html, "utf8");
console.log(`✓ site-artifact.html oluşturuldu (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
