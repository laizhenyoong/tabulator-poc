/**
 * Utility functions for session storage persistence
 */

const SESSION_STORAGE_PREFIX = 'advanced-data-table-';

export interface SessionTableState {
  columnOrder: string[];
  columnWidths: Record<string, number>;
}

/**
 * Save table state to session storage
 */
export const saveTableStateToSession = (tableId: string, state: SessionTableState): void => {
  try {
    const key = `${SESSION_STORAGE_PREFIX}${tableId}`;
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save table state to session storage:', error);
  }
};

/**
 * Load table state from session storage
 */
export const loadTableStateFromSession = (tableId: string): SessionTableState | null => {
  try {
    const key = `${SESSION_STORAGE_PREFIX}${tableId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load table state from session storage:', error);
  }
  return null;
};

/**
 * Clear table state from session storage
 */
export const clearTableStateFromSession = (tableId: string): void => {
  try {
    const key = `${SESSION_STORAGE_PREFIX}${tableId}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear table state from session storage:', error);
  }
};