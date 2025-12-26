import React, { useEffect, useRef, useCallback } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TabulatorWrapperProps, PackageRecord, ColumnDefinition } from '../types';
import ContextMenu from './ContextMenu';
import BulkActionBar from './BulkActionBar';

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
  onContextMenuAction,
  onError,
  onLoadingStateChange,
  setTableState
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    try {
      if (tabulatorRef.current) {
        tabulatorRef.current.clearHeaderFilter();
        onFiltersChange({}, data.length); // Pass full data count when filters are cleared
        setTableState(prev => ({
          ...prev,
          filters: {}
        }));
      }
    } catch (error) {
      if (onError) {
        onError(error as Error, 'clearing filters');
      } else {
        console.error('Error clearing filters:', error);
      }
    }
  }, [onFiltersChange, setTableState, data.length, onError]);

  // Get current filter values
  const getCurrentFilters = useCallback(() => {
    try {
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
    } catch (error) {
      if (onError) {
        onError(error as Error, 'getting current filters');
      } else {
        console.error('Error getting current filters:', error);
      }
      return {};
    }
  }, [onError]);

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

    // Prepare columns array with selection column if bulk actions are enabled
    const tabulatorColumns: any[] = [];
    
    // Add row expansion column if row expansion is enabled
    if (configuration.enableRowExpansion) {
      tabulatorColumns.push({
        title: "",
        field: "_expansion",
        width: 40,
        resizable: false,
        frozen: true,
        headerSort: false,
        formatter: (cell: any) => {
          const rowData = cell.getRow().getData() as PackageRecord;
          const isExpanded = tableState.expandedRows.has(rowData.packageId);
          
          // Create expansion indicator element
          const indicator = document.createElement('button');
          indicator.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 2px;
            transition: all 0.2s ease;
          `;
          
          indicator.onmouseenter = () => {
            indicator.style.backgroundColor = '#f5f5f5';
          };
          indicator.onmouseleave = () => {
            indicator.style.backgroundColor = 'transparent';
          };
          
          // Create arrow icon
          const arrow = document.createElement('div');
          arrow.style.cssText = `
            width: 0;
            height: 0;
            border-style: solid;
            transition: transform 0.2s ease;
          `;
          
          if (isExpanded) {
            arrow.style.cssText += `
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 6px solid #6c757d;
            `;
          } else {
            arrow.style.cssText += `
              border-top: 4px solid transparent;
              border-bottom: 4px solid transparent;
              border-left: 6px solid #6c757d;
            `;
          }
          
          indicator.appendChild(arrow);
          indicator.setAttribute('data-testid', 'expansion-indicator');
          indicator.setAttribute('aria-label', isExpanded ? 'Collapse row' : 'Expand row');
          indicator.title = isExpanded ? 'Collapse row' : 'Expand row';
          
          // Handle click to toggle expansion
          indicator.onclick = (e) => {
            e.stopPropagation();
            const currentlyExpanded = tableState.expandedRows.has(rowData.packageId);
            
            if (currentlyExpanded) {
              // Collapse the row
              setTableState(prev => {
                const newExpandedRows = new Set(prev.expandedRows);
                newExpandedRows.delete(rowData.packageId);
                return { ...prev, expandedRows: newExpandedRows };
              });
              
              // Remove expansion content
              const row = cell.getRow();
              const nextRow = row.getNextRow();
              if (nextRow && nextRow.getElement().classList.contains('expansion-row')) {
                nextRow.delete();
              }
            } else {
              // Expand the row
              setTableState(prev => {
                const newExpandedRows = new Set(prev.expandedRows);
                newExpandedRows.add(rowData.packageId);
                return { ...prev, expandedRows: newExpandedRows };
              });
              
              // Add expansion content
              const row = cell.getRow();
              
              // Create expansion row
              const expansionRowData = {
                _isExpansionRow: true,
                _parentId: rowData.packageId,
                _expansionContent: null // We'll use default content for now
              };
              
              // Add the expansion row after the current row
              const rowIndex = row.getPosition();
              tabulatorRef.current?.addRow(expansionRowData, false, Number(rowIndex) + 1);
            }
          };
          
          return indicator;
        }
      });
    }
    
    // Add row selection column if bulk actions are enabled and not in read-only mode
    if (configuration.enableBulkActions && !configuration.readOnly) {
      tabulatorColumns.push({
        formatter: "rowSelection",
        titleFormatter: "rowSelection",
        hozAlign: "center",
        headerSort: false,
        width: 40,
        resizable: false,
        frozen: true
      });
    }

    // Add regular columns
    const regularColumns = orderedColumns.map(col => {
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
        // Disable editing completely in read-only mode
        editable: isEditable,
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
        // Add validation function only if editable
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
    
    return [...tabulatorColumns, ...regularColumns];
  }, [configuration.readOnly, configuration.enableSorting, configuration.enableEditing, configuration.enableFiltering, configuration.enableBulkActions, configuration.enableRowExpansion, tableState.columnWidths, tableState.columnOrder, tableState.expandedRows, data, getEditorType, getFilterType, getFilterFunction, validateCellValue, setTableState]);

  // Initialize Tabulator
  useEffect(() => {
    if (!tableRef.current) return;

    try {
      // Emit loading state
      if (onLoadingStateChange) {
        onLoadingStateChange(true);
      }

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
      selectable: configuration.enableBulkActions && !configuration.readOnly ? true : false, // Enable row selection for bulk actions only if not read-only
      selectableRangeMode: "click", // Allow range selection with shift+click
      reactiveData: true,
      
      // Sorting configuration
      sortOrderReverse: true, // Enable three-state sorting (asc -> desc -> none)
      initialSort: [], // Start with no sorting
      
      // Tabulator configuration
      placeholder: "No data available", // Default empty state
      placeholderHeaderFilter: "No results found for current filters", // Empty state when filters are applied
      
      // Row formatter for expansion rows
      rowFormatter: (row: any) => {
        const rowData = row.getData();
        if (rowData._isExpansionRow) {
          const element = row.getElement();
          element.classList.add('expansion-row');
          element.style.cssText = `
            background-color: #f8f9fa !important;
            border-top: 1px solid #dee2e6;
          `;
          
          // Clear all cells and add expansion content
          const cells = element.querySelectorAll('.tabulator-cell');
          cells.forEach((cell: any, index: number) => {
            if (index === 0) {
              // First cell contains the expansion content
              cell.innerHTML = '';
              cell.style.cssText = `
                padding: 16px;
                border: none;
              `;
              
              // Create expansion content container
              const contentContainer = document.createElement('div');
              contentContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                max-width: 100%;
              `;
              
              // Add default expansion content
              const parentData = data.find(d => d.packageId === rowData._parentId);
              if (parentData) {
                const sections = [
                  { label: 'Package ID', value: parentData.packageId, testId: 'detail-package-id' },
                  { label: 'Priority Level', value: parentData.priority, testId: 'detail-priority' },
                  { label: 'Service Name', value: parentData.serviceName, testId: 'detail-service-name' },
                  { label: 'Process Control ID', value: parentData.pcid, testId: 'detail-pcid' },
                  { label: 'Quota Configuration', value: parentData.quotaName, testId: 'detail-quota-name' },
                  { label: 'User Profile', value: parentData.userProfile, testId: 'detail-user-profile' }
                ];
                
                sections.forEach(section => {
                  const sectionDiv = document.createElement('div');
                  sectionDiv.style.cssText = `
                    background-color: white;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    padding: 12px;
                  `;
                  
                  const labelDiv = document.createElement('div');
                  labelDiv.style.cssText = `
                    font-weight: 600;
                    color: #495057;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  `;
                  labelDiv.textContent = section.label;
                  
                  const valueDiv = document.createElement('div');
                  valueDiv.style.cssText = `
                    color: #212529;
                    font-size: 14px;
                    word-break: break-word;
                  `;
                  valueDiv.textContent = String(section.value);
                  valueDiv.setAttribute('data-testid', section.testId);
                  
                  sectionDiv.appendChild(labelDiv);
                  sectionDiv.appendChild(valueDiv);
                  contentContainer.appendChild(sectionDiv);
                });
                
                // Add package list section
                const packageListContainer = document.createElement('div');
                packageListContainer.style.cssText = `
                  grid-column: 1 / -1;
                `;
                
                const packageSection = document.createElement('div');
                packageSection.style.cssText = `
                  background-color: white;
                  border: 1px solid #e9ecef;
                  border-radius: 4px;
                  padding: 12px;
                `;
                
                const packageLabel = document.createElement('div');
                packageLabel.style.cssText = `
                  font-weight: 600;
                  color: #495057;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
                `;
                packageLabel.textContent = `Package List (${parentData.packageList.length} items)`;
                
                const packageListDiv = document.createElement('div');
                packageListDiv.setAttribute('data-testid', 'detail-package-list');
                
                parentData.packageList.forEach((pkg, index) => {
                  const packageItem = document.createElement('div');
                  packageItem.style.cssText = `
                    background-color: #e3f2fd;
                    border: 1px solid #bbdefb;
                    border-radius: 4px;
                    padding: 8px 12px;
                    margin: 4px 8px 4px 0;
                    display: inline-block;
                    font-size: 13px;
                    color: #1976d2;
                  `;
                  packageItem.textContent = pkg;
                  packageItem.setAttribute('data-testid', `package-item-${index}`);
                  packageListDiv.appendChild(packageItem);
                });
                
                packageSection.appendChild(packageLabel);
                packageSection.appendChild(packageListDiv);
                packageListContainer.appendChild(packageSection);
                contentContainer.appendChild(packageListContainer);
              }
              
              cell.appendChild(contentContainer);
            } else {
              // Hide other cells
              cell.style.display = 'none';
            }
          });
          
          // Make the row span all columns
          const firstCell = element.querySelector('.tabulator-cell');
          if (firstCell) {
            (firstCell as HTMLElement).style.gridColumn = '1 / -1';
          }
        }
      },
      
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
        const mouseEvent = e as MouseEvent;
        
        setTableState(prev => ({
          ...prev,
          contextMenu: {
            visible: true,
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
            rowData: rowData
          }
        }));
      },
      
      headerFilterUpdated: (_field: string, _value: any) => {
        try {
          const currentFilters = getCurrentFilters();
          
          // Get filtered data count
          let filteredCount = data.length;
          if (tabulatorRef.current) {
            const filteredData = tabulatorRef.current.getData("active");
            filteredCount = filteredData.length;
          }
          
          onFiltersChange(currentFilters, filteredCount);
          
          setTableState(prev => ({
            ...prev,
            filters: currentFilters
          }));
        } catch (error) {
          if (onError) {
            onError(error as Error, 'filter update');
          } else {
            console.error('Error updating filters:', error);
          }
        }
      },
      
      // Handle data filtering to track empty results and preserve expansion states
      dataFiltered: (_filters: any[], rows: any[]) => {
        const hasActiveFilters = Object.keys(tableState.filters).length > 0;
        const isEmpty = rows.length === 0;
        
        // Preserve expansion states for visible rows during filtering
        if (hasActiveFilters && configuration.enableRowExpansion) {
          const visibleRowIds = new Set(rows.map((row: any) => row.getData().packageId));
          const currentExpandedRows = tableState.expandedRows;
          
          // Keep expansion states for rows that are still visible
          const preservedExpansions = new Set(
            Array.from(currentExpandedRows).filter(rowId => visibleRowIds.has(rowId))
          );
          
          // Update table state to preserve expansion states
          if (preservedExpansions.size !== currentExpandedRows.size) {
            setTableState(prev => ({
              ...prev,
              expandedRows: preservedExpansions
            }));
          }
          
          // Re-add expansion rows for visible expanded rows
          setTimeout(() => {
            if (tabulatorRef.current) {
              preservedExpansions.forEach(rowId => {
                const parentRow = tabulatorRef.current?.getRow(rowId);
                if (parentRow) {
                  // Check if expansion row already exists
                  const nextRow = parentRow.getNextRow();
                  if (!nextRow || !nextRow.getData()._isExpansionRow) {
                    // Add expansion row
                    const expansionRowData = {
                      _isExpansionRow: true,
                      _parentId: rowId,
                      _expansionContent: null
                    };
                    
                    const rowIndex = parentRow.getPosition();
                    tabulatorRef.current?.addRow(expansionRowData, false, Number(rowIndex) + 1);
                  }
                }
              });
            }
          }, 100); // Small delay to ensure filtering is complete
        }
        
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

    // Emit loading complete
    if (onLoadingStateChange) {
      onLoadingStateChange(false);
    }

    // Cleanup function
    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  } catch (error) {
    if (onError) {
      onError(error as Error, 'table initialization');
    } else {
      console.error('Error initializing table:', error);
    }
    
    if (onLoadingStateChange) {
      onLoadingStateChange(false);
    }
  }
    // Note: When configuration.readOnly changes, this effect will re-run and recreate the table
    // with the new configuration. The tableState (selections, expansions, filters, etc.) 
    // is preserved because it's managed outside this component and will be restored
    // through the various event handlers and state restoration logic.
  }, [
    configuration,
    convertColumnsToTabulator,
    onRowSelect,
    onDataChange,
    onFiltersChange,
    onColumnOrderChange,
    onColumnWidthChange,
    onError,
    onLoadingStateChange,
    setTableState,
    getCurrentFilters,
    validateCellValue,
    data,
    tableState.filters
  ]);

  // Update data when props change
  useEffect(() => {
    try {
      if (tabulatorRef.current && data) {
        tabulatorRef.current.setData(data);
        
        // Restore expansion states after data update
        if (configuration.enableRowExpansion && tableState.expandedRows.size > 0) {
          setTimeout(() => {
            try {
              if (tabulatorRef.current) {
                tableState.expandedRows.forEach(rowId => {
                  const parentRow = tabulatorRef.current?.getRow(rowId);
                  if (parentRow) {
                    // Check if expansion row already exists
                    const nextRow = parentRow.getNextRow();
                    if (!nextRow || !nextRow.getData()._isExpansionRow) {
                      // Add expansion row
                      const expansionRowData = {
                        _isExpansionRow: true,
                        _parentId: rowId,
                        _expansionContent: null
                      };
                      
                      const rowIndex = parentRow.getPosition();
                      tabulatorRef.current?.addRow(expansionRowData, false, Number(rowIndex) + 1);
                    }
                  }
                });
              }
            } catch (error) {
              if (onError) {
                onError(error as Error, 'restoring expansion states');
              } else {
                console.error('Error restoring expansion states:', error);
              }
            }
          }, 100); // Small delay to ensure data is loaded
        }
      }
    } catch (error) {
      if (onError) {
        onError(error as Error, 'updating table data');
      } else {
        console.error('Error updating table data:', error);
      }
    }
  }, [data, configuration.enableRowExpansion, tableState.expandedRows, onError]);

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

  // Handle bulk operations
  const handleBulkDelete = useCallback((rows: PackageRecord[]) => {
    if (tabulatorRef.current) {
      // Remove rows from table
      rows.forEach(row => {
        const tabulatorRow = tabulatorRef.current?.getRow(row.packageId);
        if (tabulatorRow) {
          tabulatorRow.delete();
        }
      });
      
      // Update data and clear selection
      const updatedData = tabulatorRef.current.getData() as PackageRecord[];
      onDataChange(updatedData);
      
      // Clear selection
      tabulatorRef.current.deselectRow();
    }
  }, [onDataChange]);

  const handleBulkExport = useCallback((rows: PackageRecord[]) => {
    // Create CSV content
    const headers = configuration.columns.map(col => col.title);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        configuration.columns.map(col => {
          const value = row[col.field as keyof PackageRecord];
          // Handle array values (like packageList)
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [configuration.columns]);

  const handleBulkUpdate = useCallback((rows: PackageRecord[]) => {
    if (tabulatorRef.current) {
      // Enable editing mode for selected rows
      // This is a simplified implementation - in a real app you might want
      // to show a bulk edit form or enable inline editing for all selected rows
      
      // For now, we'll just focus on the first selected row and enable editing
      if (rows.length > 0) {
        const firstRow = tabulatorRef.current.getRow(rows[0].packageId);
        if (firstRow) {
          // Scroll to the first row and highlight it
          firstRow.scrollTo();
          
          // You could implement a bulk edit modal here
          // For now, we'll just show an alert indicating bulk update is ready
          alert(`Bulk update mode enabled for ${rows.length} rows. Click on any cell in the selected rows to edit.`);
        }
      }
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    if (tabulatorRef.current) {
      tabulatorRef.current.deselectRow();
    }
  }, []);

  // Handle context menu actions
  const handleContextMenuAction = (action: string, rowData: PackageRecord) => {
    // Call the parent's context menu action handler
    onContextMenuAction(action, rowData);
    
    // Close the context menu
    setTableState(prev => ({
      ...prev,
      contextMenu: { ...prev.contextMenu!, visible: false }
    }));
  };

  const handleContextMenuClose = () => {
    setTableState(prev => ({
      ...prev,
      contextMenu: { ...prev.contextMenu!, visible: false }
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bulk Action Bar */}
      {configuration.enableBulkActions && !configuration.readOnly && (
        <BulkActionBar
          selectedRows={data.filter(row => tableState.selectedRows.has(row.packageId))}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          onBulkUpdate={handleBulkUpdate}
          onClearSelection={handleClearSelection}
        />
      )}
      
      {/* Selection Count Display */}
      {configuration.enableBulkActions && !configuration.readOnly && tableState.selectedRows.size > 0 && (
        <div 
          style={{
            padding: '8px 12px',
            backgroundColor: '#e3f2fd',
            borderBottom: '1px solid #bbdefb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#1976d2'
          }}
          data-testid="selection-count-display"
        >
          <span>
            {tableState.selectedRows.size} row{tableState.selectedRows.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              if (tabulatorRef.current) {
                tabulatorRef.current.deselectRow();
              }
            }}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: '#1976d2',
              border: '1px solid #1976d2',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            data-testid="clear-selection-button"
          >
            Clear Selection
          </button>
        </div>
      )}
      
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
      {tableState.contextMenu && (
        <ContextMenu
          visible={tableState.contextMenu.visible}
          x={tableState.contextMenu.x}
          y={tableState.contextMenu.y}
          rowData={tableState.contextMenu.rowData}
          readOnly={configuration.readOnly}
          onAction={handleContextMenuAction}
          onClose={handleContextMenuClose}
        />
      )}
    </div>
  );
};

export default TabulatorWrapper;