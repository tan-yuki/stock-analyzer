import React from 'react';
import { StockAnalysis } from '../types';

interface AnalysisResultsProps {
  analysis: StockAnalysis;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  return (
    <div className="analysis-results">
      <h3>分析結果</h3>
      <div className="metrics">
        <div className="metric">
          <label>最高値：</label>
          <span>${analysis.max.toFixed(2)}</span>
        </div>
        <div className="metric">
          <label>最安値：</label>
          <span>${analysis.min.toFixed(2)}</span>
        </div>
        <div className="metric">
          <label>平均値：</label>
          <span>${analysis.average.toFixed(2)}</span>
        </div>
        <div className="metric">
          <label>ボラティリティ：</label>
          <span>{analysis.volatility.toFixed(2)}%</span>
        </div>
        <div className="metric">
          <label>期間収益率：</label>
          <span>{analysis.totalReturn.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};