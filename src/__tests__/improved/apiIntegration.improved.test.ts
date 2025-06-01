import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { stockApiService } from '../../services/stockApiService'
import { server } from '../../test-utils/testServer'
import { http, HttpResponse } from 'msw'
import { createDeterministicStockData } from '../../test-utils/deterministicMockData'
import { withTimeout, retryOperation } from '../../test-utils/asyncTestHelpers'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('改善されたAPI統合テスト', () => {
  
  it('確定的なAPI応答処理', async () => {
    // 確定的なレスポンスを設定
    server.use(
      http.get('https://www.alphavantage.co/query', ({ request }) => {
        const url = new URL(request.url)
        const func = url.searchParams.get('function')
        const symbol = url.searchParams.get('symbol')

        if (func === 'TIME_SERIES_DAILY' && symbol === 'AAPL') {
          const deterministicData = createDeterministicStockData('AAPL', '1mo')
          return HttpResponse.json({
            'Meta Data': {
              '2. Symbol': 'AAPL',
              '3. Last Refreshed': '2025-06-01'
            },
            'Time Series (Daily)': deterministicData.reduce((acc, price) => {
              const dateStr = price.date.toISOString().split('T')[0]
              acc[dateStr] = {
                '4. close': price.price.toFixed(2)
              }
              return acc
            }, {} as Record<string, any>)
          })
        }

        if (func === 'OVERVIEW' && symbol === 'AAPL') {
          return HttpResponse.json({
            'Symbol': 'AAPL',
            'Name': 'Apple Inc.'
          })
        }

        return HttpResponse.json({ error: 'Unknown' }, { status: 400 })
      })
    )

    const result = await withTimeout(
      stockApiService.fetchStockData('AAPL', '1mo'),
      5000,
      'API call timed out'
    )

    // 確定的な結果の検証
    expect(result.symbol).toBe('AAPL')
    expect(result.companyName).toBe('Apple Inc.')
    expect(result.prices.length).toBeGreaterThan(0)
    
    // 確定的なデータに基づく価格検証
    expect(result.currentPrice).toBeGreaterThan(0)
    expect(result.previousPrice).toBeGreaterThan(0)
  })

  it('ネットワーク障害の確実なシミュレーション', async () => {
    // ネットワークエラーを確実に発生させる
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('Controlled network error'))

    try {
      const result = await retryOperation(
        () => stockApiService.fetchStockData('AAPL', '1mo'),
        1, // リトライなし
        0
      )

      // フォールバックデータが返されることを確認
      expect(result.symbol).toBe('AAPL')
      expect(result.companyName).toBe('Apple Inc.')
      expect(result.prices.length).toBeGreaterThan(0)
    } finally {
      global.fetch = originalFetch
    }
  })

  it('期間フィルタリングの確定的テスト', async () => {
    const testCases = [
      { period: '1mo', expectedMinDays: 20, expectedMaxDays: 25 },
      { period: '3mo', expectedMinDays: 60, expectedMaxDays: 70 },
    ] as const

    for (const testCase of testCases) {
      server.use(
        http.get('https://www.alphavantage.co/query', ({ request }) => {
          const url = new URL(request.url)
          const func = url.searchParams.get('function')

          if (func === 'TIME_SERIES_DAILY') {
            const deterministicData = createDeterministicStockData('AAPL', testCase.period)
            return HttpResponse.json({
              'Meta Data': { '2. Symbol': 'AAPL' },
              'Time Series (Daily)': deterministicData.reduce((acc, price) => {
                const dateStr = price.date.toISOString().split('T')[0]
                acc[dateStr] = { '4. close': price.price.toFixed(2) }
                return acc
              }, {} as Record<string, any>)
            })
          }

          return HttpResponse.json({
            'Symbol': 'AAPL',
            'Name': 'Apple Inc.'
          })
        })
      )

      const result = await stockApiService.fetchStockData('AAPL', testCase.period)
      
      expect(result.prices.length).toBeGreaterThanOrEqual(testCase.expectedMinDays)
      expect(result.prices.length).toBeLessThanOrEqual(testCase.expectedMaxDays)
    }
  })

  it('並行API呼び出しの順序保証', async () => {
    const callOrder: string[] = []
    
    server.use(
      http.get('https://www.alphavantage.co/query', ({ request }) => {
        const url = new URL(request.url)
        const symbol = url.searchParams.get('symbol')
        const func = url.searchParams.get('function')
        
        if (func === 'TIME_SERIES_DAILY') {
          callOrder.push(`${symbol}-TIME_SERIES`)
          const deterministicData = createDeterministicStockData(symbol || 'UNKNOWN', '1mo')
          return HttpResponse.json({
            'Meta Data': { '2. Symbol': symbol },
            'Time Series (Daily)': deterministicData.reduce((acc, price) => {
              const dateStr = price.date.toISOString().split('T')[0]
              acc[dateStr] = { '4. close': price.price.toFixed(2) }
              return acc
            }, {} as Record<string, any>)
          })
        }

        if (func === 'OVERVIEW') {
          callOrder.push(`${symbol}-OVERVIEW`)
          return HttpResponse.json({
            'Symbol': symbol,
            'Name': `${symbol} Corporation`
          })
        }

        return HttpResponse.json({}, { status: 400 })
      })
    )

    const symbols = ['AAPL', 'GOOGL']
    const results = await Promise.all(
      symbols.map(symbol => stockApiService.fetchStockData(symbol, '1mo'))
    )

    // 結果の順序と内容を確認
    expect(results).toHaveLength(2)
    expect(results[0].symbol).toBe('AAPL')
    expect(results[1].symbol).toBe('GOOGL')

    // API呼び出しが期待通りに発生したことを確認
    expect(callOrder.filter(call => call.includes('AAPL'))).toHaveLength(2)
    expect(callOrder.filter(call => call.includes('GOOGL'))).toHaveLength(2)
  })
})