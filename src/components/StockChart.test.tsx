import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils/renderWithProviders'
import { StockChart } from './StockChart'
import { mockStockData } from '../test-utils/mockData'

describe('StockChart', () => {
  it('チャートが描画される', () => {
    render(<StockChart data={mockStockData} />)

    // モックされたチャートコンポーネントが表示される
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
  })

  it('チャートに正しいデータが渡される', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    // ラベル（日付）が正しく設定されている
    expect(chartData.labels).toHaveLength(mockStockData.prices.length)
    expect(chartData.labels[0]).toContain('2024')

    // データセットが正しく設定されている
    expect(chartData.datasets).toHaveLength(1)
    expect(chartData.datasets[0].label).toBe('株価')
    expect(chartData.datasets[0].data).toHaveLength(mockStockData.prices.length)
    expect(chartData.datasets[0].borderColor).toBe('#2196F3')
  })

  it('チャートオプションが正しく設定される', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}')

    // レスポンシブ設定
    expect(chartOptions.responsive).toBe(true)
    expect(chartOptions.maintainAspectRatio).toBe(false)

    // Y軸設定
    expect(chartOptions.scales.y.beginAtZero).toBe(false)

    // X軸設定
    expect(chartOptions.scales.x.ticks.maxTicksLimit).toBe(10)

    // 凡例設定
    expect(chartOptions.plugins.legend.display).toBe(false)
  })

  it('価格データが正しく変換される', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    // 価格データが正しく抽出されている
    const expectedPrices = mockStockData.prices.map(p => p.price)
    expect(chartData.datasets[0].data).toEqual(expectedPrices)
  })

  it('日付ラベルが日本語フォーマットで表示される', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    // 日付が日本語フォーマット（YYYY/MM/DD）で表示されている
    chartData.labels.forEach((label: string) => {
      expect(label).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/)
    })
  })

  it('空のデータでもエラーが発生しない', () => {
    const emptyData = {
      ...mockStockData,
      prices: []
    }

    expect(() => render(<StockChart data={emptyData} />)).not.toThrow()
  })

  it('単一データポイントでも表示される', () => {
    const singlePointData = {
      ...mockStockData,
      prices: [mockStockData.prices[0]]
    }

    render(<StockChart data={singlePointData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    expect(chartData.labels).toHaveLength(1)
    expect(chartData.datasets[0].data).toHaveLength(1)
  })

  it('適切なCSS classが適用される', () => {
    render(<StockChart data={mockStockData} />)

    const chartContainer = document.querySelector('.chart-container')
    expect(chartContainer).toBeInTheDocument()
  })

  it('チャートの色設定が正しい', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    const dataset = chartData.datasets[0]
    expect(dataset.borderColor).toBe('#2196F3')
    expect(dataset.backgroundColor).toBe('rgba(33, 150, 243, 0.1)')
    expect(dataset.borderWidth).toBe(2)
    expect(dataset.fill).toBe(true)
    expect(dataset.tension).toBe(0.1)
  })

  it('ツールチップ設定が正しい', () => {
    render(<StockChart data={mockStockData} />)

    const chartElement = screen.getByTestId('mock-chart')
    const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}')

    expect(chartOptions.plugins.tooltip.callbacks).toBeDefined()
  })

  it('大量のデータポイントでも動作する', () => {
    const largeData = {
      ...mockStockData,
      prices: Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(2024, 0, i + 1),
        price: 100 + Math.random() * 50
      }))
    }

    expect(() => render(<StockChart data={largeData} />)).not.toThrow()

    const chartElement = screen.getByTestId('mock-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}')

    expect(chartData.labels).toHaveLength(1000)
    expect(chartData.datasets[0].data).toHaveLength(1000)
  })
})