import { expect, test } from "@playwright/test";
import postgres from "postgres";

const TEST_EMAIL = `preview-test-${Date.now()}@cenate-test.com`;
const TEST_PASSWORD = "TestPw123!";
const GENERATION_PROMPT =
  "Build a simple restaurant landing page with a hero section, menu section, and contact form. Use a dark elegant theme.";

test.describe("Preview Capture Pipeline", () => {
  test(
    "end-to-end: generate → capture → blob upload → DB previewUrl → dashboard card",
    async ({ page }) => {
      // ── Collect diagnostics ──────────────────────────────────────────────
      const consoleLogs: string[] = [];
      page.on("console", (msg) => {
        const text = msg.text();
        consoleLogs.push(`[${msg.type()}] ${text}`);
      });

      let previewApiCall: { status: number; body: unknown } | null = null;
      let chatIdFromUrl = "";

      page.on("response", async (response) => {
        if (response.url().includes("/api/preview")) {
          const status = response.status();
          let body: unknown = null;
          try {
            body = await response.json();
          } catch {
            /* ignore */
          }
          previewApiCall = { status, body };
          console.log(`[playwright] /api/preview response ${status}:`, body);
        }
      });

      // ── Step 1: Register ──────────────────────────────────────────────────
      await page.goto("/register");
      await page.locator('input[type="email"]').fill(TEST_EMAIL);
      await page.locator('input[type="password"]').fill(TEST_PASSWORD);
      await page.locator('button[type="submit"]').click();

      // After register, should land on dashboard or be redirected
      await page.waitForURL(/\/(dashboard|$)/, { timeout: 15_000 });
      console.log("[playwright] A: Registered, URL:", page.url());

      // If register succeeded but we're still at register, try login
      if (page.url().includes("/register") || page.url().includes("/early-access")) {
        await page.goto("/login");
        await page.locator('input[type="email"]').fill(TEST_EMAIL);
        await page.locator('input[type="password"]').fill(TEST_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(/\/(dashboard|$)/, { timeout: 15_000 });
      }

      // Ensure we are on dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      console.log("[playwright] A: On dashboard, URL:", page.url());

      // ── Step 2: Submit generation prompt from dashboard ─────────────────
      const textarea = page.locator("textarea").first();
      await expect(textarea).toBeVisible({ timeout: 10_000 });
      await textarea.fill(GENERATION_PROMPT);

      // The submit button is the one with the ArrowUp icon — find by sibling
      // PromptInputBox submits on Enter key as well
      await textarea.press("Enter");
      console.log("[playwright] B: Prompt submitted");

      // ── Step 3: Wait for workspace to load and URL to become /chat/:id ──
      await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 30_000 });
      chatIdFromUrl = page.url().split("/chat/")[1] ?? "";
      console.log("[playwright] C: Chat URL:", chatIdFromUrl);
      expect(chatIdFromUrl).toBeTruthy();

      // ── Checkpoint A: preview_ready — wait for iframe "Live Preview" ────
      console.log("[playwright] Waiting for generation to complete (preview_ready)...");
      const livePreviewIframe = page.frameLocator('iframe[title="Live Preview"]');
      // Wait up to 180s for the iframe to appear — generation can be slow
      await expect(page.locator('iframe[title="Live Preview"]')).toBeVisible({
        timeout: 180_000,
      });
      console.log("[playwright] A: preview_ready — iframe is visible");

      // ── Checkpoint B+C: capture trigger fires, iframe receives request ───
      // Wait 6s: 4s delay in artifact.tsx + 2s for capture
      console.log("[playwright] Waiting 8s for capture to run...");
      await page.waitForTimeout(8_000);

      // ── Checkpoint E+F: POST /api/preview sent and Blob upload succeeds ─
      console.log("[playwright] previewApiCall:", previewApiCall);
      if (!previewApiCall) {
        // Log all console output to diagnose
        console.log("[playwright] ALL console logs:\n" + consoleLogs.join("\n"));
      }
      expect(previewApiCall).not.toBeNull();
      expect(previewApiCall?.status).toBe(200);
      const blobUrl = (previewApiCall?.body as { url?: string })?.url;
      console.log("[playwright] F: Blob URL:", blobUrl);
      expect(blobUrl).toMatch(/blob\.vercel-storage\.com/);

      // ── Checkpoint G: DB row has previewUrl ─────────────────────────────
      const sql = postgres(process.env.POSTGRES_URL ?? "");
      try {
        const rows = await sql`SELECT "previewUrl" FROM "Chat" WHERE id = ${chatIdFromUrl}`;
        const dbPreviewUrl = rows[0]?.previewUrl;
        console.log("[playwright] G: DB previewUrl:", dbPreviewUrl);
        expect(dbPreviewUrl).toBe(blobUrl);
      } finally {
        await sql.end();
      }

      // ── Checkpoint H: Dashboard card shows image after refresh ───────────
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Find the project card — look for an img whose src contains the blob URL
      const imgLocator = page.locator(`img[src*="blob.vercel-storage.com"]`).first();
      await expect(imgLocator).toBeVisible({ timeout: 10_000 });
      const imgSrc = await imgLocator.getAttribute("src");
      console.log("[playwright] H: Dashboard img src:", imgSrc);
      expect(imgSrc).toContain("blob.vercel-storage.com");

      console.log("[playwright] ✅ All 8 checkpoints passed");
    }
  );
});
