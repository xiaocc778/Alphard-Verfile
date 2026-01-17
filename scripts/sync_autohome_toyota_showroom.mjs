import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SHOWROOM_URL = "https://www.auto-home.com.au/showroom/toyota-alphard-vellfire";

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

function deepWalk(value, visit) {
  const stack = [value];
  const seen = new Set();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur)) continue;
    seen.add(cur);
    visit(cur);
    if (Array.isArray(cur)) {
      for (const v of cur) stack.push(v);
    } else {
      for (const v of Object.values(cur)) stack.push(v);
    }
  }
}

function normalizeTitleForMatch(title) {
  return (title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 .&-]/g, "")
    .trim();
}

function extractNextData(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!m) return null;
  return JSON.parse(m[1]);
}

function toNumberMaybe(x) {
  if (typeof x === "number") return x;
  if (typeof x !== "string") return null;
  const n = parseFloat(x.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function looksLikeListing(obj) {
  const keys = Object.keys(obj);
  // Heuristics: must contain a Toyota title with Alphard/Vellfire, and numeric-ish price + mileage
  const titleKey = keys.find((k) => /title|name|carname/i.test(k));
  if (!titleKey) return false;
  const title = String(obj[titleKey] || "");
  const t = title.toLowerCase();
  if (!t.includes("toyota")) return false;
  if (!t.includes("alphard") && !t.includes("vellfire")) return false;

  const priceKey = keys.find((k) => /price/i.test(k));
  const mileageKey = keys.find((k) => /mileage|kms|kilomet/i.test(k));
  if (!priceKey || !mileageKey) return false;
  const price = toNumberMaybe(obj[priceKey]);
  const mileage = toNumberMaybe(obj[mileageKey]);
  if (price == null || mileage == null) return false;
  if (price < 1000) return false;
  return true;
}

function pickListingFields(obj) {
  const keys = Object.keys(obj);
  const titleKey = keys.find((k) => /title|name|carname/i.test(k));
  const priceKey = keys.find((k) => /price/i.test(k));
  const mileageKey = keys.find((k) => /mileage|kms|kilomet/i.test(k));

  const title = String(obj[titleKey] || "").trim();
  const price = Math.round(toNumberMaybe(obj[priceKey]) || 0);
  const mileage = Math.round(toNumberMaybe(obj[mileageKey]) || 0);

  // Try find an image field
  const imageKey =
    keys.find((k) => /cover|thumbnail|image|img/i.test(k) && typeof obj[k] === "string") ||
    keys.find((k) => /images/i.test(k) && Array.isArray(obj[k]));

  let coverUrl = "";
  if (imageKey) {
    const v = obj[imageKey];
    if (typeof v === "string") coverUrl = v;
    else if (Array.isArray(v)) coverUrl = v.find((s) => typeof s === "string") || "";
  }
  if (coverUrl && coverUrl.startsWith("/")) coverUrl = `https://www.auto-home.com.au${coverUrl}`;

  const yearMatch = title.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  return { title, year, price, mileage, coverUrl, raw: obj };
}

async function main() {
  const html = await fetch(SHOWROOM_URL).then((r) => r.text());

  // Parse visible listing cards directly from HTML (more robust than relying on internal JSON shapes).
  // Example structure:
  // <a ... href="/car-detail/921"><img ... src="..."/><p class="md:text-2xl">2023<!-- --> Toyota<!-- --> Alphard</p> ... <p class="md:text-2xl">$94,800</p> ... <p>5500<!-- --> kms</p>
  const cardRe =
    /<a[^>]+href="\/car-detail\/(\d+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<p class="md:text-2xl">([\s\S]*?)<\/p>[\s\S]*?<p class="md:text-2xl">\$([0-9,]+)<\/p>[\s\S]*?<hr\/>[\s\S]*?<p>(\d+)[\s\S]*?<\/p>/g;

  const listings = [];
  for (const m of html.matchAll(cardRe)) {
    const id = m[1];
    const rawSrc = m[2];
    const rawTitle = m[3];
    const rawPrice = m[4];
    const rawKms = m[5];

    const title = rawTitle.replace(/<!-- -->/g, " ").replace(/\s+/g, " ").trim();
    const price = parseInt(String(rawPrice).replace(/,/g, ""), 10);
    const mileage = parseInt(String(rawKms).replace(/,/g, ""), 10);
    const yearMatch = title.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const coverUrl = rawSrc.startsWith("http")
      ? rawSrc
      : rawSrc.startsWith("/")
        ? `https://www.auto-home.com.au${rawSrc}`
        : `https://www.auto-home.com.au/${rawSrc}`;

    listings.push({
      carId: id,
      title,
      year,
      price,
      mileage,
      coverUrl,
      detailUrl: `https://www.auto-home.com.au/car-detail/${id}`,
    });
  }

  const uniqueListings = uniqBy(listings, (x) => `${x.carId}|${x.title}|${x.price}|${x.mileage}`).sort(
    (a, b) => (b.year || 0) - (a.year || 0)
  );

  const outJson = path.resolve("autohome_toyota_showroom.json");
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      { source: SHOWROOM_URL, scrapedAt: new Date().toISOString(), count: uniqueListings.length, listings: uniqueListings },
      null,
      2
    ),
    "utf-8"
  );

  // Load existing carsData
  const carsModuleUrl = pathToFileURL(path.resolve("src/carsData.js")).toString();
  const carsModule = await import(carsModuleUrl);
  const cars = Array.isArray(carsModule.cars) ? carsModule.cars.slice() : [];

  // Update / append only Alphard/Vellfire entries
  const existingIdxByNorm = new Map();
  for (let i = 0; i < cars.length; i++) {
    const c = cars[i];
    const norm = normalizeTitleForMatch(c.title);
    existingIdxByNorm.set(norm, i);
  }

  let updated = 0;
  let added = 0;

  for (const l of uniqueListings) {
    const norm = normalizeTitleForMatch(l.title);
    const idx = existingIdxByNorm.get(norm);
    if (idx != null) {
      const prev = cars[idx];
      cars[idx] = {
        ...prev,
        title: l.title,
        year: l.year ?? prev.year,
        price: l.price || prev.price,
        mileage: l.mileage || prev.mileage,
        coverUrl: l.coverUrl || prev.coverUrl,
        description:
          prev.description && prev.description.length > 20
            ? prev.description
            : "Enquire for full vehicle details. 车辆详情欢迎咨询。",
        source: SHOWROOM_URL,
        sourceDetailUrl: l.detailUrl,
      };
      updated += 1;
    } else {
      const maxId = cars.reduce((m, c) => Math.max(m, c.id || 0), 0);
      cars.push({
        id: maxId + 1 + added,
        folderName: "",
        imageCount: 0,
        title: l.title,
        price: l.price,
        mileage: l.mileage,
        year: l.year || new Date().getFullYear(),
        fuel: "",
        transmission: "Auto",
        engine: "",
        seats: 7,
        color: "",
        location: "Homebush",
        status: "In Stock",
        description: "Enquire for full vehicle details. 车辆详情欢迎咨询。",
        features: [],
        coverUrl: l.coverUrl,
        source: SHOWROOM_URL,
        sourceDetailUrl: l.detailUrl,
      });
      added += 1;
    }
  }

  // Write back carsData.js
  const outCarsPath = path.resolve("src/carsData.js");
  fs.writeFileSync(outCarsPath, `export const cars = ${JSON.stringify(cars, null, 2)};\n`, "utf-8");

  console.log(
    JSON.stringify(
      { showroomCount: uniqueListings.length, updatedExisting: updated, addedNew: added, output: outCarsPath, listingsJson: outJson },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

