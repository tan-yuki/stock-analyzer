import React from 'react';
import { StockData } from '../types';

interface StockInfoProps {
  data: StockData;
}

export const StockInfo: React.FC<StockInfoProps> = ({ data }) => {
  const priceChange = data.currentPrice - data.previousPrice;
  const priceChangePercent = (priceChange / data.previousPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="stock-info">
      <h2>{data.companyName} ({data.symbol})</h2>
      <div className="price-display">
        <span className="current-price">${data.currentPrice.toFixed(2)}</span>
        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};