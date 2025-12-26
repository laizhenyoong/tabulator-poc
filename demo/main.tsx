import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AdvancedDataTable } from '../src';
import type { PackageRecord, TableConfiguration, TableTheme } from '../src/types';
import ErrorBoundary from './ErrorBoundary';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

// Comprehensive sample data matching the screenshot and requirements
const generateSampleData = (): PackageRecord[] => [
  {
    packageId: 'PKG-001',
    priority: 1,
    serviceName: 'Authentication Service',
    pcid: 10001,
    quotaName: 'Enterprise',
    userProfile: 'System Admin',
    packageList: ['auth-core', 'oauth2-provider', 'jwt-handler', 'session-manager']
  },
  {
    packageId: 'PKG-002',
    priority: 2,
    serviceName: 'API Gateway',
    pcid: 10002,
    quotaName: 'Premium',
    userProfile: 'API Developer',
    packageList: ['gateway-core', 'rate-limiter', 'load-balancer']
  },
  {
    packageId: 'PKG-003',
    priority: 1,
    serviceName: 'Database Service',
    pcid: 10003,
    quotaName: 'Standard',
    userProfile: 'Database Admin',
    packageList: ['postgres-driver', 'connection-pool', 'migration-tool', 'backup-service', 'monitoring']
  },
  {
    packageId: 'PKG-004',
    priority: 3,
    serviceName: 'Message Queue',
    pcid: 10004,
    quotaName: 'Premium',
    userProfile: 'DevOps Engineer',
    packageList: ['rabbitmq-client', 'message-router']
  },
  {
    packageId: 'PKG-005',
    priority: 2,
    serviceName: 'File Storage',
    pcid: 10005,
    quotaName: 'Enterprise',
    userProfile: 'Storage Admin',
    packageList: ['s3-adapter', 'file-processor', 'thumbnail-generator', 'virus-scanner']
  },
  {
    packageId: 'PKG-006',
    priority: 1,
    serviceName: 'Notification Service',
    pcid: 10006,
    quotaName: 'Standard',
    userProfile: 'System Admin',
    packageList: ['email-sender', 'sms-gateway', 'push-notifications']
  },
  {
    packageId: 'PKG-007',
    priority: 4,
    serviceName: 'Analytics Engine',
    pcid: 10007,
    quotaName: 'Premium',
    userProfile: 'Data Analyst',
    packageList: ['data-collector', 'report-generator', 'dashboard-api', 'export-service']
  },
  {
    packageId: 'PKG-008',
    priority: 2,
    serviceName: 'Search Service',
    pcid: 10008,
    quotaName: 'Standard',
    userProfile: 'Search Engineer',
    packageList: ['elasticsearch-client', 'indexer', 'query-optimizer']
  },
  {
    packageId: 'PKG-009',
    priority: 1,
    serviceName: 'Cache Service',
    pcid: 10009,
    quotaName: 'Enterprise',
    userProfile: 'Performance Engineer',
    packageList: ['redis-client', 'cache-manager', 'invalidation-service']
  },
  {
    packageId: 'PKG-010',
    priority: 3,
    serviceName: 'Logging Service',
    pcid: 10010,
    quotaName: 'Premium',
    userProfile: 'DevOps Engineer',
    packageList: ['log-aggregator', 'log-parser', 'alert-manager', 'retention-policy']
  }
];

// Edge case data for testing
const generateEdgeCaseData = (): PackageRecord[] => [
  {
    packageId: 'EDGE-001',
    priority: 0,
    serviceName: '',
    pcid: 0,
    quotaName: 'None',
    userProfile: 'Test User',
    packageList: []
  },
  {
    packageId: 'VERY-LONG-PACKAGE-ID-THAT-TESTS-COLUMN-WIDTH-HANDLING-AND-TEXT-OVERFLOW-BEHAVIOR',
    priority: 999999,
    serviceName: 'Service with an extremely long name that should test text wrapping and column width behavior in various scenarios',
    pcid: 999999999,
    quotaName: 'Ultra Premium Enterprise Plus',
    userProfile: 'Super Administrator with Extended Privileges',
    packageList: ['package-with-very-long-name-1', 'package-with-very-long-name-2', 'package-with-very-long-name-3', 'package-with-very-long-name-4', 'package-with-very-long-name-5']
  },
  {
    packageId: 'SPECIAL-CHARS-测试-🚀',
    priority: -1,
    serviceName: 'Service with Special Characters: !@#$%^&*()_+-=[]{}|;:,.<>?',
    pcid: -999,
    quotaName: 'Special & Unique',
    userProfile: 'Unicode User 测试用户',
    packageList: ['package-with-emoji-🎉', 'package-with-unicode-测试', 'package-with-symbols-!@#']
  }
];

