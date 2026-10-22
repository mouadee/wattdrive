"use client";

import type { Estimate } from "@/config/pricing";
import type { Product } from "@/config/products";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";

type PdfInput = {
  lang: Locale;
  t: Dictionary["quote"];
  number: string;
  product: Product | null;
  estimate: Estimate;
  client: { name: string; phone: string; email: string; city: string };
  housing: string;
  cableMeters: number;
};

type RGB = [number, number, number];
const INK: RGB = [11, 42, 30];
const MUTED: RGB = [92, 110, 100];
const GREEN: RGB = [21, 128, 61];
const LIME: RGB = [132, 204, 22];
const CYAN: RGB = [8, 145, 178];
const LINE: RGB = [220, 232, 224];
const SOFT: RGB = [244, 249, 245];
const MINT: RGB = [236, 253, 243];

/** Validity of the estimate, in days (printed as a date on the quote). */
const VALIDITY_DAYS = 30;

/** Standard PDF fonts use WinAnsi: normalise characters it cannot encode. */
const clean = (s: string) =>
  s
    .replace(/[  ]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...");

/** "+212661616346" / "0661616346" → "06 61 61 63 46" (other formats are kept as typed). */
const phone = (raw: string) => {
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("212") && d.length === 12 ? "0" + d.slice(3) : d;
  return /^0[5-7]\d{8}$/.test(local) ? local.replace(/(\d{2})(?=\d)/g, "$1 ").trim() : raw;
};

const money = (n: number) =>
  clean(n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace(/ /g, " ") + " DH";

/** Product photo flattened on white, as a small JPEG thumbnail. */
async function thumbnail(src: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const bitmap = await createImageBitmap(await (await fetch(src)).blob());
    const scale = Math.min(1, 220 / bitmap.height);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    return { data: canvas.toDataURL("image/jpeg", 0.9), w, h };
  } catch {
    return null;
  }
}

export async function downloadQuotePdf(input: PdfInput) {
  const { jsPDF } = await import("jspdf");
  const { t, lang, estimate } = input;
  const p = t.pdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 16;
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const today = new Date();
  const until = new Date(today.getTime() + VALIDITY_DAYS * 86400000);
  const fmtDate = (d: Date) => d.toLocaleDateString(locale);

  const accentBar = (y: number, h: number) => {
    // Green → lime → cyan gradient, drawn as thin slices.
    const steps = 70;
    for (let i = 0; i < steps; i++) {
      const k = i / (steps - 1);
      const [a, b, m] = k < 0.6 ? [GREEN, LIME, k / 0.6] : [LIME, CYAN, (k - 0.6) / 0.4];
      doc.setFillColor(...(a.map((v, j) => Math.round(v + (b[j] - v) * m)) as RGB));
      doc.rect((W / steps) * i, y, W / steps + 0.3, h, "F");
    }
  };

  const logo = (x: number, y: number, size: number) => {
    doc.setFillColor(...GREEN);
    doc.roundedRect(x, y, size, size, size * 0.28, size * 0.28, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(size * 0.06);
    const c = x + size / 2;
    doc.line(c - size * 0.13, y + size * 0.24, c - size * 0.13, y + size * 0.42);
    doc.line(c + size * 0.13, y + size * 0.24, c + size * 0.13, y + size * 0.42);
    doc.roundedRect(c - size * 0.24, y + size * 0.42, size * 0.48, size * 0.22, size * 0.08, size * 0.08, "S");
    doc.setDrawColor(...LIME);
    doc.line(c, y + size * 0.66, c, y + size * 0.8);
  };

  /* ---------- Header ---------- */
  accentBar(0, 2.4);
  logo(M, 14, 14);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(site.name, M + 18, 24);

  doc.setFontSize(10.5);
  doc.text(clean(site.name.toUpperCase()), M, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(clean([site.contact.address, site.contact.city].filter(Boolean).join(", ")), M, 44);
  doc.text(clean(`${p.tel} : ${site.contact.phoneDisplay}`), M, 49.5);

  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(clean(p.title), W - M, 30, { align: "right" });
  doc.setTextColor(...INK);
  doc.setFontSize(12.5);
  doc.text(input.number, W - M, 38, { align: "right" });
  doc.setFontSize(7.5);
  const badge = clean(p.badge.toUpperCase());
  const bw = doc.getTextWidth(badge) + 8;
  doc.setFillColor(...MINT);
  doc.roundedRect(W - M - bw, 42.5, bw, 6.5, 3.25, 3.25, "F");
  doc.setTextColor(...GREEN);
  doc.text(badge, W - M - bw / 2, 46.8, { align: "center" });

  /* ---------- Client ---------- */
  let y = 62;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M, y - 6, W - M, y - 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(clean(p.client), M, y);
  const cx = M + 42;
  doc.setFontSize(13);
  doc.text(clean(input.client.name), cx, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const clientLines = [
    input.client.city,
    `${p.tel} : ${phone(input.client.phone)}`,
    input.client.email ? `${p.email} : ${input.client.email}` : "",
  ].filter(Boolean);
  clientLines.forEach((l, i) => doc.text(clean(l), cx, y + 7 + i * 5.6));
  y += 7 + clientLines.length * 5.6 + 5;

  /* ---------- Dates & city ---------- */
  const boxH = 17;
  doc.setFillColor(...SOFT);
  doc.roundedRect(M, y, W - M * 2, boxH, 3, 3, "F");
  doc.setFillColor(...GREEN);
  doc.rect(M, y + 3, 1.2, boxH - 6, "F");
  const meta: [string, string][] = [
    [p.date, fmtDate(today)],
    [p.validity, fmtDate(until)],
    [p.city, input.client.city],
  ];
  const colW = (W - M * 2) / 3;
  meta.forEach(([label, value], i) => {
    const x = M + 7 + i * colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(clean(label), x, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(clean(value), x, y + 12.5);
  });
  y += boxH + 8;

  /* ---------- Additional information ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(clean(`${p.info} :`), M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const info = doc.splitTextToSize(
    clean(fill(p.infoText, { housing: input.housing, city: input.client.city, cable: input.cableMeters })),
    W - M * 2,
  ) as string[];
  doc.setLineHeightFactor(1.55);
  doc.text(info, M, y + 6.5);
  y += 6.5 + info.length * 5.2 + 3;

  /* ---------- Table ---------- */
  const col = { desc: M + 4, qty: 116, unit: 120, pu: 156, total: W - M - 4 };
  doc.setFillColor(...GREEN);
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, "F");
  doc.rect(M, y + 5, W - M * 2, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(clean(p.description), col.desc, y + 6.6);
  doc.text(clean(p.quantity), col.qty, y + 6.6, { align: "right" });
  doc.text(clean(p.unit), col.unit, y + 6.6);
  doc.text(clean(p.unitPrice), col.pu, y + 6.6, { align: "right" });
  doc.text(clean(p.lineTotal), col.total, y + 6.6, { align: "right" });
  y += 10;

  const thumb = input.product ? await thumbnail(input.product.image.src) : null;
  estimate.lines.forEach((l, i) => {
    const isProduct = i === 0 && Boolean(input.product);
    const withThumb = isProduct && Boolean(thumb);
    const textX = withThumb ? col.desc + 13 : col.desc;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const detail = doc.splitTextToSize(clean(l.detail), 88 - (textX - col.desc)) as string[];
    const rowH = Math.max(withThumb ? 17 : 0, 9 + detail.length * 4.2 + 3);
    if (i % 2 === 1) {
      doc.setFillColor(...SOFT);
      doc.rect(M, y, W - M * 2, rowH, "F");
    }
    if (withThumb && thumb) {
      const th = 12;
      const tw = th * (thumb.w / thumb.h);
      doc.addImage(thumb.data, "JPEG", col.desc + (10 - tw) / 2, y + (rowH - th) / 2, tw, th);
    }
    doc.setTextColor(...INK);
    doc.setFontSize(10);
    doc.text(clean(l.label), textX, y + 6.5);
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.setLineHeightFactor(1.4);
    doc.text(detail, textX, y + 11);
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(String(l.qty), col.qty, y + 6.5, { align: "right" });
    doc.text(clean(l.unit), col.unit, y + 6.5);
    doc.text(money(l.unitPrice), col.pu, y + 6.5, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(money(l.total), col.total, y + 6.5, { align: "right" });
    y += rowH;
    doc.setDrawColor(...LINE);
    doc.line(M, y, W - M, y);
  });

  /* ---------- Total ---------- */
  y += 8;
  const totalW = 86;
  doc.setFillColor(...MINT);
  doc.roundedRect(W - M - totalW, y, totalW, 16, 3, 3, "F");
  doc.setFillColor(...GREEN);
  doc.roundedRect(W - M - totalW, y, 2.2, 16, 1, 1, "F");
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(clean(p.total), W - M - totalW + 8, y + 10);
  doc.setFontSize(15);
  doc.text(money(estimate.total), W - M - 5, y + 10.3, { align: "right" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(clean(p.thanks), M, y + 10);

  /* ---------- Footer (no bank details) ---------- */
  // Pinned to the bottom of the page; moves to a new page only if the table is very long.
  let fy = 262;
  if (y + 24 > fy) {
    accentBar(H - 2.4, 2.4);
    doc.addPage();
    accentBar(0, 2.4);
    fy = 24;
  }
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(M, fy, W - M, fy);

  const f1 = M;
  const f2 = 92;
  logo(f1, fy + 5, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(clean(site.name.toUpperCase()), f1 + 8.5, fy + 9.4);
  doc.text(clean(p.contactTitle), f2, fy + 9.4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.setFontSize(8.6);
  [site.contact.address, `${site.contact.city}, ${lang === "fr" ? "Maroc" : "Morocco"}`]
    .filter((l): l is string => Boolean(l))
    .forEach((l, i) => doc.text(clean(l), f1, fy + 15.5 + i * 4.8));
  [
    `${p.phone} : ${site.contact.phoneDisplay}`,
    `${p.whatsapp} : ${site.contact.phoneDisplay}`,
    `${p.email} : ${site.contact.email}`,
  ].forEach((l, i) => doc.text(clean(l), f2, fy + 15.5 + i * 4.8));

  accentBar(H - 2.4, 2.4);

  doc.save(`${p.filename}-${input.number}.pdf`);
}
