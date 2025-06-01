import React from 'react';
import { StockFormData, TimePeriod } from '../types';

interface StockFormProps {
  onSubmit: (data: StockFormData) => void;
  loading: boolean;
}

const styles = {
  inputSection: {
    background: '#fafafa',
    padding: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  formGroup: {
    display: 'inline-block',
    marginRight: '20px',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 600,
    color: '#495057',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    minWidth: '150px',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#2196F3',
  },
  analyzeBtn: {
    background: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginLeft: '10px',
  },
  analyzeBtnHover: {
    background: '#1976D2',
  },
  analyzeBtnDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
};

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
    <div style={styles.inputSection}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup} className="responsive-form-group">
          <label htmlFor="stock-symbol" style={styles.label}>銘柄コード：</label>
          <input
            type="text"
            id="stock-symbol"
            placeholder="例: AAPL, GOOGL, TSLA"
            value={formData.symbol}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              ...styles.input,
              ...(loading ? styles.analyzeBtnDisabled : {}),
            }}
            className="responsive-input"
          />
        </div>
        
        <div style={styles.formGroup} className="responsive-form-group">
          <label htmlFor="period" style={styles.label}>期間：</label>
          <select
            id="period"
            value={formData.period}
            onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as TimePeriod }))}
            disabled={loading}
            style={{
              ...styles.input,
              ...(loading ? styles.analyzeBtnDisabled : {}),
            }}
            className="responsive-input"
          >
            <option value="1mo">1ヶ月</option>
            <option value="3mo">3ヶ月</option>
            <option value="6mo">6ヶ月</option>
            <option value="1y">1年</option>
            <option value="2y">2年</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.analyzeBtn,
            ...(loading ? styles.analyzeBtnDisabled : {}),
          }}
          className="responsive-button"
        >
          分析開始
        </button>
      </form>
    </div>
  );
};