import { describe, it, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils/renderWithProviders'
import userEvent from '@testing-library/user-event'
import { AppWithoutCSS as App } from '../../components/AppWithoutCSS'
import { server } from '../../test-utils/testServer'
import { waitForElementSafely, verifyAlertCalled, waitForElementToAppear } from '../../test-utils/testHelpers'
import { withTimeout, sequentialAsync } from '../../test-utils/asyncTestHelpers'

// MSW サーバーのセットアップ
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('株価分析フロー統合テスト', () => {
  beforeEach(() => {
    // モックのクリアと確定的な時間設定（Flakyテスト対策）
    vi.clearAllMocks()
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
  })

  it('正常な分析フロー - API成功時（確定的テスト）', async () => {
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

    // 3. フォーム送信
    await user.click(submitButton)

    // 4. 確定的な結果待機（Flakyテスト対策）
    await withTimeout(
      waitForElementSafely(/Apple Inc\. \(AAPL\)/),
      10000,
      '分析結果が表示されませんでした'
    )

    // 5. 株価情報の表示確認
    expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    expect(document.querySelector('.current-price')).toBeInTheDocument()

    // 6. チャートの表示確認
    await waitForElementSafely('mock-chart', { testId: true })
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

    // 7. 分析結果の表示確認
    expect(screen.getByText('分析結果')).toBeInTheDocument()
    expect(screen.getByText('最高値：')).toBeInTheDocument()
    expect(screen.getByText('最安値：')).toBeInTheDocument()
    expect(screen.getByText('平均値：')).toBeInTheDocument()
    expect(screen.getByText('ボラティリティ：')).toBeInTheDocument()
    expect(screen.getByText('期間収益率：')).toBeInTheDocument()
  })

  it('API失敗時のエラー処理（確定的テスト）', async () => {
    const user = userEvent.setup()
    
    // 確定的なアラートモック設定
    const mockAlert = vi.fn()
    global.alert = mockAlert
    
    render(<App />)

    // 無効な銘柄でAPIエラーを発生させる
    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'INVALID')
    await user.click(submitButton)

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/無効な銘柄コードです/)).toBeInTheDocument()
    }, { timeout: 8000 })

    // エラー状態の確認
    expect(screen.queryByText('データを取得中...')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  }, 12000)

  it('レート制限時の動作', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Mock alert function to capture error messages
    const mockAlert = vi.fn()
    global.alert = mockAlert

    // レート制限エラーを発生させる銘柄
    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'RATELIMIT')
    await user.click(submitButton)

    // レート制限エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/APIの利用制限に達しました/)).toBeInTheDocument()
    }, { timeout: 8000 })

    // ローディング状態が終了している
    expect(screen.queryByText('データを取得中...')).not.toBeInTheDocument()

    // エラーのため結果は表示されない
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  }, 12000)

  it('空の銘柄コードでのバリデーション', async () => {
    const user = userEvent.setup()
    
    // Clear and set up fresh alert mock to verify no alert is called
    vi.clearAllMocks()
    const mockAlert = vi.fn()
    global.alert = mockAlert
    
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    // 銘柄コードを空にして送信
    await user.clear(symbolInput)
    await user.click(submitButton)

    // フォームレベルでバリデーションされるため、アラートは呼ばれない
    expect(mockAlert).not.toHaveBeenCalled()
    
    // ローディング状態にならないことを確認
    expect(screen.queryByText('データを取得中...')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '分析開始' })).toBeInTheDocument()
    
    // 結果が表示されないことを確認
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  })

  it('複数回の分析実行（順序保証テスト）', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    // 順序を保証した複数分析の実行（Flakyテスト対策）
    const analysisOperations = [
      async () => {
        await user.clear(symbolInput)
        await user.type(symbolInput, 'AAPL')
        await user.click(submitButton)
        
        await waitForElementSafely(/Apple Inc\. \(AAPL\)/, { timeout: 10000 })
        return 'AAPL'
      },
      async () => {
        await user.clear(symbolInput)
        await user.type(symbolInput, 'GOOGL')
        await user.click(submitButton)
        
        await waitForElementSafely(/GOOGL Corporation \(GOOGL\)/, { timeout: 10000 })
        return 'GOOGL'
      }
    ]

    const results = await sequentialAsync(analysisOperations)

    // 確定的な結果検証
    expect(results).toEqual(['AAPL', 'GOOGL'])
    expect(screen.getByText(/GOOGL Corporation \(GOOGL\)/)).toBeInTheDocument()
  })

  it('異なる期間での分析', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const periodSelect = screen.getByLabelText('期間：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    // 1年期間での分析
    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.selectOptions(periodSelect, '1y')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('データを取得中...')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

    // チャートデータに複数のポイントがあることを確認
    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')
    expect(chartData.labels.length).toBeGreaterThan(1)
  })

  it('フォーム入力完了後の有効化確認', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const periodSelect = screen.getByLabelText('期間：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.click(submitButton)

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    }, { timeout: 5000 })

    // ローディング完了後は有効化される
    expect(symbolInput).toBeEnabled()
    expect(periodSelect).toBeEnabled()
    expect(submitButton).toBeEnabled()
  })

  it('Enterキーでの分析開始', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')

    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.keyboard('{Enter}')

    // Wait for analysis results to appear
    await waitFor(() => {
      expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('価格変動の色分けが正しく表示される', async () => {
    const user = userEvent.setup()
    render(<App />)

    const symbolInput = screen.getByLabelText('銘柄コード：')
    const submitButton = screen.getByRole('button', { name: '分析開始' })

    await user.clear(symbolInput)
    await user.type(symbolInput, 'AAPL')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Apple Inc\. \(AAPL\)/)).toBeInTheDocument()
    }, { timeout: 5000 })

    // 価格変動要素が存在することを確認
    const priceChangeElements = document.querySelectorAll('.price-change')
    expect(priceChangeElements.length).toBeGreaterThan(0)

    // positive または negative クラスが適用されていることを確認
    priceChangeElements.forEach(element => {
      expect(element).toSatisfy((el: Element) => 
        el.classList.contains('positive') || el.classList.contains('negative')
      )
    })
  })
})