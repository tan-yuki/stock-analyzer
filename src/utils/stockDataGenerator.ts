import { StockData, StockPrice, CompanyInfo, TimePeriod } from '../types';

const COMPANIES: Record<string, CompanyInfo> = {
  'AAPL': { name: 'Apple Inc.', basePrice: 150 },
  'GOOGL': { name: 'Alphabet Inc.', basePrice: 2800 },
  'TSLA': { name: 'Tesla Inc.', basePrice: 800 },
  'MSFT': { name: 'Microsoft Corporation', basePrice: 330 },
  'AMZN': { name: 'Amazon.com Inc.', basePrice: 3300 },
  'NVDA': { name: 'NVIDIA Corporation', basePrice: 220 },
  'META': { name: 'Meta Platforms Inc.', basePrice: 320 }
};

export const generateMockStockData = (symbol: string, period: TimePeriod): StockData => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch(period) {
    case '1mo': startDate.setMonth(endDate.getMonth() - 1); break;
    case '3mo': startDate.setMonth(endDate.getMonth() - 3); break;
    case '6mo': startDate.setMonth(endDate.getMonth() - 6); break;
    case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
    case '2y': startDate.setFullYear(endDate.getFullYear() - 2); break;
  }

  const company = COMPANIES[symbol] || { name: `${symbol} Corporation`, basePrice: 100 };
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const prices: StockPrice[] = [];
  
  let currentPrice = company.basePrice;
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const change = (Math.random() - 0.5) * 0.05;
      currentPrice = currentPrice * (1 + change);
      
      prices.push({
        date: new Date(currentDate),
        price: parseFloat(currentPrice.toFixed(2))
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    symbol,
    companyName: company.name,
    prices,
    currentPrice: prices[prices.length - 1].price,
    previousPrice: prices[prices.length - 2]?.price || prices[prices.length - 1].price
  };
};