import { StockPrice, StockData, TimePeriod } from '../types';

// API response interface for type safety (used implicitly in API calls)

interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
}

class StockApiService {
  private readonly ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
  private readonly ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
  
  // Fallback company names for when API doesn't provide them
  private readonly COMPANY_NAMES: Record<string, string> = {
    // US Stocks
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'TSLA': 'Tesla Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'GOOG': 'Alphabet Inc.',
    'NFLX': 'Netflix Inc.',
    'ADBE': 'Adobe Inc.',
    // Japanese Stocks (with .T suffix)
    '7203.T': 'トヨタ自動車株式会社',
    '9984.T': 'ソフトバンクグループ株式会社',
    '7974.T': '任天堂株式会社',
    '6758.T': 'ソニーグループ株式会社',
    '9983.T': 'ファーストリテイリング',
    '6861.T': 'キーエンス',
    '4519.T': '中外製薬',
    '7267.T': 'ホンダ',
    '6954.T': 'ファナック',
    '8306.T': '三菱UFJフィナンシャル・グループ',
    // Japanese Stocks (without .T suffix for convenience)
    '7203': 'トヨタ自動車株式会社',
    '9984': 'ソフトバンクグループ株式会社',
    '7974': '任天堂株式会社',
    '6758': 'ソニーグループ株式会社',
    '9983': 'ファーストリテイリング',
    '6861': 'キーエンス',
    '4519': '中外製薬',
    '7267': 'ホンダ',
    '6954': 'ファナック',
    '8306': '三菱UFJフィナンシャル・グループ'
  };

  // Normalize symbol for API calls (add .T suffix for Japanese stocks)
  private normalizeSymbol(symbol: string): string {
    const cleanSymbol = symbol.trim().toUpperCase();
    
    // If already has .T suffix, return as is
    if (cleanSymbol.endsWith('.T')) {
      return cleanSymbol;
    }
    
    // Check if it's a Japanese stock code (4-digit number)
    if (/^\d{4}$/.test(cleanSymbol)) {
      return `${cleanSymbol}.T`;
    }
    
    // Return as is for US stocks and other formats
    return cleanSymbol;
  }

  async fetchStockData(symbol: string, period: TimePeriod): Promise<StockData> {
    try {
      // Check if we're using demo key and show warning
      if (this.ALPHA_VANTAGE_API_KEY === 'demo') {
        console.warn('Using demo API key. For production use, get a free API key from Alpha Vantage.');
      }

      // Normalize symbol for API calls (add .T suffix for Japanese stocks if needed)
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Fetch company information and price data concurrently for better performance
      const [companyName, priceData] = await Promise.all([
        this.fetchCompanyName(normalizedSymbol),
        this.fetchPriceData(normalizedSymbol)
      ]);
      
      // Filter data based on period
      const filteredPrices = this.filterPricesByPeriod(priceData, period);
      
      if (filteredPrices.length === 0) {
        throw new Error('No price data available for the selected period');
      }

      const currentPrice = filteredPrices[filteredPrices.length - 1].price;
      const previousPrice = filteredPrices[filteredPrices.length - 2]?.price || currentPrice;

      return {
        symbol,
        companyName,
        prices: filteredPrices,
        currentPrice,
        previousPrice,
        isUsingMockData: false
      };
    } catch (error) {
      console.error('API fetch failed, falling back to mock data:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.warn('Rate limit reached, using mock data for demonstration');
        return this.generateFallbackData(symbol, period);
      }
      
      // For Japanese stocks or unknown symbols, always fallback to mock data
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const isJapaneseStock = /^\d{4}\.T$/.test(normalizedSymbol);
      
      if (isJapaneseStock) {
        console.log(`Japanese stock ${symbol} - using mock data for demonstration`);
        return this.generateFallbackData(symbol, period);
      }
      
      // Check if it's an invalid symbol error for US stocks
      if (error instanceof Error && error.message.includes('Invalid API')) {
        console.log(`Invalid symbol ${symbol} - using mock data for demonstration`);
        return this.generateFallbackData(symbol, period);
      }
      
      // Fallback to mock data for demo purposes in all other cases
      console.log('Using mock data for demonstration');
      return this.generateFallbackData(symbol, period);
    }
  }

  private async fetchCompanyName(symbol: string): Promise<string> {
    try {
      const url = `${this.ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CompanyOverview = await response.json();
      
      if (data.Name && data.Name !== '') {
        return data.Name;
      }
      
      // Fallback to predefined company names (try both original and without .T suffix)
      const originalSymbol = symbol.replace('.T', '');
      return this.COMPANY_NAMES[symbol] || 
             this.COMPANY_NAMES[originalSymbol] || 
             `${symbol} Corporation`;
    } catch (error) {
      console.error('Failed to fetch company name:', error);
      const originalSymbol = symbol.replace('.T', '');
      return this.COMPANY_NAMES[symbol] || 
             this.COMPANY_NAMES[originalSymbol] || 
             `${symbol} Corporation`;
    }
  }

  private async fetchPriceData(symbol: string): Promise<StockPrice[]> {
    const url = `${this.ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: {
      'Error Message'?: string;
      'Note'?: string;
      'Time Series (Daily)'?: Record<string, {
        '4. close': string;
        [key: string]: string;
      }>;
    } = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      throw new Error('Invalid API call or invalid symbol');
    }
    
    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    if (!data['Time Series (Daily)']) {
      throw new Error('Invalid API response or no data available');
    }
    
    const timeSeries = data['Time Series (Daily)'];
    const prices: StockPrice[] = [];
    
    Object.entries(timeSeries)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .forEach(([dateString, priceInfo]: [string, { '4. close': string; [key: string]: string }]) => {
        const closePrice = parseFloat(priceInfo['4. close']);
        if (!isNaN(closePrice)) {
          prices.push({
            date: new Date(dateString),
            price: closePrice
          });
        }
      });
    
    if (prices.length === 0) {
      throw new Error('No valid price data found');
    }
    
    return prices;
  }

  private filterPricesByPeriod(prices: StockPrice[], period: TimePeriod): StockPrice[] {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '1mo': startDate.setMonth(endDate.getMonth() - 1); break;
      case '3mo': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6mo': startDate.setMonth(endDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      case '2y': startDate.setFullYear(endDate.getFullYear() - 2); break;
    }
    
    return prices.filter(price => price.date >= startDate && price.date <= endDate);
  }

  private generateFallbackData(symbol: string, period: TimePeriod): StockData {
    // Fallback to mock data generation
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '1mo': startDate.setMonth(endDate.getMonth() - 1); break;
      case '3mo': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6mo': startDate.setMonth(endDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      case '2y': startDate.setFullYear(endDate.getFullYear() - 2); break;
    }

    const basePrice = 100 + Math.random() * 200; // Random base price between 100-300
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prices: StockPrice[] = [];
    
    let currentPrice = basePrice;
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

    // Try to get company name with both original symbol and normalized symbol
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const companyName = this.COMPANY_NAMES[symbol] || 
                       this.COMPANY_NAMES[normalizedSymbol] || 
                       `${symbol} Corporation`;

    return {
      symbol,
      companyName,
      prices,
      currentPrice: prices[prices.length - 1].price,
      previousPrice: prices[prices.length - 2]?.price || prices[prices.length - 1].price,
      isUsingMockData: true
    };
  }
}

export const stockApiService = new StockApiService();