// Core type definitions for the Advanced Data Table

export interface PackageRecord {
  packageId: string;
  priority: number;
  serviceName: string;
  pcid: number;
  quotaName: string;
  userProfile: string;
  packageList: string[];
}

export interface ColumnDefinition {
  field: string;
  title: string;
  width?: number;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  formatter?: string;
}

export interface TableConfiguration {
  columns: ColumnDefinition[];
  data: PackageRecord[];
  readOnly?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableEditing?: boolean;
  enableBulkActions?: boolean;
  enableRowExpansion?: boolean;
}

export interface TableTheme {
  primaryColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  headerBackgroundColor?: string;
  hoverColor?: string;
}

export interface AdvancedDataTableProps {
  data: PackageRecord[];
  configuration: TableConfiguration;
  onDataChange?: (data: PackageRecord[]) => void;
  onRowSelect?: (selectedRows: PackageRecord[]) => void;
  onRowExpand?: (row: PackageRecord) => React.ReactNode;
  onContextMenuAction?: (action: string, row: PackageRecord) => void;
  theme?: TableTheme;
  className?: string;
}

export interface TableState {
  selectedRows: Set<string>;
  expandedRows: Set<string>;
  filters: Record<string, any>;
  sortConfig: SortConfiguration[];
  editingCell: CellPosition | null;
  contextMenu: ContextMenuState | null;
}

export interface SortConfiguration {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface CellPosition {
  rowId: string;
  field: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  rowData: PackageRecord | null;
}