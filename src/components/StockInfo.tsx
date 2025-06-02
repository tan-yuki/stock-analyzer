import React from 'react';
import { StockData } from '../types';

interface StockInfoProps {
  data: StockData;
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
};

export const StockInfo: React.FC<StockInfoProps> = ({ data }) => {
  const priceChange = data.currentPrice - data.previousPrice;
  const priceChangePercent = (priceChange / data.previousPrice) * 100;
  const isPositive = priceChange >= 0;

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
    </div>
  );
};