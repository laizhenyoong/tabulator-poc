import React from 'react';
import styled from 'styled-components';
import { PackageRecord } from '../types';

const MenuContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const MenuItem = styled.div<{ isLast?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: ${props => props.isLast ? 'none' : '1px solid #eee'};
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:active {
    background-color: #e9ecef;
  }
`;

export interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  rowData: PackageRecord | null;
  readOnly?: boolean;
  onAction: (action: string, rowData: PackageRecord) => void;
  onClose: () => void;
}

/**
 * ContextMenu Component
 * 
 * Provides right-click context menu functionality for table rows
 * Supports Copy, View Details, and Lock Record actions
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  rowData,
  readOnly = false,
  onAction,
  onClose
}) => {
  if (!visible || !rowData) {
    return null;
  }

  const handleAction = (action: string) => {
    onAction(action, rowData);
    onClose();
  };

  const handleCopy = async () => {
    try {
      // Format the row data for clipboard
      const formattedData = [
        `Package ID: ${rowData.packageId}`,
        `Priority: ${rowData.priority}`,
        `Service Name: ${rowData.serviceName}`,
        `PCID: ${rowData.pcid}`,
        `Quota Name: ${rowData.quotaName}`,
        `User Profile: ${rowData.userProfile}`,
        `Package List: ${Array.isArray(rowData.packageList) ? rowData.packageList.join(', ') : rowData.packageList}`
      ].join('\n');

      await navigator.clipboard.writeText(formattedData);
      handleAction('copy');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers or when clipboard API is not available
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(rowData, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      handleAction('copy');
    }
  };

  const handleViewDetails = () => {
    handleAction('view-details');
  };

  const handleLockRecord = () => {
    handleAction('lock-record');
  };

  // Calculate menu items based on read-only mode
  const menuItems = [
    {
      label: 'Copy',
      action: handleCopy,
      testId: 'context-menu-copy'
    },
    {
      label: 'View Details',
      action: handleViewDetails,
      testId: 'context-menu-view-details'
    }
  ];

  // Add lock record option only if not in read-only mode
  if (!readOnly) {
    menuItems.push({
      label: 'Lock Record',
      action: handleLockRecord,
      testId: 'context-menu-lock-record'
    });
  }

  return (
    <MenuContainer 
      x={x} 
      y={y} 
      data-testid="context-menu"
      onClick={(e) => e.stopPropagation()} // Prevent event bubbling
    >
      {menuItems.map((item, index) => (
        <MenuItem
          key={item.label}
          isLast={index === menuItems.length - 1}
          onClick={item.action}
          data-testid={item.testId}
        >
          {item.label}
        </MenuItem>
      ))}
    </MenuContainer>
  );
};

export default ContextMenu;