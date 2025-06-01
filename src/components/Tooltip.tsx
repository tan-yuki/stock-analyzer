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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '50%',
    fontSize: '12px',
    color: '#666',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '6px',
  },
  triggerHover: {
    background: '#f0f0f0',
    color: '#333',
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    background: '#333',
    color: 'white',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.4',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: 1000,
    minWidth: '200px',
    maxWidth: '300px',
    whiteSpace: 'normal' as const,
  },
  arrow: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #333',
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

  const handleBlur = () => {
    setIsVisible(false);
  };

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onBlur={handleBlur}
        style={{
          ...styles.trigger,
          ...(isHovered ? styles.triggerHover : {}),
        }}
        aria-label="ヘルプを表示"
      >
        {children}
      </button>
      {isVisible && (
        <div style={styles.tooltip}>
          {content}
          <div style={styles.arrow} />
        </div>
      )}
    </div>
  );
};