import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockCompanyOverview } from './mockData'
import { createDeterministicStockData } from './deterministicMockData'

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// 確定的なデータ生成ヘルパー（Flakyテスト防止）
const generateDeterministicTimeSeriesData = (period: string, symbol: string = 'AAPL') => {
  const deterministicData = createDeterministicStockData(symbol, period)
  const timeSeries: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }> = {}
  
  deterministicData.forEach(price => {
    const dateStr = price.date.toISOString().split('T')[0]
    timeSeries[dateStr] = {
      '1. open': price.price.toFixed(2),
      '2. high': (price.price * 1.02).toFixed(2),
      '3. low': (price.price * 0.98).toFixed(2),
      '4. close': price.price.toFixed(2),
      '5. volume': '1000000'
    }
  })
  
  return {
    'Meta Data': {
      '1. Information': 'Daily Prices (open, high, low, close) and Volumes',
      '2. Symbol': symbol,
      '3. Last Refreshed': '2025-06-01', // 固定日付
      '4. Output Size': 'Compact',
      '5. Time Zone': 'US/Eastern'
    },
    'Time Series (Daily)': timeSeries
  }
}

export const handlers = [
  // 株価データ取得のモック
  http.get(ALPHA_VANTAGE_BASE_URL, ({ request }) => {
    const url = new URL(request.url)
    const func = url.searchParams.get('function')
    const symbol = url.searchParams.get('symbol')
    const outputsize = url.searchParams.get('outputsize')

    if (func === 'TIME_SERIES_DAILY') {
      if (symbol === 'INVALID') {
        return HttpResponse.json({
          'Error Message': 'Invalid API call. Please retry or visit the documentation'
        })
      }
      
      if (symbol === 'RATELIMIT') {
        return HttpResponse.json({
          'Note': 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.'
        })
      }

      // 確定的なデータを生成 (outputsizeから推測)
      const period = outputsize === 'full' ? '2y' : '6mo'
      return HttpResponse.json(generateDeterministicTimeSeriesData(period, symbol || 'AAPL'))
    }

    if (func === 'OVERVIEW') {
      const companyData = {
        ...mockCompanyOverview,
        'Symbol': symbol,
        'Name': symbol === 'AAPL' ? 'Apple Inc.' : `${symbol} Corporation`
      }
      return HttpResponse.json(companyData)
    }

    return HttpResponse.json({ error: 'Unknown function' }, { status: 400 })
  }),

  // ネットワークエラーのモック
  http.get(`${ALPHA_VANTAGE_BASE_URL}/network-error`, () => {
    return HttpResponse.error()
  }),
]

export const server = setupServer(...handlers)