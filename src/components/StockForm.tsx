import React from 'react';
import { StockFormData, TimePeriod } from '../types';

interface StockFormProps {
  onSubmit: (data: StockFormData) => void;
  loading: boolean;
}

export const StockForm: React.FC<StockFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = React.useState<StockFormData>({
    symbol: 'AAPL',
    period: '6mo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSymbol = formData.symbol.trim();
    if (trimmedSymbol) {
      onSubmit({
        ...formData,
        symbol: trimmedSymbol.toUpperCase()
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="input-section">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="stock-symbol">銘柄コード：</label>
          <input
            type="text"
            id="stock-symbol"
            placeholder="例: AAPL, GOOGL, TSLA"
            value={formData.symbol}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="period">期間：</label>
          <select
            id="period"
            value={formData.period}
            onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as TimePeriod }))}
            disabled={loading}
          >
            <option value="1mo">1ヶ月</option>
            <option value="3mo">3ヶ月</option>
            <option value="6mo">6ヶ月</option>
            <option value="1y">1年</option>
            <option value="2y">2年</option>
          </select>
        </div>
        
        <button type="submit" id="analyze-btn" disabled={loading}>
          分析開始
        </button>
      </form>
    </div>
  );
};