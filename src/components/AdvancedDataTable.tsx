import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import { AdvancedDataTableProps } from '../types';
import useTableState from '../hooks/useTableState';
import { useAccessibility } from '../hooks/useAccessibility';
import TabulatorWrapper from './TabulatorWrapper';
import { saveTableStateToSession, loadTableStateFromSession } from '../utils/sessionStorage';
import { validateTableConfiguration, createDefaultConfiguration } from '../utils/configValidation';
import { createEventEmitter, validateCallbacks } from '../utils/eventCallbacks';
import { defaultTheme, mergeTheme, validateTheme } from '../themes';
import { TableContainer, EmptyStateContainer, LoadingStateContainer, ErrorStateContainer, Spinner, ErrorMessage, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, StyledButton } from '../styles/styledComponents';
import { 
  generateTableAriaAttributes
} from '../utils/accessibility';


/**
 * Advanced Data Table Component
 * 
 * A feature-rich table component built with React and Tabulator.js
 * Provides sorting, filtering, editing, context menus, bulk operations, and row expansion.
 */

// Internal component for empty state
const EmptyStateComponent: React.FC<{ 
  theme: any; 
  message?: string; 
  variant?: 'no-data' | 'no-results' | 'error';
  onRetry?: () => void;
}> = ({ theme, message, variant = 'no-data', onRetry }) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'no-data':
        return {
          icon: '📦',
          title: 'No Data Available',
          message: message || 'There are no package records to display. Try adding some data or check your data source.'
        };
      case 'no-results':
        return {
          icon: '🔍',
          title: 'No Results Found',
          message: message || 'No package records match your current filters. Try adjusting your search criteria or clearing filters.'
        };
      case 'error':
        return {
          icon: '⚠️',
          title: 'Failed to Load Data',
          message: message || 'There was an error loading the package data. Please check your connection and try again.'
        };
      default:
        return {
          icon: '📄',
          title: 'Empty',
          message: message || 'No content available'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <EmptyStateContainer theme={theme}>
      <EmptyStateIcon theme={theme}>{config.icon}</EmptyStateIcon>
      <EmptyStateTitle theme={theme}>{config.title}</EmptyStateTitle>
      <EmptyStateDescription theme={theme}>{config.message}</EmptyStateDescription>
      {onRetry && (
        <StyledButton theme={theme} variant="primary" onClick={onRetry}>
          Try Again
        </StyledButton>
      )}
    </EmptyStateContainer>
  );
};

// Internal component for loading state
const LoadingStateComponent: React.FC<{ 
  theme: any; 
  message?: string; 
  size?: 'small' | 'medium' | 'large';
}> = ({ theme, message = 'Loading...', size = 'medium' }) => {
  return (
    <LoadingStateContainer theme={theme}>
      <Spinner theme={theme} size={size} />
      <div style={{ 
        marginTop: '16px', 
        fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
        color: theme.secondaryColor || theme.textColor
      }}>
        {message}
      </div>
    </LoadingStateContainer>
  );
};

