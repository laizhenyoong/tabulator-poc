/**
 * Accessibility utilities and constants
 */

// ARIA roles and attributes
export const ARIA_ROLES = {
  TABLE: 'table',
  ROW: 'row',
  CELL: 'cell',
  COLUMNHEADER: 'columnheader',
  ROWHEADER: 'rowheader',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  BUTTON: 'button',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  CHECKBOX: 'checkbox',
  TEXTBOX: 'textbox'
} as const;

export const ARIA_STATES = {
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  DISABLED: 'aria-disabled',
  HIDDEN: 'aria-hidden',
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  SORT: 'aria-sort',
  ROWCOUNT: 'aria-rowcount',
  COLCOUNT: 'aria-colcount',
  ROWINDEX: 'aria-rowindex',
  COLINDEX: 'aria-colindex',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic'
} as const;

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  F2: 'F2',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace'
} as const;

// Screen reader announcements
export const SCREEN_READER_MESSAGES = {
  TABLE_LOADED: (rowCount: number) => `Table loaded with ${rowCount} rows`,
  ROW_SELECTED: (rowIndex: number) => `Row ${rowIndex} selected`,
  ROW_DESELECTED: (rowIndex: number) => `Row ${rowIndex} deselected`,
  COLUMN_SORTED: (column: string, direction: string) => `Column ${column} sorted ${direction}`,
  FILTER_APPLIED: (column: string, value: string) => `Filter applied to ${column}: ${value}`,
  FILTER_CLEARED: (column: string) => `Filter cleared from ${column}`,
  CELL_EDITING: (column: string, row: number) => `Editing cell in ${column}, row ${row}`,
  CELL_EDIT_SAVED: (column: string, row: number) => `Changes saved to ${column}, row ${row}`,
  CELL_EDIT_CANCELLED: (column: string, row: number) => `Edit cancelled for ${column}, row ${row}`,
  ROW_EXPANDED: (row: number) => `Row ${row} expanded`,
  ROW_COLLAPSED: (row: number) => `Row ${row} collapsed`,
  BULK_ACTION: (action: string, count: number) => `${action} applied to ${count} selected rows`,
  CONTEXT_MENU_OPENED: 'Context menu opened',
  CONTEXT_MENU_CLOSED: 'Context menu closed',
  LOADING: 'Loading table data',
  LOADED: 'Table data loaded',
  ERROR: (message: string) => `Error: ${message}`
} as const;

/**
 * Generate ARIA attributes for table elements
 */
export const generateTableAriaAttributes = (
  rowCount: number,
  columnCount: number,
  tableId: string
) => ({
  role: ARIA_ROLES.TABLE,
  [ARIA_STATES.ROWCOUNT]: rowCount + 1, // +1 for header row
  [ARIA_STATES.COLCOUNT]: columnCount,
  [ARIA_STATES.LABEL]: `Data table with ${rowCount} rows and ${columnCount} columns`,
  id: tableId
});

/**
 * Generate ARIA attributes for table rows
 */
