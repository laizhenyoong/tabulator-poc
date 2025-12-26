import { TableConfiguration, ColumnDefinition, PackageRecord } from '../types';

/**
 * Configuration validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates table configuration object
 */
export const validateTableConfiguration = (config: TableConfiguration): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!config.columns || !Array.isArray(config.columns)) {
    errors.push('Configuration must include a columns array');
  } else if (config.columns.length === 0) {
    errors.push('Configuration must include at least one column');
  }

  if (!config.data || !Array.isArray(config.data)) {
    errors.push('Configuration must include a data array');
  }

  // Column validation
  if (config.columns && Array.isArray(config.columns)) {
    config.columns.forEach((column, index) => {
      if (!column.field || typeof column.field !== 'string') {
        errors.push(`Column at index ${index} must have a valid field property`);
      }
      if (!column.title || typeof column.title !== 'string') {
        errors.push(`Column at index ${index} must have a valid title property`);
      }
      if (column.width !== undefined && (typeof column.width !== 'number' || column.width <= 0)) {
        warnings.push(`Column "${column.field}" has invalid width, using default`);
      }
    });

    // Check for duplicate field names
    const fieldNames = config.columns.map(col => col.field);
    const duplicates = fieldNames.filter((field, index) => fieldNames.indexOf(field) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate column fields found: ${duplicates.join(', ')}`);
    }
  }

  // Feature compatibility validation
  if (config.readOnly && config.enableEditing) {
    warnings.push('Read-only mode is enabled but editing is also enabled. Editing will be disabled.');
  }

  if (config.enableBulkActions && config.readOnly) {
    warnings.push('Bulk actions may have limited functionality in read-only mode');
  }

  // Pagination validation
  if (config.enablePagination && config.pageSize !== undefined) {
    if (typeof config.pageSize !== 'number' || config.pageSize <= 0) {
      warnings.push('Invalid pageSize provided, using default value');
    }
  }

  if (config.maxRows !== undefined && (typeof config.maxRows !== 'number' || config.maxRows <= 0)) {
    warnings.push('Invalid maxRows provided, ignoring limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates column definition
 */
export const validateColumnDefinition = (column: ColumnDefinition): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!column.field || typeof column.field !== 'string') {
    errors.push('Column must have a valid field property');
  }

  if (!column.title || typeof column.title !== 'string') {
    errors.push('Column must have a valid title property');
  }

  if (column.width !== undefined && (typeof column.width !== 'number' || column.width <= 0)) {
    warnings.push('Invalid column width provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates package record data structure
 */
export const validatePackageRecord = (record: PackageRecord): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredFields = ['packageId', 'priority', 'serviceName', 'pcid', 'quotaName', 'userProfile', 'packageList'];
  
  requiredFields.forEach(field => {
    if (!(field in record) || record[field as keyof PackageRecord] === undefined || record[field as keyof PackageRecord] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (record.packageId && typeof record.packageId !== 'string') {
    errors.push('packageId must be a string');
  }

  if (record.priority !== undefined && typeof record.priority !== 'number') {
    errors.push('priority must be a number');
  }

  if (record.pcid !== undefined && typeof record.pcid !== 'number') {
    errors.push('pcid must be a number');
  }

  if (record.packageList && !Array.isArray(record.packageList)) {
    errors.push('packageList must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates data array
 */
export const validateDataArray = (data: PackageRecord[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors, warnings };
  }

  const packageIds = new Set<string>();
  
  data.forEach((record, index) => {
    const recordValidation = validatePackageRecord(record);
    if (!recordValidation.isValid) {
      errors.push(`Record at index ${index}: ${recordValidation.errors.join(', ')}`);
    }
    
    if (record.packageId) {
      if (packageIds.has(record.packageId)) {
        warnings.push(`Duplicate packageId found: ${record.packageId}`);
      }
      packageIds.add(record.packageId);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Creates default configuration with validation
 */
export const createDefaultConfiguration = (overrides: Partial<TableConfiguration> = {}): TableConfiguration => {
  const defaultConfig: TableConfiguration = {
    columns: [],
    data: [],
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
    enablePagination: false,
    enableSearch: false,
    pageSize: 50,
    searchPlaceholder: 'Search...',
    emptyStateMessage: 'No data available',
    loadingMessage: 'Loading...',
    ...overrides
  };

  const validation = validateTableConfiguration(defaultConfig);
  if (!validation.isValid) {
    console.warn('Default configuration validation failed:', validation.errors);
  }

  return defaultConfig;
};