import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TabulatorWrapperProps, PackageRecord } from '../types';

/**
 * TabulatorWrapper Component
 * 
 * Optimized wrapper for Tabulator.js with better performance
 */
const TabulatorWrapper: React.FC<TabulatorWrapperProps> = ({
  data,
  configuration,
  onRowSelect,
  onDataChange,
  onFiltersChange,
  onColumnOrderChange,
  onColumnWidthChange,
  onContextMenuAction,
  onError,
  onLoadingStateChange
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  // Memoize column conversion to prevent unnecessary recalculations
  const tabulatorColumns = useMemo(() => {
    const columns: any[] = [];
    
    // Add selection column if bulk actions enabled
    if (configuration.enableBulkActions && !configuration.readOnly) {
      columns.push({
        formatter: "rowSelection",
        titleFormatter: "rowSelection",
        hozAlign: "center",
        headerSort: false,
        width: 40,
        resizable: false
      });
    }

    // Add regular columns
    const regularColumns = configuration.columns.map(col => ({
      title: col.title,
      field: col.field,
      width: col.width || 150,
      sorter: col.sortable !== false && configuration.enableSorting !== false ? "string" : undefined,
      headerFilter: col.filterable !== false && configuration.enableFiltering !== false ? "input" : undefined,
      headerFilterPlaceholder: `Filter ${col.title}...`,
      editor: col.editable !== false && configuration.enableEditing !== false && !configuration.readOnly ? "input" : undefined,
      formatter: col.field === 'packageList' ? (cell: any) => {
        const value = cell.getValue();
        return Array.isArray(value) ? value.join(', ') : value;
      } : "plaintext"
    }));
    
    return [...columns, ...regularColumns];
  }, [configuration.columns, configuration.enableBulkActions, configuration.readOnly, configuration.enableSorting, configuration.enableFiltering, configuration.enableEditing]);

  // Stable event handlers
  const handleRowSelectionChanged = useCallback((_selectedData: any[], rows: any[]) => {
    const selectedIds = rows.map((row: any) => row.getData().packageId);
    onRowSelect?.(selectedIds);
  }, [onRowSelect]);

  const handleCellEdited = useCallback(() => {
    const updatedData = tabulatorRef.current?.getData() as PackageRecord[];
    if (updatedData && onDataChange) {
      onDataChange(updatedData);
    }
  }, [onDataChange]);

  const handleColumnMoved = useCallback(() => {
    const currentColumns = tabulatorRef.current?.getColumnDefinitions() || [];
    const columnOrder = currentColumns.map((col: any) => col.field).filter(Boolean);
    onColumnOrderChange?.(columnOrder);
  }, [onColumnOrderChange]);

  const handleColumnResized = useCallback((column: any) => {
    const field = column.getField();
    const width = column.getWidth();
    if (onColumnWidthChange && field) {
      onColumnWidthChange({ [field]: width });
    }
  }, [onColumnWidthChange]);

  const handleHeaderFilterUpdated = useCallback(() => {
    try {
      const currentFilters = tabulatorRef.current?.getHeaderFilters() || [];
      const filters = currentFilters.reduce((acc: Record<string, any>, filter: any) => {
        if (filter.value) {
          acc[filter.field] = filter.value;
        }
        return acc;
      }, {});
      
      onFiltersChange?.(filters);
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  }, [onFiltersChange]);

  const handleRowContext = useCallback((e: Event, row: any) => {
    if (configuration.enableContextMenu && onContextMenuAction) {
      e.preventDefault();
      const rowData = row.getData() as PackageRecord;
      onContextMenuAction('view-details', rowData);
    }
  }, [configuration.enableContextMenu, onContextMenuAction]);

  // Initialize Tabulator - but only recreate when absolutely necessary
  useEffect(() => {
    if (!tableRef.current) return;

    try {
      onLoadingStateChange?.(true);

      const tabulatorConfig: any = {
        data: data,
        columns: tabulatorColumns,
        layout: "fitColumns",
        responsiveLayout: "hide",
        pagination: false,
        movableColumns: configuration.enableColumnReordering !== false,
        resizableColumns: configuration.enableColumnResizing !== false,
        selectable: configuration.enableBulkActions && !configuration.readOnly ? true : false,
        reactiveData: true,
        placeholder: "No data available",
        
        // Event handlers
        rowSelectionChanged: handleRowSelectionChanged,
        cellEdited: handleCellEdited,
        columnMoved: handleColumnMoved,
        columnResized: handleColumnResized,
        headerFilterUpdated: handleHeaderFilterUpdated,
        rowContext: handleRowContext
      };

      // Destroy existing instance if it exists
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
      }

      // Create new Tabulator instance
      tabulatorRef.current = new Tabulator(tableRef.current, tabulatorConfig);

      onLoadingStateChange?.(false);

    } catch (error) {
      console.error('Error initializing table:', error);
      onError?.(error as Error, 'table initialization');
      onLoadingStateChange?.(false);
    }

    // Cleanup
    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  }, [
    // Only recreate when these core configuration options change
    configuration.enableBulkActions,
    configuration.readOnly,
    configuration.enableColumnReordering,
    configuration.enableColumnResizing,
    JSON.stringify(tabulatorColumns) // Use JSON.stringify for deep comparison of columns
  ]);

  // Update data when it changes (without recreating the table)
  useEffect(() => {
    if (tabulatorRef.current && data) {
      try {
        tabulatorRef.current.setData(data);
      } catch (error) {
        console.error('Error updating table data:', error);
        // If setData fails, we might need to recreate the table
        // This is a fallback for when the table gets into a bad state
      }
    }
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={tableRef} data-testid="tabulator-table" />
    </div>
  );
};

export default TabulatorWrapper;