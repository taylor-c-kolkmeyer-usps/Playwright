import { test, expect } from '@playwright/test';
import { GlobalFiltersPage } from '../../pages/globalfilters.page';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const globalFilterPath = env.IBPS_GLOBAL_FILTER_PATH ?? '/';

/**
 * S02 - District/Division Global Filter
 *
 * Validates two things on the Global Filter:
 *  1. The full D/D dropdown (Area = All) matches a stored snapshot.
 *     Run once with `--update-snapshots` to capture the baseline; subsequent
 *     runs guard against unexpected data changes in SIT.
 *  2. For every Area/Region, the D/D dropdown has "All" first and the
 *     remaining entries are in alphanumeric (locale-sorted) order.
 *
 * Authentication is provided by Playwright global setup storage state.
 * Migrated from: S02GlobalFilterDistrictDivisionTest.java (Selenium / TestNG)
 */

test('Global Filter District Division AlphaNumeric Order', async ({ page }) => {
  // Use domcontentloaded (same pattern as global-setup) so the slow SIT app does not
  // time out on the full 'load' event; networkidle below waits for Angular to settle.
  await page.goto(globalFilterPath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const globalFilters = new GlobalFiltersPage(page);

  // --- Validate 1: full D/D list (Area = All) matches stored snapshot ---
  // First run: execute with `npx playwright test --update-snapshots` to write the baseline file.
  // Subsequent runs: fails if the list changes unexpectedly in SIT.
  const allDdOptions = await globalFilters.getAllDistrictDivisionOptions();
  expect(allDdOptions).toMatchSnapshot('district-division-all-options.txt');

  // --- Validate 2: per-Area D/D list starts with "All" and is alphanumerically sorted ---
  const areaRegionOptions = await globalFilters.getAllAreaRegionOptions();

  for (const area of areaRegionOptions) {
    const ddOptions = await globalFilters.getDistrictDivisionOptionsForArea(area);

    expect(
      ddOptions[0],
      `Area "${area}": first D/D option should be "All"`,
    ).toBe('All');

    const withoutAll = ddOptions.slice(1);
    const sorted = [...withoutAll].sort((a, b) => a.localeCompare(b));
    expect(
      withoutAll,
      `Area "${area}": D/D options should be in alphanumeric order`,
    ).toEqual(sorted);
  }
  });
