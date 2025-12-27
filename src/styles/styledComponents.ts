import styled from 'styled-components';
import { TableTheme } from '../types';

// Base table container
export const TableContainer = styled.div<{ theme: TableTheme; readOnly?: boolean }>`
  background-color: ${props => props.theme.backgroundColor || '#ffffff'};
  border: 1px solid ${props => props.theme.borderColor || '#dee2e6'};
  border-radius: 8px;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  
  ${props => props.readOnly && `
    &::before {
      content: 'READ ONLY';
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #6c757d;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      z-index: 10;
      pointer-events: none;
    }
  `}
  
  .tabulator {
    background-color: transparent;
    border: none;
    font-family: inherit;
  }
  
  .tabulator-header {
    background-color: ${props => props.theme.headerBackgroundColor || '#f8f9fa'};
    border-bottom: 2px solid ${props => props.theme.borderColor || '#dee2e6'};
    color: ${props => props.theme.headerTextColor || '#495057'};
  }
  
  .tabulator-col {
    background-color: ${props => props.theme.headerBackgroundColor || '#f8f9fa'};
    border-right: 1px solid ${props => props.theme.borderColor || '#dee2e6'};
    color: ${props => props.theme.headerTextColor || '#495057'};
    
    &.tabulator-sortable {
      cursor: pointer;
      
      &:hover {
        background-color: ${props => props.theme.rowHoverColor || '#f5f5f5'};
      }
    }
  }
  
  .tabulator-row {
    border-bottom: 1px solid ${props => props.theme.borderColor || '#dee2e6'};
    background-color: ${props => props.theme.backgroundColor || '#ffffff'};
    
    &:nth-child(even) {
      background-color: ${props => props.theme.rowAlternateBackgroundColor || '#f8f9fa'};
    }
    
    &:hover {
      background-color: ${props => props.theme.rowHoverColor || '#f5f5f5'};
    }
    
    &.tabulator-selected {
      background-color: ${props => props.theme.rowSelectedColor || '#e3f2fd'};
    }
  }
  
  .tabulator-cell {
    border-right: 1px solid ${props => props.theme.borderColor || '#dee2e6'};
    color: ${props => props.theme.textColor || '#212529'};
    padding: 12px 16px;
  }
`;

// Styled button component
export const StyledButton = styled.button<{ theme: TableTheme; variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
  padding: 8px 16px;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.primaryColor || '#007bff';
      case 'secondary': return props.theme.borderColor || '#6c757d';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return props.theme.borderColor || '#dee2e6';
    }
  }};
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.primaryColor || '#007bff';
      case 'secondary': return 'transparent';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return props.theme.backgroundColor || '#ffffff';
    }
  }};
  color: ${props => props.variant && props.variant !== 'secondary' ? '#ffffff' : props.theme.textColor || '#212529'};
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.primaryColor || '#007bff'};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Empty state container
export const EmptyStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background-color: ${props => props.theme.backgroundColor || '#ffffff'};
  border: 2px dashed ${props => props.theme.borderColor || '#dee2e6'};
  border-radius: 8px;
  margin: 16px 0;
  min-height: 200px;
`;

// Loading state container
export const LoadingStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: ${props => props.theme.backgroundColor || '#ffffff'};
  border: 1px solid ${props => props.theme.borderColor || '#dee2e6'};
  border-radius: 8px;
  min-height: 200px;
`;

// Error state container
export const ErrorStateContainer = styled.div<{ theme: TableTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: #ffebee;
  border: 2px solid #f44336;
  border-radius: 8px;
  margin: 16px 0;
  min-height: 200px;
  text-align: center;
`;

// Spinner animation
export const Spinner = styled.div<{ theme: TableTheme; size?: 'small' | 'medium' | 'large' }>`
  border: 4px solid ${props => props.theme.borderColor || '#dee2e6'};
  border-top: 4px solid ${props => props.theme.primaryColor || '#007bff'};
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
  color: #d32f2f;
  font-weight: 500;
  margin-bottom: 16px;
`;

// Empty state icon
export const EmptyStateIcon = styled.div<{ theme: TableTheme }>`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
`;

// Empty state title
export const EmptyStateTitle = styled.h3<{ theme: TableTheme }>`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.textColor || '#212529'};
`;

// Empty state description
export const EmptyStateDescription = styled.p<{ theme: TableTheme }>`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: ${props => props.theme.textColor || '#6c757d'};
  max-width: 400px;
  line-height: 1.5;
`;