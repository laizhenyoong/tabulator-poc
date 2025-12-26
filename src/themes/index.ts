import { TableTheme } from '../types';

/**
 * Default theme configuration
 */
export const defaultTheme: TableTheme = {
  // Core colors
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  backgroundColor: '#ffffff',
  borderColor: '#dee2e6',
  textColor: '#212529',
  
  // Header styling
  headerBackgroundColor: '#f8f9fa',
  headerTextColor: '#495057',
  headerBorderColor: '#dee2e6',
  
  // Row styling
  rowBackgroundColor: '#ffffff',
  rowAlternateBackgroundColor: '#f8f9fa',
  rowHoverColor: '#f5f5f5',
  rowSelectedColor: '#e3f2fd',
  
  // Cell styling
  cellPadding: '12px 16px',
  cellBorderColor: '#dee2e6',
  
  // Interactive states
  hoverColor: '#f5f5f5',
  activeColor: '#e9ecef',
  focusColor: '#80bdff',
  disabledColor: '#6c757d',
  
  // Status colors
  successColor: '#28a745',
  warningColor: '#ffc107',
  errorColor: '#dc3545',
  infoColor: '#17a2b8',
  
  // Typography
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1.5',
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
  },
  
  // Animation
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out'
  }
};

/**
 * Dark theme configuration
 */
export const darkTheme: TableTheme = {
  ...defaultTheme,
  
  // Core colors
  primaryColor: '#0d6efd',
  secondaryColor: '#6c757d',
  backgroundColor: '#212529',
  borderColor: '#495057',
  textColor: '#ffffff',
  
  // Header styling
  headerBackgroundColor: '#343a40',
  headerTextColor: '#ffffff',
  headerBorderColor: '#495057',
  
  // Row styling
  rowBackgroundColor: '#212529',
  rowAlternateBackgroundColor: '#2c3034',
  rowHoverColor: '#343a40',
  rowSelectedColor: '#1e3a5f',
  
  // Cell styling
  cellBorderColor: '#495057',
  
  // Interactive states
  hoverColor: '#343a40',
  activeColor: '#495057',
  focusColor: '#0d6efd',
  disabledColor: '#6c757d'
};

/**
 * Minimal theme configuration
 */
export const minimalTheme: TableTheme = {
  ...defaultTheme,
  
  // Core colors
  primaryColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#e0e0e0',
  textColor: '#333333',
  
  // Header styling
  headerBackgroundColor: '#ffffff',
  headerTextColor: '#333333',
  headerBorderColor: '#e0e0e0',
  
  // Row styling
  rowBackgroundColor: '#ffffff',
  rowAlternateBackgroundColor: '#ffffff',
  rowHoverColor: '#f9f9f9',
  rowSelectedColor: '#f0f0f0',
  
  // Cell styling
  cellBorderColor: '#e0e0e0',
  
  // Interactive states
  hoverColor: '#f9f9f9',
  activeColor: '#f0f0f0',
  
  // Spacing - more compact
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  
  // Border radius - minimal
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '6px'
  },
  
  // Shadows - subtle
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.05)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.05)'
  }
};

/**
 * Corporate theme configuration
 */
export const corporateTheme: TableTheme = {
  ...defaultTheme,
  
  // Core colors
  primaryColor: '#2c5aa0',
  secondaryColor: '#5a6c7d',
  backgroundColor: '#ffffff',
  borderColor: '#d1d9e0',
  textColor: '#2c3e50',
  
  // Header styling
  headerBackgroundColor: '#f4f6f8',
  headerTextColor: '#2c3e50',
  headerBorderColor: '#d1d9e0',
  
  // Row styling
  rowBackgroundColor: '#ffffff',
  rowAlternateBackgroundColor: '#f9fafb',
  rowHoverColor: '#f1f3f5',
  rowSelectedColor: '#e8f4fd',
  
  // Typography
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '13px',
  fontWeight: '400',
  
  // Status colors
  successColor: '#27ae60',
  warningColor: '#f39c12',
  errorColor: '#e74c3c',
  infoColor: '#3498db'
};

/**
 * Available theme presets
 */
export const themePresets = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme,
  corporate: corporateTheme
} as const;

export type ThemePreset = keyof typeof themePresets;

/**
 * Merge theme with base theme
 */
export const mergeTheme = (baseTheme: TableTheme, customTheme?: Partial<TableTheme>): TableTheme => {
  if (!customTheme) return baseTheme;
  
  return {
    ...baseTheme,
    ...customTheme,
    spacing: {
      ...baseTheme.spacing,
      ...customTheme.spacing
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...customTheme.borderRadius
    },
    shadows: {
      ...baseTheme.shadows,
      ...customTheme.shadows
    },
    transitions: {
      ...baseTheme.transitions,
      ...customTheme.transitions
    },
    components: {
      ...baseTheme.components,
      ...customTheme.components
    }
  };
};

/**
 * Get theme preset by name
 */
export const getThemePreset = (preset: ThemePreset): TableTheme => {
  return themePresets[preset];
};

/**
 * Create custom theme from preset
 */
export const createCustomTheme = (preset: ThemePreset, overrides?: Partial<TableTheme>): TableTheme => {
  const baseTheme = getThemePreset(preset);
  return mergeTheme(baseTheme, overrides);
};

/**
 * Validate theme configuration
 */
export const validateTheme = (theme: TableTheme): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Check for required color properties
  const requiredColors = ['primaryColor', 'backgroundColor', 'textColor'];
  requiredColors.forEach(color => {
    if (!theme[color as keyof TableTheme]) {
      warnings.push(`Missing required color: ${color}`);
    }
  });
  
  // Validate color format (basic hex check)
  const colorProperties = Object.keys(theme).filter(key => key.includes('Color'));
  colorProperties.forEach(prop => {
    const value = theme[prop as keyof TableTheme] as string;
    if (value && typeof value === 'string' && !value.match(/^#[0-9A-Fa-f]{6}$/) && !value.match(/^#[0-9A-Fa-f]{3}$/)) {
      // Allow CSS color names and other valid formats, just warn about potential issues
      if (!value.match(/^(rgb|rgba|hsl|hsla)\(/) && !['transparent', 'inherit', 'initial', 'unset'].includes(value)) {
        warnings.push(`Color property ${prop} may not be a valid color format: ${value}`);
      }
    }
  });
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};