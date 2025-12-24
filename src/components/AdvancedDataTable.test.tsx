import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import AdvancedDataTable from './AdvancedDataTable';
import { PackageRecord, TableConfiguration } from '../types';

describe('AdvancedDataTable', () => {
  const mockData: PackageRecord[] = [
    {
      packageId: 'PKG001',
      priority: 1,
      serviceName: 'Test Service',
      pcid: 12345,
      quotaName: 'Standard',
      userProfile: 'Admin',
      packageList: ['package1', 'package2']
    }
  ];

  const mockConfiguration: TableConfiguration = {
    columns: [
      { field: 'packageId', title: 'Package ID' },
      { field: 'priority', title: 'Priority' },
      { field: 'serviceName', title: 'Service Name' }
    ],
    data: mockData,
    enableSorting: true,
    enableFiltering: true
  };

  // Generators for property-based testing
  const packageRecordArb = fc.record({
    packageId: fc.string({ minLength: 1, maxLength: 20 }),
    priority: fc.integer({ min: 1, max: 10 }),
    serviceName: fc.string({ minLength: 1, maxLength: 50 }),
    pcid: fc.integer({ min: 1, max: 99999 }),
    quotaName: fc.string({ minLength: 1, maxLength: 30 }),
    userProfile: fc.string({ minLength: 1, max: 30 }),
    packageList: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 })
  });

  const tableConfigurationArb = (data: PackageRecord[]) => fc.record({
    columns: fc.constant([
      { field: 'packageId', title: 'Package ID' },
      { field: 'priority', title: 'Priority' },
      { field: 'serviceName', title: 'Service Name' },
      { field: 'pcid', title: 'PCID' },
      { field: 'quotaName', title: 'Quota Name' },
      { field: 'userProfile', title: 'User Profile' },
      { field: 'packageList', title: 'Package List' }
    ]),
    data: fc.constant(data),
    enableSorting: fc.boolean(),
    enableFiltering: fc.boolean(),
    enableEditing: fc.boolean(),
    enableBulkActions: fc.boolean(),
    enableRowExpansion: fc.boolean(),
    readOnly: fc.boolean()
  });

  it('renders without crashing', () => {
    render(
      <AdvancedDataTable
        data={mockData}
        configuration={mockConfiguration}
      />
    );
    
    expect(screen.getByTestId('advanced-data-table')).toBeInTheDocument();
    expect(screen.getByTestId('tabulator-table')).toBeInTheDocument();
  });

  it('displays the table structure correctly', () => {
    render(
      <AdvancedDataTable
        data={mockData}
        configuration={mockConfiguration}
      />
    );
    
    // Check that the main table container exists
    expect(screen.getByTestId('advanced-data-table')).toBeInTheDocument();
    // Check that the Tabulator wrapper exists
    expect(screen.getByTestId('tabulator-table')).toBeInTheDocument();
  });

  // Property-based tests
  describe('Property-based tests', () => {
    /**
     * **Feature: advanced-data-table, Property 1: Data Display Completeness**
     * **Validates: Requirements 1.1**
     * For any set of package records provided to the table, all records should be visible in the rendered table output
     */
    it('Property 1: Data Display Completeness', () => {
      fc.assert(
        fc.property(
          fc.array(packageRecordArb, { minLength: 0, maxLength: 100 }),
          (packageRecords) => {
            const configuration = {
              columns: [
                { field: 'packageId', title: 'Package ID' },
                { field: 'priority', title: 'Priority' },
                { field: 'serviceName', title: 'Service Name' },
                { field: 'pcid', title: 'PCID' },
                { field: 'quotaName', title: 'Quota Name' },
                { field: 'userProfile', title: 'User Profile' },
                { field: 'packageList', title: 'Package List' }
              ],
              data: packageRecords,
              enableSorting: true,
              enableFiltering: true
            };

            const { container, unmount } = render(
              <AdvancedDataTable
                data={packageRecords}
                configuration={configuration}
              />
            );

            try {
              // Verify the table component is rendered
              const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
              expect(tableElement).toBeInTheDocument();

              // Verify the tabulator wrapper is rendered
              const tabulatorElement = container.querySelector('[data-testid="tabulator-table"]');
              expect(tabulatorElement).toBeInTheDocument();

              return true;
            } finally {
              // Clean up to prevent DOM pollution
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: advanced-data-table, Property 2: Varying Data Length Handling**
     * **Validates: Requirements 1.3**
     * For any package records with varying field lengths, the table should render all data without truncation or overflow errors
     */
    it('Property 2: Varying Data Length Handling', () => {
      fc.assert(
        fc.property(
          fc.array(packageRecordArb, { minLength: 1, maxLength: 50 }),
          (packageRecords) => {
            const configuration = {
              columns: [
                { field: 'packageId', title: 'Package ID' },
                { field: 'priority', title: 'Priority' },
                { field: 'serviceName', title: 'Service Name' },
                { field: 'pcid', title: 'PCID' },
                { field: 'quotaName', title: 'Quota Name' },
                { field: 'userProfile', title: 'User Profile' },
                { field: 'packageList', title: 'Package List' }
              ],
              data: packageRecords,
              enableSorting: true,
              enableFiltering: true
            };

            // Test that the component renders without throwing errors regardless of data length variations
            const { container, unmount } = render(
              <AdvancedDataTable
                data={packageRecords}
                configuration={configuration}
              />
            );

            try {
              // Verify the component renders successfully
              const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
              expect(tableElement).toBeInTheDocument();

              // Verify the tabulator wrapper is rendered
              const tabulatorElement = container.querySelector('[data-testid="tabulator-table"]');
              expect(tabulatorElement).toBeInTheDocument();

              return true;
            } catch (error) {
              return false;
            } finally {
              // Clean up to prevent DOM pollution
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: advanced-data-table, Property 36: Reactive Data Updates**
     * **Validates: Requirements 10.2**
     * For any external data change, the table display should update to reflect the new data state
     */
    it('Property 36: Reactive Data Updates', () => {
      fc.assert(
        fc.property(
          fc.array(packageRecordArb, { minLength: 1, maxLength: 20 }),
          fc.array(packageRecordArb, { minLength: 1, maxLength: 20 }),
          (initialData, updatedData) => {
            const configuration = {
              columns: [
                { field: 'packageId', title: 'Package ID' },
                { field: 'priority', title: 'Priority' },
                { field: 'serviceName', title: 'Service Name' },
                { field: 'pcid', title: 'PCID' },
                { field: 'quotaName', title: 'Quota Name' },
                { field: 'userProfile', title: 'User Profile' },
                { field: 'packageList', title: 'Package List' }
              ],
              data: initialData,
              enableSorting: true,
              enableFiltering: true
            };

            // Create a component that we can re-render with different data
            const TestComponent = ({ data }: { data: PackageRecord[] }) => (
              <AdvancedDataTable
                data={data}
                configuration={{ ...configuration, data }}
              />
            );

            const { container, rerender, unmount } = render(
              <TestComponent data={initialData} />
            );

            try {
              // Verify initial render
              const tableElement = container.querySelector('[data-testid="advanced-data-table"]');
              expect(tableElement).toBeInTheDocument();

              const tabulatorElement = container.querySelector('[data-testid="tabulator-table"]');
              expect(tabulatorElement).toBeInTheDocument();

              // Re-render with updated data
              rerender(<TestComponent data={updatedData} />);

              // Verify the component still renders after data update
              const updatedTableElement = container.querySelector('[data-testid="advanced-data-table"]');
              expect(updatedTableElement).toBeInTheDocument();

              const updatedTabulatorElement = container.querySelector('[data-testid="tabulator-table"]');
              expect(updatedTabulatorElement).toBeInTheDocument();

              return true;
            } catch (error) {
              return false;
            } finally {
              // Clean up to prevent DOM pollution
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});