// Internal component for error state
const ErrorStateComponent: React.FC<{ 
  theme: any; 
  error: string; 
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ theme, error, onRetry, onDismiss }) => {
  return (
    <ErrorStateContainer theme={theme}>
      <EmptyStateIcon theme={theme}>🚨</EmptyStateIcon>
      <EmptyStateTitle theme={theme}>Something went wrong</EmptyStateTitle>
      <ErrorMessage theme={theme}>{error}</ErrorMessage>
      <EmptyStateDescription theme={theme}>
        The Advanced Data Table encountered an unexpected error. This could be due to invalid data format, 
        configuration issues, or network connectivity problems.
      </EmptyStateDescription>
      <div style={{ display: 'flex', gap: '8px' }}>
        {onRetry && (
          <StyledButton theme={theme} variant="primary" onClick={onRetry}>
            Try Again
          </StyledButton>
        )}
        {onDismiss && (
          <StyledButton theme={theme} variant="secondary" onClick={onDismiss}>
            Dismiss
          </StyledButton>
        )}
      </div>
    </ErrorStateContainer>
  );
};

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
  const [filteredDataCount, setFilteredDataCount] = useState<number>(data.length);
  
  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Retry handler for error states
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    
    // Emit loading state change
    if (onLoadingStateChange) {
      onLoadingStateChange(true);
    }
    
    // Simulate retry delay and then reset loading state
    setTimeout(() => {
      setIsLoading(false);
      if (onLoadingStateChange) {
        onLoadingStateChange(false);
      }
    }, 1000);
  }, [onLoadingStateChange]);
  
  // Error handler that integrates with the error state
  const handleError = useCallback((error: Error, context: string) => {
    const errorMessage = `${context}: ${error.message}`;
    setError(errorMessage);
    setIsLoading(false);
    
    if (onError) {
      onError(error, context);
    } else {
      console.error('Table error:', errorMessage);
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
  
  // Validate and merge configuration with defaults
  const validatedConfiguration = useMemo(() => {
    try {
      const validation = validateTableConfiguration(configuration);
      
      if (!validation.isValid) {
        const error = new Error(`Invalid table configuration: ${validation.errors.join(', ')}`);
        handleError(error, 'configuration validation');
        // Return default configuration as fallback
        return createDefaultConfiguration({ columns: configuration.columns, data: configuration.data });
      }
      
      if (validation.warnings.length > 0) {
        console.warn('Table configuration warnings:', validation.warnings);
      }
      
      return configuration;
    } catch (error) {
      handleError(error as Error, 'configuration processing');
      return createDefaultConfiguration({ columns: configuration.columns, data: configuration.data });
    }
  }, [configuration, handleError]);

  // Validate callbacks
  const callbackValidation = useMemo(() => {
    try {
      const callbacks = {
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
        onError: handleError, // Use our enhanced error handler
        onLoadingStateChange: handleLoadingStateChange
      };
      
      return validateCallbacks(callbacks);
    } catch (error) {
      handleError(error as Error, 'callback validation');
      return { isValid: false, warnings: [] };
    }
  }, [onDataChange, onRowSelect, onRowExpand, onContextMenuAction, onCellEdit, onSort, onFilter, onColumnReorder, onColumnResize, onBulkAction, handleError, handleLoadingStateChange]);

  // Create event emitter
  const eventEmitter = useMemo(() => {
    try {
      if (!callbackValidation.isValid) {
        console.warn('Callback validation warnings:', callbackValidation.warnings);
      }
      
      return createEventEmitter({
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
        onError: handleError,
        onLoadingStateChange: handleLoadingStateChange
      }, tableId);
    } catch (error) {
      handleError(error as Error, 'event emitter creation');
      // Return a fallback event emitter
      return createEventEmitter({}, tableId);
    }
  }, [tableId, onDataChange, onRowSelect, onRowExpand, onContextMenuAction, onCellEdit, onSort, onFilter, onColumnReorder, onColumnResize, onBulkAction, handleError, handleLoadingStateChange, callbackValidation]);
  
  // Validate and merge theme
  const validatedTheme = useMemo(() => {
    try {
      const mergedTheme = mergeTheme(defaultTheme, theme);
      const themeValidation = validateTheme(mergedTheme);
      
      if (!themeValidation.isValid || themeValidation.warnings.length > 0) {
        console.warn('Theme validation warnings:', themeValidation.warnings);
      }
      
      return mergedTheme;
    } catch (error) {
      handleError(error as Error, 'theme validation');
      return defaultTheme;
    }
  }, [theme, handleError]);

  // Initialize accessibility features
  const { 
    tableRef, 
    accessibilityHandlers, 
    accessibilityPreferences 
  } = useAccessibility(tableId, {
    enableKeyboardNavigation: true,
    enableScreenReaderAnnouncements: true,
    onCellFocus: (row, col) => {
      // Handle cell focus for keyboard navigation
      console.debug(`Cell focused: row ${row}, col ${col}`);
    },
    onCellActivate: (row, col) => {
      // Handle cell activation (Enter/F2 key)
      console.debug(`Cell activated: row ${row}, col ${col}`);
    },
    onRowSelect: (row) => {
      // Handle row selection via keyboard
      console.debug(`Row selected via keyboard: ${row}`);
    }
  });

  // Generate table ARIA attributes
  const tableAriaAttributes = useMemo(() => {
    return generateTableAriaAttributes(
      data.length,
      validatedConfiguration.columns.length,
      tableId
    );
  }, [data.length, validatedConfiguration.columns.length, tableId]);

  // Load persisted state on mount
  useEffect(() => {
    try {
      if (validatedConfiguration.enableSessionPersistence) {
        const persistedState = loadTableStateFromSession(tableId);
        if (persistedState) {
          setTableState(prev => ({
            ...prev,
            columnOrder: persistedState.columnOrder,
            columnWidths: persistedState.columnWidths,
            expandedRows: new Set(persistedState.expandedRows || [])
          }));
        }
      }
    } catch (error) {
      handleError(error as Error, 'loading persisted state');
    }
  }, [tableId, setTableState, validatedConfiguration.enableSessionPersistence, handleError]);

  // Save state to session storage when column state changes
  useEffect(() => {
    try {
      if (validatedConfiguration.enableSessionPersistence && 
          (tableState.columnOrder.length > 0 || Object.keys(tableState.columnWidths).length > 0 || tableState.expandedRows.size > 0)) {
        saveTableStateToSession(tableId, {
          columnOrder: tableState.columnOrder,
          columnWidths: tableState.columnWidths,
          expandedRows: Array.from(tableState.expandedRows)
        });
      }
    } catch (error) {
      handleError(error as Error, 'saving state to session');
    }
  }, [tableId, tableState.columnOrder, tableState.columnWidths, tableState.expandedRows, validatedConfiguration.enableSessionPersistence, handleError]);

  // Handle data changes from parent component
  useEffect(() => {
    try {
      // Update filtered data count
      setFilteredDataCount(data.length);
      
      // Clear any existing errors when new data arrives
      if (data.length > 0 && error) {
        setError(null);
      }
      
      // Emit loading state change when data changes
      eventEmitter.emitLoadingStateChange(false);
      // Announce table load to screen readers
      accessibilityHandlers.onTableLoad(data.length);
    } catch (error) {
      handleError(error as Error, 'handling data changes');
    }
  }, [data, eventEmitter, accessibilityHandlers, error, handleError]);

  // Handle read-only mode changes - preserve state during mode switching
  useEffect(() => {
    // When read-only mode changes, we don't need to do anything special
    // as the TabulatorWrapper will handle the reconfiguration through its own useEffect
    // The table state (selections, expansions, filters, etc.) will be preserved
  }, [validatedConfiguration.readOnly]);

  // Handle selection changes
  const handleRowSelect = (selectedRows: string[]) => {
    try {
      updateSelectedRows(selectedRows);
      const selectedRecords = data.filter(record => selectedRows.includes(record.packageId));
      eventEmitter.emitRowSelect(selectedRecords);
      
      // Announce selection changes to screen readers
      selectedRows.forEach((rowId) => {
        const rowIndex = data.findIndex(record => record.packageId === rowId);
        if (rowIndex !== -1) {
          accessibilityHandlers.onRowSelect(rowIndex + 1, true); // +1 for 1-based indexing
        }
      });
    } catch (error) {
      handleError(error as Error, 'row selection');
    }
  };

  // Handle row expansion
  const handleRowExpand = (rowId: string) => {
    try {
      const wasExpanded = tableState.expandedRows.has(rowId);
      toggleRowExpansion(rowId);
      const record = data.find(r => r.packageId === rowId);
      if (record) {
        const rowIndex = data.findIndex(r => r.packageId === rowId);
        accessibilityHandlers.onRowExpand(rowIndex + 1, !wasExpanded);
        return eventEmitter.emitRowExpand(record);
      }
      return null;
    } catch (error) {
      handleError(error as Error, 'row expansion');
      return null;
    }
  };

  // Handle context menu actions
  const handleContextMenuAction = (action: string, rowData: any) => {
    try {
      eventEmitter.emitContextMenuAction(action, rowData);
    } catch (error) {
      handleError(error as Error, 'context menu action');
    }
  };

  // Handle data changes from table
  const handleDataChange = (updatedData: any[]) => {
    try {
      eventEmitter.emitDataChange(updatedData);
    } catch (error) {
      handleError(error as Error, 'data change');
    }
  };

  // Handle cell edits
  const handleCellEdit = (rowData: any, field: string, oldValue: any, newValue: any) => {
    try {
      eventEmitter.emitCellEdit(rowData, field, oldValue, newValue);
      const rowIndex = data.findIndex(record => record.packageId === rowData.packageId);
      if (rowIndex !== -1) {
        accessibilityHandlers.onCellEditSave(field, rowIndex + 1);
      }
    } catch (error) {
      handleError(error as Error, 'cell edit');
    }
  };

  // Handle sort changes
  const handleSort = (sortConfig: any[]) => {
    try {
      eventEmitter.emitSort(sortConfig);
      if (sortConfig.length > 0) {
        const { field, direction } = sortConfig[0];
        accessibilityHandlers.onColumnSort(field, direction);
      }
    } catch (error) {
      handleError(error as Error, 'sorting');
    }
  };

  // Handle filter changes
  const handleFilter = (filters: Record<string, any>, filteredCount?: number) => {
    try {
      updateFilters(filters);
      eventEmitter.emitFilter(filters);
      
      // Update filtered data count if provided
      if (typeof filteredCount === 'number') {
        setFilteredDataCount(filteredCount);
      }
      
      // Announce filter changes
      Object.entries(filters).forEach(([column, value]) => {
        if (value) {
          accessibilityHandlers.onFilterApply(column, String(value));
        } else {
          accessibilityHandlers.onFilterClear(column);
        }
      });
    } catch (error) {
      handleError(error as Error, 'filtering');
    }
  };

  // Handle column reorder
  const handleColumnReorder = (columnOrder: string[]) => {
    try {
      updateColumnOrder(columnOrder);
      eventEmitter.emitColumnReorder(columnOrder);
    } catch (error) {
      handleError(error as Error, 'column reorder');
    }
  };

  // Handle column resize
  const handleColumnResize = (columnWidths: Record<string, number>) => {
    try {
      updateColumnWidths(columnWidths);
      eventEmitter.emitColumnResize(columnWidths);
    } catch (error) {
      handleError(error as Error, 'column resize');
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, selectedRowIds: string[]) => {
    try {
      const selectedRecords = data.filter(record => selectedRowIds.includes(record.packageId));
      eventEmitter.emitBulkAction(action, selectedRecords);
      accessibilityHandlers.onBulkAction(action, selectedRecords.length);
    } catch (error) {
      handleError(error as Error, 'bulk action');
    }
  };

  // Handle keyboard events at table level
  const handleTableKeyDown = (event: React.KeyboardEvent) => {
    try {
      // Handle global table keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            // Select all rows
            event.preventDefault();
            const allRowIds = data.map(record => record.packageId);
            handleRowSelect(allRowIds);
            break;
          case 'f':
            // Focus on search/filter
            event.preventDefault();
            // This would focus on a search input if available
            break;
        }
      }
    } catch (error) {
      handleError(error as Error, 'keyboard navigation');
    }
  };

  // Determine what to render based on current state
  const renderContent = () => {
    // Show error state if there's an error
    if (error) {
      return (
        <ErrorStateComponent 
          theme={validatedTheme} 
          error={error} 
          onRetry={handleRetry}
          onDismiss={clearError}
        />
      );
    }

    // Show loading state if loading
    if (isLoading) {
      return (
        <LoadingStateComponent 
          theme={validatedTheme} 
          message={validatedConfiguration.loadingMessage || 'Loading table data...'}
          size="large"
        />
      );
    }

    // Show empty state if no data
    if (data.length === 0) {
      return (
        <EmptyStateComponent 
          theme={validatedTheme} 
          message={validatedConfiguration.emptyStateMessage || 'No package records to display'}
          variant="no-data"
        />
      );
    }

    // Show no results state if data exists but filters result in no matches
    if (data.length > 0 && filteredDataCount === 0) {
      return (
        <EmptyStateComponent 
          theme={validatedTheme} 
          message="No package records match your current filters. Try adjusting your search criteria or clearing filters."
          variant="no-results"
        />
      );
    }

    // Show the actual table
    return (
      <TabulatorWrapper
        data={data}
        configuration={validatedConfiguration}
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
        accessibilityHandlers={accessibilityHandlers}
      />
    );
  };

  return (
    <ThemeProvider theme={validatedTheme}>
      <TableContainer 
        ref={(el) => {
          (containerRef as any).current = el;
          (tableRef as any).current = el;
        }}
        data-testid="advanced-data-table"
        theme={validatedTheme}
        readOnly={validatedConfiguration.readOnly}
        className={className}
        onKeyDown={handleTableKeyDown}
        tabIndex={0}
        {...tableAriaAttributes}
        aria-label={ariaLabel || tableAriaAttributes['aria-label']}
        aria-describedby={ariaDescribedBy}
        style={{
          // Apply accessibility preferences
          ...(accessibilityPreferences.reducedMotion && {
            ['--transition-duration' as any]: '0s'
          })
        }}
      >
        {renderContent()}
      </TableContainer>
    </ThemeProvider>
  );
};

export default AdvancedDataTable;