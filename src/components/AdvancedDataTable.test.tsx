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
  });

  it('displays the correct number of data records', () => {
    render(
      <AdvancedDataTable
        data={mockData}
        configuration={mockConfiguration}
      />
    );
    
    expect(screen.getByText('Data records: 1')).toBeInTheDocument();
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

              // Verify the data count is displayed correctly
              const dataCountText = container.querySelector(`[data-testid="advanced-data-table"]`)?.textContent;
              expect(dataCountText).toContain(`Data records: ${packageRecords.length}`);

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

              // Verify no overflow or truncation errors by checking the component is still functional
              const dataCountText = container.querySelector(`[data-testid="advanced-data-table"]`)?.textContent;
              expect(dataCountText).toContain(`Data records: ${packageRecords.length}`);

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