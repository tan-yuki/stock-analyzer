import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadWatchlist,
  saveWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  updateWatchlistItemPrice
} from './watchlistStorage';
import { Watchlist, WatchlistItem } from '../types';

// localStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('watchlistStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadWatchlist', () => {
    it('localStorageが空の場合は空のウォッチリストを返す', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = loadWatchlist();
      
      expect(result.items).toEqual([]);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('保存されたウォッチリストを正しく読み込む', () => {
      const mockData = {
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: '2024-01-01T00:00:00Z',
            lastPrice: 150.0,
            priceChange: 5.0
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const result = loadWatchlist();
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].symbol).toBe('AAPL');
      expect(result.items[0].addedAt).toBeInstanceOf(Date);
    });

    it('無効なJSONの場合は空のウォッチリストを返す', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = loadWatchlist();
      
      expect(result.items).toEqual([]);
    });
  });

  describe('saveWatchlist', () => {
    it('ウォッチリストをlocalStorageに保存する', () => {
      const watchlist: Watchlist = {
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: new Date('2024-01-01'),
          }
        ],
        lastUpdated: new Date('2024-01-01')
      };
      
      saveWatchlist(watchlist);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stock-analyzer-watchlist',
        JSON.stringify(watchlist)
      );
    });
  });

  describe('addToWatchlist', () => {
    beforeEach(() => {
      // 空のウォッチリストをモック
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        items: [],
        lastUpdated: '2024-01-01T00:00:00Z'
      }));
    });

    it('新しい銘柄をウォッチリストに追加する', () => {
      const result = addToWatchlist('AAPL', 'Apple Inc.');
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].symbol).toBe('AAPL');
      expect(result.items[0].companyName).toBe('Apple Inc.');
      expect(result.items[0].addedAt).toBeInstanceOf(Date);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('銘柄コードを大文字に変換する', () => {
      const result = addToWatchlist('aapl', 'Apple Inc.');
      
      expect(result.items[0].symbol).toBe('AAPL');
    });

    it('既に存在する銘柄は追加しない', () => {
      // 既にAAPLが存在するウォッチリストをモック
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: '2024-01-01T00:00:00Z'
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      }));
      
      const result = addToWatchlist('AAPL', 'Apple Inc.');
      
      expect(result.items).toHaveLength(1);
    });
  });

  describe('removeFromWatchlist', () => {
    beforeEach(() => {
      // AAPLとGOOGLが存在するウォッチリストをモック
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: '2024-01-01T00:00:00Z'
          },
          {
            symbol: 'GOOGL',
            companyName: 'Alphabet Inc.',
            addedAt: '2024-01-01T00:00:00Z'
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      }));
    });

    it('指定した銘柄をウォッチリストから削除する', () => {
      const result = removeFromWatchlist('AAPL');
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].symbol).toBe('GOOGL');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('存在しない銘柄を削除しようとしても何も起こらない', () => {
      const result = removeFromWatchlist('TSLA');
      
      expect(result.items).toHaveLength(2);
    });
  });

  describe('isInWatchlist', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: '2024-01-01T00:00:00Z'
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      }));
    });

    it('ウォッチリストに存在する銘柄に対してtrueを返す', () => {
      expect(isInWatchlist('AAPL')).toBe(true);
      expect(isInWatchlist('aapl')).toBe(true); // 大文字小文字を区別しない
    });

    it('ウォッチリストに存在しない銘柄に対してfalseを返す', () => {
      expect(isInWatchlist('GOOGL')).toBe(false);
    });
  });

  describe('updateWatchlistItemPrice', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        items: [
          {
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            addedAt: '2024-01-01T00:00:00Z'
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      }));
    });

    it('指定した銘柄の価格情報を更新する', () => {
      updateWatchlistItemPrice('AAPL', 155.0, 5.0);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      
      expect(savedData.items[0].lastPrice).toBe(155.0);
      expect(savedData.items[0].priceChange).toBe(5.0);
    });

    it('存在しない銘柄の価格更新では何も起こらない', () => {
      updateWatchlistItemPrice('GOOGL', 100.0, 1.0);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      
      // AAPLの価格情報は変更されていない
      expect(savedData.items[0].lastPrice).toBeUndefined();
    });
  });
});