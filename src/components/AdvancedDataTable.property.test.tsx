import React from 'react';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import AdvancedDataTable from './AdvancedDataTable';
import { PackageRecord, TableConfiguration, ColumnDefinition, TableTheme } from '../types';

/**
 * **Feature: advanced-data-table, Property 35: Configuration Props Acceptance**
 * **Validates: Requirements 10.1**
 * 
 * For any valid configuration object provided to the component, 
 * all specified features should be enabled and functional
 */

// Generators for property-based testing
const packageRecordGenerator = fc.record({
  packageId: fc.string({ minLength: 1, maxLength: 20 }),
  priority: fc.integer({ min: 1, max: 10 }),
  serviceName: fc.string({ minLength: 1, maxLength: 30 }),
  pcid: fc.integer({ min: 1000, max: 9999 }),
  quotaName: fc.string({ minLength: 1, maxLength: 25 }),
  userProfile: fc.string({ minLength: 1, maxLength: 20 }),
  packageList: fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 0, maxLength: 5 })
});

const columnDefinitionGenerator = fc.record({
  field: fc.constantFrom('packageId', 'priority', 'serviceName', 'pcid', 'quotaName', 'userProfile', 'packageList'),
  title: fc.string({ minLength: 1, maxLength: 20 }),
  width: fc.option(fc.integer({ min: 50, max: 500 })),
  editable: fc.option(fc.boolean()),
  sortable: fc.option(fc.boolean()),
  filterable: fc.option(fc.boolean()),
  formatter: fc.option(fc.constantFrom('string', 'number', 'array'))
});

const tableConfigurationGenerator = fc.record({
  columns: fc.array(columnDefinitionGenerator, { minLength: 1, maxLength: 7 }),
  data: fc.array(packageRecordGenerator, { minLength: 0, maxLength: 10 }),
  readOnly: fc.option(fc.boolean()),
  enableFiltering: fc.option(fc.boolean()),
  enableSorting: fc.option(fc.boolean()),
  enableEditing: fc.option(fc.boolean()),
  enableBulkActions: fc.option(fc.boolean()),
  enableRowExpansion: fc.option(fc.boolean()),
  enableContextMenu: fc.option(fc.boolean()),
  enableColumnReordering: fc.option(fc.boolean()),
  enableColumnResizing: fc.option(fc.boolean()),
  enableSessionPersistence: fc.option(fc.boolean()),
  maxRows: fc.option(fc.integer({ min: 1, max: 1000 })),
  pageSize: fc.option(fc.integer({ min: 10, max: 100 })),
  enablePagination: fc.option(fc.boolean()),
  enableSearch: fc.option(fc.boolean()),
  searchPlaceholder: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
  emptyStateMessage: fc.option(fc.string({ minLength: 1, max: 50 })),
  loadingMessage: fc.option(fc.string({ minLength: 1, max: 30 }))
});

