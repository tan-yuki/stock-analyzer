import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '../test-utils/renderWithProviders'
import { AnalysisResults } from './AnalysisResults'
import { mockStockAnalysis } from '../test-utils/mockData'
import { getAllElementsSafely } from '../test-utils/testHelpers'

describe('AnalysisResults', () => {
  beforeEach(() => {
    // 確定的なテスト環境設定（Flakyテスト対策）
    vi.clearAllMocks()
  })
  it('分析結果のタイトルが表示される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    expect(screen.getByText('分析結果')).toBeInTheDocument()
  })

  it('すべての統計指標が表示される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    expect(screen.getByText('最高値：')).toBeInTheDocument()
    expect(screen.getByText('最安値：')).toBeInTheDocument()
    expect(screen.getByText('平均値：')).toBeInTheDocument()
    expect(screen.getByText('ボラティリティ：')).toBeInTheDocument()
    expect(screen.getByText('期間収益率：')).toBeInTheDocument()
  })

  it('価格データが正しくフォーマットされて表示される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    expect(screen.getByText('$159.50')).toBeInTheDocument() // max
    expect(screen.getByText('$148.75')).toBeInTheDocument() // min
    expect(screen.getByText('$153.47')).toBeInTheDocument() // average (rounded)
  })

  it('パーセンテージが正しくフォーマットされて表示される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    expect(screen.getByText('12.34%')).toBeInTheDocument() // volatility
    expect(screen.getByText('6.33%')).toBeInTheDocument() // totalReturn
  })

  it('価格が小数点以下2桁でフォーマットされる', () => {
    const analysis = {
      max: 159.999,
      min: 148.001,
      average: 153.456789,
      volatility: 12.3456,
      totalReturn: 6.789,
    }

    render(<AnalysisResults analysis={analysis} />)

    expect(screen.getByText('$160.00')).toBeInTheDocument() // max rounded
    expect(screen.getByText('$148.00')).toBeInTheDocument() // min rounded
    expect(screen.getByText('$153.46')).toBeInTheDocument() // average rounded
  })

  it('パーセンテージが小数点以下2桁でフォーマットされる', () => {
    const analysis = {
      max: 100,
      min: 90,
      average: 95,
      volatility: 12.3456,
      totalReturn: 6.789123,
    }

    render(<AnalysisResults analysis={analysis} />)

    expect(screen.getByText('12.35%')).toBeInTheDocument() // volatility rounded
    expect(screen.getByText('6.79%')).toBeInTheDocument() // totalReturn rounded
  })

  it('負の値でも正しく表示される', () => {
    const analysis = {
      max: 100,
      min: 90,
      average: 95,
      volatility: 12.34,
      totalReturn: -5.67,
    }

    render(<AnalysisResults analysis={analysis} />)

    expect(screen.getByText('-5.67%')).toBeInTheDocument() // negative return
  })

  it('ゼロの値でも正しく表示される（確定的テスト）', () => {
    const analysis = {
      max: 100,
      min: 100,
      average: 100,
      volatility: 0,
      totalReturn: 0,
    }

    render(<AnalysisResults analysis={analysis} />)

    // 安全な複数要素取得（Flakyテスト対策）
    const zeroPercentageElements = getAllElementsSafely('0.00%')
    expect(zeroPercentageElements).toHaveLength(2) // volatility and totalReturn
    
    // より具体的な検証（複数要素対応）
    const dollarElements = getAllElementsSafely('$100.00')
    expect(dollarElements).toHaveLength(3) // max, min, average all same
  })

  it('大きな数値でも適切に表示される', () => {
    const analysis = {
      max: 99999.99,
      min: 10000.01,
      average: 55000.50,
      volatility: 999.99,
      totalReturn: 500.75,
    }

    render(<AnalysisResults analysis={analysis} />)

    expect(screen.getByText('$99999.99')).toBeInTheDocument()
    expect(screen.getByText('$10000.01')).toBeInTheDocument()
    expect(screen.getByText('$55000.50')).toBeInTheDocument()
    expect(screen.getByText('999.99%')).toBeInTheDocument()
    expect(screen.getByText('500.75%')).toBeInTheDocument()
  })

  it('適切なCSSクラスが適用される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    const analysisResults = document.querySelector('.analysis-results')
    const metrics = document.querySelector('.metrics')
    const metricElements = document.querySelectorAll('.metric')

    expect(analysisResults).toBeInTheDocument()
    expect(metrics).toBeInTheDocument()
    expect(metricElements).toHaveLength(5) // 5つの指標
  })

  it('各指標のラベルと値が正しい構造で表示される', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    const metricElements = document.querySelectorAll('.metric')
    
    metricElements.forEach(metric => {
      const label = metric.querySelector('label')
      const span = metric.querySelector('span')
      
      expect(label).toBeInTheDocument()
      expect(span).toBeInTheDocument()
    })
  })

  it('グリッドレイアウトのための適切な構造を持つ', () => {
    render(<AnalysisResults analysis={mockStockAnalysis} />)

    const metrics = document.querySelector('.metrics')
    expect(metrics).toBeInTheDocument()
    
    const metricElements = metrics?.querySelectorAll('.metric')
    expect(metricElements).toHaveLength(5)
  })

  it('スナップショットテスト', () => {
    const { container } = render(<AnalysisResults analysis={mockStockAnalysis} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('非常に小さな数値でも表示される（確定的テスト）', () => {
    const analysis = {
      max: 0.01,
      min: 0.001,
      average: 0.005,
      volatility: 0.01,
      totalReturn: 0.001,
    }

    render(<AnalysisResults analysis={analysis} />)

    // より具体的な検証（複数要素対応でFlakyテスト対策）
    const dollarZeroOneElements = getAllElementsSafely('$0.01')
    expect(dollarZeroOneElements).toHaveLength(2) // max and average (0.005 rounds to 0.01)
    
    expect(screen.getByText('$0.00')).toBeInTheDocument() // min rounded
    expect(screen.getByText('0.01%')).toBeInTheDocument() // volatility
    expect(screen.getByText('0.00%')).toBeInTheDocument() // totalReturn rounded
  })
})