import React from 'react';

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box' as const,
  },
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: '#f5f5f5',
    minHeight: '100vh',
    color: '#333',
  }
};

export const GlobalStyles: React.FC = () => {
  React.useEffect(() => {
    // Apply global styles to document
    Object.assign(document.body.style, globalStyles.body);
    
    // Apply global styles and responsive design
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      @media (max-width: 768px) {
        .responsive-container {
          padding: 10px !important;
        }
        
        .responsive-header-title {
          font-size: 2rem !important;
        }
        
        .responsive-form-group {
          display: block !important;
          margin-right: 0 !important;
          margin-bottom: 20px !important;
        }
        
        .responsive-input {
          width: 100% !important;
        }
        
        .responsive-button {
          width: 100% !important;
          margin-left: 0 !important;
        }
        
        .responsive-price-display {
          flex-direction: column !important;
          gap: 10px !important;
        }
        
        .responsive-metrics {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};