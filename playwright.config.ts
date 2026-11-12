import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.ts",
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:17347",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "bun tests/e2e-server.ts",
    url: "http://127.0.0.1:17347/api/health",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
