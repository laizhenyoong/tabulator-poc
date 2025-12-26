import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'no-data' | 'no-results' | 'error' | 'loading-failed';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  variant = 'no-data'
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'no-data':
        return {
          title: title || 'No Data Available',
          message: message || 'There are no package records to display. Try adding some data or check your data source.',
          icon: icon || '📦',
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6'
        };
      case 'no-results':
        return {
          title: title || 'No Results Found',
          message: message || 'No package records match your current filters. Try adjusting your search criteria or clearing filters.',
          icon: icon || '🔍',
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7'
        };
      case 'error':
        return {
          title: title || 'Failed to Load Data',
          message: message || 'There was an error loading the package data. Please check your connection and try again.',
          icon: icon || '⚠️',
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb'
        };
      case 'loading-failed':
        return {
          title: title || 'Loading Failed',
          message: message || 'The data could not be loaded due to a network or server error.',
          icon: icon || '🔄',
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb'
        };
      default:
        return {
          title: title || 'Empty',
          message: message || 'No content available',
          icon: icon || '📄',
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: config.backgroundColor,
      border: `2px dashed ${config.borderColor}`,
      borderRadius: '8px',
      margin: '16px 0'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        opacity: 0.7
      }}>
        {config.icon}
      </div>
      
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#495057'
      }}>
        {config.title}
      </h3>
      
      <p style={{
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#6c757d',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {config.message}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;