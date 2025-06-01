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
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'TSLA': 'Tesla Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'GOOG': 'Alphabet Inc.',
    'NFLX': 'Netflix Inc.',
    'ADBE': 'Adobe Inc.'
  };

  async fetchStockData(symbol: string, period: TimePeriod): Promise<StockData> {
    try {
      // Check if we're using demo key and show warning
      if (this.ALPHA_VANTAGE_API_KEY === 'demo') {
        console.warn('Using demo API key. For production use, get a free API key from Alpha Vantage.');
      }

      // Fetch company information and price data concurrently for better performance
      const [companyName, priceData] = await Promise.all([
        this.fetchCompanyName(symbol),
        this.fetchPriceData(symbol)
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
        previousPrice
      };
    } catch (error) {
      console.error('API fetch failed, falling back to mock data:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error('APIの利用制限に達しました。しばらく待ってから再試行してください。');
      }
      
      // Check if it's an invalid symbol error
      if (error instanceof Error && error.message.includes('Invalid API')) {
        throw new Error('無効な銘柄コードです。正しい銘柄コードを入力してください。');
      }
      
      // Fallback to mock data for demo purposes
      console.log('Falling back to mock data for demonstration');
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
      
      // Fallback to predefined company names
      return this.COMPANY_NAMES[symbol] || `${symbol} Corporation`;
    } catch (error) {
      console.error('Failed to fetch company name:', error);
      return this.COMPANY_NAMES[symbol] || `${symbol} Corporation`;
    }
  }

  private async fetchPriceData(symbol: string): Promise<StockPrice[]> {
    const url = `${this.ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: any = await response.json();
    
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
      .forEach(([dateString, priceInfo]: [string, any]) => {
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

    return {
      symbol,
      companyName: this.COMPANY_NAMES[symbol] || `${symbol} Corporation`,
      prices,
      currentPrice: prices[prices.length - 1].price,
      previousPrice: prices[prices.length - 2]?.price || prices[prices.length - 1].price
    };
  }
}

export const stockApiService = new StockApiService();