import { defineConfig } from "vite";

// Statik site: kök dizindeki index.html giriş noktası.
// Mevcut relative asset yolları (css/, js/, assets/) olduğu gibi çalışır.
export default defineConfig({
  root: ".",
  base: "./",
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    cssMinify: true,
    rollupOptions: {
      output: {
        // Asset dosyalarını düzenli klasörlerde topla
        assetFileNames: "assets/build/[name]-[hash][extname]"
      }
    }
  }
});
