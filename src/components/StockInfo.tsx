import React, { useState } from 'react';
import { StockData } from '../types';

interface StockInfoProps {
  data: StockData;
  isInWatchlist?: boolean;
  onAddToWatchlist?: (symbol: string, companyName: string) => void;
  onRemoveFromWatchlist?: (symbol: string) => void;
}

const styles = {
  stockInfo: {
    textAlign: 'center' as const,
    marginBottom: '24px',
    padding: '16px',
    background: '#fafafa',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  title: {
    color: '#495057',
    marginBottom: '10px',
  },
  priceDisplay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
  },
  currentPrice: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: '#333',
  },
  priceChange: {
    fontSize: '1rem',
    padding: '4px 8px',
    borderRadius: '3px',
  },
  priceChangePositive: {
    background: '#e8f5e8',
    color: '#2e7d32',
  },
  priceChangeNegative: {
    background: '#ffebee',
    color: '#c62828',
  },
  watchlistActions: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  watchlistButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  addButton: {
    background: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
  },
  addButtonHover: {
    background: '#bbdefb',
    color: '#0d47a1',
  },
  removeButton: {
    background: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
  },
  removeButtonHover: {
    background: '#ffcdd2',
    color: '#b71c1c',
  },
};

export const StockInfo: React.FC<StockInfoProps> = ({ 
  data, 
  isInWatchlist = false,
  onAddToWatchlist,
  onRemoveFromWatchlist 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priceChange = data.currentPrice - data.previousPrice;
  const priceChangePercent = (priceChange / data.previousPrice) * 100;
  const isPositive = priceChange >= 0;

  const handleWatchlistToggle = () => {
    if (isInWatchlist && onRemoveFromWatchlist) {
      onRemoveFromWatchlist(data.symbol);
    } else if (!isInWatchlist && onAddToWatchlist) {
      onAddToWatchlist(data.symbol, data.companyName);
    }
  };

  return (
    <div style={styles.stockInfo} data-testid="stock-info">
      <h2 style={styles.title} data-testid="company-name">{data.companyName} ({data.symbol})</h2>
      <div style={styles.priceDisplay} className="responsive-price-display">
        <span style={styles.currentPrice} data-testid="current-price">${data.currentPrice.toFixed(2)}</span>
        <span style={{
          ...styles.priceChange,
          ...(isPositive ? styles.priceChangePositive : styles.priceChangeNegative),
        }} data-testid="price-change">
          {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </span>
      </div>
      
      {(onAddToWatchlist || onRemoveFromWatchlist) && (
        <div style={styles.watchlistActions}>
          <button
            style={{
              ...styles.watchlistButton,
              ...(isInWatchlist ? styles.removeButton : styles.addButton),
              ...(isHovered ? (isInWatchlist ? styles.removeButtonHover : styles.addButtonHover) : {})
            }}
            onClick={handleWatchlistToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-testid={isInWatchlist ? "remove-from-watchlist" : "add-to-watchlist"}
          >
            {isInWatchlist ? (
              <>
                ⭐ ウォッチリストから削除
              </>
            ) : (
              <>
                ☆ ウォッチリストに追加
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};