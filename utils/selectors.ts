// Reusable locators for Other Non-Personnel (ONP) components.
export const ONP_SELECTORS = {
  // "Select Other Non-Personnel Lines" tab button. data-testid confirmed from live DOM inspection (June 2026).
  onpSelectLinesRadioIndicator: '[data-testid="tab-select-other-non-personnel-lines-tab"]',

  // Selection criteria dialog — ibps-tabulator (Tabulator.js) grid. IDs/attributes confirmed from live DOM (July 2026).
  // Top-right search input (filters across all fields).
  lineNumberSearchInput:  '[data-testid="search-grid-select-lines"]',
  // Column-level filter input under the "Line #" header. Stable ID set by the component.
  lineNumberColumnFilter: '#grid-select-lines-column-filter-lineNumberCode-input',
  // Tabulator row and the cell that holds the line number code.
  tabulatorRow:           '.tabulator-row',
  lineNumberCell:         '.tabulator-cell[tabulator-field="lineNumberCode"]',
  // Native checkbox inside the frozen first cell of each row.
  tabulatorRowCheckbox:   'input[type="checkbox"]',
  // Column-level filter input under the "Finance #" header. ID confirmed from live DOM (July 2026).
  // Note: the component uses the 'grid-select-lines' prefix for all grids in this dialog.
  financeNumberColumnFilter: '#grid-select-lines-column-filter-financeNumber-input',
  // Cell that holds the finance number code.
  financeNumberCell:         '.tabulator-cell[tabulator-field="financeNumber"]',
  // OK button that confirms the selection and closes the dialog. id confirmed from live DOM (July 2026).
  selectionCriteriaOkBtn: '#pricing-type-ok-button',
};

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