import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

function parseArgs(argv) {
  const args = { url: "", out: "xhs_posts.json", limit: 0, headed: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") args.url = argv[++i] || "";
    else if (a === "--out") args.out = argv[++i] || "xhs_posts.json";
    else if (a === "--limit") args.limit = parseInt(argv[++i] || "0", 10) || 0;
    else if (a === "--headed") args.headed = true;
    else if (a === "--help") args.help = true;
  }
  return args;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeProfileUrl(raw) {
  // Remove volatile query params (xsec_token etc.) – keep base profile URL.
  try {
    const u = new URL(raw);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return raw;
  }
}

async function tryClickNotesTab(page) {
  // On XHS profile, posts are under "笔记" tab sometimes.
  const candidates = [
    "text=笔记",
    "text=Notes",
    '[role="tab"]:has-text("笔记")',
    'a:has-text("笔记")',
    'button:has-text("笔记")',
  ];
  for (const sel of candidates) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      return true;
    }
  }
  return false;
}

function isValidNoteLink(href) {
  if (!href) return false;
  // Accept /explore/<noteId> or /discovery/item/<id>, but exclude the generic /explore/ entry.
  const u = href.startsWith("http") ? href : `https://www.xiaohongshu.com${href}`;
  return (
    /^https:\/\/www\.xiaohongshu\.com\/explore\/[A-Za-z0-9]{6,}/.test(u) ||
    /^https:\/\/www\.xiaohongshu\.com\/discovery\/item\/[A-Za-z0-9]{6,}/.test(u)
  );
}

async function collectPostLinks(page, { maxScrolls = 60 }) {
  // Xiaohongshu web commonly uses /explore/<id> for notes.
  const linkSelector = 'a[href*="/explore/"], a[href*="/discovery/item/"]';
  let lastCount = 0;
  let stableRounds = 0;

  // Try to ensure we're on notes tab and content has loaded
  await tryClickNotesTab(page);
  await page.waitForTimeout(800);

  for (let i = 0; i < maxScrolls; i++) {
    const links = await page.$$eval(linkSelector, (as) =>
      as
        .map((a) => a.getAttribute("href"))
        .filter(Boolean)
        .map((h) => (h.startsWith("http") ? h : `https://www.xiaohongshu.com${h}`))
    );
    const uniqueLinks = uniq(links).filter(isValidNoteLink);

    if (uniqueLinks.length === lastCount) stableRounds += 1;
    else stableRounds = 0;

    lastCount = uniqueLinks.length;
    if (stableRounds >= 6) break;

    // Some pages use scroll containers; try both window and document scrolling.
    await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      const by = Math.floor(window.innerHeight * 1.2);
      window.scrollBy(0, by);
      if (el) el.scrollTop = el.scrollTop + by;
    });
    await sleep(900);
  }

  const finalLinks = await page.$$eval(linkSelector, (as) =>
    as
      .map((a) => a.getAttribute("href"))
      .filter(Boolean)
      .map((h) => (h.startsWith("http") ? h : `https://www.xiaohongshu.com${h}`))
  );

  return uniq(finalLinks).filter(isValidNoteLink);
}

