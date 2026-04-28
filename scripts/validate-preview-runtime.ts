import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { buildIframeDoc } from "../components/chat/project-runtime-preview";
import { evaluateProjectPreviewReadiness } from "../lib/ai/website/preview-readiness";
import { parseProjectContent } from "../lib/project-manifest";

async function main() {
  const projectPath = process.argv[2];
  const slug = process.argv[3] || "preview-check";

  if (!projectPath) {
    throw new Error(
      "Usage: node --import tsx ./scripts/validate-preview-runtime.ts <project.txt> [slug]"
    );
  }

  const { readFileSync } = await import("node:fs");
  const raw = readFileSync(projectPath, "utf8");
  const parsed = parseProjectContent(raw);
  const readiness = evaluateProjectPreviewReadiness(raw);
  const html = buildIframeDoc(parsed.files);

  const outDir = path.join(process.cwd(), ".tmp", "validation");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, `${slug}-runtime.html`), html, "utf8");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    deviceScaleFactor: 1,
  });

  const consoleErrors: string[] = [];
  const previewLogs: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    const text = message.text();
    if (text.includes("[preview-runtime]")) {
      previewLogs.push(text);
    }
    if (message.type() === "error" || text.includes("Module not found:")) {
      consoleErrors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(8000);

    const bodyText = await page.locator("body").innerText();
    const hasMountedContent = await page.evaluate(() => {
      const root = document.getElementById("root");
      return !!root && root.textContent !== null && root.textContent.trim().length > 0;
    });

    const hasErrorSurface =
      bodyText.includes("Module not found:") ||
      bodyText.includes("Preview error:") ||
      bodyText.includes("Runtime error:");

    const screenshotPath = path.join(outDir, `${slug}-runtime.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const result = {
      slug,
      readiness,
      consoleErrors,
      pageErrors,
      previewLogs,
      hasMountedContent,
      hasErrorSurface,
      screenshotPath,
    };

    writeFileSync(
      path.join(outDir, `${slug}-runtime-result.json`),
      JSON.stringify(result, null, 2),
      "utf8"
    );

    console.log(JSON.stringify(result, null, 2));

    if (!readiness.previewReady || hasErrorSurface || consoleErrors.length > 0 || pageErrors.length > 0 || !hasMountedContent) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
