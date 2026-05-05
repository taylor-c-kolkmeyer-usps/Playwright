// Reusable locators for Global Filter components.
// These target Angular Material select controls by visible label first, with
// accessibility and automation-id fallbacks to support minor markup variations.
export const GLOBAL_FILTER_SELECTORS = {
  districtDivisionDropdown: [
    'mat-form-field:has-text("District/Division") .mat-mdc-select-trigger',
    'mat-form-field:has-text("District Division") .mat-mdc-select-trigger',
    '[aria-label="District/Division"]',
    '[aria-label="District Division"]',
    '[data-automation-id="district-division-dropdown"]',
  ].join(', '),
  districtDivisionDropdownValues: [
    'mat-option .mdc-list-item__primary-text',
    '.mat-mdc-option .mdc-list-item__primary-text',
    'mat-option',
    '.mat-mdc-option',
  ].join(', '),
  areaRegionDropdown: [
    'mat-form-field:has-text("Area/Region") .mat-mdc-select-trigger',
    'mat-form-field:has-text("Area Region") .mat-mdc-select-trigger',
    '[aria-label="Area/Region"]',
    '[aria-label="Area Region"]',
    '[data-automation-id="area-region-dropdown"]',
  ].join(', '),
  areaRegionDropdownValues: [
    'mat-option .mdc-list-item__primary-text',
    '.mat-mdc-option .mdc-list-item__primary-text',
    'mat-option',
    '.mat-mdc-option',
  ].join(', '),
  overlayBackdrop:                '.cdk-overlay-backdrop',
};