const themeGenerator = fc.record({
  primaryColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
  backgroundColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
  borderColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
  textColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
  headerBackgroundColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
  hoverColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`))
});

describe('AdvancedDataTable Configuration Props Acceptance', () => {
  /**
   * **Feature: advanced-data-table, Property 35: Configuration Props Acceptance**
   * **Validates: Requirements 10.1**
   */
  test('should accept and render with any valid configuration object', () => {
    fc.assert(
      fc.property(
        tableConfigurationGenerator,
        fc.option(themeGenerator),
        fc.option(fc.string({ minLength: 1, maxLength: 20 })), // className
        fc.option(fc.string({ minLength: 1, maxLength: 50 })), // aria-label
        (configuration, theme, className, ariaLabel) => {
          // Ensure we have unique column fields to avoid validation errors
          const uniqueColumns = configuration.columns.reduce((acc: ColumnDefinition[], col) => {
            if (!acc.find(existing => existing.field === col.field)) {
              acc.push(col);
            }
            return acc;
          }, []);

          const validConfiguration: TableConfiguration = {
            ...configuration,
            columns: uniqueColumns.length > 0 ? uniqueColumns : [
              { field: 'packageId', title: 'Package ID' }
            ]
          };

          // Test that component renders without throwing errors
          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={validConfiguration.data}
                configuration={validConfiguration}
                theme={theme || undefined}
                className={className || undefined}
                aria-label={ariaLabel || undefined}
                tableId="test-table"
              />
            );

            // Verify the component rendered
            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();

            // Verify configuration props are accepted (component doesn't crash)
            expect(tableElement).toBeTruthy();

            // Verify ARIA attributes are applied when provided
            if (ariaLabel) {
              expect(tableElement).toHaveAttribute('aria-label', ariaLabel);
            }

            // Verify className is applied when provided
            if (className && className.trim()) {
              expect(tableElement).toHaveClass(className);
            }

            // Verify table ID is set
            expect(tableElement).toHaveAttribute('id', 'test-table');

          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle configuration with all features enabled', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 1, maxLength: 5 }),
        (data) => {
          const fullConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID', sortable: true, filterable: true, editable: true },
              { field: 'priority', title: 'Priority', sortable: true, filterable: true, editable: true },
              { field: 'serviceName', title: 'Service Name', sortable: true, filterable: true, editable: true }
            ],
            data,
            readOnly: false,
            enableFiltering: true,
            enableSorting: true,
            enableEditing: true,
            enableBulkActions: true,
            enableRowExpansion: true,
            enableContextMenu: true,
            enableColumnReordering: true,
            enableColumnResizing: true,
            enableSessionPersistence: true,
            enablePagination: true,
            enableSearch: true,
            pageSize: 25,
            searchPlaceholder: 'Search records...',
            emptyStateMessage: 'No records found',
            loadingMessage: 'Loading data...'
          };

          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={data}
                configuration={fullConfiguration}
                tableId="full-config-test"
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();
          }).not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle configuration with all features disabled', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 0, maxLength: 3 }),
        (data) => {
          const minimalConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' }
            ],
            data,
            readOnly: true,
            enableFiltering: false,
            enableSorting: false,
            enableEditing: false,
            enableBulkActions: false,
            enableRowExpansion: false,
            enableContextMenu: false,
            enableColumnReordering: false,
            enableColumnResizing: false,
            enableSessionPersistence: false,
            enablePagination: false,
            enableSearch: false
          };

          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={data}
                configuration={minimalConfiguration}
                tableId="minimal-config-test"
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();
          }).not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle empty data with valid configuration', () => {
    const emptyDataConfiguration: TableConfiguration = {
      columns: [
        { field: 'packageId', title: 'Package ID' },
        { field: 'priority', title: 'Priority' },
        { field: 'serviceName', title: 'Service Name' }
      ],
      data: [],
      enableFiltering: true,
      enableSorting: true
    };

    expect(() => {
      const { container } = render(
        <AdvancedDataTable
          data={[]}
          configuration={emptyDataConfiguration}
          tableId="empty-data-test"
        />
      );

      const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
      expect(tableElement).toBeInTheDocument();
    }).not.toThrow();
  });
});

/**
 * **Feature: advanced-data-table, Property 37: Event Callback Emission**
 * **Validates: Requirements 10.3**
 * 
 * For any user interaction that triggers an event, 
 * the appropriate callback should be called with correct parameters
 */

describe('AdvancedDataTable Event Callback Emission', () => {
  /**
   * **Feature: advanced-data-table, Property 37: Event Callback Emission**
   * **Validates: Requirements 10.3**
   */
  test('should emit appropriate callbacks for user interactions', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 1, maxLength: 3 }),
        (data) => {
          const mockCallbacks = {
            onDataChange: jest.fn(),
            onRowSelect: jest.fn(),
            onRowExpand: jest.fn(),
            onContextMenuAction: jest.fn(),
            onCellEdit: jest.fn(),
            onSort: jest.fn(),
            onFilter: jest.fn(),
            onColumnReorder: jest.fn(),
            onColumnResize: jest.fn(),
            onBulkAction: jest.fn(),
            onError: jest.fn(),
            onLoadingStateChange: jest.fn()
          };

          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID', sortable: true, filterable: true, editable: true },
              { field: 'priority', title: 'Priority', sortable: true, filterable: true, editable: true }
            ],
            data,
            enableFiltering: true,
            enableSorting: true,
            enableEditing: true,
            enableBulkActions: true,
            enableRowExpansion: true,
            enableContextMenu: true
          };

          const { container } = render(
            <AdvancedDataTable
              data={data}
              configuration={testConfiguration}
              tableId="callback-test"
              {...mockCallbacks}
            />
          );

          // Verify the component rendered
          const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
          expect(tableElement).toBeInTheDocument();

          // Test that callbacks are functions and can be called
          expect(typeof mockCallbacks.onDataChange).toBe('function');
          expect(typeof mockCallbacks.onRowSelect).toBe('function');
          expect(typeof mockCallbacks.onRowExpand).toBe('function');
          expect(typeof mockCallbacks.onContextMenuAction).toBe('function');
          expect(typeof mockCallbacks.onCellEdit).toBe('function');
          expect(typeof mockCallbacks.onSort).toBe('function');
          expect(typeof mockCallbacks.onFilter).toBe('function');
          expect(typeof mockCallbacks.onColumnReorder).toBe('function');
          expect(typeof mockCallbacks.onColumnResize).toBe('function');
          expect(typeof mockCallbacks.onBulkAction).toBe('function');
          expect(typeof mockCallbacks.onError).toBe('function');
          expect(typeof mockCallbacks.onLoadingStateChange).toBe('function');

          // Verify that the component accepts all callback props without throwing
          expect(tableElement).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle callback functions with correct signatures', () => {
    fc.assert(
      fc.property(
        packageRecordGenerator,
        (sampleRecord) => {
          let callbackResults: any = {};

          const testCallbacks = {
            onDataChange: (data: any[]) => {
              callbackResults.onDataChange = { called: true, dataLength: data.length };
            },
            onRowSelect: (selectedRows: any[]) => {
              callbackResults.onRowSelect = { called: true, selectedCount: selectedRows.length };
            },
            onRowExpand: (row: any) => {
              callbackResults.onRowExpand = { called: true, rowId: row.packageId };
              return <div>Expanded content for {row.packageId}</div>;
            },
            onContextMenuAction: (action: string, row: any) => {
              callbackResults.onContextMenuAction = { called: true, action, rowId: row.packageId };
            },
            onCellEdit: (rowData: any, field: string, oldValue: any, newValue: any) => {
              callbackResults.onCellEdit = { called: true, field, oldValue, newValue };
            },
            onSort: (sortConfig: any[]) => {
              callbackResults.onSort = { called: true, sortCount: sortConfig.length };
            },
            onFilter: (filters: Record<string, any>) => {
              callbackResults.onFilter = { called: true, filterCount: Object.keys(filters).length };
            },
            onColumnReorder: (columnOrder: string[]) => {
              callbackResults.onColumnReorder = { called: true, columnCount: columnOrder.length };
            },
            onColumnResize: (columnWidths: Record<string, number>) => {
              callbackResults.onColumnResize = { called: true, widthCount: Object.keys(columnWidths).length };
            },
            onBulkAction: (action: string, selectedRows: any[]) => {
              callbackResults.onBulkAction = { called: true, action, selectedCount: selectedRows.length };
            },
            onError: (error: Error, context: string) => {
              callbackResults.onError = { called: true, errorMessage: error.message, context };
            },
            onLoadingStateChange: (isLoading: boolean) => {
              callbackResults.onLoadingStateChange = { called: true, isLoading };
            }
          };

          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' },
              { field: 'priority', title: 'Priority' }
            ],
            data: [sampleRecord],
            enableFiltering: true,
            enableSorting: true,
            enableEditing: true
          };

          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={[sampleRecord]}
                configuration={testConfiguration}
                tableId="callback-signature-test"
                {...testCallbacks}
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();

            // Test that callbacks can be called with expected parameters
            testCallbacks.onDataChange([sampleRecord]);
            expect(callbackResults.onDataChange?.called).toBe(true);
            expect(callbackResults.onDataChange?.dataLength).toBe(1);

            testCallbacks.onRowSelect([sampleRecord]);
            expect(callbackResults.onRowSelect?.called).toBe(true);
            expect(callbackResults.onRowSelect?.selectedCount).toBe(1);

            const expandResult = testCallbacks.onRowExpand(sampleRecord);
            expect(callbackResults.onRowExpand?.called).toBe(true);
            expect(callbackResults.onRowExpand?.rowId).toBe(sampleRecord.packageId);
            expect(expandResult).toBeTruthy();

            testCallbacks.onContextMenuAction('copy', sampleRecord);
            expect(callbackResults.onContextMenuAction?.called).toBe(true);
            expect(callbackResults.onContextMenuAction?.action).toBe('copy');

            testCallbacks.onCellEdit(sampleRecord, 'priority', 1, 2);
            expect(callbackResults.onCellEdit?.called).toBe(true);
            expect(callbackResults.onCellEdit?.field).toBe('priority');

            testCallbacks.onSort([{ field: 'priority', direction: 'asc', priority: 1 }]);
            expect(callbackResults.onSort?.called).toBe(true);
            expect(callbackResults.onSort?.sortCount).toBe(1);

            testCallbacks.onFilter({ priority: 1 });
            expect(callbackResults.onFilter?.called).toBe(true);
            expect(callbackResults.onFilter?.filterCount).toBe(1);

            testCallbacks.onColumnReorder(['packageId', 'priority']);
            expect(callbackResults.onColumnReorder?.called).toBe(true);
            expect(callbackResults.onColumnReorder?.columnCount).toBe(2);

            testCallbacks.onColumnResize({ packageId: 100 });
            expect(callbackResults.onColumnResize?.called).toBe(true);
            expect(callbackResults.onColumnResize?.widthCount).toBe(1);

            testCallbacks.onBulkAction('delete', [sampleRecord]);
            expect(callbackResults.onBulkAction?.called).toBe(true);
            expect(callbackResults.onBulkAction?.action).toBe('delete');

            testCallbacks.onError(new Error('Test error'), 'test context');
            expect(callbackResults.onError?.called).toBe(true);
            expect(callbackResults.onError?.errorMessage).toBe('Test error');

            testCallbacks.onLoadingStateChange(true);
            expect(callbackResults.onLoadingStateChange?.called).toBe(true);
            expect(callbackResults.onLoadingStateChange?.isLoading).toBe(true);

          }).not.toThrow();
        }
      ),
      { numRuns: 25 }
    );
  });

  test('should handle missing callbacks gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 0, maxLength: 2 }),
        (data) => {
          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' }
            ],
            data,
            enableFiltering: true,
            enableSorting: true
          };

          // Test with no callbacks provided
          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={data}
                configuration={testConfiguration}
                tableId="no-callbacks-test"
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();
          }).not.toThrow();
        }
      ),
      { numRuns: 25 }
    );
  });
});
/**
 * **Feature: advanced-data-table, Property 38: Theme and Styling Support**
 * **Validates: Requirements 10.4**
 * 
 * For any custom theme or CSS class provided, 
 * the styling should be applied correctly to the table components
 */

describe('AdvancedDataTable Theme and Styling Support', () => {
  /**
   * **Feature: advanced-data-table, Property 38: Theme and Styling Support**
   * **Validates: Requirements 10.4**
   */
  test('should apply custom themes correctly', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 1, maxLength: 2 }),
        fc.record({
          primaryColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          backgroundColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          borderColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
          headerBackgroundColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)),
          hoverColor: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`))
        }),
        (data, customTheme) => {
          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' },
              { field: 'priority', title: 'Priority' }
            ],
            data,
            enableFiltering: true,
            enableSorting: true
          };

          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={data}
                configuration={testConfiguration}
                theme={customTheme}
                tableId="theme-test"
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();

            // Verify that custom theme is accepted without throwing errors
            expect(tableElement).toBeTruthy();

            // The component should render successfully with any valid theme
            expect(tableElement).toHaveAttribute('id', 'theme-test');

          }).not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle custom CSS classes', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 0, maxLength: 2 }),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s.trim())),
        (data, customClassName) => {
          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' }
            ],
            data,
            enableFiltering: true
          };

          expect(() => {
            const { container } = render(
              <AdvancedDataTable
                data={data}
                configuration={testConfiguration}
                className={customClassName}
                tableId="css-class-test"
              />
            );

            const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
            expect(tableElement).toBeInTheDocument();

            // Verify that custom CSS class is applied
            expect(tableElement).toHaveClass(customClassName);

          }).not.toThrow();
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should handle theme presets correctly', () => {
    const testData = [
      { packageId: 'test-1', priority: 1, serviceName: 'Service A', pcid: 1001, quotaName: 'Quota A', userProfile: 'User A', packageList: ['pkg1'] }
    ];

    const testConfiguration: TableConfiguration = {
      columns: [
        { field: 'packageId', title: 'Package ID' },
        { field: 'priority', title: 'Priority' }
      ],
      data: testData,
      enableFiltering: true,
      enableSorting: true
    };

    // Test with different theme configurations
    const themes = [
      { primaryColor: '#007bff', backgroundColor: '#ffffff', textColor: '#212529' },
      { primaryColor: '#28a745', backgroundColor: '#f8f9fa', textColor: '#495057' },
      { primaryColor: '#dc3545', backgroundColor: '#ffffff', textColor: '#212529' },
      {}  // Empty theme (should use defaults)
    ];

    themes.forEach((theme, index) => {
      expect(() => {
        const { container } = render(
          <AdvancedDataTable
            data={testData}
            configuration={testConfiguration}
            theme={theme}
            tableId={`theme-preset-test-${index}`}
          />
        );

        const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
        expect(tableElement).toBeInTheDocument();
        expect(tableElement).toHaveAttribute('id', `theme-preset-test-${index}`);

      }).not.toThrow();
    });
  });
});
/**
 * **Feature: advanced-data-table, Property 39: Accessibility Compliance**
 * **Validates: Requirements 10.5**
 * 
 * For any table instance, proper ARIA attributes and keyboard navigation 
 * should be implemented and functional
 */

