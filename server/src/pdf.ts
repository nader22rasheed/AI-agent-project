import { createRequire } from "node:module";
import fs from "node:fs";
import puppeteer from "puppeteer";
import { CalculatedData, SessionInputData } from "./types.js";

const require = createRequire(import.meta.url);

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("ar", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

const asTableRows = (entries: Array<[string, string | number]>) =>
  entries
    .map(
      ([label, value]) => `<tr><th>${label}</th><td>${typeof value === "number" ? value.toFixed(2) : value}</td></tr>`
    )
    .join("\n");

export const buildArabicReportHtml = (
  sessionId: string,
  input: SessionInputData,
  calculated: CalculatedData,
  timestamp: string
) => {
  const fontPath = require.resolve("@fontsource/amiri/files/amiri-arabic-400-normal.woff");
  const fontBase64 = fs.readFileSync(fontPath).toString("base64");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<style>
@font-face {
  font-family: 'AmiriLocal';
  src: url(data:font/woff;base64,${fontBase64}) format('woff');
}
* { box-sizing: border-box; }
body { font-family: 'AmiriLocal', serif; direction: rtl; margin: 24px; color: #111827; }
h1,h2 { color: #1f2937; }
.card { border: 1px solid #e5e7eb; border-radius: 10px; margin: 12px 0; padding: 12px; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; }
th, td { border: 1px solid #d1d5db; padding: 8px; text-align: right; }
th { background: #f3f4f6; width: 45%; }
.meta { color: #4b5563; font-size: 14px; }
</style>
</head>
<body>
  <h1>تقرير تقدير المشروع</h1>
  <p class="meta">معرّف الجلسة: ${sessionId}</p>
  <p class="meta">تاريخ التجميد: ${new Date(timestamp).toLocaleString("ar")}</p>

  <div class="card">
    <h2>معلومات المشروع</h2>
    <table>
      ${asTableRows([
        ["اسم المشروع", input.project.name || "-"],
        ["الوصف", input.project.description || "-"],
        ["المجال", input.project.domain || "-"],
        ["المستخدمون المستهدفون", input.project.targetUsers || "-"],
        ["المنصات", input.project.platforms.join("، ") || "-"],
        ["الافتراضات", input.project.assumptions || "-"]
      ])}
    </table>
  </div>

  <div class="card">
    <h2>نتائج Function Point</h2>
    <table>
      ${asTableRows([
        ["UFP", calculated.fp.ufp],
        ["DI", calculated.fp.di],
        ["VAF", calculated.fp.vaf],
        ["AFP", calculated.fp.afp],
        ["تصنيف الحجم", calculated.classifications.fpSize]
      ])}
    </table>
  </div>

  <div class="card">
    <h2>نتائج Use Case Point</h2>
    <table>
      ${asTableRows([
        ["UAW", calculated.ucp.uaw],
        ["UUCW", calculated.ucp.uucw],
        ["UUCP", calculated.ucp.uucp],
        ["TCF", calculated.ucp.tcf],
        ["EF", calculated.ucp.ef],
        ["UCP", calculated.ucp.ucp],
        ["تصنيف الحجم", calculated.classifications.ucpSize]
      ])}
    </table>
  </div>

  <div class="card">
    <h2>الجهد والتكلفة</h2>
    <table>
      ${asTableRows([
        ["ساعات الجهد (FP)", calculated.effort.effortHoursFP],
        ["ساعات الجهد (UCP)", calculated.effort.effortHoursUCP],
        ["تكلفة بالساعة (FP)", formatMoney(calculated.effort.costHourlyFP, input.economics.currency)],
        ["تكلفة بالساعة (UCP)", formatMoney(calculated.effort.costHourlyUCP, input.economics.currency)],
        ["شهور العمل (FP)", calculated.effort.personMonthsFP],
        ["شهور العمل (UCP)", calculated.effort.personMonthsUCP],
        ["تكلفة شهر-شخص (FP)", formatMoney(calculated.effort.costPersonMonthFP, input.economics.currency)],
        ["تكلفة شهر-شخص (UCP)", formatMoney(calculated.effort.costPersonMonthUCP, input.economics.currency)]
      ])}
    </table>
  </div>
</body>
</html>`;
};

export const generateArabicPdf = async (html: string) => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--font-render-hinting=medium"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    return await page.pdf({ format: "A4", printBackground: true, margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" } });
  } finally {
    await browser.close();
  }
};
