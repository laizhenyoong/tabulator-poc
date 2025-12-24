import { useState, useCallback } from 'react';
import { TableState } from '../types';

/**
 * Custom hook for managing table state
 */
const useTableState = () => {
  const [tableState, setTableState] = useState<TableState>({
    selectedRows: new Set<string>(),
    expandedRows: new Set<string>(),
    filters: {},
    sortConfig: [],
    editingCell: null,
    contextMenu: null,
    columnOrder: [],
    columnWidths: {},
  });

  const updateSelectedRows = useCallback((rowIds: string[]) => {
    setTableState(prev => ({
      ...prev,
      selectedRows: new Set(rowIds)
    }));
  }, []);

  const toggleRowExpansion = useCallback((rowId: string) => {
    setTableState(prev => {
      const newExpandedRows = new Set(prev.expandedRows);
      if (newExpandedRows.has(rowId)) {
        newExpandedRows.delete(rowId);
      } else {
        newExpandedRows.add(rowId);
      }
      return {
        ...prev,
        expandedRows: newExpandedRows
      };
    });
  }, []);

  const updateFilters = useCallback((filters: Record<string, any>) => {
    setTableState(prev => ({
      ...prev,
      filters
    }));
  }, []);

  const updateColumnOrder = useCallback((columnOrder: string[]) => {
    setTableState(prev => ({
      ...prev,
      columnOrder
    }));
  }, []);

  const updateColumnWidths = useCallback((columnWidths: Record<string, number>) => {
    setTableState(prev => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, ...columnWidths }
    }));
  }, []);

  return {
    tableState,
    updateSelectedRows,
    toggleRowExpansion,
    updateFilters,
    updateColumnOrder,
    updateColumnWidths,
    setTableState
  };
};

export default useTableState;