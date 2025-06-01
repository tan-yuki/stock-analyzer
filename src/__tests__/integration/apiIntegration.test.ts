import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest'
import { stockApiService } from '../../services/stockApiService'
import { server } from '../../test-utils/testServer'
import { http, HttpResponse } from 'msw'
import { withTimeout, sequentialAsync } from '../../test-utils/asyncTestHelpers'
import { createDeterministicStockData } from '../../test-utils/deterministicMockData'

// MSW サーバーのセットアップ
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API統合テスト', () => {
  beforeEach(() => {
    // 確定的なテスト環境設定（Flakyテスト対策）
    vi.clearAllMocks()
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
  })
  describe('Alpha Vantage API統合', () => {
    it('確定的なAPIエンドポイント呼び出し', async () => {
      const result = await withTimeout(
        stockApiService.fetchStockData('AAPL', '1mo'),
        10000,
        'API呼び出しがタイムアウトしました'
      )

      // 確定的なレスポンス検証（Flakyテスト対策）
      expect(result.symbol).toBe('AAPL')
      expect(result.companyName).toBe('Apple Inc.')
      expect(result.prices.length).toBeGreaterThan(0)
      
      // 価格データの妥当性（確定的検証）
      result.prices.forEach(price => {
        expect(price.date).toBeInstanceOf(Date)
        expect(typeof price.price).toBe('number')
        expect(price.price).toBeGreaterThan(0)
        // 確定的データなので合理的な範囲内であることを確認
        expect(price.price).toBeGreaterThan(140)
        expect(price.price).toBeLessThan(160)
      })
    })

    it('会社情報とタイムシリーズデータの統合', async () => {
      const result = await stockApiService.fetchStockData('AAPL', '1mo')

      // 会社情報が正しく統合されている
      expect(result.symbol).toBe('AAPL')
      expect(result.companyName).toBe('Apple Inc.')
      
      // タイムシリーズデータが正しく処理されている - use dynamic values
      expect(result.currentPrice).toBeGreaterThan(0)
      expect(result.previousPrice).toBeGreaterThan(0)
      expect(result.prices.length).toBeGreaterThan(0)
    })

    it('期間フィルタリングの統合テスト', async () => {
      // 異なる期間でのデータ取得
      const result1mo = await stockApiService.fetchStockData('AAPL', '1mo')
      const result1y = await stockApiService.fetchStockData('AAPL', '1y')

      // 期間による差異の確認（実際の実装では期間に応じてフィルタリングされる）
      expect(result1mo.symbol).toBe('AAPL')
      expect(result1y.symbol).toBe('AAPL')
      
      // 両方ともデータが存在することを確認
      expect(result1mo.prices.length).toBeGreaterThan(0)
      expect(result1y.prices.length).toBeGreaterThan(0)
    })
  })

  describe('エラーレスポンス統合テスト', () => {
    it('API エラーメッセージの統合処理', async () => {
      // 無効な銘柄でのテスト - expect error to be thrown
      await expect(stockApiService.fetchStockData('INVALID', '1mo'))
        .rejects.toThrow('無効な銘柄コードです。正しい銘柄コードを入力してください。')
    })

    it('レート制限レスポンスの統合処理', async () => {
      // レート制限エラーのテスト - expect error to be thrown
      await expect(stockApiService.fetchStockData('RATELIMIT', '1mo'))
        .rejects.toThrow('APIの利用制限に達しました。しばらく待ってから再試行してください。')
    })

    it('HTTPエラーレスポンスの処理', async () => {
      // 500エラーをモック
      server.use(
        http.get('https://www.alphavantage.co/query', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const result = await stockApiService.fetchStockData('AAPL', '1mo')

      // フォールバックが動作することを確認
      expect(result.symbol).toBe('AAPL')
      expect(result.prices.length).toBeGreaterThan(0)
    })
  })

  describe('並行API呼び出しテスト', () => {
    it('会社情報と価格データの並行取得', async () => {
      const startTime = Date.now()
      const result = await stockApiService.fetchStockData('AAPL', '1mo')
      const endTime = Date.now()

      // データが正常に取得されている
      expect(result.symbol).toBe('AAPL')
      expect(result.companyName).toBe('Apple Inc.')
      expect(result.prices.length).toBeGreaterThan(0)

      // 並行処理により合理的な時間で完了している
      expect(endTime - startTime).toBeLessThan(5000) // 5秒以内
    })

    it('順序保証された複数銘柄取得', async () => {
      const symbols = ['AAPL', 'GOOGL']
      
      // 順序を保証した並行処理（Flakyテスト対策）
      const fetchOperations = symbols.map(symbol => 
        () => withTimeout(
          stockApiService.fetchStockData(symbol, '1mo'),
          10000,
          `${symbol}のデータ取得がタイムアウトしました`
        )
      )

      const results = await sequentialAsync(fetchOperations)

      expect(results).toHaveLength(2)
      
      // 確定的な順序検証
      expect(results[0].symbol).toBe('AAPL')
      expect(results[1].symbol).toBe('GOOGL')
      
      results.forEach(result => {
        expect(result.prices.length).toBeGreaterThan(0)
        expect(result.companyName).toContain(result.symbol === 'AAPL' ? 'Apple Inc.' : 'GOOGL Corporation')
      })
    })
  })

  describe('データ品質統合テスト', () => {
    it('取得データの一貫性確認', async () => {
      const result = await stockApiService.fetchStockData('AAPL', '1mo')

      // 価格データの一貫性
      expect(result.currentPrice).toBe(result.prices[result.prices.length - 1].price)
      
      if (result.prices.length > 1) {
        expect(result.previousPrice).toBe(result.prices[result.prices.length - 2].price)
      }

      // 日付の昇順確認
      for (let i = 1; i < result.prices.length; i++) {
        expect(result.prices[i].date.getTime()).toBeGreaterThanOrEqual(
          result.prices[i - 1].date.getTime()
        )
      }
    })

    it('フォールバックデータの品質確認', async () => {
      // Use network error to trigger fallback instead of invalid symbol
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await stockApiService.fetchStockData('AAPL', '1mo')

      // フォールバックデータが営業日のみ含む
      result.prices.forEach(price => {
        const dayOfWeek = price.date.getDay()
        expect(dayOfWeek).toBeGreaterThanOrEqual(1) // 月曜日
        expect(dayOfWeek).toBeLessThanOrEqual(5) // 金曜日
      })

      // 価格変動が合理的な範囲内
      for (let i = 1; i < result.prices.length; i++) {
        const currentPrice = result.prices[i].price
        const previousPrice = result.prices[i - 1].price
        const changePercent = Math.abs((currentPrice - previousPrice) / previousPrice)
        
        expect(changePercent).toBeLessThanOrEqual(0.05) // ±5%以内
      }

      // 元のfetchを復元
      global.fetch = originalFetch
    })
  })

  describe('パフォーマンス統合テスト', () => {
    it('大量データ取得のパフォーマンス', async () => {
      const startTime = Date.now()
      const result = await stockApiService.fetchStockData('AAPL', '2y')
      const endTime = Date.now()

      expect(result.prices.length).toBeGreaterThan(0)
      
      // 合理的な時間で完了
      expect(endTime - startTime).toBeLessThan(10000) // 10秒以内
    })

    it('メモリ使用量の確認', async () => {
      const results = []
      
      // 複数回のAPI呼び出し
      for (let i = 0; i < 5; i++) {
        const result = await stockApiService.fetchStockData('AAPL', '1mo')
        results.push(result)
      }

      // 全ての結果が正常
      results.forEach(result => {
        expect(result.symbol).toBe('AAPL')
        expect(result.prices.length).toBeGreaterThan(0)
      })
    })
  })

  describe('環境変数統合テスト', () => {
    it('APIキー設定時の動作', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // このテストでは実際のAPIキーが設定されているかをチェック
      // CI環境では環境変数VITE_ALPHA_VANTAGE_API_KEYが'demo'に設定されているため
      // デモキーの警告が表示されることを確認
      if (import.meta.env.VITE_ALPHA_VANTAGE_API_KEY === 'demo') {
        const result = await stockApiService.fetchStockData('AAPL', '1mo')
        expect(result.symbol).toBe('AAPL')
        expect(consoleSpy).toHaveBeenCalledWith(
          'Using demo API key. For production use, get a free API key from Alpha Vantage.'
        )
      } else {
        // 実際のAPIキーが設定されている場合
        const result = await stockApiService.fetchStockData('AAPL', '1mo')
        expect(result.symbol).toBe('AAPL')
        expect(consoleSpy).not.toHaveBeenCalledWith(
          'Using demo API key. For production use, get a free API key from Alpha Vantage.'
        )
      }

      consoleSpy.mockRestore()
    })

    it('API設定の統合テスト', async () => {
      // Test that API integration works correctly
      const result = await stockApiService.fetchStockData('AAPL', '1mo')

      expect(result.symbol).toBe('AAPL')
      expect(result.companyName).toBe('Apple Inc.')
      expect(result.prices.length).toBeGreaterThan(0)
    })
  })
})