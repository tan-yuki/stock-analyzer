import { StockData, StockPrice, CompanyInfo, TimePeriod } from '../types';

const COMPANIES: Record<string, CompanyInfo> = {
  // US Stocks
  'AAPL': { name: 'Apple Inc.', basePrice: 150 },
  'GOOGL': { name: 'Alphabet Inc.', basePrice: 2800 },
  'TSLA': { name: 'Tesla Inc.', basePrice: 800 },
  'MSFT': { name: 'Microsoft Corporation', basePrice: 330 },
  'AMZN': { name: 'Amazon.com Inc.', basePrice: 3300 },
  'NVDA': { name: 'NVIDIA Corporation', basePrice: 220 },
  'META': { name: 'Meta Platforms Inc.', basePrice: 320 },
  // Japanese Stocks (with .T suffix)
  '7203.T': { name: 'トヨタ自動車株式会社', basePrice: 2400 },
  '9984.T': { name: 'ソフトバンクグループ株式会社', basePrice: 5100 },
  '7974.T': { name: '任天堂株式会社', basePrice: 5800 },
  '6758.T': { name: 'ソニーグループ株式会社', basePrice: 11500 },
  '9983.T': { name: 'ファーストリテイリング', basePrice: 8400 },
  '6861.T': { name: 'キーエンス', basePrice: 46000 },
  '4519.T': { name: '中外製薬', basePrice: 3600 },
  '7267.T': { name: 'ホンダ', basePrice: 2800 },
  '6954.T': { name: 'ファナック', basePrice: 20000 },
  '8306.T': { name: '三菱UFJフィナンシャル・グループ', basePrice: 850 },
  // Japanese Stocks (without .T suffix for convenience)
  '7203': { name: 'トヨタ自動車株式会社', basePrice: 2400 },
  '9984': { name: 'ソフトバンクグループ株式会社', basePrice: 5100 },
  '7974': { name: '任天堂株式会社', basePrice: 5800 },
  '6758': { name: 'ソニーグループ株式会社', basePrice: 11500 },
  '9983': { name: 'ファーストリテイリング', basePrice: 8400 },
  '6861': { name: 'キーエンス', basePrice: 46000 },
  '4519': { name: '中外製薬', basePrice: 3600 },
  '7267': { name: 'ホンダ', basePrice: 2800 },
  '6954': { name: 'ファナック', basePrice: 20000 },
  '8306': { name: '三菱UFJフィナンシャル・グループ', basePrice: 850 }
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