// Custom themes for demonstration
const lightTheme: TableTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#ffffff',
  borderColor: '#dee2e6',
  textColor: '#212529',
  headerBackgroundColor: '#f8f9fa',
  headerTextColor: '#495057',
  rowHoverColor: '#f5f5f5',
  rowSelectedColor: '#e3f2fd'
};

const darkTheme: TableTheme = {
  primaryColor: '#4dabf7',
  backgroundColor: '#1a1a1a',
  borderColor: '#404040',
  textColor: '#ffffff',
  headerBackgroundColor: '#2d2d2d',
  headerTextColor: '#ffffff',
  rowHoverColor: '#333333',
  rowSelectedColor: '#1e3a8a'
};

interface FeatureToggles {
  enableSorting: boolean;
  enableFiltering: boolean;
  enableEditing: boolean;
  enableBulkActions: boolean;
  enableRowExpansion: boolean;
  enableContextMenu: boolean;
  enableColumnReordering: boolean;
  enableColumnResizing: boolean;
  readOnly: boolean;
}

type DataMode = 'normal' | 'empty' | 'edge-cases' | 'loading' | 'error';

function Demo() {
  const [data, setData] = useState<PackageRecord[]>(generateSampleData());
  const [dataMode, setDataMode] = useState<DataMode>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>({
    enableSorting: true,
    enableFiltering: true,
    enableEditing: true,
    enableBulkActions: true,
    enableRowExpansion: true,
    enableContextMenu: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    readOnly: false
  });
  
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<PackageRecord[]>([]);

  // Log events for demonstration
  const logEvent = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Simulate loading states and errors
  const changeDataMode = useCallback(async (mode: DataMode) => {
    setHasError(false);
    setErrorMessage('');
    
    if (mode === 'loading') {
      setIsLoading(true);
      setDataMode(mode);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      setDataMode('normal');
      setData(generateSampleData());
      logEvent('Data loaded successfully after delay');
      return;
    }
    
    if (mode === 'error') {
      setIsLoading(true);
      setDataMode('loading');
      
      // Simulate network delay then error
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('Failed to load data: Network timeout after 30 seconds');
      setDataMode(mode);
      setData([]);
      logEvent('Data loading failed with network error');
      return;
    }
    
    setDataMode(mode);
    
    switch (mode) {
      case 'normal':
        setData(generateSampleData());
        logEvent('Loaded normal sample data');
        break;
      case 'empty':
        setData([]);
        logEvent('Cleared all data (empty state)');
        break;
      case 'edge-cases':
        setData(generateEdgeCaseData());
        logEvent('Loaded edge case data for testing');
        break;
    }
  }, [logEvent]);

  // Create configuration based on feature toggles
  const configuration: TableConfiguration = {
    columns: [
      { field: 'packageId', title: 'Package ID', sortable: featureToggles.enableSorting, width: 120 },
      { field: 'priority', title: 'Priority', sortable: featureToggles.enableSorting, filterable: featureToggles.enableFiltering, width: 100 },
      { field: 'serviceName', title: 'Service Name', filterable: featureToggles.enableFiltering, editable: featureToggles.enableEditing, width: 200 },
      { field: 'pcid', title: 'PCID', sortable: featureToggles.enableSorting, width: 100 },
      { field: 'quotaName', title: 'Quota Name', filterable: featureToggles.enableFiltering, editable: featureToggles.enableEditing, width: 120 },
      { field: 'userProfile', title: 'User Profile', filterable: featureToggles.enableFiltering, editable: featureToggles.enableEditing, width: 150 },
      { field: 'packageList', title: 'Package List', width: 250 }
    ],
    data: data,
    readOnly: featureToggles.readOnly,
    enableSorting: featureToggles.enableSorting,
    enableFiltering: featureToggles.enableFiltering,
    enableEditing: featureToggles.enableEditing && !featureToggles.readOnly,
    enableBulkActions: featureToggles.enableBulkActions,
    enableRowExpansion: featureToggles.enableRowExpansion,
    enableContextMenu: featureToggles.enableContextMenu,
    enableColumnReordering: featureToggles.enableColumnReordering,
    enableColumnResizing: featureToggles.enableColumnResizing,
    enableSessionPersistence: true,
    emptyStateMessage: 'No package records found',
    loadingMessage: 'Loading package data...'
  };

  // Event handlers with error handling
  const handleDataChange = useCallback((newData: PackageRecord[]) => {
    try {
      setData(newData);
      logEvent(`Data updated: ${newData.length} records`);
    } catch (error) {
      logEvent(`Error updating data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasError(true);
      setErrorMessage('Failed to update table data');
    }
  }, [logEvent]);

  const handleRowSelect = useCallback((selectedRows: PackageRecord[]) => {
    try {
      setSelectedRows(selectedRows);
      logEvent(`Selected ${selectedRows.length} rows`);
    } catch (error) {
      logEvent(`Error selecting rows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [logEvent]);

  const handleContextMenuAction = useCallback((action: string, row: PackageRecord) => {
    try {
      logEvent(`Context menu action: ${action} on ${row.packageId}`);
      
      switch (action) {
        case 'copy':
          navigator.clipboard.writeText(JSON.stringify(row, null, 2));
          break;
        case 'view-details':
          alert(`Package Details:\n${JSON.stringify(row, null, 2)}`);
          break;
        case 'lock-record':
          logEvent(`Record ${row.packageId} locked`);
          break;
        default:
          logEvent(`Unknown context menu action: ${action}`);
      }
    } catch (error) {
      logEvent(`Error in context menu action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [logEvent]);

  const handleCellEdit = useCallback((rowData: PackageRecord, field: string, oldValue: any, newValue: any) => {
    try {
      logEvent(`Cell edited: ${field} changed from "${oldValue}" to "${newValue}" in ${rowData.packageId}`);
    } catch (error) {
      logEvent(`Error in cell edit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [logEvent]);

  const handleSort = useCallback((sortConfig: any[]) => {
    try {
      const sortDesc = sortConfig.map(s => `${s.field} ${s.direction}`).join(', ');
      logEvent(`Sorted by: ${sortDesc}`);
    } catch (error) {
      logEvent(`Error in sort: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [logEvent]);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    try {
      const activeFilters = Object.entries(filters).filter(([_, value]) => value).length;
      logEvent(`Filters applied: ${activeFilters} active filters`);
    } catch (error) {
      logEvent(`Error in filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [logEvent]);

  const handleBulkAction = useCallback((action: string, selectedRows: PackageRecord[]) => {
    try {
      logEvent(`Bulk action: ${action} on ${selectedRows.length} rows`);
      
      switch (action) {
        case 'delete':
          if (confirm(`Delete ${selectedRows.length} selected records?`)) {
            const remainingData = data.filter(record => 
              !selectedRows.some(selected => selected.packageId === record.packageId)
            );
            setData(remainingData);
            setSelectedRows([]);
          }
          break;
        case 'export':
          const csvContent = [
            'Package ID,Priority,Service Name,PCID,Quota Name,User Profile,Package List',
            ...selectedRows.map(row => 
              `${row.packageId},${row.priority},${row.serviceName},${row.pcid},${row.quotaName},${row.userProfile},"${row.packageList.join(';')}"`
            )
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'selected-packages.csv';
          a.click();
          URL.revokeObjectURL(url);
          break;
        default:
          logEvent(`Unknown bulk action: ${action}`);
      }
    } catch (error) {
      logEvent(`Error in bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [data, logEvent]);

  const handleRowExpand = useCallback((row: PackageRecord) => {
    try {
      logEvent(`Row expanded: ${row.packageId}`);
      
      return (
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
          <h4>Package Details: {row.packageId}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <strong>Service Information:</strong>
              <ul>
                <li>Service: {row.serviceName || 'N/A'}</li>
                <li>PCID: {row.pcid}</li>
                <li>Priority Level: {row.priority}</li>
              </ul>
            </div>
            <div>
              <strong>Configuration:</strong>
              <ul>
                <li>Quota: {row.quotaName}</li>
                <li>User Profile: {row.userProfile}</li>
                <li>Package Count: {row.packageList.length}</li>
              </ul>
            </div>
          </div>
          <div>
            <strong>Included Packages:</strong>
            <div style={{ marginTop: '8px' }}>
              {row.packageList.length === 0 ? (
                <span style={{ fontStyle: 'italic', color: '#666' }}>No packages</span>
              ) : (
                row.packageList.map((pkg, index) => (
                  <span 
                    key={index}
                    style={{ 
                      display: 'inline-block', 
                      margin: '2px 4px', 
                      padding: '4px 8px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {pkg}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      logEvent(`Error in row expand: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return <div>Error loading expanded content</div>;
    }
  }, [logEvent]);

  const handleError = useCallback((error: Error, context: string) => {
    logEvent(`Table error in ${context}: ${error.message}`);
    setHasError(true);
    setErrorMessage(`${context}: ${error.message}`);
  }, [logEvent]);

  const handleLoadingStateChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    logEvent(`Loading state changed: ${loading ? 'started' : 'finished'}`);
  }, [logEvent]);

  const toggleFeature = (feature: keyof FeatureToggles) => {
    setFeatureToggles(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const clearEventLog = () => {
    setEventLog([]);
  };

  const clearError = () => {
    setHasError(false);
    setErrorMessage('');
  };

  // Render loading state
  if (isLoading && dataMode === 'loading') {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: selectedTheme === 'dark' ? '#0d1117' : '#ffffff',
        color: selectedTheme === 'dark' ? '#ffffff' : '#000000',
        minHeight: '100vh'
      }}>
        <LoadingState 
          message="Loading package data from server..." 
          size="large" 
          variant="skeleton"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      logEvent(`React Error Boundary: ${error.message}`);
    }}>
      <div style={{ 
        padding: '20px', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: selectedTheme === 'dark' ? '#0d1117' : '#ffffff',
        color: selectedTheme === 'dark' ? '#ffffff' : '#000000',
        minHeight: '100vh'
      }}>
        <header style={{ marginBottom: '32px' }}>
          <h1>Advanced Data Table Demo</h1>
          <p>
            This demonstration showcases all features of the Advanced Data Table component including error handling, loading states, and edge cases. 
            Use the controls below to toggle features and test different scenarios.
          </p>
        </header>

        {/* Error display */}
        {hasError && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            color: '#721c24'
          }}>
            <strong>Error:</strong> {errorMessage}
            <button 
              onClick={clearError}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                backgroundColor: '#721c24',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          {/* Main table area */}
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>Data Mode:</span>
                <select 
                  value={dataMode} 
                  onChange={(e) => changeDataMode(e.target.value as DataMode)}
                  style={{ padding: '4px 8px' }}
                >
                  <option value="normal">Normal Data</option>
                  <option value="empty">Empty State</option>
                  <option value="edge-cases">Edge Cases</option>
                  <option value="loading">Loading State</option>
                  <option value="error">Error State</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>Theme:</span>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value as 'light' | 'dark')}
                  style={{ padding: '4px 8px' }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <span style={{ marginLeft: '16px' }}>
                Selected: {selectedRows.length} rows
              </span>
            </div>

            {/* Table or empty/error states */}
            {dataMode === 'empty' && !isLoading ? (
              <EmptyState 
                variant="no-data"
                actionLabel="Load Sample Data"
                onAction={() => changeDataMode('normal')}
              />
            ) : dataMode === 'error' && !isLoading ? (
              <EmptyState 
                variant="error"
                actionLabel="Retry Loading"
                onAction={() => changeDataMode('loading')}
              />
            ) : isLoading ? (
              <LoadingState message="Loading table data..." variant="spinner" size="large" />
            ) : (
              <ErrorBoundary>
                <AdvancedDataTable
                  data={data}
                  configuration={configuration}
                  tableId="demo-table"
                  onDataChange={handleDataChange}
                  onRowSelect={handleRowSelect}
                  onRowExpand={handleRowExpand}
                  onContextMenuAction={handleContextMenuAction}
                  onCellEdit={handleCellEdit}
                  onSort={handleSort}
                  onFilter={handleFilter}
                  onBulkAction={handleBulkAction}
                  onError={handleError}
                  onLoadingStateChange={handleLoadingStateChange}
                  theme={selectedTheme === 'dark' ? darkTheme : lightTheme}
                  aria-label="Package management data table"
                />
              </ErrorBoundary>
            )}
          </div>

          {/* Control panel */}
          <div style={{ 
            backgroundColor: selectedTheme === 'dark' ? '#161b22' : '#f6f8fa',
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${selectedTheme === 'dark' ? '#30363d' : '#d1d9e0'}`
          }}>
            <h3>Feature Controls</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <h4>Table Features</h4>
              {Object.entries(featureToggles).map(([key, value]) => (
                <label key={key} style={{ display: 'block', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleFeature(key as keyof FeatureToggles)}
                    style={{ marginRight: '8px' }}
                  />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4>Event Log</h4>
                <button onClick={clearEventLog} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  Clear
                </button>
              </div>
              <div style={{ 
                height: '300px', 
                overflow: 'auto', 
                fontSize: '12px',
                backgroundColor: selectedTheme === 'dark' ? '#0d1117' : '#ffffff',
                border: `1px solid ${selectedTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                padding: '8px',
                borderRadius: '4px'
              }}>
                {eventLog.length === 0 ? (
                  <div style={{ color: '#666', fontStyle: 'italic' }}>
                    No events yet. Interact with the table to see events here.
                  </div>
                ) : (
                  eventLog.map((event, index) => (
                    <div key={index} style={{ marginBottom: '4px', wordBreak: 'break-word' }}>
                      {event}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: '32px', paddingTop: '16px', borderTop: `1px solid ${selectedTheme === 'dark' ? '#30363d' : '#d1d9e0'}` }}>
          <h3>Instructions & Edge Cases</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4>Basic Features</h4>
              <ul>
                <li><strong>Sorting:</strong> Click column headers to sort (3-state cycle: asc → desc → none)</li>
                <li><strong>Filtering:</strong> Use the filter inputs below column headers</li>
                <li><strong>Editing:</strong> Double-click cells to edit (when enabled)</li>
                <li><strong>Context Menu:</strong> Right-click rows for actions</li>
                <li><strong>Bulk Actions:</strong> Select multiple rows using checkboxes</li>
                <li><strong>Row Expansion:</strong> Click the expand icon to see details</li>
                <li><strong>Column Management:</strong> Drag headers to reorder, drag borders to resize</li>
                <li><strong>Keyboard Navigation:</strong> Use Tab, Arrow keys, Enter, and Escape</li>
              </ul>
            </div>
            <div>
              <h4>Error Handling & Edge Cases</h4>
              <ul>
                <li><strong>Empty State:</strong> Select "Empty State" to see no-data handling</li>
                <li><strong>Loading State:</strong> Select "Loading State" to see loading indicators</li>
                <li><strong>Error State:</strong> Select "Error State" to see error handling</li>
                <li><strong>Edge Cases:</strong> Select "Edge Cases" to test with unusual data</li>
                <li><strong>Feature Degradation:</strong> Disable features to see graceful fallbacks</li>
                <li><strong>Theme Switching:</strong> Test dark/light theme compatibility</li>
                <li><strong>Error Recovery:</strong> Errors are logged and can be dismissed</li>
                <li><strong>Session Persistence:</strong> Column settings persist across reloads</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

// Add CSS animations for loading states
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 40% { 
      transform: scale(1.0);
    }
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Demo />);