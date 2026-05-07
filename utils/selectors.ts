// Reusable locators for Global Filter components.
// IDs confirmed from live DOM inspection on /work-hours (May 2026).
export const GLOBAL_FILTER_SELECTORS = {
  // #district-division-select is the mat-select element; clicking it opens the panel.
  districtDivisionDropdown: '#district-division-select',
  // Options render in a CDK overlay panel. Use only the inner text span to avoid
  // double-matching both the span and the parent mat-option element.
  districtDivisionDropdownValues: 'mat-option .mdc-list-item__primary-text',
  // #area-region-select confirmed id from DOM inspection.
  areaRegionDropdown: '#area-region-select',
  areaRegionDropdownValues: 'mat-option .mdc-list-item__primary-text',
  overlayBackdrop: '.cdk-overlay-backdrop',
};