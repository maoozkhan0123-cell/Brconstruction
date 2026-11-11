import assert from "node:assert/strict";
import { access, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Uses an existing Playwright installation and browser. No downloads or installs.
// PLAYWRIGHT_MODULE_PATH may point to its package directory or index.mjs.
// CHROME_PATH may point to an existing Chrome/Chromium executable.
// A durable QA inquiry is submitted only when --submit-inquiry is supplied.
const baseUrl = process.argv[2];
if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
  throw new Error("Usage: node tests/browser-qa.mjs http://127.0.0.1:5173 [--submit-inquiry]");
}
const origin = new URL(baseUrl).origin;
const outputDir = path.resolve(process.env.QA_OUTPUT_DIR || ".qa");
await mkdir(outputDir, { recursive: true });

async function loadPlaywright() {
  const configured = process.env.PLAYWRIGHT_MODULE_PATH;
  if (!configured) {
    try { return await import("playwright"); }
    catch { throw new Error("Set PLAYWRIGHT_MODULE_PATH to an existing Playwright package; this script does not install one."); }
  }
  let entry = configured;
  if ((await stat(configured)).isDirectory()) {
    const candidates = ["index.mjs", "index.js"];
    for (const filename of candidates) {
      const candidate = path.join(configured, filename);
      try { await access(candidate); entry = candidate; break; } catch { /* Try the package's other entry format. */ }
    }
  }
  return import(pathToFileURL(path.resolve(entry)).href);
}

const { chromium } = await loadPlaywright();
const context = await chromium.launchPersistentContext(path.join(outputDir, "chrome"), {
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  args: ["--disable-background-networking", "--no-first-run"],
});
context.setDefaultTimeout(12_000);
const page = context.pages()[0] || await context.newPage();
const results = [];
const consoleErrors = [];
const failedResponses = [];
const screenshots = [];
page.on("pageerror", error => consoleErrors.push({ type: "exception", message: error.message }));
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push({ type: "console", message: message.text() });
});
page.on("response", response => {
  if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() });
});