async function extractPost(page) {
  // Defensive extraction: use meta as fallback.
  const url = page.url();
  const title =
    (await page.locator("h1").first().textContent().catch(() => null)) ||
    (await page.locator('meta[property="og:title"]').getAttribute("content").catch(() => null)) ||
    "";

  // Content is often in a rich text container; try a few common selectors.
  const contentCandidates = [
    '[data-testid="note-content"]',
    ".note-content",
    ".content",
    "article",
  ];
  let content = "";
  for (const sel of contentCandidates) {
    const t = await page.locator(sel).first().innerText().catch(() => "");
    if (t && t.length > content.length) content = t;
  }
  content = (content || "").trim();

  const publishTime =
    (await page.locator("time").first().getAttribute("datetime").catch(() => null)) ||
    (await page.locator("time").first().innerText().catch(() => null)) ||
    "";

  // Images: collect visible images
  const images = uniq(
    await page.$$eval("img", (imgs) =>
      imgs
        .map((img) => img.getAttribute("src") || img.getAttribute("data-src"))
        .filter(Boolean)
        .filter((src) => !src.startsWith("data:"))
    )
  );

  return { url, title: title.trim(), publishTime, content, images };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.url) {
    console.log(
      [
        "Usage:",
        "  npm run scrape:xhs -- --url <profile_url> [--out xhs_posts.json] [--limit 50] [--headed]",
        "",
        "First run (login required):",
        "  npm run scrape:xhs -- --url <profile_url> --headed",
        "  - A browser will open; please login manually, then return to terminal.",
        "",
        "Then headless run:",
        "  npm run scrape:xhs -- --url <profile_url> --out xhs_posts.json",
      ].join("\n")
    );
    process.exit(args.url ? 0 : 1);
  }

  const statePath = path.resolve(".xhs_state.json");
  const profileUrl = normalizeProfileUrl(args.url);
  const outPath = path.resolve(args.out);

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext(
    fs.existsSync(statePath) ? { storageState: statePath } : {}
  );
  const page = await context.newPage();

  await page.goto(profileUrl, { waitUntil: "domcontentloaded" });

  // Detect if login is required
  const needsLogin =
    (await page.locator("text=登录").first().isVisible().catch(() => false)) ||
    (await page.locator("text=Login").first().isVisible().catch(() => false)) ||
    page.url().includes("/login");

  if (needsLogin && !fs.existsSync(statePath)) {
    if (!args.headed) {
      console.log("\n[Blocked] Looks like Xiaohongshu requires login in this environment.");
      console.log("Re-run with --headed, login manually, then press ENTER in this terminal.");
      console.log(
        `\nExample:\n  npm run scrape:xhs -- --url "${profileUrl}" --headed --out "${args.out}"\n`
      );
      await browser.close();
      process.exit(2);
    }

    console.log("\n[Login step] Please login in the opened browser window.");
    console.log("After login and the profile page shows posts, come back here and press ENTER.\n");
    await new Promise((resolve) => process.stdin.once("data", resolve));
    await context.storageState({ path: statePath });
    console.log(`[Saved] storageState -> ${statePath}\n`);
    await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
  }

  // Make sure we're on the profile page
  await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  // If still blocked by captcha, bail with clear message.
  const urlNow = page.url();
  if (urlNow.includes("/captcha") || urlNow.includes("/website-login/captcha")) {
    console.log("\n[Blocked] Captcha page detected.");
    console.log("Please run with --headed and finish the captcha in the browser.");
    console.log(`Then re-run:\n  npm run scrape:xhs -- --url "${profileUrl}" --out "${args.out}" --limit ${args.limit || 200}\n`);
    await browser.close();
    process.exit(3);
  }

  console.log(`[Collecting] post links from: ${profileUrl}`);
  const links = await collectPostLinks(page, { maxScrolls: 80 });
  const limitedLinks = args.limit > 0 ? links.slice(0, args.limit) : links;
  console.log(`[Found] ${links.length} links (processing ${limitedLinks.length})`);

  const results = [];
  for (let i = 0; i < limitedLinks.length; i++) {
    const link = limitedLinks[i];
    const p = await context.newPage();
    try {
      await p.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(1000);
      const post = await extractPost(p);
      results.push(post);
      console.log(`[${i + 1}/${limitedLinks.length}] OK: ${post.title || post.url}`);
    } catch (e) {
      console.log(`[${i + 1}/${limitedLinks.length}] FAIL: ${link} -> ${e?.message || e}`);
    } finally {
      await p.close();
      await sleep(350);
    }
  }

  fs.writeFileSync(outPath, JSON.stringify({ profileUrl, scrapedAt: new Date().toISOString(), count: results.length, posts: results }, null, 2), "utf-8");
  console.log(`\n[Done] Saved ${results.length} posts to: ${outPath}`);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

