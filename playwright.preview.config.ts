import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  timeout: 300 * 1000,
  expect: { timeout: 60 * 1000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "preview",
      testMatch: /preview-capture\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // No webServer — assumes dev server is already running on 3000
});