async function check(name, run) {
  try {
    const detail = await run();
    results.push({ name, passed: true, ...(detail ? { detail } : {}) });
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    process.stdout.write(`FAIL ${name}: ${error.message}\n`);
    try { await screenshot(`failure-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`); } catch { /* Preserve the original failure. */ }
  }
}
async function visit(route = "/") {
  const response = await page.goto(new URL(route, origin).href, { waitUntil: "networkidle", timeout: 45_000 });
  assert.ok(response && response.status() === 200, `Expected HTTP 200 for ${route}; got ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("h1").first().waitFor();
}
async function screenshot(name, fullPage = false) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file, fullPage, animations: "disabled" });
  screenshots.push(file);
}
async function revealPage() {
  // Trigger below-fold lazy images and scroll reveal observers before capture.
  await page.evaluate(async () => {
    const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await pause(60);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

try {
  await check("Homepage and local images load", async () => {
    await visit();
    await page.locator(".hero-images img").first().evaluate(image => image.decode());
    assert.match(await page.title(), /BR/i);
    await screenshot("home-desktop-1440.png");
    await revealPage();
    const broken = await page.locator("img").evaluateAll(images => images.filter(image => image.getAttribute("src") && image.complete && image.naturalWidth === 0).map(image => image.src));
    assert.deepEqual(broken, [], "Broken page images");
    await screenshot("home-desktop-full.png", true);
  });

  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await check(`Responsive layout has no horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      if (dimensions.document > width + 1 || dimensions.body > width + 1) {
        dimensions.overflowingElements = await page.locator("body *").evaluateAll(elements => elements.map(element => ({ element, rect: element.getBoundingClientRect() })).filter(({ rect }) => rect.right > window.innerWidth + 1 && rect.width > 0).slice(0, 12).map(({ element, rect }) => ({ tag: element.tagName, className: typeof element.className === "string" ? element.className : "", right: rect.right, width: rect.width })));
        assert.fail(JSON.stringify(dimensions));
      }
      if (width === 390) await screenshot("home-mobile-390.png");
      return dimensions;
    });
  }

  await check("Hero image controls change the selected slide", async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("button", { name: "Next architectural image" }).click();
    assert.equal(await page.getByRole("button", { name: "Show architectural image 2" }).getAttribute("aria-pressed"), "true");
  });

  await check("Desktop navigation reaches the target section", async () => {
    await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "About", exact: true }).click();
    await page.waitForURL(url => url.hash === "#about");
    assert.ok(await page.locator("#about").isVisible());
  });

  await check("Expertise cards expand and collapse accessibly", async () => {
    const toggles = page.locator(".expertise-toggle");
    await toggles.nth(1).click();
    assert.equal(await toggles.nth(1).getAttribute("aria-expanded"), "true");
    assert.equal(await toggles.nth(0).getAttribute("aria-expanded"), "false");
    await toggles.nth(1).click();
    assert.equal(await toggles.nth(1).getAttribute("aria-expanded"), "false");
  });

  await check("Project filters update cards and shareable URL", async () => {
    await page.locator(".project-filters").getByRole("button", { name: /^Interior Design/ }).click();
    assert.equal(new URL(page.url()).searchParams.get("category"), "Interior Design");
    assert.equal(await page.locator(".project-grid .project-card").count(), 1);
    assert.match(await page.locator(".project-grid").innerText(), /Stone & Light/);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator(".project-grid .project-card").count(), 1);
    await page.locator(".project-filters").getByRole("button", { name: /^All Projects/ }).click();
    assert.equal(new URL(page.url()).searchParams.has("category"), false);
  });

  await check("Process timeline updates its content and selected stage", async () => {
    const stage = page.locator(".process-timeline button").nth(3);
    await stage.click();
    assert.equal(await stage.getAttribute("aria-pressed"), "true");
    assert.match(await page.locator(".process-description").innerText(), /Refine & handover/);
  });

  await check("Commitment carousel advances", async () => {
    const before = await page.locator(".commitment-content h2").innerText();
    await page.getByRole("button", { name: "Next commitment" }).click();
    assert.notEqual(await page.locator(".commitment-content h2").innerText(), before);
  });

  await check("Mobile navigation opens, closes with Escape, and follows links", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator("#mobile-navigation").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation", exact: true }).getByRole("link", { name: /Projects/ }).click();
    await page.waitForURL(url => url.hash === "#projects");
    await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
  });

  await check("Project case study and gallery keyboard controls work", async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit("/projects");
    await page.locator(".project-card").filter({ hasText: "The Stillwater Residence" }).click();
    await page.waitForURL(url => url.pathname === "/projects/stillwater-residence");
    assert.match(await page.locator("main").innerText(), /illustrative|concept/i);
    await page.locator(".gallery-thumbnail").first().click();
    const gallery = page.locator(".gallery-dialog");
    await gallery.waitFor({ state: "visible" });
    const before = await gallery.locator(".gallery-image").getAttribute("src");
    await page.keyboard.press("ArrowRight");
    assert.notEqual(await gallery.locator(".gallery-image").getAttribute("src"), before);
    await page.keyboard.press("ArrowLeft");
    assert.equal(await gallery.locator(".gallery-image").getAttribute("src"), before);
    await page.keyboard.press("Escape");
    await gallery.waitFor({ state: "hidden" });
    await screenshot("project-detail-desktop.png");
  });

  await check("Service page loads with complete capabilities", async () => {
    await visit("/");
    await page.locator(".expertise-toggle").nth(2).click();
    await page.locator("#expertise-2").getByRole("link", { name: /Explore expertise/ }).click();
    await page.waitForURL(url => url.pathname === "/services/interior-design");
    assert.match(await page.locator("main").innerText(), /Lighting design/i);
  });

  await check("Contact preselection and accessible validation work", async () => {
    await visit("/contact?service=interior-design");
    assert.equal(await page.locator("#service").inputValue(), "Interior Design");
    await page.getByRole("button", { name: "Discuss my project", exact: true }).click();
    assert.ok(await page.locator(".field-error").count() >= 5, "Expected clear required-field messages");
    assert.equal(await page.locator("#fullName").getAttribute("aria-invalid"), "true");
    assert.equal(await page.locator("#fullName").evaluate(element => document.activeElement === element), true);
  });

  if (process.argv.includes("--submit-inquiry")) {
    await check("Valid inquiry is accepted by the backend before success is shown", async () => {
      await page.locator("#fullName").fill("QA Browser Verification — Do Not Contact");
      await page.locator("#email").fill("qa+brconstruction@example.com");
      await page.locator("#phone").fill("");
      await page.locator("#service").selectOption("Interior Design");
      await page.locator("#location").fill("QA validation only");
      await page.locator("#budget").fill("QA — no commercial inquiry");
      await page.locator("#description").fill("Automated QA verification of the BR Construction inquiry form. This is test data. No follow-up or consultation is requested.");
      await page.locator("#consent").check();
      await page.waitForTimeout(2100);
      const accepted = page.waitForResponse(response => response.url().endsWith("/api/inquiries") && response.request().method() === "POST");
      await page.getByRole("button", { name: "Discuss my project", exact: true }).click();
      const response = await accepted;
      const body = await response.json();
      assert.equal(response.status(), 201, JSON.stringify(body));
      assert.equal(body.ok, true);
      assert.ok(body.id, "Server must return a durable inquiry reference");
      await page.locator(".form-success").waitFor({ state: "visible" });
      assert.match(await page.locator(".inquiry-reference").innerText(), new RegExp(body.id));
      return { id: body.id, notification: body.notification };
    });
  } else {
    results.push({ name: "Durable inquiry submission", skipped: true, reason: "Pass --submit-inquiry to create one explicitly marked QA inquiry." });
  }

  for (const route of ["/about", "/projects", "/privacy", "/terms"]) {
    await check(`Page and metadata load: ${route}`, async () => {
      await visit(route);
      assert.ok(await page.title());
      assert.equal(await page.locator("h1").count(), 1);
    });
  }
  await check("No browser exceptions or console errors", () => {
    if (consoleErrors.length) {
      const distinctMessages = [...new Set(consoleErrors.map(error => error.message.split("\n")[0]))];
      assert.fail(JSON.stringify({ count: consoleErrors.length, distinctMessages }));
    }
  });
  await check("No HTTP errors", () => assert.deepEqual(failedResponses, []));
} finally {
  await writeFile(path.join(outputDir, "browser-report.json"), JSON.stringify({ origin, checkedAt: new Date().toISOString(), results, consoleErrors, failedResponses, screenshots }, null, 2));
  await context.close();
}

const failed = results.filter(result => result.passed === false);
process.stdout.write(`\n${results.filter(result => result.passed).length} passed; ${failed.length} failed. Report: ${path.join(outputDir, "browser-report.json")}\n`);
if (failed.length) process.exitCode = 1;
