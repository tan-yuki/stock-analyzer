import React from 'react';

const styles = {
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
};

export const LoadingSpinner: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <div style={styles.loading}>
      <div style={styles.spinner}></div>
      <p>データを取得中...</p>
    </div>
  );
};