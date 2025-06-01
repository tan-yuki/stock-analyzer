import { StockPrice, StockData, StockAnalysis } from '../types'

export const mockStockPrices: StockPrice[] = [
  { date: new Date('2024-01-01'), price: 150.00 },
  { date: new Date('2024-01-02'), price: 152.50 },
  { date: new Date('2024-01-03'), price: 148.75 },
  { date: new Date('2024-01-04'), price: 151.25 },
  { date: new Date('2024-01-05'), price: 155.00 },
  { date: new Date('2024-01-08'), price: 153.75 },
  { date: new Date('2024-01-09'), price: 157.25 },
  { date: new Date('2024-01-10'), price: 159.50 },
]

export const mockStockData: StockData = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  prices: mockStockPrices,
  currentPrice: 159.50,
  previousPrice: 157.25,
}

export const mockStockAnalysis: StockAnalysis = {
  max: 159.50,
  min: 148.75,
  average: 153.46875,
  volatility: 12.34,
  totalReturn: 6.33,
}

export const mockAlphaVantageResponse = {
  'Meta Data': {
    '1. Information': 'Daily Prices (open, high, low, close) and Volumes',
    '2. Symbol': 'AAPL',
    '3. Last Refreshed': '2024-01-10',
    '4. Output Size': 'Compact',
    '5. Time Zone': 'US/Eastern',
  },
  'Time Series (Daily)': {
    '2024-01-10': {
      '1. open': '158.0000',
      '2. high': '160.0000',
      '3. low': '157.0000',
      '4. close': '159.5000',
      '5. volume': '50000000',
    },
    '2024-01-09': {
      '1. open': '156.0000',
      '2. high': '158.0000',
      '3. low': '155.0000',
      '4. close': '157.2500',
      '5. volume': '45000000',
    },
    '2024-01-08': {
      '1. open': '154.0000',
      '2. high': '156.0000',
      '3. low': '153.0000',
      '4. close': '153.7500',
      '5. volume': '42000000',
    },
  },
}

export const mockCompanyOverview = {
  Symbol: 'AAPL',
  Name: 'Apple Inc.',
  Description: 'Apple Inc. designs, manufactures, and markets smartphones...',
  Exchange: 'NASDAQ',
  Currency: 'USD',
}

export const createMockStockPrice = (overrides: Partial<StockPrice> = {}): StockPrice => ({
  date: new Date('2024-01-01'),
  price: 100.00,
  ...overrides,
})

export const createMockStockData = (overrides: Partial<StockData> = {}): StockData => ({
  symbol: 'TEST',
  companyName: 'Test Company Inc.',
  prices: [createMockStockPrice()],
  currentPrice: 100.00,
  previousPrice: 95.00,
  ...overrides,
})