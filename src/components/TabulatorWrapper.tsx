import React, { useEffect, useRef, useCallback } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TabulatorWrapperProps, PackageRecord, ColumnDefinition } from '../types';

/**
 * TabulatorWrapper Component
 * 
 * Wraps Tabulator.js functionality within React lifecycle
 * Handles table initialization, configuration, and data binding
 */
const TabulatorWrapper: React.FC<TabulatorWrapperProps> = ({
  data,
  configuration,
  tableState,
  onRowSelect,
  onDataChange,
  onFiltersChange,
  onColumnOrderChange,
  onColumnWidthChange,
  setTableState
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    if (tabulatorRef.current) {
      tabulatorRef.current.clearHeaderFilter();
      onFiltersChange({});
      setTableState(prev => ({
        ...prev,
        filters: {}
      }));
    }
  }, [onFiltersChange, setTableState]);

  // Get current filter values
  const getCurrentFilters = useCallback(() => {
    if (tabulatorRef.current) {
      const currentFilters = tabulatorRef.current.getHeaderFilters() || [];
      return currentFilters.reduce((acc: Record<string, any>, filter: any) => {
        if (filter.value) {
          acc[filter.field] = filter.value;
        }
        return acc;
      }, {});
    }
    return {};
  }, []);

  // Validation functions for different field types
  const validateCellValue = useCallback((field: string, value: any, _rowData: PackageRecord): { isValid: boolean; errorMessage?: string } => {
    // Required field validation
    if (value === null || value === undefined || value === '') {
      return { isValid: false, errorMessage: `${field} is required` };
    }

    // Field-specific validation
    switch (field) {
      case 'packageId':
        if (typeof value !== 'string' || value.trim().length === 0) {
          return { isValid: false, errorMessage: 'Package ID must be a non-empty string' };
        }
        break;
      
      case 'priority':
        const priorityNum = Number(value);
        if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 10) {
          return { isValid: false, errorMessage: 'Priority must be a number between 1 and 10' };
        }
        break;
      
      case 'pcid':
        const pcidNum = Number(value);
        if (isNaN(pcidNum) || pcidNum < 0) {
          return { isValid: false, errorMessage: 'PCID must be a non-negative number' };
        }
        break;
      
      case 'serviceName':
      case 'quotaName':
      case 'userProfile':
        if (typeof value !== 'string' || value.trim().length === 0) {
          return { isValid: false, errorMessage: `${field} must be a non-empty string` };
        }
        break;
      
      case 'packageList':
        if (typeof value === 'string') {
          // Convert comma-separated string to array for validation
          const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
          if (arrayValue.length === 0) {
            return { isValid: false, errorMessage: 'Package list cannot be empty' };
          }
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            return { isValid: false, errorMessage: 'Package list cannot be empty' };
          }
        } else {
          return { isValid: false, errorMessage: 'Package list must be an array or comma-separated string' };
        }
        break;
    }

    return { isValid: true };
  }, []);

  // Get appropriate editor type based on field and data type
  const getEditorType = useCallback((field: string, sampleValue: any) => {
    if (field === 'priority' || field === 'pcid') {
      return "number";
    }
    if (field === 'packageList' && Array.isArray(sampleValue)) {
      return "textarea";
    }
    return "input";
  }, []);

  // Get appropriate filter type based on field and data type
  const getFilterType = useCallback((field: string, sampleValue: any) => {
    if (field === 'priority' || field === 'pcid') {
      return "number";
    }
    if (field === 'serviceName' || field === 'quotaName' || field === 'userProfile') {
      // For these fields, we could use select filters with unique values
      // For now, using input but this could be enhanced to select
      return "input";
    }
    if (field === 'packageList' && Array.isArray(sampleValue)) {
      return "input"; // Text search within array values
    }
    return "input";
  }, []);

  // Get filter function based on field type
  const getFilterFunction = useCallback((field: string) => {
    if (field === 'priority' || field === 'pcid') {
      return "="; // Exact match for numbers
    }
    if (field === 'packageList') {
      // Custom filter for array fields - search within array values
      return (headerValue: any, rowValue: any) => {
        if (!headerValue) return true;
        if (!rowValue) return false;
        
        const searchTerm = headerValue.toString().toLowerCase();
        if (Array.isArray(rowValue)) {
          return rowValue.some(item => 
            item.toString().toLowerCase().includes(searchTerm)
          );
        }
        return rowValue.toString().toLowerCase().includes(searchTerm);
      };
    }
    return "like"; // Partial match for text fields
  }, []);

  // Convert our column definitions to Tabulator format
  const convertColumnsToTabulator = useCallback((columns: ColumnDefinition[]) => {
    // Apply persisted column order if available
    let orderedColumns = columns;
    if (tableState.columnOrder.length > 0) {
      const columnMap = new Map(columns.map(col => [col.field, col]));
      orderedColumns = tableState.columnOrder
        .map(field => columnMap.get(field))
        .filter(Boolean) as ColumnDefinition[];
      
      // Add any new columns that weren't in the persisted order
      const persistedFields = new Set(tableState.columnOrder);
      const newColumns = columns.filter(col => !persistedFields.has(col.field));
      orderedColumns = [...orderedColumns, ...newColumns];
    }

    // Get sample data to determine editor and filter types
    const sampleRecord = data[0];

    return orderedColumns.map(col => {
      const isEditable = col.editable !== false && 
                        configuration.enableEditing !== false && 
                        !configuration.readOnly;
      
      const isFilterable = col.filterable !== false && 
                          configuration.enableFiltering !== false;
      
      const editorType = isEditable ? getEditorType(col.field, sampleRecord?.[col.field as keyof PackageRecord]) : undefined;
      const filterType = isFilterable ? getFilterType(col.field, sampleRecord?.[col.field as keyof PackageRecord]) : undefined;
      const filterFunc = isFilterable ? getFilterFunction(col.field) : undefined;
      
      return {
        title: col.title,
        field: col.field,
        width: tableState.columnWidths[col.field] || col.width,
        sorter: col.sortable !== false && configuration.enableSorting !== false ? "string" as const : undefined,
        headerFilter: filterType,
        headerFilterFunc: filterFunc,
        headerFilterPlaceholder: `Filter ${col.title}...`,
        editor: editorType,
        formatter: col.field === 'packageList' ? "textarea" as const : "plaintext" as const,
        // Enable three-state sorting (asc -> desc -> none)
        headerSortTristate: col.sortable !== false && configuration.enableSorting !== false ? true : false,
        // Custom cell formatter for arrays
        ...(col.field === 'packageList' && {
          formatter: (cell: any) => {
            const value = cell.getValue();
            return Array.isArray(value) ? value.join(', ') : value;
          }
        }),
        // Custom editor params for better UX
        ...(editorType && {
          editorParams: {
            ...(editorType === 'textarea' && {
              verticalNavigation: "editor",
              shiftEnterSubmit: true
            }),
            ...(editorType === 'number' && {
              min: col.field === 'priority' ? 1 : 0,
              max: col.field === 'priority' ? 10 : undefined,
              step: 1
            })
          }
        }),
        // Filter params for number fields
        ...(filterType === 'number' && {
          headerFilterParams: {
            min: col.field === 'priority' ? 1 : 0,
            max: col.field === 'priority' ? 10 : undefined,
            step: 1
          }
        }),
        // Add validation function
        ...(isEditable && {
          validator: (cell: any, value: any) => {
            const field = cell.getField();
            const rowData = cell.getRow().getData();
            const validation = validateCellValue(field, value, rowData);
            
            if (!validation.isValid) {
              return validation.errorMessage || 'Invalid value';
            }
            return true;
          }
        })
      };
    });
  }, [configuration.readOnly, configuration.enableSorting, configuration.enableEditing, configuration.enableFiltering, tableState.columnWidths, tableState.columnOrder, data, getEditorType, getFilterType, getFilterFunction, validateCellValue]);

  // Initialize Tabulator
  useEffect(() => {
    if (!tableRef.current) return;

    const tabulatorColumns = convertColumnsToTabulator(configuration.columns);

    const tabulatorConfig: any = {
      data: data,
      columns: tabulatorColumns,
      layout: "fitColumns",
      responsiveLayout: "hide",
      pagination: false,
      movableColumns: true, // Enable column reordering
      resizableColumns: true, // Enable column resizing
      resizableColumnFit: true,
      selectable: configuration.enableBulkActions ? "highlight" : false,
      reactiveData: true,
      
      // Sorting configuration
      sortOrderReverse: true, // Enable three-state sorting (asc -> desc -> none)
      initialSort: [], // Start with no sorting
      
      // Tabulator configuration
      placeholder: "No data available", // Default empty state
      placeholderHeaderFilter: "No results found for current filters", // Empty state when filters are applied
      
      // Event handlers
      rowSelectionChanged: (_selectedData: any[], rows: any[]) => {
        const selectedIds = rows.map((row: any) => row.getData().packageId);
        onRowSelect(selectedIds);
      },
      
      // Handle cell editing events
      cellEditCancelled: (_cell: any) => {
        setTableState(prev => ({
          ...prev,
          editingCell: null
        }));
      },
      
      cellEditing: (cell: any) => {
        const rowData = cell.getRow().getData();
        const field = cell.getField();
        
        setTableState(prev => ({
          ...prev,
          editingCell: {
            rowId: rowData.packageId,
            field: field
          }
        }));
      },
      
      cellEdited: (cell: any) => {
        const field = cell.getField();
        const newValue = cell.getValue();
        const rowData = cell.getRow().getData();
        
        // Validate the new value
        const validation = validateCellValue(field, newValue, rowData);
        
        if (!validation.isValid) {
          // Show error and revert to original value
          const originalValue = cell.getOldValue();
          cell.setValue(originalValue, true);
          
          // Show error message (you could implement a toast notification here)
          console.error(`Validation error for ${field}: ${validation.errorMessage}`);
          
          // Add visual error indication
          const cellElement = cell.getElement();
          cellElement.style.backgroundColor = '#ffebee';
          cellElement.title = validation.errorMessage || 'Invalid value';
          
          // Remove error styling after a delay
          setTimeout(() => {
            cellElement.style.backgroundColor = '';
            cellElement.title = '';
          }, 3000);
          
          return false; // Prevent the edit
        }
        
        // Handle array fields (like packageList)
        if (field === 'packageList' && typeof newValue === 'string') {
          const arrayValue = newValue.split(',').map(item => item.trim()).filter(item => item.length > 0);
          cell.setValue(arrayValue, true);
        }
        
        setTableState(prev => ({
          ...prev,
          editingCell: null
        }));
        
        const updatedData = tabulatorRef.current?.getData() as PackageRecord[];
        if (updatedData) {
          onDataChange(updatedData);
        }
      },
      
      // Handle sort changes to update table state
      dataSorted: (_sorters: any[], _rows: any[]) => {
        const currentSorters = tabulatorRef.current?.getSorters() || [];
        const sortConfig = currentSorters.map((sorter: any, index: number) => ({
          field: sorter.field,
          direction: sorter.dir as 'asc' | 'desc',
          priority: index + 1
        }));
        
        setTableState(prev => ({
          ...prev,
          sortConfig: sortConfig
        }));
      },
      
      // Handle column reordering
      columnMoved: (_column: any, _columns: any[]) => {
        const currentColumns = tabulatorRef.current?.getColumnDefinitions() || [];
        const columnOrder = currentColumns.map((col: any) => col.field);
        onColumnOrderChange(columnOrder);
        
        setTableState(prev => ({
          ...prev,
          columnOrder: columnOrder
        }));
      },
      
      // Handle column resizing
      columnResized: (column: any) => {
        const field = column.getField();
        const width = column.getWidth();
        const widthUpdate = { [field]: width };
        
        onColumnWidthChange(widthUpdate);
        
        setTableState(prev => ({
          ...prev,
          columnWidths: { ...prev.columnWidths, ...widthUpdate }
        }));
      },
      
      rowContext: (e: Event, row: any) => {
        e.preventDefault();
        const rowData = row.getData() as PackageRecord;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        
        setTableState(prev => ({
          ...prev,
          contextMenu: {
            visible: true,
            x: rect.left,
            y: rect.top,
            rowData: rowData
          }
        }));
      },
      
      headerFilterUpdated: (_field: string, _value: any) => {
        const currentFilters = getCurrentFilters();
        onFiltersChange(currentFilters);
        setTableState(prev => ({
          ...prev,
          filters: currentFilters
        }));
      },
      
      // Handle data filtering to track empty results
      dataFiltered: (_filters: any[], rows: any[]) => {
        const hasActiveFilters = Object.keys(tableState.filters).length > 0;
        const isEmpty = rows.length === 0;
        
        // The placeholder handling is managed by Tabulator's built-in placeholder system
        // We just track the state here for potential UI updates
        if (hasActiveFilters && isEmpty) {
          // Could emit an event or update state for "no results" UI
          console.debug('No results found for current filters');
        }
      }
    };

    // Create Tabulator instance
    tabulatorRef.current = new Tabulator(tableRef.current, tabulatorConfig);

    // Cleanup function
    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  }, [
    configuration,
    convertColumnsToTabulator,
    onRowSelect,
    onDataChange,
    onFiltersChange,
    onColumnOrderChange,
    onColumnWidthChange,
    setTableState,
    getCurrentFilters
  ]);

  // Update data when props change
  useEffect(() => {
    if (tabulatorRef.current && data) {
      tabulatorRef.current.setData(data);
    }
  }, [data]);

  // Handle context menu clicks outside to close
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (tableState.contextMenu?.visible) {
        setTableState(prev => ({
          ...prev,
          contextMenu: { ...prev.contextMenu!, visible: false }
        }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tableState.contextMenu?.visible, setTableState]);

  // Handle context menu actions
  const handleContextMenuClick = (_action: string) => {
    if (tableState.contextMenu?.rowData) {
      setTableState(prev => ({
        ...prev,
        contextMenu: { ...prev.contextMenu!, visible: false }
      }));
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Filter Controls Bar */}
      {configuration.enableFiltering && (
        <div 
          style={{
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}
          data-testid="filter-controls-bar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6c757d' }}>
              Filters: {Object.keys(tableState.filters).length > 0 
                ? `${Object.keys(tableState.filters).length} active`
                : 'None active'
              }
            </span>
            {Object.keys(tableState.filters).length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {Object.entries(tableState.filters).map(([field, value]) => (
                  <span
                    key={field}
                    style={{
                      backgroundColor: '#e9ecef',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#495057'
                    }}
                  >
                    {field}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          {Object.keys(tableState.filters).length > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              data-testid="clear-filters-button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
      
      <div ref={tableRef} data-testid="tabulator-table" />
      
      {/* Context Menu */}
      {tableState.contextMenu?.visible && (
        <div
          style={{
            position: 'fixed',
            top: tableState.contextMenu.y,
            left: tableState.contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '120px'
          }}
          data-testid="context-menu"
        >
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            onClick={() => handleContextMenuClick('copy')}
          >
            Copy
          </div>
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            onClick={() => handleContextMenuClick('view-details')}
          >
            View Details
          </div>
          {!configuration.readOnly && (
            <div
              style={{ padding: '8px 12px', cursor: 'pointer' }}
              onClick={() => handleContextMenuClick('lock-record')}
            >
              Lock Record
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TabulatorWrapper;