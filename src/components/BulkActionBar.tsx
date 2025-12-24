import React, { useState } from 'react';
import { PackageRecord } from '../types';

interface BulkActionBarProps {
  selectedRows: PackageRecord[];
  onBulkDelete: (rows: PackageRecord[]) => void;
  onBulkExport: (rows: PackageRecord[]) => void;
  onBulkUpdate: (rows: PackageRecord[]) => void;
  onClearSelection: () => void;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmBg: '#dc3545',
          confirmHover: '#c82333',
          titleColor: '#dc3545'
        };
      case 'warning':
        return {
          confirmBg: '#ffc107',
          confirmHover: '#e0a800',
          titleColor: '#856404'
        };
      default:
        return {
          confirmBg: '#007bff',
          confirmHover: '#0056b3',
          titleColor: '#007bff'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      data-testid="confirmation-dialog-overlay"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        data-testid="confirmation-dialog"
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            color: styles.titleColor,
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            color: '#495057',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            data-testid="confirmation-cancel-button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: styles.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = styles.confirmHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.confirmBg;
            }}
            data-testid="confirmation-confirm-button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * BulkActionBar Component
 * 
 * Provides bulk operation controls for selected table rows
 * Includes Delete, Export, and Update actions with confirmation dialogs
 */
const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedRows,
  onBulkDelete,
  onBulkExport,
  onBulkUpdate,
  onClearSelection
}) => {
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'export' | 'update' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: ''
  });

  const handleBulkDelete = () => {
    setConfirmationDialog({
      isOpen: true,
      type: 'delete',
      title: 'Confirm Bulk Delete',
      message: `Are you sure you want to delete ${selectedRows.length} selected row${selectedRows.length !== 1 ? 's' : ''}? This action cannot be undone.`
    });
  };

  const handleBulkExport = () => {
    setConfirmationDialog({
      isOpen: true,
      type: 'export',
      title: 'Confirm Bulk Export',
      message: `Export ${selectedRows.length} selected row${selectedRows.length !== 1 ? 's' : ''} to CSV file?`
    });
  };

  const handleBulkUpdate = () => {
    setConfirmationDialog({
      isOpen: true,
      type: 'update',
      title: 'Confirm Bulk Update',
      message: `Enable batch editing for ${selectedRows.length} selected row${selectedRows.length !== 1 ? 's' : ''}?`
    });
  };

  const handleConfirmAction = () => {
    switch (confirmationDialog.type) {
      case 'delete':
        onBulkDelete(selectedRows);
        break;
      case 'export':
        onBulkExport(selectedRows);
        break;
      case 'update':
        onBulkUpdate(selectedRows);
        break;
    }
    setConfirmationDialog({ isOpen: false, type: null, title: '', message: '' });
  };

  const handleCancelAction = () => {
    setConfirmationDialog({ isOpen: false, type: null, title: '', message: '' });
  };

  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
        data-testid="bulk-action-bar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#495057', fontWeight: '500' }}>
            {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            data-testid="bulk-delete-button"
          >
            Delete
          </button>
          
          <button
            onClick={handleBulkExport}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            data-testid="bulk-export-button"
          >
            Export
          </button>
          
          <button
            onClick={handleBulkUpdate}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            data-testid="bulk-update-button"
          >
            Update
          </button>
          
          <button
            onClick={onClearSelection}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            data-testid="clear-selection-button"
          >
            Clear
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        confirmText={
          confirmationDialog.type === 'delete' ? 'Delete' :
          confirmationDialog.type === 'export' ? 'Export' :
          confirmationDialog.type === 'update' ? 'Update' : 'Confirm'
        }
        type={
          confirmationDialog.type === 'delete' ? 'danger' :
          confirmationDialog.type === 'export' ? 'info' :
          confirmationDialog.type === 'update' ? 'warning' : 'info'
        }
      />
    </>
  );
};

export default BulkActionBar;