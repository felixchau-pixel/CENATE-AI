import { expect, test } from "@playwright/test";

const DASHBOARD_PROMPT = "dashboard first submit regression smoke";
const CHAT_URL_REGEX = /\/chat\/[\w-]+$/;

test.describe("Dashboard first submit bootstrap", () => {
  test("navigates immediately and keeps the first user message visible", async ({
    page,
  }) => {
    const blockingErrors: string[] = [];
    let chatPostCount = 0;

    page.on("console", (message) => {
      const text = message.text();
      if (
        /blocking-route|uncached data|hydration|connection\(\)|hydration mismatch/i.test(
          text
        )
      ) {
        blockingErrors.push(text);
      }
    });

    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("/api/chat")
      ) {
        chatPostCount += 1;
      }
    });

    await page.goto("/api/auth/guest?redirectUrl=/dashboard");
    await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });

    const dashboardInput = page.locator("textarea").first();
    await expect(dashboardInput).toBeVisible({ timeout: 10_000 });
    await dashboardInput.fill(DASHBOARD_PROMPT);
    await dashboardInput.press("Enter");

    await expect(page).toHaveURL(CHAT_URL_REGEX, { timeout: 15_000 });
    await expect(
      page.locator('[data-role="user"]').filter({ hasText: DASHBOARD_PROMPT }).first()
    ).toBeVisible({ timeout: 10_000 });

    expect(chatPostCount).toBe(1);
    expect(blockingErrors).toEqual([]);
  });
});
