import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

function parseArgs(argv) {
  const args = {
    inFile: "xhs_links.json",
    outFile: "xhs_extracted.json",
    headed: false,
    max: 0,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") args.inFile = argv[++i] || args.inFile;
    else if (a === "--out") args.outFile = argv[++i] || args.outFile;
    else if (a === "--max") args.max = parseInt(argv[++i] || "0", 10) || 0;
    else if (a === "--headed") args.headed = true;
  }
  return args;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function normalizeText(s) {
  return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTitleForMatch(title) {
  return normalizeText(title)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff .&-]/g, "")
    .trim();
}

function parsePriceAUD(text) {
  const t = text || "";
  // $94,800 / AUD 94800 / 94800
  const m1 = t.match(/\$\s*([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{4,6})/);
  if (m1) return parseInt(m1[1].replace(/,/g, ""), 10);

  const m2 = t.match(/\bAUD\s*([0-9]{4,6})\b/i);
  if (m2) return parseInt(m2[1], 10);

  // 9.48w / 9.48万 (ambiguous currency; treat as AUD*10k only if user uses this pattern a lot)
  const m3 = t.match(/([0-9]{1,3}(?:\.[0-9]{1,2})?)\s*(?:w|万)\b/i);
  if (m3) return Math.round(parseFloat(m3[1]) * 10000);

  return null;
}

function parseYear(text) {
  const m = (text || "").match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function buildCarTitle({ year, brandModel }) {
  const bm = normalizeText(brandModel);
  if (year && bm) return `${year} ${bm}`;
  return bm || (year ? String(year) : "");
}

function guessBrandModel(title, content) {
  const t = `${title}\n${content}`.toLowerCase();
  // Very light heuristics: prioritize Alphard/Vellfire/VOXY etc.
  const year = parseYear(t);
  if (t.includes("vellfire") || t.includes("威尔法")) return { year, brandModel: "Toyota Vellfire" };
  if (t.includes("alphard") || t.includes("埃尔法") || t.includes("elphard")) return { year, brandModel: "Toyota Alphard" };
  if (t.includes("voxy") || t.includes("沃尔斯") || t.includes("vox y")) return { year, brandModel: "Toyota Voxy" };
  if (t.includes("odyssey") || t.includes("奥德赛")) return { year, brandModel: "Honda Odyssey" };
  if (t.includes("camry") || t.includes("凯美瑞")) return { year, brandModel: "Toyota Camry" };
  if (t.includes("corolla") || t.includes("卡罗拉")) return { year, brandModel: "Toyota Corolla" };
  if (t.includes("rav4") || t.includes("荣放")) return { year, brandModel: "Toyota RAV4" };
  if (t.includes("crown") || t.includes("皇冠")) return { year, brandModel: "Toyota Crown" };
  if (t.includes("gtr") || t.includes("gt-r")) return { year, brandModel: "Nissan GT-R" };
  if (t.includes("elgrand") || t.includes("埃尔格朗德")) return { year, brandModel: "Nissan Elgrand" };
  if (t.includes("model y")) return { year, brandModel: "Tesla Model Y" };
  if (t.includes("model 3")) return { year, brandModel: "Tesla Model 3" };

  // fallback: first line of title without emojis
  const raw = normalizeText(title).replace(/[✨🚗💫🥂🚀⭐️]+/g, "").trim();
  return { year: parseYear(raw), brandModel: raw };
}

async function extractFromNotePage(page) {
  const url = page.url();

  // Quick captcha detection
  if (url.includes("/captcha") || url.includes("/website-login/captcha")) {
    return { url, blocked: true, reason: "captcha" };
  }
  // 404 / restricted note
  if (url.includes("/404")) {
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const t = normalizeText(bodyText);
    if (t.includes("暂时无法浏览") || t.includes("无法浏览") || t.includes("error_code")) {
      return { url, blocked: true, reason: "restricted_or_404" };
    }
  }
  const bodyTextEarly = await page.locator("body").innerText().catch(() => "");
  const bt = normalizeText(bodyTextEarly);
  if (bt.includes("暂时无法浏览") || bt.includes("请完成验证") || bt.includes("验证码")) {
    return { url, blocked: true, reason: "restricted_or_verify" };
  }

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content").catch(() => "");
  const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content").catch(() => "");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content").catch(() => "");

  // Try DOM title/content as fallback
  const h1 = await page.locator("h1").first().textContent().catch(() => "");
  const title = normalizeText(ogTitle || h1 || "");

  const contentCandidates = [
    '[data-testid="note-content"]',
    ".note-content",
    ".content",
    "article",
  ];
  let content = normalizeText(ogDesc || "");
  for (const sel of contentCandidates) {
    const t = await page.locator(sel).first().innerText().catch(() => "");
    const nt = normalizeText(t);
    if (nt.length > content.length) content = nt;
  }

  // Cover: prefer og:image, otherwise first visible img
  let coverUrl = ogImage || "";
  if (!coverUrl) {
    coverUrl =
      (await page
        .locator("img")
        .first()
        .getAttribute("src")
        .catch(() => "")) || "";
  }

  const price = parsePriceAUD(`${title}\n${content}`);
  const { year, brandModel } = guessBrandModel(title, content);
  const carTitle = buildCarTitle({ year, brandModel });

  // Brief intro: prioritize ogDesc, otherwise first 160 chars
  const intro = normalizeText(ogDesc || content).slice(0, 280);

  return {
    url,
    blocked: false,
    title,
    content,
    coverUrl,
    carTitle,
    year,
    price,
    intro,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const inPath = path.resolve(args.inFile);
  const outPath = path.resolve(args.outFile);
  const statePath = path.resolve(".xhs_state.json");

  if (!fs.existsSync(inPath)) {
    console.error(`Missing input file: ${inPath}`);
    process.exit(1);
  }

  const links = JSON.parse(fs.readFileSync(inPath, "utf-8"));
  const urls = uniq(Array.isArray(links) ? links : []);
  const limited = args.max > 0 ? urls.slice(0, args.max) : urls;

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    ...(fs.existsSync(statePath) ? { storageState: statePath } : {}),
    locale: "zh-CN",
    timezoneId: "Australia/Sydney",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // Speed: we only need HTML/meta, so block heavy assets.
  await context.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media" || type === "font" || type === "stylesheet") {
      return route.abort();
    }
    return route.continue();
  });

  const results = [];
  let blockedCount = 0;

  for (let i = 0; i < limited.length; i++) {
    const u = limited[i];
    const p = await context.newPage();
    try {
      // Use "commit" to avoid hanging on scripts; we mainly need meta tags.
      await p.goto(u, { waitUntil: "commit", timeout: 15000 });
      await p.waitForTimeout(800);
      const data = await extractFromNotePage(p);
      results.push(data);
      if (data.blocked) blockedCount += 1;
      console.log(`[${i + 1}/${limited.length}] ${data.blocked ? "BLOCKED" : "OK"}: ${data.carTitle || data.title || data.url}`);
    } catch (e) {
      results.push({ url: u, blocked: true, reason: e?.message || String(e) });
      blockedCount += 1;
      console.log(`[${i + 1}/${limited.length}] FAIL: ${u} -> ${e?.message || e}`);
    } finally {
      await p.close();
    }
  }

  fs.writeFileSync(outPath, JSON.stringify({ scrapedAt: new Date().toISOString(), count: results.length, blockedCount, results }, null, 2), "utf-8");

  // Import carsData and update it
  const carsModuleUrl = pathToFileURL(path.resolve("src/carsData.js")).toString();
  const carsModule = await import(carsModuleUrl);
  const cars = Array.isArray(carsModule.cars) ? carsModule.cars.slice() : [];

  const idxByNormTitle = new Map();
  for (let i = 0; i < cars.length; i++) idxByNormTitle.set(normalizeTitleForMatch(cars[i].title), i);

  let updated = 0;
  let added = 0;
  const imported = [];

  for (const r of results) {
    if (!r || r.blocked) continue;
    if (!r.carTitle) continue;

    const norm = normalizeTitleForMatch(r.carTitle);
    const idx = idxByNormTitle.get(norm);
    if (idx != null) {
      const prev = cars[idx];
      cars[idx] = {
        ...prev,
        title: r.carTitle || prev.title,
        year: r.year ?? prev.year,
        price: r.price ?? prev.price,
        description: r.intro || prev.description,
        coverUrl: r.coverUrl || prev.coverUrl,
        source: "https://www.xiaohongshu.com",
        sourceDetailUrl: r.url,
      };
      updated += 1;
      imported.push({ action: "updated", id: prev.id, title: cars[idx].title, price: cars[idx].price, coverUrl: cars[idx].coverUrl, sourceDetailUrl: cars[idx].sourceDetailUrl });
    } else {
      const maxId = cars.reduce((m, c) => Math.max(m, c.id || 0), 0);
      const newCar = {
        id: maxId + 1 + added,
        folderName: "",
        imageCount: 0,
        title: r.carTitle,
        price: r.price ?? 0,
        mileage: 0,
        year: r.year || new Date().getFullYear(),
        fuel: "",
        transmission: "Auto",
        engine: "",
        seats: 0,
        color: "",
        location: "Homebush",
        status: "In Stock",
        description: r.intro || "",
        features: [],
        coverUrl: r.coverUrl || "",
        source: "https://www.xiaohongshu.com",
        sourceDetailUrl: r.url,
      };
      cars.push(newCar);
      idxByNormTitle.set(norm, cars.length - 1);
      added += 1;
      imported.push({ action: "added", id: newCar.id, title: newCar.title, price: newCar.price, coverUrl: newCar.coverUrl, sourceDetailUrl: newCar.sourceDetailUrl });
    }
  }

  const carsPath = path.resolve("src/carsData.js");
  fs.writeFileSync(carsPath, `export const cars = ${JSON.stringify(cars, null, 2)};\n`, "utf-8");

  const reportPath = path.resolve("xhs_import_report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ updated, added, blockedCount, total: results.length, imported }, null, 2), "utf-8");

  console.log(JSON.stringify({ outExtracted: outPath, outCars: carsPath, report: reportPath, updated, added, blockedCount, total: results.length }, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

