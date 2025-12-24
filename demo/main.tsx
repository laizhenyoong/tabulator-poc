import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdvancedDataTable } from '../src';
import type { PackageRecord, TableConfiguration } from '../src/types';

// Sample data matching the requirements
const sampleData: PackageRecord[] = [
  {
    packageId: 'PKG001',
    priority: 1,
    serviceName: 'Web Service',
    pcid: 12345,
    quotaName: 'Standard',
    userProfile: 'Admin',
    packageList: ['web-package', 'auth-package']
  },
  {
    packageId: 'PKG002',
    priority: 2,
    serviceName: 'API Service',
    pcid: 12346,
    quotaName: 'Premium',
    userProfile: 'Developer',
    packageList: ['api-package', 'logging-package']
  },
  {
    packageId: 'PKG003',
    priority: 3,
    serviceName: 'Database Service',
    pcid: 12347,
    quotaName: 'Enterprise',
    userProfile: 'DBA',
    packageList: ['db-package', 'backup-package', 'monitoring-package']
  }
];

const configuration: TableConfiguration = {
  columns: [
    { field: 'packageId', title: 'Package ID', sortable: true },
    { field: 'priority', title: 'Priority', sortable: true },
    { field: 'serviceName', title: 'Service Name', filterable: true },
    { field: 'pcid', title: 'PCID', sortable: true },
    { field: 'quotaName', title: 'Quota Name', filterable: true },
    { field: 'userProfile', title: 'User Profile', filterable: true },
    { field: 'packageList', title: 'Package List' }
  ],
  data: sampleData,
  enableSorting: true,
  enableFiltering: true,
  enableEditing: true,
  enableBulkActions: true,
  enableRowExpansion: true
};

function Demo() {
  const handleDataChange = (newData: PackageRecord[]) => {
    console.log('Data changed:', newData);
  };

  const handleRowSelect = (selectedRows: PackageRecord[]) => {
    console.log('Rows selected:', selectedRows);
  };

  const handleContextMenuAction = (action: string, row: PackageRecord) => {
    console.log('Context menu action:', action, 'on row:', row);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Advanced Data Table Demo</h1>
      <p>This is a demonstration of the Advanced Data Table component.</p>
      
      <AdvancedDataTable
        data={sampleData}
        configuration={configuration}
        onDataChange={handleDataChange}
        onRowSelect={handleRowSelect}
        onContextMenuAction={handleContextMenuAction}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Demo />);