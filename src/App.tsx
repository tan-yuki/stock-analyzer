import React, { useState } from 'react';
import { StockForm } from './components/StockForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StockInfo } from './components/StockInfo';
import { StockChart } from './components/StockChart';
import { AnalysisResults } from './components/AnalysisResults';
import { generateMockStockData } from './utils/stockDataGenerator';
import { calculateStockAnalysis } from './utils/stockAnalysis';
import { StockData, StockAnalysis, StockFormData } from './types';
import './style.css';

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockStockData(formData.symbol, formData.period);
      const analysisResult = calculateStockAnalysis(data.prices);
      
      setStockData(data);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error:', error);
      alert('データの取得に失敗しました。銘柄コードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>📈 株価分析アプリ</h1>
      </header>
      
      <main>
        <StockForm onSubmit={handleAnalyzeStock} loading={loading} />
        
        <div className="results-section">
          {loading && <LoadingSpinner />}
          
          {stockData && !loading && (
            <>
              <StockInfo data={stockData} />
              <StockChart data={stockData} />
              {analysis && <AnalysisResults analysis={analysis} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;