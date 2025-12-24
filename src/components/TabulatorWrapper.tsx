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
  setTableState
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  // Convert our column definitions to Tabulator format
  const convertColumnsToTabulator = useCallback((columns: ColumnDefinition[]) => {
    return columns.map(col => ({
      title: col.title,
      field: col.field,
      width: col.width,
      sorter: col.sortable !== false ? "string" as const : undefined,
      headerFilter: col.filterable !== false ? "input" as const : undefined,
      editor: col.editable !== false && !configuration.readOnly ? "input" as const : undefined,
      formatter: "plaintext" as const
    }));
  }, [configuration.readOnly]);

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
      movableColumns: true,
      resizableColumnFit: true,
      selectable: configuration.enableBulkActions ? "highlight" : false,
      reactiveData: true,
      
      // Event handlers
      rowSelectionChanged: (_selectedData: any[], rows: any[]) => {
        const selectedIds = rows.map((row: any) => row.getData().packageId);
        onRowSelect(selectedIds);
      },
      
      cellEdited: (_cell: any) => {
        const updatedData = tabulatorRef.current?.getData() as PackageRecord[];
        if (updatedData) {
          onDataChange(updatedData);
        }
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
        const currentFilters = tabulatorRef.current?.getHeaderFilters() || [];
        const filtersObj = currentFilters.reduce((acc: Record<string, any>, filter: any) => {
          if (filter.value) {
            acc[filter.field] = filter.value;
          }
          return acc;
        }, {});
        onFiltersChange(filtersObj);
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
    setTableState
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