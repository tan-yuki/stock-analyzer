export interface StockPrice {
  date: Date;
  price: number;
}

export interface StockData {
  symbol: string;
  companyName: string;
  prices: StockPrice[];
  currentPrice: number;
  previousPrice: number;
  isUsingMockData?: boolean;
}

export interface StockAnalysis {
  max: number;
  min: number;
  average: number;
  volatility: number;
  totalReturn: number;
}

export interface CompanyInfo {
  name: string;
  basePrice: number;
}

export type TimePeriod = '1mo' | '3mo' | '6mo' | '1y' | '2y';

export interface StockFormData {
  symbol: string;
  period: TimePeriod;
}

// ウォッチリスト関連の型定義
export interface WatchlistItem {
  symbol: string;
  companyName: string;
  addedAt: Date;
  lastPrice?: number;
  priceChange?: number;
}

export interface Watchlist {
  items: WatchlistItem[];
  lastUpdated: Date;
}