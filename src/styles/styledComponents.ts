import styled, { css } from 'styled-components';
import { TableTheme } from '../types';

/**
 * Styled components utilities for theming
 */

// Theme-aware styled component helpers
export const getThemeValue = (path: string, fallback?: string) => (props: { theme: TableTheme }) => {
  const keys = path.split('.');
  let value: any = props.theme;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value || fallback;
};

// Common CSS mixins
export const focusStyles = css<{ theme: TableTheme }>`
  &:focus {
    outline: 2px solid ${props => props.theme.focusColor || props.theme.primaryColor};
    outline-offset: 2px;
  }
`;

export const hoverStyles = css<{ theme: TableTheme }>`
  &:hover {
    background-color: ${props => props.theme.hoverColor};
    transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
  }
`;

export const disabledStyles = css<{ theme: TableTheme }>`
  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${props => props.theme.disabledColor};
  }
`;

// Base table container
export const TableContainer = styled.div<{ theme: TableTheme; readOnly?: boolean }>`
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius?.md || '8px'};
  overflow: hidden;
  font-family: ${props => props.theme.fontFamily};
  font-size: ${props => props.theme.fontSize};
  line-height: ${props => props.theme.lineHeight};
  position: relative;
  box-shadow: ${props => props.theme.shadows?.sm};
  
  ${props => props.readOnly && css`
    &::before {
      content: 'READ ONLY';
      position: absolute;
      top: ${props.theme.spacing?.sm || '8px'};
      right: ${props.theme.spacing?.sm || '8px'};
      background-color: ${props.theme.disabledColor || '#6c757d'};
      color: white;
      padding: ${props.theme.spacing?.xs || '4px'} ${props.theme.spacing?.sm || '8px'};
      border-radius: ${props.theme.borderRadius?.sm || '4px'};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 10;
      pointer-events: none;
    }
  `}
  
  .tabulator {
    background-color: transparent;
    border: none;
    font-family: inherit;
    
    ${props => props.readOnly && css`
      opacity: 0.9;
    `}
  }
  
  .tabulator-header {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-bottom: 2px solid ${props => props.theme.headerBorderColor || props.theme.borderColor};
    color: ${props => props.theme.headerTextColor || props.theme.textColor};
  }
  
  .tabulator-col {
    background-color: ${props => props.theme.headerBackgroundColor};
    border-right: 1px solid ${props => props.theme.headerBorderColor || props.theme.borderColor};
    position: relative;
    color: ${props => props.theme.headerTextColor || props.theme.textColor};
    
    &.tabulator-sortable {
      cursor: pointer;
      transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
      
      &:hover {
        background-color: ${props => props.theme.hoverColor};
      }
    }
    
    /* Sort indicators */
    &.tabulator-col-sorter-element {
      .tabulator-col-content {
        position: relative;
        padding-right: 20px;
      }
      
      &::after {
        content: '';
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        opacity: 0.3;
        transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
      }
      
      /* Ascending sort indicator */
      &.tabulator-col-sorter-asc::after {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 6px solid ${props => props.theme.primaryColor};
        opacity: 1;
      }
      
      /* Descending sort indicator */
      &.tabulator-col-sorter-desc::after {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid ${props => props.theme.primaryColor};
        opacity: 1;
      }
    }
  }
  
  .tabulator-row {
    border-bottom: 1px solid ${props => props.theme.cellBorderColor || props.theme.borderColor};
    background-color: ${props => props.theme.rowBackgroundColor || props.theme.backgroundColor};
    transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
    
    &:nth-child(even) {
      background-color: ${props => props.theme.rowAlternateBackgroundColor || props.theme.rowBackgroundColor || props.theme.backgroundColor};
    }
    
    &:hover {
      background-color: ${props => props.theme.rowHoverColor || props.theme.hoverColor};
    }
    
    &.tabulator-selected {
      background-color: ${props => props.theme.rowSelectedColor || props.theme.primaryColor}20;
    }
  }
  
  .tabulator-cell {
    border-right: 1px solid ${props => props.theme.cellBorderColor || props.theme.borderColor};
    color: ${props => props.theme.textColor};
    padding: ${props => props.theme.cellPadding || '12px 16px'};
    
    ${props => props.readOnly && css`
      &.tabulator-editing {
        background-color: transparent !important;
        cursor: not-allowed !important;
      }
    `}
    
    &.tabulator-editing {
      background-color: ${props => props.theme.activeColor || props.theme.hoverColor};
    }
  }
  
  /* Custom class support is handled via className prop */
`;

