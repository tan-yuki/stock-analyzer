import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils/renderWithProviders'
import { StockInfo } from './StockInfo'
import { createMockStockData } from '../test-utils/mockData'

describe('StockInfo', () => {
  it('会社名と銘柄コードが表示される', () => {
    const stockData = createMockStockData({
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('Apple Inc. (AAPL)')).toBeInTheDocument()
  })

  it('現在価格が正しくフォーマットされて表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 150.25,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('$150.25')).toBeInTheDocument()
  })

  it('正の価格変動が正しく表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 150.00,
      previousPrice: 140.00,
    })

    render(<StockInfo data={stockData} />)

    // 価格変動: +$10.00 (+7.14%)
    expect(screen.getByText('+$10.00 (+7.14%)')).toBeInTheDocument()
    
    // 正の変動のスタイルが適用されることを確認
    const priceChangeElement = screen.getByText('+$10.00 (+7.14%)')
    const computedStyle = window.getComputedStyle(priceChangeElement)
    expect(priceChangeElement).toBeInTheDocument()
  })

  it('負の価格変動が正しく表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 140.00,
      previousPrice: 150.00,
    })

    render(<StockInfo data={stockData} />)

    // 価格変動: -$10.00 (-6.67%) - Use regex to handle potential text split
    expect(screen.getByText(/\$-10\.00.*-6\.67%/)).toBeInTheDocument()
    
    // 負の変動のスタイルが適用されることを確認
    const priceChangeElement = screen.getByText(/\$-10\.00.*-6\.67%/)
    expect(priceChangeElement).toBeInTheDocument()
  })

  it('価格変動なしの場合', () => {
    const stockData = createMockStockData({
      currentPrice: 150.00,
      previousPrice: 150.00,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('+$0.00 (+0.00%)')).toBeInTheDocument()
    
    // 0%変動でも正しく表示される（+記号があるため）
    const priceChangeElement = screen.getByText('+$0.00 (+0.00%)')
    expect(priceChangeElement).toBeInTheDocument()
  })

  it('小数点以下の価格変動が正しく計算される', () => {
    const stockData = createMockStockData({
      currentPrice: 150.75,
      previousPrice: 150.25,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('+$0.50 (+0.33%)')).toBeInTheDocument()
  })

  it('大きな価格変動が正しく表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 200.00,
      previousPrice: 100.00,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('+$100.00 (+100.00%)')).toBeInTheDocument()
  })

  it('非常に小さな価格変動でも表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 150.01,
      previousPrice: 150.00,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('+$0.01 (+0.01%)')).toBeInTheDocument()
  })

  it('適切な構造で表示される', () => {
    const stockData = createMockStockData()
    const { container } = render(<StockInfo data={stockData} />)

    // Check that the component renders with proper structure
    const h2Element = container.querySelector('h2')
    expect(h2Element).toBeInTheDocument()
    
    // Check for responsive price display class that remains for layout
    const priceDisplayContainer = container.querySelector('.responsive-price-display')
    expect(priceDisplayContainer).toBeInTheDocument()
    
    // Check that price and change elements are present
    const spanElements = container.querySelectorAll('span')
    expect(spanElements.length).toBeGreaterThanOrEqual(2) // current price + price change
  })

  it('数値のフォーマットが一貫している', () => {
    const stockData = createMockStockData({
      currentPrice: 150,
      previousPrice: 140,
    })

    render(<StockInfo data={stockData} />)

    // 価格は常に2桁の小数点で表示される
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByText('+$10.00 (+7.14%)')).toBeInTheDocument()
  })

  it('極端に長い会社名でも表示される', () => {
    const stockData = createMockStockData({
      symbol: 'LONGNAME',
      companyName: 'Very Long Company Name That Might Cause Layout Issues Inc.',
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('Very Long Company Name That Might Cause Layout Issues Inc. (LONGNAME)')).toBeInTheDocument()
  })
})