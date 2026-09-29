import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { describeViolations } from "../helpers/audit";
import { OWNED_ROUTES } from "../helpers/routes";

/** WCAG 2.2 AA gate: no serious or critical axe violations on any owned route. */
for (const route of OWNED_ROUTES) {
  test(`${route} has no serious/critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(describeViolations(blocking), `axe violations on ${route}`).toEqual([]);
  });
}