export const generateRowAriaAttributes = (
  rowIndex: number,
  isSelected: boolean,
  isExpanded?: boolean,
  isHeader: boolean = false
) => {
  const attributes: Record<string, any> = {
    role: ARIA_ROLES.ROW,
    [ARIA_STATES.ROWINDEX]: rowIndex + (isHeader ? 0 : 1), // Headers start at 0, data rows start at 1
    [ARIA_STATES.SELECTED]: isSelected
  };

  if (isExpanded !== undefined) {
    attributes[ARIA_STATES.EXPANDED] = isExpanded;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for table cells
 */
export const generateCellAriaAttributes = (
  columnIndex: number,
  isHeader: boolean = false,
  sortDirection?: 'asc' | 'desc' | 'none',
  isEditable: boolean = false
) => {
  const attributes: Record<string, any> = {
    role: isHeader ? ARIA_ROLES.COLUMNHEADER : ARIA_ROLES.CELL,
    [ARIA_STATES.COLINDEX]: columnIndex + 1
  };

  if (isHeader && sortDirection) {
    attributes[ARIA_STATES.SORT] = sortDirection === 'none' ? 'none' : sortDirection;
  }

  if (isEditable) {
    attributes.tabIndex = 0;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for interactive elements
 */
export const generateInteractiveAriaAttributes = (
  element: 'button' | 'checkbox' | 'textbox' | 'menu' | 'menuitem',
  options: {
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    checked?: boolean;
    disabled?: boolean;
  } = {}
) => {
  const attributes: Record<string, any> = {
    role: ARIA_ROLES[element.toUpperCase() as keyof typeof ARIA_ROLES]
  };

  if (options.label) {
    attributes[ARIA_STATES.LABEL] = options.label;
  }

  if (options.describedBy) {
    attributes[ARIA_STATES.DESCRIBEDBY] = options.describedBy;
  }

  if (options.expanded !== undefined) {
    attributes[ARIA_STATES.EXPANDED] = options.expanded;
  }

  if (options.checked !== undefined) {
    attributes[ARIA_STATES.CHECKED] = options.checked;
  }

  if (options.disabled !== undefined) {
    attributes[ARIA_STATES.DISABLED] = options.disabled;
  }

  return attributes;
};

/**
 * Create screen reader announcement
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute(ARIA_STATES.LIVE, priority);
  announcement.setAttribute(ARIA_STATES.ATOMIC, 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Keyboard navigation handler
 */
export class KeyboardNavigationHandler {
  private currentFocusedCell: { row: number; col: number } | null = null;
  private tableElement: HTMLElement | null = null;
  private onCellFocus?: (row: number, col: number) => void;
  private onCellActivate?: (row: number, col: number) => void;
  private onRowSelect?: (row: number) => void;

  constructor(
    tableElement: HTMLElement,
    options: {
      onCellFocus?: (row: number, col: number) => void;
      onCellActivate?: (row: number, col: number) => void;
      onRowSelect?: (row: number) => void;
    } = {}
  ) {
    this.tableElement = tableElement;
    this.onCellFocus = options.onCellFocus;
    this.onCellActivate = options.onCellActivate;
    this.onRowSelect = options.onRowSelect;
    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.tableElement) return;

    this.tableElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.tableElement.addEventListener('focus', this.handleFocus.bind(this), true);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const { key, ctrlKey } = event;

    switch (key) {
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        this.moveFocus('up');
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        this.moveFocus('down');
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        event.preventDefault();
        this.moveFocus('left');
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        event.preventDefault();
        this.moveFocus('right');
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        if (ctrlKey) {
          this.moveFocus('first-cell');
        } else {
          this.moveFocus('row-start');
        }
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        if (ctrlKey) {
          this.moveFocus('last-cell');
        } else {
          this.moveFocus('row-end');
        }
        break;
      case KEYBOARD_KEYS.PAGE_UP:
        event.preventDefault();
        this.moveFocus('page-up');
        break;
      case KEYBOARD_KEYS.PAGE_DOWN:
        event.preventDefault();
        this.moveFocus('page-down');
        break;
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.F2:
        event.preventDefault();
        this.activateCell();
        break;
      case KEYBOARD_KEYS.SPACE:
        if (this.currentFocusedCell) {
          event.preventDefault();
          this.selectRow();
        }
        break;
      case KEYBOARD_KEYS.ESCAPE:
        event.preventDefault();
        this.cancelEdit();
        break;
    }
  }

  private handleFocus(event: FocusEvent) {
    const target = event.target as HTMLElement;
    const cell = target.closest('[role="cell"], [role="gridcell"]');
    
    if (cell) {
      const row = cell.closest('[role="row"]');
      if (row) {
        const rowIndex = Array.from(row.parentElement?.children || []).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        this.setCurrentFocus(rowIndex, colIndex);
      }
    }
  }

  private moveFocus(direction: string) {
    if (!this.currentFocusedCell || !this.tableElement) return;

    const { row, col } = this.currentFocusedCell;
    const rows = this.tableElement.querySelectorAll('[role="row"]');
    const currentRow = rows[row];
    const cells = currentRow?.querySelectorAll('[role="cell"], [role="gridcell"]');

    let newRow = row;
    let newCol = col;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, row - 1);
        break;
      case 'down':
        newRow = Math.min(rows.length - 1, row + 1);
        break;
      case 'left':
        newCol = Math.max(0, col - 1);
        break;
      case 'right':
        newCol = Math.min((cells?.length || 1) - 1, col + 1);
        break;
      case 'row-start':
        newCol = 0;
        break;
      case 'row-end':
        newCol = (cells?.length || 1) - 1;
        break;
      case 'first-cell':
        newRow = 0;
        newCol = 0;
        break;
      case 'last-cell':
        newRow = rows.length - 1;
        const lastRowCells = rows[newRow]?.querySelectorAll('[role="cell"], [role="gridcell"]');
        newCol = (lastRowCells?.length || 1) - 1;
        break;
      case 'page-up':
        newRow = Math.max(0, row - 10);
        break;
      case 'page-down':
        newRow = Math.min(rows.length - 1, row + 10);
        break;
    }

    this.focusCell(newRow, newCol);
  }

  private focusCell(row: number, col: number) {
    if (!this.tableElement) return;

    const rows = this.tableElement.querySelectorAll('[role="row"]');
    const targetRow = rows[row];
    const cells = targetRow?.querySelectorAll('[role="cell"], [role="gridcell"]');
    const targetCell = cells?.[col] as HTMLElement;

    if (targetCell) {
      targetCell.focus();
      this.setCurrentFocus(row, col);
      
      if (this.onCellFocus) {
        this.onCellFocus(row, col);
      }
    }
  }

  private setCurrentFocus(row: number, col: number) {
    this.currentFocusedCell = { row, col };
  }

  private activateCell() {
    if (this.currentFocusedCell && this.onCellActivate) {
      const { row, col } = this.currentFocusedCell;
      this.onCellActivate(row, col);
    }
  }

  private selectRow() {
    if (this.currentFocusedCell && this.onRowSelect) {
      const { row } = this.currentFocusedCell;
      this.onRowSelect(row);
    }
  }

  private cancelEdit() {
    // This would be handled by the parent component
    const event = new CustomEvent('cancelEdit', {
      detail: this.currentFocusedCell
    });
    this.tableElement?.dispatchEvent(event);
  }

  public destroy() {
    if (this.tableElement) {
      this.tableElement.removeEventListener('keydown', this.handleKeyDown.bind(this));
      this.tableElement.removeEventListener('focus', this.handleFocus.bind(this), true);
    }
  }
}

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus to first focusable element in container
   */
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusable?.focus();
  },

  /**
   * Set focus to last focusable element in container
   */
  focusLast: (container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastFocusable = focusable[focusable.length - 1] as HTMLElement;
    lastFocusable?.focus();
  },

  /**
   * Trap focus within container
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable[0] as HTMLElement;
    const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

    if (event.key === KEYBOARD_KEYS.TAB) {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }
};

/**
 * High contrast mode detection
 */
export const detectHighContrastMode = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false; // Default to false in test/server environments
  }
  
  try {
    // Create a test element to detect high contrast mode
    const testElement = document.createElement('div');
    testElement.style.border = '1px solid';
    testElement.style.borderColor = 'red green';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const isHighContrast = computedStyle.borderTopColor === computedStyle.borderRightColor;

    document.body.removeChild(testElement);
    return isHighContrast;
  } catch (error) {
    // Fallback for environments where this detection might not work
    return false;
  }
};

/**
 * Reduced motion detection
 */
export const prefersReducedMotion = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false; // Default to false in test/server environments
  }
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    // Fallback for environments where matchMedia might not work properly
    return false;
  }
};