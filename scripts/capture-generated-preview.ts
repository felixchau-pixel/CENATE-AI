import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

async function main() {
  const htmlPath = process.argv[2];
  const screenshotPath = process.argv[3];

  if (!htmlPath || !screenshotPath) {
    throw new Error(
      "Usage: node --import tsx ./scripts/capture-generated-preview.ts <preview.html> <screenshot.png>"
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => {
    console.error("pageerror:", error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error("console-error:", message.text());
    }
  });

  try {
    console.error("capture:start");
    const html = readFileSync(htmlPath, "utf8");
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    console.error("capture:content-ready");
    await page.waitForTimeout(8000);
    console.error("capture:screenshot");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.error("capture:done");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
