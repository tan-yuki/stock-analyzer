import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const styles = {
  container: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  trigger: {
    background: '#e3f2fd',
    border: '1px solid #2196F3',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '50%',
    fontSize: '11px',
    color: '#1976D2',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  triggerHover: {
    background: '#2196F3',
    color: 'white',
    transform: 'scale(1.1)',
  },
  tooltip: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#333',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 9999,
    minWidth: '280px',
    maxWidth: '350px',
    whiteSpace: 'normal' as const,
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9998,
  },
  closeButton: {
    position: 'absolute' as const,
    top: '8px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOverlayClick = () => {
    setIsVisible(false);
  };

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.trigger,
          ...(isHovered ? styles.triggerHover : {}),
        }}
        aria-label="ヘルプを表示"
      >
        {children}
      </button>
      {isVisible && (
        <>
          <div style={styles.overlay} onClick={handleOverlayClick} />
          <div style={styles.tooltip}>
            <button
              type="button"
              onClick={handleClose}
              style={styles.closeButton}
              aria-label="閉じる"
            >
              ×
            </button>
            {content}
          </div>
        </>
      )}
    </div>
  );
};