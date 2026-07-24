const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT = process.argv[3];

const wb = XLSX.readFile(SRC, { cellStyles: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

const FONT_DIR = 'C:\\Windows\\Fonts';
const REG = path.join(FONT_DIR, 'arial.ttf');
const BOLD = path.join(FONT_DIR, 'arialbd.ttf');

const INK = '#0A0E14';
const GOLD_BG = '#F2C879';
const LINE = '#D8D5CC';
const STRIPE = '#F5F3EE';
const TEXT = '#14181F';
const MUTE = '#5B6572';

function clean(v) {
  const s = String(v ?? '').trim();
  if (s === ',' || s === '-' || s === '.') return '';
  return s;
}
function isCheck(v) {
  return String(v ?? '').trim() === 'ü';
}
function drawCheck(x, y, size, color) {
  doc.save();
  doc.lineWidth(1.6).strokeColor(color)
    .moveTo(x, y + size * 0.5)
    .lineTo(x + size * 0.35, y + size * 0.85)
    .lineTo(x + size, y)
    .stroke();
  doc.restore();
}

const doc = new PDFDocument({ size: 'A3', layout: 'landscape', margin: 36, autoFirstPage: false, bufferPages: true });
doc.registerFont('R', REG);
doc.registerFont('B', BOLD);
doc.pipe(fs.createWriteStream(OUT));

let pageWidth, pageHeight, marginX, marginTop, marginBottom, contentW;

function newPage() {
  doc.addPage({ size: 'A3', layout: 'landscape', margin: 36 });
  pageWidth = doc.page.width;
  pageHeight = doc.page.height;
  marginX = doc.page.margins.left;
  marginTop = doc.page.margins.top;
  marginBottom = doc.page.margins.bottom;
  contentW = pageWidth - marginX * 2;
}

function footer(n) {
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.font('R').fontSize(8).fillColor(MUTE)
    .text('Sigmatek Mühendislik Danışmanlık A.Ş.  —  EK-3 Kapsam Matrisi ve Kırılımlı Fiyat Cetveli', marginX, pageHeight - 24, { width: contentW / 2, lineBreak: false });
  doc.text(String(n), marginX, pageHeight - 24, { width: contentW, align: 'right', lineBreak: false });
  doc.page.margins.bottom = savedBottom;
}

function startPage() {
  newPage();
}

function drawDocTitle() {
  doc.font('B').fontSize(16).fillColor(INK).text('EK-3 KAPSAM MATRİSİ VE KIRILIMLI FİYAT CETVELİ', marginX, marginTop, { width: contentW });
  doc.moveDown(0.2);
  doc.font('R').fontSize(10).fillColor(MUTE).text(`USD Kur: ${usdKur}`, marginX, doc.y, { width: contentW });
  doc.moveDown(0.6);
}

function drawTableTitle(text) {
  if (doc.y + 40 > pageHeight - marginBottom) { startPage(); }
  doc.font('B').fontSize(13).fillColor(INK).text(text, marginX, doc.y, { width: contentW });
  doc.moveDown(0.4);
}

// ---------- generic table renderer ----------
function measureRowHeight(cells, colWidths, font, size, padX, padY, minH) {
  let maxH = minH;
  cells.forEach((c, i) => {
    doc.font(font).fontSize(size);
    const h = doc.heightOfString(String(c ?? ''), { width: colWidths[i] - padX * 2 }) + padY * 2;
    if (h > maxH) maxH = h;
  });
  return maxH;
}

function measureHeaderHeight(headers, colWidths) {
  let maxH = 0;
  headers.forEach((h, i) => {
    doc.font('B').fontSize(9);
    const height = doc.heightOfString(h, { width: colWidths[i] - 12 });
    if (height > maxH) maxH = height;
  });
  return maxH + 16;
}

function drawHeaderRow(headers, colWidths, y, rowH, bg) {
  let x = marginX;
  doc.rect(marginX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill(bg || INK);
  const txtColor = bg ? INK : '#FFFFFF';
  headers.forEach((h, i) => {
    doc.font('B').fontSize(9).fillColor(txtColor)
      .text(h, x + 6, y + 7, { width: colWidths[i] - 12, align: 'left' });
    x += colWidths[i];
  });
}

function drawRow(cells, colWidths, y, rowH, opts = {}) {
  let x = marginX;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  if (opts.highlight) {
    doc.rect(marginX, y, totalW, rowH).fill('#FBEFDD');
  } else if (opts.stripe) {
    doc.rect(marginX, y, totalW, rowH).fill(STRIPE);
  }
  cells.forEach((c, i) => {
    if (opts.checkCol === i && isCheck(c)) {
      drawCheck(x + colWidths[i] / 2 - 6, y + rowH / 2 - 5, 12, '#1F7A5C');
    } else {
      doc.font(opts.bold ? 'B' : 'R').fontSize(8.5).fillColor(opts.color || TEXT)
        .text(String(c ?? ''), x + 6, y + 6, { width: colWidths[i] - 12, align: opts.aligns ? opts.aligns[i] : 'left' });
    }
    x += colWidths[i];
  });
  x = marginX;
  doc.lineWidth(0.5).strokeColor(LINE);
  colWidths.forEach((w) => {
    doc.rect(x, y, w, rowH).stroke();
    x += w;
  });
}

function renderTable({ headers, colWidths, data, rowOpts, sectionTitle, headerBg }) {
  if (sectionTitle) drawTableTitle(sectionTitle);
  const headerH = measureHeaderHeight(headers, colWidths);
  if (doc.y + headerH + 20 > pageHeight - marginBottom) startPage();
  let y = doc.y;
  drawHeaderRow(headers, colWidths, y, headerH, headerBg);
  y += headerH;

  data.forEach((row) => {
    const opts = (rowOpts && rowOpts(row)) || {};
    const rh = measureRowHeight(row.cells, colWidths, opts.bold ? 'B' : 'R', 8.5, 6, 6, 20);
    if (y + rh > pageHeight - marginBottom) {
      startPage();
      y = marginTop;
      drawHeaderRow(headers, colWidths, y, headerH, headerBg);
      y += headerH;
    }
    drawRow(row.cells, colWidths, y, rh, opts);
    y += rh;
  });
  doc.y = y + 20;
}

// ---------- data prep ----------
const usdKur = rows[2][5];

const mainRows = [];
for (let i = 3; i <= 35; i++) mainRows.push(rows[i]);

// rows whose col-6 value is actually sub-table header/data bleed-through, not a real note
const NOTE_BLACKLIST_INDEXES = new Set([8, 33, 34, 35]);

const mainHeaders = ['SIRA\nNO', 'SORUMLULUKLAR', 'KAPSAM MATRİSİ\nKARŞILIĞI', 'YÜKLENİCİ', 'HİZMET BEDELİ\n(TL)', 'HİZMET BEDELİ\n(USD)', 'AÇIKLAMA'];
const mainColWidths = [45, 300, 130, 60, 115, 115, 250];

const mainData = mainRows.map((r, idx) => {
  const realIndex = idx + 3;
  const note = NOTE_BLACKLIST_INDEXES.has(realIndex) ? '' : clean(r[6]);
  return {
    raw: r,
    cells: [clean(r[0]), clean(r[1]), clean(r[2]), clean(r[3]), clean(r[4]), clean(r[5]), note],
  };
});

// ---------- build PDF ----------
startPage();
drawDocTitle();

renderTable({
  headers: mainHeaders,
  colWidths: mainColWidths,
  data: mainData,
  rowOpts: (row) => {
    const raw = row.raw;
    const isSection = raw[0] === '' && raw[1] && !raw[2] && !raw[4];
    const isTotal = raw[0] === 'Toplam Bedel';
    if (isTotal) return { bold: true, highlight: true, aligns: ['left', 'left', 'left', 'left', 'right', 'right', 'left'] };
    if (isSection) return { bold: true, aligns: ['left', 'left', 'left', 'left', 'left', 'left', 'left'] };
    return { aligns: ['left', 'left', 'left', 'center', 'right', 'right', 'left'], checkCol: 3 };
  },
});

// ---------- Detail table 1: cable breakdown ----------
const cableHeaders = ['KABLO ADI', 'METRAJ', 'BİRİM FİYAT (TL)', 'TOPLAM FİYAT (TL)', 'MARKA'];
const cableColWidths = [340, 120, 150, 180, 175];
const cableDataRows = [9, 10, 11, 12, 13, 14, 15].map((i) => rows[i]).filter((r) => r[6]);
const cableData = cableDataRows.map((r) => ({ raw: r, cells: [clean(r[6]), clean(r[7]), clean(r[8]), clean(r[9]), clean(r[10])] }));

renderTable({
  headers: cableHeaders,
  colWidths: cableColWidths,
  data: cableData,
  sectionTitle: 'Malzeme Detay Tablosu — Kablo ve Ekipman Kırılımı',
  headerBg: GOLD_BG,
  rowOpts: () => ({ aligns: ['left', 'right', 'right', 'right', 'left'] }),
});

// ---------- Detail table 2: mıcır/serim breakdown ----------
const paveHeaders = ['TANIM', 'SERİM YAPILACAK\nYÜZEY (M2)', 'SERİM YÜKSEKLİĞİ\n(MTR)', 'TOPLAM KÜBAJ\n(M3)', 'TOPLAM KÜBAJ\n(1,8 KATI TON)'];
const paveColWidths = [340, 180, 180, 170, 195];
const paveDataRows = [34, 35].map((i) => rows[i]);
const paveData = paveDataRows.map((r) => ({ raw: r, cells: [clean(r[6]), clean(r[7]), clean(r[8]), clean(r[9]), clean(r[10])] }));

renderTable({
  headers: paveHeaders,
  colWidths: paveColWidths,
  data: paveData,
  sectionTitle: 'Malzeme Detay Tablosu — Mıcır ve Serim Kırılımı',
  headerBg: GOLD_BG,
  rowOpts: () => ({ aligns: ['left', 'right', 'right', 'right', 'right'] }),
});

// footers on all pages
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  pageWidth = doc.page.width; pageHeight = doc.page.height;
  marginX = doc.page.margins.left; contentW = pageWidth - marginX * 2;
  footer(i + 1);
}

doc.end();
console.log('DONE ->', OUT, 'pages:', range.count);
