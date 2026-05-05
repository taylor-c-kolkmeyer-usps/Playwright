import { type Page, type Locator } from '@playwright/test';
import { GLOBAL_FILTER_SELECTORS } from '../utils/selectors';
import { BasePage } from './base.page';

export class GlobalFiltersPage extends BasePage {
  private readonly ddDropdown: Locator;
  private readonly ddDropdownValues: Locator;
  private readonly areaRegionDropdown: Locator;
  private readonly areaRegionDropdownValues: Locator;
  private readonly overlayBackdrop: Locator;

  constructor(page: Page) {
    super(page);
    this.ddDropdown = this.locator(GLOBAL_FILTER_SELECTORS.districtDivisionDropdown);
    this.ddDropdownValues = this.locator(GLOBAL_FILTER_SELECTORS.districtDivisionDropdownValues);
    this.areaRegionDropdown = this.locator(GLOBAL_FILTER_SELECTORS.areaRegionDropdown);
    this.areaRegionDropdownValues = this.locator(GLOBAL_FILTER_SELECTORS.areaRegionDropdownValues);
    this.overlayBackdrop = this.locator(GLOBAL_FILTER_SELECTORS.overlayBackdrop);
  }

  /** Opens the D/D dropdown, collects all option texts, then closes it. */
  async getAllDistrictDivisionOptions(): Promise<string[]> {
    await this.ddDropdown.click();
    await this.ddDropdownValues.first().waitFor({ state: 'visible' });
    const options = await this.ddDropdownValues.allTextContents();
    await this.overlayBackdrop.click();
    await this.ddDropdownValues.first().waitFor({ state: 'hidden' });
    return options.map(o => o.trim());
  }

  /** Opens the Area/Region dropdown, collects all option texts (excluding "All"), then closes it. */
  async getAllAreaRegionOptions(): Promise<string[]> {
    await this.areaRegionDropdown.click();
    await this.areaRegionDropdownValues.first().waitFor({ state: 'visible' });
    const options = await this.areaRegionDropdownValues.allTextContents();
    await this.overlayBackdrop.click();
    await this.areaRegionDropdownValues.first().waitFor({ state: 'hidden' });
    return options.map(o => o.trim()).filter(o => o !== 'All');
  }

  /**
   * Selects the given Area/Region value, then opens the D/D dropdown and
   * returns all option texts for that area. Closes the dropdown afterwards.
   */
  async getDistrictDivisionOptionsForArea(areaValue: string): Promise<string[]> {
    await this.areaRegionDropdown.click();
    await this.areaRegionDropdownValues.getByText(areaValue, { exact: true }).click();
    await this.ddDropdown.click();
    await this.ddDropdownValues.first().waitFor({ state: 'visible' });
    const options = await this.ddDropdownValues.allTextContents();
    await this.overlayBackdrop.click();
    await this.ddDropdownValues.first().waitFor({ state: 'hidden' });
    return options.map(o => o.trim());
  }
}
