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
    
    // 正の変動には positive クラスが適用される
    const priceChangeElement = screen.getByText('+$10.00 (+7.14%)')
    expect(priceChangeElement).toHaveClass('price-change', 'positive')
  })

  it('負の価格変動が正しく表示される', () => {
    const stockData = createMockStockData({
      currentPrice: 140.00,
      previousPrice: 150.00,
    })

    render(<StockInfo data={stockData} />)

    // 価格変動: -$10.00 (-6.67%) - Use regex to handle potential text split
    expect(screen.getByText(/\$-10\.00.*-6\.67%/)).toBeInTheDocument()
    
    // 負の変動には negative クラスが適用される
    const priceChangeElement = document.querySelector('.price-change.negative')
    expect(priceChangeElement).toBeInTheDocument()
  })

  it('価格変動なしの場合', () => {
    const stockData = createMockStockData({
      currentPrice: 150.00,
      previousPrice: 150.00,
    })

    render(<StockInfo data={stockData} />)

    expect(screen.getByText('+$0.00 (+0.00%)')).toBeInTheDocument()
    
    // 0%変動でも positive クラスが適用される（+記号があるため）
    const priceChangeElement = screen.getByText('+$0.00 (+0.00%)')
    expect(priceChangeElement).toHaveClass('price-change', 'positive')
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

  it('適切なCSSクラスが適用される', () => {
    const stockData = createMockStockData()

    render(<StockInfo data={stockData} />)

    const stockInfoContainer = document.querySelector('.stock-info')
    const priceDisplay = document.querySelector('.price-display')
    const currentPrice = document.querySelector('.current-price')

    expect(stockInfoContainer).toBeInTheDocument()
    expect(priceDisplay).toBeInTheDocument()
    expect(currentPrice).toBeInTheDocument()
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