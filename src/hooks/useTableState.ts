import { useState, useCallback } from 'react';
import { TableState, PackageRecord } from '../types';

/**
 * Custom hook for managing table state
 */
const useTableState = (initialData: PackageRecord[]) => {
  const [tableState, setTableState] = useState<TableState>({
    selectedRows: new Set<string>(),
    expandedRows: new Set<string>(),
    filters: {},
    sortConfig: [],
    editingCell: null,
    contextMenu: null,
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

  return {
    tableState,
    updateSelectedRows,
    toggleRowExpansion,
    updateFilters,
    setTableState
  };
};

export default useTableState;