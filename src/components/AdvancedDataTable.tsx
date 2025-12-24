import React, { useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { AdvancedDataTableProps, TableTheme } from '../types';
import useTableState from '../hooks/useTableState';
import TabulatorWrapper from './TabulatorWrapper';
import { saveTableStateToSession, loadTableStateFromSession } from '../utils/sessionStorage';

const defaultTheme: TableTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#ffffff',
  borderColor: '#dee2e6',
  textColor: '#212529',
  headerBackgroundColor: '#f8f9fa',
  hoverColor: '#f5f5f5'
};

const TableContainer = styled.div<{ theme: TableTheme; readOnly?: boolean }>`
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
  
  ${props => props.readOnly && `
    &::before {
      content: 'READ ONLY';
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #6c757d;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 10;
      pointer-events: none;
    }
  `}
  
  .tabulator {
    background-color: transparent;
    border: none;
    ${props => props.readOnly && `
      opacity: 0.9;
    `}
  }
  
  .tabulator-header {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-bottom: 2px solid ${props => props.theme.borderColor};
  }
  
  .tabulator-col {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-right: 1px solid ${props => props.theme.borderColor};
    position: relative;
    
    &.tabulator-sortable {
      cursor: pointer;
      
      &:hover {
        background-color: ${props => props.theme.hoverColor};
      }
    }
    
    /* Sort indicators */
    &.tabulator-col-sorter-element {
      .tabulator-col-content {
        position: relative;
        padding-right: 20px;
      }
      
      &::after {
        content: '';
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        opacity: 0.3;
      }
      
      /* Ascending sort indicator */
      &.tabulator-col-sorter-asc::after {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 6px solid ${props => props.theme.primaryColor};
        opacity: 1;
      }
      
      /* Descending sort indicator */
      &.tabulator-col-sorter-desc::after {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid ${props => props.theme.primaryColor};
        opacity: 1;
      }
    }
  }
  
  .tabulator-row {
    border-bottom: 1px solid ${props => props.theme.borderColor};
    
    &:hover {
      background-color: ${props => props.theme.hoverColor};
    }
  }
  
  .tabulator-cell {
    border-right: 1px solid ${props => props.theme.borderColor};
    color: ${props => props.theme.textColor};
    
    ${props => props.readOnly && `
      &.tabulator-editing {
        background-color: transparent !important;
        cursor: not-allowed !important;
      }
    `}
  }
`;

/**
 * Advanced Data Table Component
 * 
 * A feature-rich table component built with React and Tabulator.js
 * Provides sorting, filtering, editing, context menus, bulk operations, and row expansion.
 */
const AdvancedDataTable: React.FC<AdvancedDataTableProps> = ({
  data,
  configuration,
  tableId = 'default',
  onDataChange,
  onRowSelect,
  onRowExpand,
  onContextMenuAction,
  theme,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    tableState, 
    updateSelectedRows, 
    toggleRowExpansion, 
    updateFilters, 
    updateColumnOrder,
    updateColumnWidths,
    setTableState 
  } = useTableState();
  
  const mergedTheme = { ...defaultTheme, ...theme };

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = loadTableStateFromSession(tableId);
    if (persistedState) {
      setTableState(prev => ({
        ...prev,
        columnOrder: persistedState.columnOrder,
        columnWidths: persistedState.columnWidths,
        expandedRows: new Set(persistedState.expandedRows || [])
      }));
    }
  }, [tableId, setTableState]);

  // Save state to session storage when column state changes
  useEffect(() => {
    if (tableState.columnOrder.length > 0 || Object.keys(tableState.columnWidths).length > 0 || tableState.expandedRows.size > 0) {
      saveTableStateToSession(tableId, {
        columnOrder: tableState.columnOrder,
        columnWidths: tableState.columnWidths,
        expandedRows: Array.from(tableState.expandedRows)
      });
    }
  }, [tableId, tableState.columnOrder, tableState.columnWidths, tableState.expandedRows]);

  // Handle data changes from parent component
  useEffect(() => {
    // This will be used by TabulatorWrapper to update table data
  }, [data]);

  // Handle read-only mode changes - preserve state during mode switching
  useEffect(() => {
    // When read-only mode changes, we don't need to do anything special
    // as the TabulatorWrapper will handle the reconfiguration through its own useEffect
    // The table state (selections, expansions, filters, etc.) will be preserved
  }, [configuration.readOnly]);

  // Handle selection changes
  const handleRowSelect = (selectedRows: string[]) => {
    updateSelectedRows(selectedRows);
    if (onRowSelect) {
      const selectedRecords = data.filter(record => selectedRows.includes(record.packageId));
      onRowSelect(selectedRecords);
    }
  };

  // Handle row expansion
  const handleRowExpand = (rowId: string) => {
    toggleRowExpansion(rowId);
    if (onRowExpand) {
      const record = data.find(r => r.packageId === rowId);
      if (record) {
        return onRowExpand(record);
      }
    }
    return null;
  };

  // Handle context menu actions
  const handleContextMenuAction = (action: string, rowData: any) => {
    if (onContextMenuAction) {
      onContextMenuAction(action, rowData);
    }
  };

  // Handle data changes from table
  const handleDataChange = (updatedData: any[]) => {
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  return (
    <ThemeProvider theme={mergedTheme}>
      <TableContainer 
        ref={containerRef}
        className={className} 
        data-testid="advanced-data-table"
        theme={mergedTheme}
        readOnly={configuration.readOnly}
      >
        <TabulatorWrapper
          data={data}
          configuration={configuration}
          tableState={tableState}
          tableId={tableId}
          onRowSelect={handleRowSelect}
          onRowExpand={handleRowExpand}
          onContextMenuAction={handleContextMenuAction}
          onDataChange={handleDataChange}
          onFiltersChange={updateFilters}
          onColumnOrderChange={updateColumnOrder}
          onColumnWidthChange={updateColumnWidths}
          setTableState={setTableState}
        />
      </TableContainer>
    </ThemeProvider>
  );
};

export default AdvancedDataTable;