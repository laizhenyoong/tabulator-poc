import React, { useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { AdvancedDataTableProps, TableTheme } from '../types';
import useTableState from '../hooks/useTableState';
import TabulatorWrapper from './TabulatorWrapper';

const defaultTheme: TableTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#ffffff',
  borderColor: '#dee2e6',
  textColor: '#212529',
  headerBackgroundColor: '#f8f9fa',
  hoverColor: '#f5f5f5'
};

const TableContainer = styled.div<{ theme: TableTheme }>`
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  .tabulator {
    background-color: transparent;
    border: none;
  }
  
  .tabulator-header {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-bottom: 2px solid ${props => props.theme.borderColor};
  }
  
  .tabulator-col {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-right: 1px solid ${props => props.theme.borderColor};
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
  onDataChange,
  onRowSelect,
  onRowExpand,
  onContextMenuAction,
  theme,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tableState, updateSelectedRows, toggleRowExpansion, updateFilters, setTableState } = useTableState(data);
  
  const mergedTheme = { ...defaultTheme, ...theme };

  // Handle data changes from parent component
  useEffect(() => {
    // This will be used by TabulatorWrapper to update table data
  }, [data]);

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
      >
        <TabulatorWrapper
          data={data}
          configuration={configuration}
          tableState={tableState}
          onRowSelect={handleRowSelect}
          onRowExpand={handleRowExpand}
          onContextMenuAction={handleContextMenuAction}
          onDataChange={handleDataChange}
          onFiltersChange={updateFilters}
          setTableState={setTableState}
        />
      </TableContainer>
    </ThemeProvider>
  );
};

export default AdvancedDataTable;