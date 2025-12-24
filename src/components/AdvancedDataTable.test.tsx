import React from 'react';
import { render, screen } from '@testing-library/react';
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
});