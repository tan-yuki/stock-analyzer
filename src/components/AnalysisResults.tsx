import React from 'react';
import { StockAnalysis } from '../types';

interface AnalysisResultsProps {
  analysis: StockAnalysis;
}

const styles = {
  analysisResults: {
    background: '#fafafa',
    padding: '20px',
    borderRadius: '4px',
    marginTop: '24px',
    border: '1px solid #e0e0e0',
  },
  title: {
    marginBottom: '20px',
    color: '#495057',
    textAlign: 'center' as const,
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  metric: {
    background: 'white',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontWeight: 600,
    color: '#495057',
  },
  metricValue: {
    fontWeight: 600,
    color: '#2196F3',
  },
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  return (
    <div style={styles.analysisResults}>
      <h3 style={styles.title}>分析結果</h3>
      <div style={styles.metrics} className="responsive-metrics">
        <div style={styles.metric}>
          <label style={styles.metricLabel}>最高値：</label>
          <span style={styles.metricValue}>${analysis.max.toFixed(2)}</span>
        </div>
        <div style={styles.metric}>
          <label style={styles.metricLabel}>最安値：</label>
          <span style={styles.metricValue}>${analysis.min.toFixed(2)}</span>
        </div>
        <div style={styles.metric}>
          <label style={styles.metricLabel}>平均値：</label>
          <span style={styles.metricValue}>${analysis.average.toFixed(2)}</span>
        </div>
        <div style={styles.metric}>
          <label style={styles.metricLabel}>ボラティリティ：</label>
          <span style={styles.metricValue}>{analysis.volatility.toFixed(2)}%</span>
        </div>
        <div style={styles.metric}>
          <label style={styles.metricLabel}>期間収益率：</label>
          <span style={styles.metricValue}>{analysis.totalReturn.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};