// Styled button component
export const StyledButton = styled.button<{ theme: TableTheme; variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
  padding: ${props => props.theme.spacing?.sm || '8px'} ${props => props.theme.spacing?.md || '16px'};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.primaryColor;
      case 'secondary': return props.theme.secondaryColor;
      case 'success': return props.theme.successColor;
      case 'warning': return props.theme.warningColor;
      case 'error': return props.theme.errorColor;
      default: return props.theme.borderColor;
    }
  }};
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.primaryColor;
      case 'secondary': return props.theme.secondaryColor;
      case 'success': return props.theme.successColor;
      case 'warning': return props.theme.warningColor;
      case 'error': return props.theme.errorColor;
      default: return props.theme.backgroundColor;
    }
  }};
  color: ${props => props.variant && props.variant !== 'secondary' ? '#ffffff' : props.theme.textColor};
  border-radius: ${props => props.theme.borderRadius?.sm || '4px'};
  font-family: inherit;
  font-size: ${props => props.theme.fontSize};
  cursor: pointer;
  transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
  
  ${hoverStyles}
  ${focusStyles}
  ${disabledStyles}
`;

// Styled input component
export const StyledInput = styled.input<{ theme: TableTheme }>`
  padding: ${props => props.theme.spacing?.sm || '8px'} ${props => props.theme.spacing?.md || '12px'};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius?.sm || '4px'};
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  font-family: inherit;
  font-size: ${props => props.theme.fontSize};
  transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.focusColor || props.theme.primaryColor};
    box-shadow: 0 0 0 2px ${props => props.theme.focusColor || props.theme.primaryColor}20;
  }
  
  ${disabledStyles}
`;

// Context menu styles
export const ContextMenuContainer = styled.div<{ theme: TableTheme }>`
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius?.md || '8px'};
  box-shadow: ${props => props.theme.shadows?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)'};
  padding: ${props => props.theme.spacing?.xs || '4px'};
  min-width: 150px;
  z-index: 1000;
`;

export const ContextMenuItem = styled.button<{ theme: TableTheme }>`
  width: 100%;
  padding: ${props => props.theme.spacing?.sm || '8px'} ${props => props.theme.spacing?.md || '12px'};
  border: none;
  background: none;
  color: ${props => props.theme.textColor};
  text-align: left;
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius?.sm || '4px'};
  font-family: inherit;
  font-size: ${props => props.theme.fontSize};
  transition: ${props => props.theme.transitions?.fast || '0.15s ease-in-out'};
  
  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
  
  ${focusStyles}
  ${disabledStyles}
`;

// Bulk action bar styles
export const BulkActionBar = styled.div<{ theme: TableTheme }>`
  background-color: ${props => props.theme.primaryColor}10;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  padding: ${props => props.theme.spacing?.md || '12px'};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing?.sm || '8px'};
`;

// Expansion panel styles
export const ExpansionPanel = styled.div<{ theme: TableTheme }>`
  background-color: ${props => props.theme.rowAlternateBackgroundColor || props.theme.backgroundColor};
  border-top: 1px solid ${props => props.theme.borderColor};
  padding: ${props => props.theme.spacing?.lg || '16px'};
`;

// Loading indicator
export const LoadingIndicator = styled.div<{ theme: TableTheme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing?.xl || '32px'};
  color: ${props => props.theme.secondaryColor || props.theme.textColor};
  font-size: ${props => props.theme.fontSize};
`;

// Empty state
export const EmptyState = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing?.xl || '32px'};
  color: ${props => props.theme.secondaryColor || props.theme.textColor};
  text-align: center;
`;

// Empty state container
export const EmptyStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background-color: ${props => props.theme.backgroundColor};
  border: 2px dashed ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius?.md || '8px'};
  margin: 16px 0;
  min-height: 200px;
`;

// Loading state container
export const LoadingStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing?.xl || '32px'};
  background-color: ${props => props.theme.backgroundColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius?.md || '8px'};
  min-height: 200px;
`;

// Error state container
export const ErrorStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing?.xl || '32px'};
  background-color: ${props => props.theme.errorColor}10;
  border: 2px solid ${props => props.theme.errorColor || '#dc3545'};
  border-radius: ${props => props.theme.borderRadius?.md || '8px'};
  margin: 16px 0;
  min-height: 200px;
  text-align: center;
`;

// Spinner animation
export const Spinner = styled.div<{ theme: TableTheme; size?: 'small' | 'medium' | 'large' }>`
  border: 4px solid ${props => props.theme.borderColor};
  border-top: 4px solid ${props => props.theme.primaryColor};
  border-radius: 50%;
  width: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error message
export const ErrorMessage = styled.div<{ theme: TableTheme }>`
  color: ${props => props.theme.errorColor || '#dc3545'};
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing?.md || '16px'};
`;

// Empty state icon
export const EmptyStateIcon = styled.div<{ theme: TableTheme }>`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing?.md || '16px'};
  opacity: 0.7;
`;

// Empty state title
export const EmptyStateTitle = styled.h3<{ theme: TableTheme }>`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
`;

// Empty state description
export const EmptyStateDescription = styled.p<{ theme: TableTheme }>`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: ${props => props.theme.secondaryColor || props.theme.textColor};
  max-width: 400px;
  line-height: 1.5;
`;