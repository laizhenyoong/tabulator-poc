import { PackageRecord, SortConfiguration } from '../types';

/**
 * Event callback utilities and types
 */

export interface EventCallbacks {
  onDataChange?: (data: PackageRecord[]) => void;
  onRowSelect?: (selectedRows: PackageRecord[]) => void;
  onRowExpand?: (row: PackageRecord) => React.ReactNode;
  onContextMenuAction?: (action: string, row: PackageRecord) => void;
  onCellEdit?: (rowData: PackageRecord, field: string, oldValue: any, newValue: any) => void;
  onSort?: (sortConfig: SortConfiguration[]) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onColumnReorder?: (columnOrder: string[]) => void;
  onColumnResize?: (columnWidths: Record<string, number>) => void;
  onBulkAction?: (action: string, selectedRows: PackageRecord[]) => void;
  onError?: (error: Error, context: string) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export interface EventContext {
  tableId: string;
  timestamp: number;
  source: string;
}

/**
 * Event emitter for table events
 */
export class TableEventEmitter {
  private callbacks: EventCallbacks;
  private tableId: string;

  constructor(callbacks: EventCallbacks, tableId: string) {
    this.callbacks = callbacks;
    this.tableId = tableId;
  }

  /**
   * Safely emit data change event
   */
  emitDataChange(data: PackageRecord[]): void {
    try {
      if (this.callbacks.onDataChange) {
        this.callbacks.onDataChange(data);
      }
    } catch (error) {
      this.emitError(error as Error, 'onDataChange callback');
    }
  }

  /**
   * Safely emit row selection event
   */
  emitRowSelect(selectedRows: PackageRecord[]): void {
    try {
      if (this.callbacks.onRowSelect) {
        this.callbacks.onRowSelect(selectedRows);
      }
    } catch (error) {
      this.emitError(error as Error, 'onRowSelect callback');
    }
  }

  /**
   * Safely emit row expansion event
   */
  emitRowExpand(row: PackageRecord): React.ReactNode {
    try {
      if (this.callbacks.onRowExpand) {
        return this.callbacks.onRowExpand(row);
      }
    } catch (error) {
      this.emitError(error as Error, 'onRowExpand callback');
    }
    return null;
  }

  /**
   * Safely emit context menu action event
   */
  emitContextMenuAction(action: string, row: PackageRecord): void {
    try {
      if (this.callbacks.onContextMenuAction) {
        this.callbacks.onContextMenuAction(action, row);
      }
    } catch (error) {
      this.emitError(error as Error, 'onContextMenuAction callback');
    }
  }

  /**
   * Safely emit cell edit event
   */
  emitCellEdit(rowData: PackageRecord, field: string, oldValue: any, newValue: any): void {
    try {
      if (this.callbacks.onCellEdit) {
        this.callbacks.onCellEdit(rowData, field, oldValue, newValue);
      }
    } catch (error) {
      this.emitError(error as Error, 'onCellEdit callback');
    }
  }

  /**
   * Safely emit sort event
   */
  emitSort(sortConfig: SortConfiguration[]): void {
    try {
      if (this.callbacks.onSort) {
        this.callbacks.onSort(sortConfig);
      }
    } catch (error) {
      this.emitError(error as Error, 'onSort callback');
    }
  }

  /**
   * Safely emit filter event
   */
  emitFilter(filters: Record<string, any>): void {
    try {
      if (this.callbacks.onFilter) {
        this.callbacks.onFilter(filters);
      }
    } catch (error) {
      this.emitError(error as Error, 'onFilter callback');
    }
  }

  /**
   * Safely emit column reorder event
   */
  emitColumnReorder(columnOrder: string[]): void {
    try {
      if (this.callbacks.onColumnReorder) {
        this.callbacks.onColumnReorder(columnOrder);
      }
    } catch (error) {
      this.emitError(error as Error, 'onColumnReorder callback');
    }
  }

  /**
   * Safely emit column resize event
   */
  emitColumnResize(columnWidths: Record<string, number>): void {
    try {
      if (this.callbacks.onColumnResize) {
        this.callbacks.onColumnResize(columnWidths);
      }
    } catch (error) {
      this.emitError(error as Error, 'onColumnResize callback');
    }
  }

  /**
   * Safely emit bulk action event
   */
  emitBulkAction(action: string, selectedRows: PackageRecord[]): void {
    try {
      if (this.callbacks.onBulkAction) {
        this.callbacks.onBulkAction(action, selectedRows);
      }
    } catch (error) {
      this.emitError(error as Error, 'onBulkAction callback');
    }
  }

  /**
   * Safely emit loading state change event
   */
  emitLoadingStateChange(isLoading: boolean): void {
    try {
      if (this.callbacks.onLoadingStateChange) {
        this.callbacks.onLoadingStateChange(isLoading);
      }
    } catch (error) {
      this.emitError(error as Error, 'onLoadingStateChange callback');
    }
  }

  /**
   * Emit error event
   */
  emitError(error: Error, context: string): void {
    try {
      if (this.callbacks.onError) {
        this.callbacks.onError(error, context);
      } else {
        // Fallback to console error if no error handler provided
        console.error(`Table ${this.tableId} error in ${context}:`, error);
      }
    } catch (callbackError) {
      // Last resort error handling
      console.error(`Critical error in table ${this.tableId}:`, error);
      console.error('Error callback also failed:', callbackError);
    }
  }

  /**
   * Update callbacks
   */
  updateCallbacks(newCallbacks: EventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  /**
   * Get current context information
   */
  getContext(): EventContext {
    return {
      tableId: this.tableId,
      timestamp: Date.now(),
      source: 'AdvancedDataTable'
    };
  }
}

/**
 * Create event emitter instance
 */
export const createEventEmitter = (callbacks: EventCallbacks, tableId: string): TableEventEmitter => {
  return new TableEventEmitter(callbacks, tableId);
};

/**
 * Validate callback functions
 */
export const validateCallbacks = (callbacks: EventCallbacks): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  Object.entries(callbacks).forEach(([key, callback]) => {
    if (callback !== undefined && typeof callback !== 'function') {
      warnings.push(`${key} should be a function, received ${typeof callback}`);
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};