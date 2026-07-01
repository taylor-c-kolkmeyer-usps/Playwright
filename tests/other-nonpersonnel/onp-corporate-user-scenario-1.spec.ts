import { test, expect } from '@playwright/test';
import { ONP_SELECTORS } from '../../utils/selectors';
import { ONP_SCENARIO_1 } from '../../utils/test-data';

/**
 * ONP Corporate User - Scenario 1
 *
 * End-to-End Scenario:
 * A corporate user updates three non-salary expense lines for Finance Number 102706
 * to ensure the fiscal-year budget is accurate.
 *   Line 41 - Rent                  -> 78,500 each month
 *   Line 43 - Depreciation          -> 145,000 each month
 *   Line 46 - Information Technology -> Annual total of 330,000, keeping the existing monthly spread.
 * Lines 41 and 43 are updated through the import template.
 * Line 46 is updated directly in the data grid.
 *
 * Authentication is provided by Playwright global setup storage state.
 * Migrated from: S02 / ONP corporate user scenario (Selenium / TestNG)
 */

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const baseURL = env.BASE_URL ?? 'https://ibps-sit.usps.gov';

test('ONP Corporate User Scenario 1', async ({ page }) => {
  await page.goto(`${baseURL}/other-non-personnel`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  // Step 1: Select the "Select Other Non-Personnel Lines" tab
  await page.locator(ONP_SELECTORS.onpSelectLinesRadioIndicator).click();

  // Step 2: Select Line 41 (Rent) from the selection criteria dialog.
  // Use pressSequentially (not fill) so each keystroke fires keydown/keyup — Tabulator's
  // column filter listens for keyup to apply the filter; fill() skips that event.
  await page.locator(ONP_SELECTORS.lineNumberColumnFilter).pressSequentially('41');

  const line41Row = page.locator(ONP_SELECTORS.tabulatorRow).filter({
    has: page.locator(ONP_SELECTORS.lineNumberCell).filter({ hasText: /^41$/ }),
  });
  await expect(line41Row).toBeVisible();
  await line41Row.locator(ONP_SELECTORS.tabulatorRowCheckbox).click();
  await expect(line41Row).toHaveClass(/tabulator-selected/);

  // Step 3: Select Finance Number 102706 (Business Operations) from the finance number grid.
  await page.locator(ONP_SELECTORS.financeNumberColumnFilter).pressSequentially(ONP_SCENARIO_1.financeNumber);

  const financeRow = page.locator(ONP_SELECTORS.tabulatorRow).filter({
    has: page.locator(ONP_SELECTORS.financeNumberCell).filter({ hasText: new RegExp(`^${ONP_SCENARIO_1.financeNumber}$`) }),
  });
  await expect(financeRow).toBeVisible();
  await financeRow.locator(ONP_SELECTORS.tabulatorRowCheckbox).click();
  await expect(financeRow).toHaveClass(/tabulator-selected/);

  // Step 4: Confirm the selection criteria by clicking OK.
  await page.locator(ONP_SELECTORS.selectionCriteriaOkBtn).click();
  await page.waitForLoadState('networkidle');
});