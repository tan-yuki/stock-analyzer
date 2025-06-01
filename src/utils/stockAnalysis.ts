import { StockPrice, StockAnalysis } from '../types';

export const calculateStockAnalysis = (prices: StockPrice[]): StockAnalysis => {
  if (prices.length === 0) {
    throw new Error('Price data cannot be empty');
  }

  const priceValues = prices.map(p => p.price);
  const max = Math.max(...priceValues);
  const min = Math.min(...priceValues);
  const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
  
  const returns: number[] = [];
  for (let i = 1; i < priceValues.length; i++) {
    returns.push((priceValues[i] - priceValues[i-1]) / priceValues[i-1]);
  }
  
  let volatility = 0;
  if (returns.length > 0) {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    volatility = Math.sqrt(variance * 252) * 100;
  }
  
  const totalReturn = priceValues.length > 1 
    ? ((priceValues[priceValues.length - 1] - priceValues[0]) / priceValues[0]) * 100
    : 0;
  
  return { max, min, average, volatility, totalReturn };
};