import React, { useState } from 'react';
import { StockForm } from './components/StockForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StockInfo } from './components/StockInfo';
import { StockChart } from './components/StockChart';
import { AnalysisResults } from './components/AnalysisResults';
import { GlobalStyles } from './styles/GlobalStyles';
import { stockApiService } from './services/stockApiService';
import { calculateStockAnalysis } from './utils/stockAnalysis';
import { StockData, StockAnalysis, StockFormData } from './types';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  headerTitle: {
    color: '#333',
    fontSize: '2rem',
    fontWeight: 500,
  },
  main: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  resultsSection: {
    padding: '24px',
  },
  mockDataNotice: {
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#856404',
  },
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);

  const handleAnalyzeStock = async (formData: StockFormData) => {
    if (!formData.symbol) {
      alert('銘柄コードを入力してください');
      return;
    }

    setLoading(true);
    
    try {
      const data = await stockApiService.fetchStockData(formData.symbol, formData.period);
      const analysisResult = calculateStockAnalysis(data.prices);
      
      setStockData(data);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Unexpected error:', error);
      // Since API service now handles all errors with fallback data,
      // this should rarely be reached
      alert('予期しないエラーが発生しました。ページを再読み込みして再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={styles.container} className="responsive-container">
        <header style={styles.header}>
          <h1 style={styles.headerTitle} className="responsive-header-title">📈 株価分析アプリ</h1>
        </header>
        
        <main style={styles.main}>
          <StockForm onSubmit={handleAnalyzeStock} loading={loading} />
          
          <div style={styles.resultsSection}>
            {loading && <LoadingSpinner />}
            
            {stockData && !loading && (
              <>
                {stockData.isUsingMockData && (
                  <div style={styles.mockDataNotice}>
                    ℹ️ デモ用データを表示しています。実際のAPIキーを設定すると、リアルタイムデータを取得できます。
                  </div>
                )}
                <StockInfo data={stockData} />
                <StockChart data={stockData} />
                {analysis && <AnalysisResults analysis={analysis} />}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;