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
  enableContextMenu?: boolean;
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;
  enableSessionPersistence?: boolean;
  maxRows?: number;
  pageSize?: number;
  enablePagination?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  loadingMessage?: string;
}

export interface TableTheme {
  // Core colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  
  // Header styling
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerBorderColor?: string;
  
  // Row styling
  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverColor?: string;
  rowSelectedColor?: string;
  
  // Cell styling
  cellPadding?: string;
  cellBorderColor?: string;
  
  // Interactive states
  hoverColor?: string;
  activeColor?: string;
  focusColor?: string;
  disabledColor?: string;
  
  // Status colors
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  
  // Spacing
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  // Border radius
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  
  // Shadows
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  
  // Animation
  transitions?: {
    fast?: string;
    normal?: string;
    slow?: string;
  };
  
  // Component-specific overrides
  components?: {
    contextMenu?: Partial<TableTheme>;
    bulkActionBar?: Partial<TableTheme>;
    expansionPanel?: Partial<TableTheme>;
    filters?: Partial<TableTheme>;
  };
}

export interface AdvancedDataTableProps {
  data: PackageRecord[];
  configuration: TableConfiguration;
  tableId?: string; // Optional ID for session persistence
  onDataChange?: (data: PackageRecord[]) => void;
  onRowSelect?: (selectedRows: PackageRecord[]) => void;
  onRowExpand?: (row: PackageRecord) => React.ReactNode;
  onContextMenuAction?: (action: string, row: PackageRecord) => void;
  onCellEdit?: (rowData: PackageRecord, field: string, oldValue: any, newValue: any) => void;
  onSort?: (sortConfig: SortConfiguration[]) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onColumnReorder?: (columnOrder: string[]) => void;
  onColumnResize?: (columnWidths: Record<string, number>) => void;
  onBulkAction?: (action: string, selectedRows: PackageRecord[]) => void;
  onError?: (error: Error, context: string) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  theme?: TableTheme;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface TableState {
  selectedRows: Set<string>;
  expandedRows: Set<string>;
  filters: Record<string, any>;
  sortConfig: SortConfiguration[];
  editingCell: CellPosition | null;
  contextMenu: ContextMenuState | null;
  columnOrder: string[];
  columnWidths: Record<string, number>;
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

export interface TabulatorWrapperProps {
  data: PackageRecord[];
  configuration: TableConfiguration;
  tableState: TableState;
  tableId: string;
  onRowSelect: (selectedRows: string[]) => void;
  onRowExpand: (rowId: string) => React.ReactNode | null;
  onContextMenuAction: (action: string, rowData: PackageRecord) => void;
  onDataChange: (data: PackageRecord[]) => void;
  onCellEdit?: (rowData: PackageRecord, field: string, oldValue: any, newValue: any) => void;
  onSort?: (sortConfig: SortConfiguration[]) => void;
  onFiltersChange: (filters: Record<string, any>, filteredCount?: number) => void;
  onColumnOrderChange: (columnOrder: string[]) => void;
  onColumnWidthChange: (columnWidths: Record<string, number>) => void;
  onBulkAction?: (action: string, selectedRowIds: string[]) => void;
  onError?: (error: Error, context: string) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  accessibilityHandlers?: any; // Will be properly typed when TabulatorWrapper is updated
}

export interface FilterMethods {
  clearAllFilters: () => void;
  applyFilters: (filters: Record<string, any>) => void;
  getCurrentFilters: () => Record<string, any>;
}