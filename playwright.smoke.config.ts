import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.LANTERN_SMOKE_BASE_URL;
if (!baseURL) throw new Error("Set LANTERN_SMOKE_BASE_URL before running smoke tests.");

export default defineConfig({
  testDir: "./smoke",
  timeout: 30_000,
  workers: 1,
  retries: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    actionTimeout: 10_000,
    trace: "retain-on-failure",
  },
});
