# Advanced Data Table

A feature-rich React component built with Tabulator.js for displaying and managing tabular data.

## Features

- **Sorting**: Multi-column sorting with visual indicators
- **Filtering**: Individual column filters with comprehensive search
- **Editing**: Inline cell editing with validation
- **Context Menus**: Right-click actions for rows
- **Bulk Operations**: Multi-select operations (delete, export, update)
- **Row Expansion**: Expandable rows for detailed views
- **Customization**: Column reordering, resizing, and theming
- **Accessibility**: ARIA attributes and keyboard navigation
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Usage

```tsx
import { AdvancedDataTable } from 'advanced-data-table';
import type { PackageRecord, TableConfiguration } from 'advanced-data-table';

const data: PackageRecord[] = [
  {
    packageId: "PKG001",
    priority: 1,
    serviceName: "Web Service",
    pcid: 12345,
    quotaName: "Standard",
    userProfile: "Admin",
    packageList: ["package1", "package2"]
  }
];

const configuration: TableConfiguration = {
  columns: [
    { field: "packageId", title: "Package ID", sortable: true },
    { field: "priority", title: "Priority", sortable: true },
    { field: "serviceName", title: "Service Name", filterable: true }
  ],
  data,
  enableSorting: true,
  enableFiltering: true,
  enableEditing: true
};

function App() {
  return (
    <AdvancedDataTable
      data={data}
      configuration={configuration}
      onDataChange={(newData) => console.log('Data changed:', newData)}
    />
  );
}
```

## Testing

The project uses Jest for unit testing and fast-check for property-based testing to ensure comprehensive coverage and correctness.

## License

MIT