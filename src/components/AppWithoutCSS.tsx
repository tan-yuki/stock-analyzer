import { useState } from 'react';
import { StockForm } from './StockForm';
import { LoadingSpinner } from './LoadingSpinner';
import { StockInfo } from './StockInfo';
import { StockChart } from './StockChart';
import { AnalysisResults } from './AnalysisResults';
import { stockApiService } from '../services/stockApiService';
import { calculateStockAnalysis } from '../utils/stockAnalysis';
import { StockData, StockAnalysis, StockFormData } from '../types';

export function AppWithoutCSS() {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeStock = async (formData: StockFormData) => {
    if (!formData.symbol.trim()) {
      setError('銘柄コードを入力してください');
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null);
    setAnalysis(null);

    try {
      const data = await stockApiService.fetchStockData(formData.symbol, formData.period);
      const analysisResult = calculateStockAnalysis(data.prices);
      
      setStockData(data);
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '2rem', fontSize: '2.5rem' }}>
          📈 株価分析ツール
        </h1>
        
        <StockForm onSubmit={handleAnalyzeStock} loading={loading} />
        
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {loading && <LoadingSpinner />}
        
        {stockData && (
          <div style={{ marginTop: '2rem' }}>
            {stockData.isUsingMockData && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#856404',
              }}>
                ℹ️ デモ用データを表示しています。実際のAPIキーを設定すると、リアルタイムデータを取得できます。
              </div>
            )}
            <StockInfo data={stockData} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <StockChart data={stockData} />
              {analysis && <AnalysisResults analysis={analysis} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}