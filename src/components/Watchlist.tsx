import React from 'react';
import { WatchlistItem } from '../types';

interface WatchlistProps {
  items: WatchlistItem[];
  onSelectStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '20px',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  list: {
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  itemHover: {
    background: '#f8f9fa',
  },
  stockInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  symbol: {
    fontWeight: 600,
    color: '#333',
    fontSize: '14px',
  },
  companyName: {
    fontSize: '12px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '200px',
  },
  priceInfo: {
    textAlign: 'right' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  price: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#333',
  },
  priceChange: {
    fontSize: '12px',
    fontWeight: 500,
  },
  priceChangePositive: {
    color: '#2e7d32',
  },
  priceChangeNegative: {
    color: '#c62828',
  },
  actions: {
    marginLeft: '12px',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  },
  removeButtonHover: {
    background: '#ffebee',
    color: '#c62828',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#666',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
    display: 'block',
  },
  emptyText: {
    fontSize: '14px',
    margin: 0,
  }
};

export const Watchlist: React.FC<WatchlistProps> = ({ 
  items, 
  onSelectStock, 
  onRemoveStock 
}) => {
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div style={styles.container} data-testid="watchlist-container">
        <div style={styles.header}>
          <h3 style={styles.title}>
            ⭐ ウォッチリスト
          </h3>
        </div>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📊</span>
          <p style={styles.emptyText}>
            ウォッチリストに銘柄を追加すると、ここに表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="watchlist-container">
      <div style={styles.header}>
        <h3 style={styles.title}>
          ⭐ ウォッチリスト ({items.length})
        </h3>
      </div>
      <ul style={styles.list}>
        {items.map((item) => (
          <li
            key={item.symbol}
            style={{
              ...styles.item,
              ...(hoveredItem === item.symbol ? styles.itemHover : {})
            }}
            onMouseEnter={() => setHoveredItem(item.symbol)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => onSelectStock(item.symbol)}
            data-testid={`watchlist-item-${item.symbol}`}
          >
            <div style={styles.stockInfo}>
              <div style={styles.symbol}>{item.symbol}</div>
              <div style={styles.companyName} title={item.companyName}>
                {item.companyName}
              </div>
            </div>
            
            {item.lastPrice && (
              <div style={styles.priceInfo}>
                <div style={styles.price}>
                  ${item.lastPrice.toFixed(2)}
                </div>
                {item.priceChange !== undefined && (
                  <div 
                    style={{
                      ...styles.priceChange,
                      ...(item.priceChange >= 0 
                        ? styles.priceChangePositive 
                        : styles.priceChangeNegative
                      )
                    }}
                  >
                    {item.priceChange >= 0 ? '+' : ''}
                    ${item.priceChange.toFixed(2)}
                  </div>
                )}
              </div>
            )}
            
            <div style={styles.actions}>
              <button
                style={{
                  ...styles.removeButton,
                  ...(hoveredButton === item.symbol ? styles.removeButtonHover : {})
                }}
                onMouseEnter={() => setHoveredButton(item.symbol)}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStock(item.symbol);
                }}
                title="ウォッチリストから削除"
                data-testid={`remove-watchlist-${item.symbol}`}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};