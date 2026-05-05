import { test, expect } from '@playwright/test';
import { GlobalFiltersPage } from '../../pages/globalfilters.page';
import { EXPECTED_DISTRICT_DIVISION_LIST } from '../../utils/test-data';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const globalFilterPath = env.IBPS_GLOBAL_FILTER_PATH ?? '/';

/**
 * S02 - District/Division Global Filter
 *
 * Validates two things on the Global Filter:
 *  1. The full D/D dropdown (Area = All) matches the expected ordered list.
 *  2. For every Area/Region, the D/D dropdown has "All" first and the
 *     remaining entries are in alphanumeric (locale-sorted) order.
 *
 * Authentication is provided by Playwright global setup storage state.
 * Migrated from: S02GlobalFilterDistrictDivisionTest.java (Selenium / TestNG)
 */

test('Global Filter District Division AlphaNumeric Order', async ({ page }) => {
  await page.goto(globalFilterPath);
  await page.waitForLoadState('networkidle');

  const globalFilters = new GlobalFiltersPage(page);

  // --- Validate 1: full D/D list matches expected ordered list (Area = All) ---
  const allDdOptions = await globalFilters.getAllDistrictDivisionOptions();
  expect(allDdOptions, 'D/D options should match the expected ordered list').toEqual(
    Array.from(EXPECTED_DISTRICT_DIVISION_LIST),
  );

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
