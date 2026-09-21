import { expect, test } from "@playwright/test";

for (const route of ["/", "/first-day"] as const) {
  test(`${route} keeps a stable, lightweight first render`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium");
    await page.addInitScript(() => {
      (window as typeof window & { __lanternCls?: number }).__lanternCls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!shift.hadRecentInput) {
            const target = window as typeof window & { __lanternCls?: number };
            target.__lanternCls = (target.__lanternCls ?? 0) + (shift.value ?? 0);
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const transferBytes = performance
        .getEntriesByType("resource")
        .reduce(
          (total, entry) =>
            total + (entry as PerformanceResourceTiming).transferSize,
          navigation.transferSize,
        );
      return {
        cls:
          (window as typeof window & { __lanternCls?: number }).__lanternCls ??
          0,
        loadMs: navigation.loadEventEnd,
        transferBytes,
      };
    });

    expect(metrics.cls).toBeLessThan(0.1);
    expect(metrics.loadMs).toBeLessThan(5_000);
    expect(metrics.transferBytes).toBeLessThan(2_500_000);
  });
}
