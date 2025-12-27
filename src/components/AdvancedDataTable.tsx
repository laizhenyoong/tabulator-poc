import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import { AdvancedDataTableProps } from '../types';
import useTableState from '../hooks/useTableState';
import TabulatorWrapper from './TabulatorWrapper';
import { defaultTheme, mergeTheme } from '../themes';
import { TableContainer, EmptyStateContainer, LoadingStateContainer, ErrorStateContainer, Spinner, ErrorMessage, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, StyledButton } from '../styles/styledComponents';


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
  onCellEdit,
  onSort,
  onFilter,
  onColumnReorder,
  onColumnResize,
  onBulkAction,
  onError,
  onLoadingStateChange,
  theme,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
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
  
  // State for error handling and edge cases
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Error handler
  const handleError = useCallback((error: Error, context: string) => {
    const errorMessage = `${context}: ${error.message}`;
    setError(errorMessage);
    setIsLoading(false);
    
    if (onError) {
      onError(error, context);
    }
    
    if (onLoadingStateChange) {
      onLoadingStateChange(false);
    }
  }, [onError, onLoadingStateChange]);
  
  // Loading state handler
  const handleLoadingStateChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (onLoadingStateChange) {
      onLoadingStateChange(loading);
    }
  }, [onLoadingStateChange]);
  
  // Merge theme with defaults
  const validatedTheme = useMemo(() => {
    return mergeTheme(defaultTheme, theme);
  }, [theme]);

  // Handle selection changes
  const handleRowSelect = useCallback((selectedRows: string[]) => {
    updateSelectedRows(selectedRows);
    const selectedRecords = data.filter(record => selectedRows.includes(record.packageId));
    if (onRowSelect) {
      onRowSelect(selectedRecords);
    }
  }, [data, updateSelectedRows, onRowSelect]);

  // Handle row expansion
  const handleRowExpand = useCallback((rowId: string) => {
    const wasExpanded = tableState.expandedRows.has(rowId);
    toggleRowExpansion(rowId);
    const record = data.find(r => r.packageId === rowId);
    if (record && onRowExpand) {
      return onRowExpand(record);
    }
    return null;
  }, [data, tableState.expandedRows, toggleRowExpansion, onRowExpand]);

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string, rowData: any) => {
    if (onContextMenuAction) {
      onContextMenuAction(action, rowData);
    }
  }, [onContextMenuAction]);

  // Handle data changes from table
  const handleDataChange = useCallback((updatedData: any[]) => {
    if (onDataChange) {
      onDataChange(updatedData);
    }
  }, [onDataChange]);

  // Handle cell edits
  const handleCellEdit = useCallback((rowData: any, field: string, oldValue: any, newValue: any) => {
    if (onCellEdit) {
      onCellEdit(rowData, field, oldValue, newValue);
    }
  }, [onCellEdit]);

  // Handle sort changes
  const handleSort = useCallback((sortConfig: any[]) => {
    if (onSort) {
      onSort(sortConfig);
    }
  }, [onSort]);

  // Handle filter changes
  const handleFilter = useCallback((filters: Record<string, any>, filteredCount?: number) => {
    updateFilters(filters);
    if (onFilter) {
      onFilter(filters);
    }
  }, [updateFilters, onFilter]);

  // Handle column reorder
  const handleColumnReorder = useCallback((columnOrder: string[]) => {
    updateColumnOrder(columnOrder);
    if (onColumnReorder) {
      onColumnReorder(columnOrder);
    }
  }, [updateColumnOrder, onColumnReorder]);

  // Handle column resize
  const handleColumnResize = useCallback((columnWidths: Record<string, number>) => {
    updateColumnWidths(columnWidths);
    if (onColumnResize) {
      onColumnResize(columnWidths);
    }
  }, [updateColumnWidths, onColumnResize]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string, selectedRowIds: string[]) => {
    const selectedRecords = data.filter(record => selectedRowIds.includes(record.packageId));
    if (onBulkAction) {
      onBulkAction(action, selectedRecords);
    }
  }, [data, onBulkAction]);

  // Determine what to render based on current state
  const renderContent = () => {
    // Show error state if there's an error
    if (error) {
      return (
        <ErrorStateContainer theme={validatedTheme}>
          <EmptyStateIcon theme={validatedTheme}>🚨</EmptyStateIcon>
          <EmptyStateTitle theme={validatedTheme}>Something went wrong</EmptyStateTitle>
          <ErrorMessage theme={validatedTheme}>{error}</ErrorMessage>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StyledButton theme={validatedTheme} variant="primary" onClick={clearError}>
              Dismiss
            </StyledButton>
          </div>
        </ErrorStateContainer>
      );
    }

    // Show loading state if loading
    if (isLoading) {
      return (
        <LoadingStateContainer theme={validatedTheme}>
          <Spinner theme={validatedTheme} size="large" />
          <div style={{ marginTop: '16px', fontSize: '16px' }}>
            Loading table data...
          </div>
        </LoadingStateContainer>
      );
    }

    // Show empty state if no data
    if (data.length === 0) {
      return (
        <EmptyStateContainer theme={validatedTheme}>
          <EmptyStateIcon theme={validatedTheme}>📦</EmptyStateIcon>
          <EmptyStateTitle theme={validatedTheme}>No Data Available</EmptyStateTitle>
          <EmptyStateDescription theme={validatedTheme}>
            There are no package records to display. Try adding some data or check your data source.
          </EmptyStateDescription>
        </EmptyStateContainer>
      );
    }

    // Show the actual table
    return (
      <TabulatorWrapper
        data={data}
        configuration={configuration}
        tableState={tableState}
        tableId={tableId}
        onRowSelect={handleRowSelect}
        onRowExpand={handleRowExpand}
        onContextMenuAction={handleContextMenuAction}
        onDataChange={handleDataChange}
        onCellEdit={handleCellEdit}
        onSort={handleSort}
        onFiltersChange={handleFilter}
        onColumnOrderChange={handleColumnReorder}
        onColumnWidthChange={handleColumnResize}
        onBulkAction={handleBulkAction}
        onError={handleError}
        onLoadingStateChange={handleLoadingStateChange}
        setTableState={setTableState}
      />
    );
  };

  return (
    <ThemeProvider theme={validatedTheme}>
      <TableContainer 
        ref={containerRef}
        data-testid="advanced-data-table"
        theme={validatedTheme}
        readOnly={configuration.readOnly}
        className={className}
        tabIndex={0}
        aria-label={ariaLabel || `Data table with ${data.length} rows`}
        aria-describedby={ariaDescribedBy}
      >
        {renderContent()}
      </TableContainer>
    </ThemeProvider>
  );
};

export default AdvancedDataTable;