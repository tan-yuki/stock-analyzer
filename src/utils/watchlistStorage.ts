import { Watchlist, WatchlistItem } from '../types';

const WATCHLIST_STORAGE_KEY = 'stock-analyzer-watchlist';

/**
 * ウォッチリストをlocalStorageから読み込み
 */
export const loadWatchlist = (): Watchlist => {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      return {
        items: [],
        lastUpdated: new Date()
      };
    }
    
    const parsed = JSON.parse(stored);
    return {
      items: parsed.items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      })),
      lastUpdated: new Date(parsed.lastUpdated)
    };
  } catch (error) {
    console.error('ウォッチリストの読み込みに失敗しました:', error);
    return {
      items: [],
      lastUpdated: new Date()
    };
  }
};

/**
 * ウォッチリストをlocalStorageに保存
 */
export const saveWatchlist = (watchlist: Watchlist): void => {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('ウォッチリストの保存に失敗しました:', error);
  }
};

/**
 * ウォッチリストに銘柄を追加
 */
export const addToWatchlist = (symbol: string, companyName: string): Watchlist => {
  const currentWatchlist = loadWatchlist();
  
  // 既に存在する場合は追加しない
  const exists = currentWatchlist.items.some(item => item.symbol === symbol);
  if (exists) {
    return currentWatchlist;
  }
  
  const newItem: WatchlistItem = {
    symbol: symbol.toUpperCase(),
    companyName,
    addedAt: new Date()
  };
  
  const updatedWatchlist: Watchlist = {
    items: [...currentWatchlist.items, newItem],
    lastUpdated: new Date()
  };
  
  saveWatchlist(updatedWatchlist);
  return updatedWatchlist;
};

/**
 * ウォッチリストから銘柄を削除
 */
export const removeFromWatchlist = (symbol: string): Watchlist => {
  const currentWatchlist = loadWatchlist();
  
  const updatedWatchlist: Watchlist = {
    items: currentWatchlist.items.filter(item => item.symbol !== symbol.toUpperCase()),
    lastUpdated: new Date()
  };
  
  saveWatchlist(updatedWatchlist);
  return updatedWatchlist;
};

/**
 * ウォッチリストに銘柄が含まれているかチェック
 */
export const isInWatchlist = (symbol: string): boolean => {
  const watchlist = loadWatchlist();
  return watchlist.items.some(item => item.symbol === symbol.toUpperCase());
};

/**
 * ウォッチリストアイテムの価格情報を更新
 */
export const updateWatchlistItemPrice = (symbol: string, lastPrice: number, priceChange: number): void => {
  const currentWatchlist = loadWatchlist();
  
  const updatedItems = currentWatchlist.items.map(item => {
    if (item.symbol === symbol.toUpperCase()) {
      return {
        ...item,
        lastPrice,
        priceChange
      };
    }
    return item;
  });
  
  const updatedWatchlist: Watchlist = {
    items: updatedItems,
    lastUpdated: new Date()
  };
  
  saveWatchlist(updatedWatchlist);
};