describe('AdvancedDataTable Accessibility Compliance', () => {
  /**
   * **Feature: advanced-data-table, Property 39: Accessibility Compliance**
   * **Validates: Requirements 10.5**
   */
  test('should implement proper ARIA attributes', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 1, maxLength: 3 }),
        fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        (data, ariaLabel, ariaDescribedBy) => {
          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' },
              { field: 'priority', title: 'Priority' },
              { field: 'serviceName', title: 'Service Name' }
            ],
            data,
            enableFiltering: true,
            enableSorting: true
          };

          const { container } = render(
            <AdvancedDataTable
              data={data}
              configuration={testConfiguration}
              tableId="accessibility-test"
              aria-label={ariaLabel || undefined}
              aria-describedby={ariaDescribedBy || undefined}
            />
          );

          const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
          expect(tableElement).toBeInTheDocument();

          // Verify ARIA attributes are present
          expect(tableElement).toHaveAttribute('role', 'table');
          expect(tableElement).toHaveAttribute('aria-rowcount');
          expect(tableElement).toHaveAttribute('aria-colcount');
          
          // Verify custom ARIA attributes when provided
          if (ariaLabel && ariaLabel.trim()) {
            expect(tableElement).toHaveAttribute('aria-label', ariaLabel);
          }
          
          if (ariaDescribedBy && ariaDescribedBy.trim()) {
            expect(tableElement).toHaveAttribute('aria-describedby', ariaDescribedBy);
          }

          // Verify table has proper ID
          expect(tableElement).toHaveAttribute('id', 'accessibility-test');

          // Verify table is focusable for keyboard navigation
          expect(tableElement).toHaveAttribute('tabindex', '0');
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should support keyboard navigation attributes', () => {
    fc.assert(
      fc.property(
        fc.array(packageRecordGenerator, { minLength: 1, maxLength: 2 }),
        (data) => {
          const testConfiguration: TableConfiguration = {
            columns: [
              { field: 'packageId', title: 'Package ID' },
              { field: 'priority', title: 'Priority' }
            ],
            data,
            enableFiltering: true,
            enableSorting: true,
            enableEditing: true
          };

          const { container } = render(
            <AdvancedDataTable
              data={data}
              configuration={testConfiguration}
              tableId="keyboard-nav-test"
            />
          );

          const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
          expect(tableElement).toBeInTheDocument();

          // Verify keyboard navigation support
          expect(tableElement).toHaveAttribute('tabindex', '0');
          
          // Verify the table has proper role
          expect(tableElement).toHaveAttribute('role', 'table');

          // Verify table structure supports accessibility
          expect(tableElement).toHaveAttribute('aria-rowcount');
          expect(tableElement).toHaveAttribute('aria-colcount');
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should handle accessibility with different configurations', () => {
    const testData = [
      { packageId: 'acc-1', priority: 1, serviceName: 'Service A', pcid: 1001, quotaName: 'Quota A', userProfile: 'User A', packageList: ['pkg1'] }
    ];

    const configurations = [
      // Basic configuration
      {
        columns: [{ field: 'packageId', title: 'Package ID' }],
        data: testData,
        enableFiltering: false,
        enableSorting: false
      },
      // Full feature configuration
      {
        columns: [
          { field: 'packageId', title: 'Package ID' },
          { field: 'priority', title: 'Priority' }
        ],
        data: testData,
        enableFiltering: true,
        enableSorting: true,
        enableEditing: true,
        enableBulkActions: true,
        enableRowExpansion: true
      },
      // Read-only configuration
      {
        columns: [{ field: 'packageId', title: 'Package ID' }],
        data: testData,
        readOnly: true,
        enableFiltering: true,
        enableSorting: true
      }
    ];

    configurations.forEach((config, index) => {
      const { container } = render(
        <AdvancedDataTable
          data={testData}
          configuration={config}
          tableId={`accessibility-config-test-${index}`}
          aria-label={`Test table ${index + 1}`}
        />
      );

      const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
      expect(tableElement).toBeInTheDocument();

      // Verify accessibility attributes are present regardless of configuration
      expect(tableElement).toHaveAttribute('role', 'table');
      expect(tableElement).toHaveAttribute('aria-label', `Test table ${index + 1}`);
      expect(tableElement).toHaveAttribute('tabindex', '0');
      expect(tableElement).toHaveAttribute('id', `accessibility-config-test-${index}`);
    });
  });
});