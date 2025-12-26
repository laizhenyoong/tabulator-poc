import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'skeleton' | 'dots';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  variant = 'spinner'
}) => {
  const sizeMap = {
    small: { width: '24px', height: '24px', fontSize: '14px' },
    medium: { width: '40px', height: '40px', fontSize: '16px' },
    large: { width: '60px', height: '60px', fontSize: '18px' }
  };

  const currentSize = sizeMap[size];

  if (variant === 'spinner') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        gap: '16px'
      }}>
        <div 
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            width: currentSize.width,
            height: currentSize.height,
            animation: 'spin 1s linear infinite'
          }}
        />
        <div style={{ fontSize: currentSize.fontSize, color: '#666' }}>
          {message}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px', fontSize: currentSize.fontSize, color: '#666' }}>
          {message}
        </div>
        {/* Table skeleton */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          {/* Header skeleton */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#f5f5f5', 
            borderBottom: '1px solid #e0e0e0',
            padding: '12px'
          }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i}
                style={{
                  flex: 1,
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  marginRight: i < 6 ? '8px' : '0',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            ))}
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div 
              key={rowIndex}
              style={{ 
                display: 'flex', 
                padding: '12px',
                borderBottom: rowIndex < 4 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <div 
                  key={colIndex}
                  style={{
                    flex: 1,
                    height: '16px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    marginRight: colIndex < 6 ? '8px' : '0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${(rowIndex * 7 + colIndex) * 0.1}s`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                animation: 'bounce 1.4s ease-in-out infinite both',
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: currentSize.fontSize, color: '#666' }}>
          {message}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingState;