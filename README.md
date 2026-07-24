# Sigmatek Mühendislik — Kurumsal Web Sitesi

GES çatı/saha kurulumları, mühendislik danışmanlığı, endüstriyel ısıtma-soğutma-havalandırma, otomasyon, yangın sistemleri ve çelik konstrüksiyon hizmetlerini tanıtan kurumsal web sitesi.

Saf HTML/CSS/JS ile geliştirilmiştir; modern geliştirme araçlarıyla (Vite, Prettier, Stylelint, ESLint, sharp) desteklenir.

## Gereksinimler

- [Node.js](https://nodejs.org/) 18+ (LTS önerilir)

## Kurulum

```bash
npm install
```

## Komutlar

| Komut                    | Açıklama                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run dev`            | Vite geliştirme sunucusu (canlı yenileme) — http://localhost:5173 |
| `npm run build`          | Üretim derlemesi (`dist/` klasörüne, minify + hash)               |
| `npm run preview`        | Derlenmiş siteyi önizle                                           |
| `npm run format`         | Prettier ile tüm kodu formatla                                    |
| `npm run lint:css`       | Stylelint ile CSS denetimi                                        |
| `npm run lint:css:fix`   | CSS sorunlarını otomatik düzelt                                   |
| `npm run lint:js`        | ESLint ile JavaScript denetimi                                    |
| `npm run optimize:img`   | JPG/PNG görselleri `.webp`'ye dönüştür (orijinaller korunur)      |
| `npm run optimize:svg`   | SVG dosyalarını sıkıştır                                          |

## Proje Yapısı

```
├── index.html              # Ana sayfa (tek sayfa)
├── css/style.css           # Tüm stiller + tasarım tokenları
├── js/script.js            # Etkileşimler (nav, modal, sayaçlar, form)
├── assets/                 # Görseller, logolar, galeri
├── scripts/
│   └── optimize-images.js  # Görsel optimizasyon aracı
├── vite.config.js          # Build yapılandırması
└── .claude/dev-server.js   # Basit statik önizleme sunucusu (port 5510)
```

## Yayına Alma (Deploy)

Site statik olduğu için herhangi bir statik barındırma servisine yüklenebilir:

- **Vercel / Netlify:** GitHub reposunu bağlayın, build komutu `npm run build`, çıktı klasörü `dist`.
- **GitHub Pages:** `npm run build` sonrası `dist/` içeriğini yayınlayın.

## Notlar

- İletişim formu [FormSubmit](https://formsubmit.co/) üzerinden e-posta gönderir.
- Görseller `loading="lazy"` ile geç yüklenir.
- Kod tabanı Prettier + Stylelint + ESLint ile denetlenir.
