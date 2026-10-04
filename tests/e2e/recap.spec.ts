import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const demo = "/wrapped/octocat?year=2025&demo=1";
async function readyCard(page: Page) {
  await expect(page.locator(".card-shadow")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(async () => page.locator(".card-preview-shell").evaluate(shell => {
    const width = shell.getBoundingClientRect().width;
    return width > 0 ? Math.abs(width - shell.querySelector(".card-preview-render")!.getBoundingClientRect().width) : Infinity;
  })).toBeLessThan(1);
}

for (const route of ["/", demo]) {
  for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 480], [390, 844], [375, 667], [320, 568]]) {
    test(`${route === "/" ? "home" : "result"}: complete cover and separate stats at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(route);
      await readyCard(page);
      const cover = await page.locator(".card-shadow").boundingBox();
      const stats = await page.locator("#year-details").boundingBox();
      const cue = await page.getByRole("link", { name: "Explore the stats" }).boundingBox();
      expect(cover!.y).toBeGreaterThanOrEqual(0);
      expect(cover!.y + cover!.height).toBeLessThanOrEqual(height);
      expect(stats!.y).toBeGreaterThanOrEqual(height);
      expect(cue!.y).toBeGreaterThanOrEqual(cover!.y + cover!.height);
      expect(cue!.y + cue!.height).toBeLessThanOrEqual(stats!.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.locator(".sample-badge")).toHaveCount(3);
      if (process.env.UPDATE_README_SCREENSHOT === "1" && route === demo && width === 1440) {
        await page.screenshot({ path: "docs/screenshot.png" });
      }
    });
  }
}

test("scroll cue supports keyboard navigation and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(demo);
  const cue = page.getByRole("link", { name: "Explore the stats" });
  await cue.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#year-details$/);
  await expect(page.getByRole("heading", { name: "Every little push adds up." })).toBeInViewport();
  await expect(page.locator("#year-details")).toBeFocused();
  expect(await page.locator("html").evaluate(el => getComputedStyle(el).scrollBehavior)).toBe("auto");
});

test("failed historical recap keeps the requested year", async ({ page }) => {
  await page.goto("/wrapped/invalid!?year=2024");
  await expect(page.locator("#year")).toHaveValue("2024");
  await expect(page.locator("#username")).toHaveValue("invalid!");
  await expect(page.locator(".form-error")).toContainText("Enter a valid GitHub username");
});

test("gateway and network failures remain readable and retryable", async ({ page }) => {
  await page.goto("/");
  await page.locator("#username").fill("octocat");
  await page.route("**/api/wrapped?*", route => route.fulfill({ status: 502, contentType: "text/html", body: "<h1>Bad Gateway</h1>" }));
  await page.locator(".generate-button").click();
  await expect(page.locator(".form-error")).toHaveText("Couldn't generate your recap. Please try again.");
  await expect(page.locator(".generate-button")).toBeEnabled();
  await page.unroute("**/api/wrapped?*");
  await page.route("**/api/wrapped?*", route => route.abort("failed"));
  await page.locator(".generate-button").click();
  await expect(page.locator(".form-error")).toHaveText("Couldn't connect. Check your connection and try again.");
  await expect(page.locator(".generate-button")).toBeEnabled();
});

test("generating another year and going back restores recap identity", async ({ page }) => {
  await page.goto("/wrapped/octocat?year=2024&demo=1");
  await page.locator("#username").fill("octocat");
  await page.locator("#year").selectOption("2025");
  await page.route("**/api/wrapped?*", route => route.fulfill({ json: { username: "octocat", year: 2025, isDemo: true } }));
  await page.locator(".generate-button").click();
  await expect(page).toHaveURL(/year=2025&theme=lime&demo=1/);
  await expect(page.locator("#year")).toHaveValue("2025");
  await page.goBack();
  await expect(page.locator("#year")).toHaveValue("2024");
  await expect(page.locator("#username")).toHaveValue("");
});

test("theme, PNG download and chart interactions remain usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(demo);
  await page.getByRole("button", { name: "Violet", exact: true }).click();
  await expect(page.getByRole("button", { name: "Violet", exact: true })).toHaveAttribute("aria-pressed", "true");
  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await pendingDownload;
  expect(download.suggestedFilename()).toBe("github-wrapped-octocat-2025-violet-demo.png");
  const bytes = await readFile((await download.path())!);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1080);
  expect(bytes.readUInt32BE(20)).toBe(1350);
  expect(bytes).toMatchSnapshot("violet-export.png", { maxDiffPixelRatio: 0.001 });
  await expect(page.locator(".month-label").first()).toHaveText("Jan");
  await expect(page.locator(".month-label").last()).toHaveText("Dec");
  await page.locator(".month-column").first().click();
  await expect(page.locator(".month-column").first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".contribution-calendar button")).toHaveCount(365);
  await page.locator(".contribution-calendar button").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".contribution-calendar button").nth(7)).toBeFocused();
  expect(errors).toEqual([]);
});

test("download and copy reuse a PNG and changing themes renders a new one", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "write", { configurable: true, value: async (items: ClipboardItem[]) => {
      const image = await items[0].getType("image/png");
      if (image.type !== "image/png" || image.size === 0) throw new Error("Invalid image");
    } });
  });
  let renders = 0;
  page.on("request", request => { if (new URL(request.url()).pathname === "/api/card") renders++; });
  await page.goto(demo);
  let download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  await download;
  await page.getByRole("button", { name: "Copy image", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Image copied");
  expect(renders).toBe(1);
  await page.getByRole("button", { name: "Mono", exact: true }).click();
  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  expect((await download).suggestedFilename()).toContain("mono");
  expect(renders).toBe(2);
  await page.getByRole("button", { name: "Lime", exact: true }).click();
  await page.getByRole("button", { name: "Copy image", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Image copied");
  expect(renders).toBe(2);
});

test("full profile URLs fit the form and normalize through the API", async ({ page, request }) => {
  const profile = "https://github.com/a-very-long-but-valid-github-username/";
  await page.goto("/");
  await page.locator("#username").fill(profile);
  await expect(page.locator("#username")).toHaveValue(profile);
  // Demo lookup still runs the same parser, without requiring a server token.
  const response = await request.get(`/api/wrapped?${new URLSearchParams({ username: profile, year: "2025", demo: "1" })}`);
  expect(response.ok()).toBe(true);
  await page.route("**/api/wrapped?*", async route => {
    expect(new URL(route.request().url()).searchParams.get("username")).toBe(profile);
    await route.fulfill({ json: { username: "octocat", year: 2025, isDemo: true } });
  });
  await page.locator(".generate-button").click();
  await expect(page).toHaveURL(/wrapped\/octocat\?year=2025/);
});
