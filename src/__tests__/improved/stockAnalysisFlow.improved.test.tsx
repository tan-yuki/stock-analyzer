import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils/renderWithProviders'
import userEvent from '@testing-library/user-event'
import { AppWithoutCSS as App } from '../../components/AppWithoutCSS'
import { server } from '../../test-utils/testServer'
import { http, HttpResponse } from 'msw'
import { createDeterministicStockData } from '../../test-utils/deterministicMockData'
import { waitForElementToAppear, waitForStateChange } from '../../test-utils/testHelpers'
import { withTimeout, sequentialAsync } from '../../test-utils/asyncTestHelpers'

// MSW サーバーのセットアップ
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('改善された株価分析フロー統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 確定的な日付を設定
    vi.setSystemTime(new Date('2025-06-01'))
  })

  it('確定的なデータでの正常分析フロー', async () => {
    // 確定的なMSWハンドラーを設定
    server.use(
      http.get('https://www.alphavantage.co/query', ({ request }) => {
        const url = new URL(request.url)
        const func = url.searchParams.get('function')
        const symbol = url.searchParams.get('symbol')

        if (func === 'TIME_SERIES_DAILY') {
          const deterministicData = createDeterministicStockData(symbol || 'AAPL', '3mo')
          return HttpResponse.json({
            'Meta Data': {
              '1. Information': 'Daily Prices',
              '2. Symbol': symbol,
              '3. Last Refreshed': '2025-06-01',
              '4. Output Size': 'Compact',
              '5. Time Zone': 'US/Eastern'
            },
            'Time Series (Daily)': deterministicData.reduce((acc, price) => {
              const dateStr = price.date.toISOString().split('T')[0]
              acc[dateStr] = {
                '1. open': price.price.toFixed(2),
                '2. high': (price.price * 1.02).toFixed(2),
                '3. low': (price.price * 0.98).toFixed(2),
                '4. close': price.price.toFixed(2),
                '5. volume': '1000000'
              }
              return acc
            }, {} as Record<string, any>)
          })
        }

        if (func === 'OVERVIEW') {
          return HttpResponse.json({
            'Symbol': symbol,
            'Name': symbol === 'AAPL' ? 'Apple Inc.' : `${symbol} Corporation`
          })
        }

        return HttpResponse.json({ error: 'Unknown function' }, { status: 400 })
      })
    )

    const user = userEvent.setup()
    render(<App />)

    // 1. 初期状態の確認
    expect(screen.getByText('📈 株価分析ツール')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '分析開始' })).toBeInTheDocument()

    // 2. フォーム入力
    const symbolInput = screen.getByLabelText('銘柄コード：')
    const periodSelect = screen.getByLabelText('期間：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.selectOptions(periodSelect, '3mo')

    // 3. フォーム送信と結果の確認
    await user.click(submitButton)

    // 4. 確定的な結果の検証
    await withTimeout(
      waitForElementToAppear(() => screen.queryByText(/Apple Inc\. \(AAPL\)/)),
      5000,
      'Apple Inc. text did not appear'
    )

    // 株価情報の表示確認（確定的データに基づく）
    expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    expect(document.querySelector('.current-price')).toBeInTheDocument()

    // チャートの表示確認
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

    // 分析結果の表示確認
    expect(screen.getByText('分析結果')).toBeInTheDocument()
    expect(screen.getByText('最高値：')).toBeInTheDocument()
    expect(screen.getByText('最安値：')).toBeInTheDocument()
    expect(screen.getByText('平均値：')).toBeInTheDocument()
    expect(screen.getByText('ボラティリティ：')).toBeInTheDocument()
    expect(screen.getByText('期間収益率：')).toBeInTheDocument()
  })

  it('順序を保証した複数回分析実行', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    // 最初の分析（AAPL）
    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    }, { timeout: 8000 })

    // 2回目の分析（GOOGL）
    await user.clear(symbolInput)
    await user.type(symbolInput, 'GOOGL')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/GOOGL Corporation \(GOOGL\)/)).toBeInTheDocument()
    }, { timeout: 8000 })
  }, 15000)

  it('エラー状態の確定的テスト', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'INVALID')
    await user.click(submitButton)

    // エラーメッセージが表示されることを確認（または成功してフォールバックデータが表示される）
    await waitFor(() => {
      const hasError = screen.queryByText(/無効な銘柄コードです/)
      const hasFallback = screen.queryByText(/INVALID Corporation \(INVALID\)/)
      expect(hasError || hasFallback).toBeTruthy()
    }, { timeout: 8000 })

    // エラー状態の確認
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  }, 12000)

  it('フォーム状態の確定的検証', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const periodSelect = screen.getByLabelText('期間：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    // 初期状態の確認
    expect(symbolInput).toBeEnabled()
    expect(periodSelect).toBeEnabled()
    expect(submitButton).toBeEnabled()

    // 分析実行
    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.click(submitButton)

    // 分析完了後の状態確認
    await waitForElementToAppear(() => 
      screen.queryByText(/Apple Inc\. \(AAPL\)/)
    )

    expect(symbolInput).toBeEnabled()
    expect(periodSelect).toBeEnabled()
    expect(submitButton).toBeEnabled()
  })

  it('チャートデータの構造確定的検証', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.click(submitButton)

    await waitForElementToAppear(() => screen.queryByTestId('mock-chart'))

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    // 確定的なデータ構造の検証
    expect(chartData.labels).toBeDefined()
    expect(Array.isArray(chartData.labels)).toBe(true)
    expect(chartData.labels.length).toBeGreaterThan(0)
    
    expect(chartData.datasets).toBeDefined()
    expect(Array.isArray(chartData.datasets)).toBe(true)
    expect(chartData.datasets[0].data.length).toBe(chartData.labels.length)
  })
})