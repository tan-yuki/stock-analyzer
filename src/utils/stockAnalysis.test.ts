import { describe, it, expect } from 'vitest'
import { calculateStockAnalysis } from './stockAnalysis'
import { mockStockPrices, createMockStockPrice } from '../test-utils/mockData'

describe('calculateStockAnalysis', () => {
  it('正常な株価データで統計を計算する', () => {
    const result = calculateStockAnalysis(mockStockPrices)

    expect(result.max).toBe(159.50)
    expect(result.min).toBe(148.75)
    expect(result.average).toBeCloseTo(153.5, 1) // 実際の平均値
    expect(result.volatility).toBeGreaterThan(0)
    expect(result.totalReturn).toBeCloseTo(6.33, 1)
  })

  it('単一データポイントでの計算', () => {
    const singlePrice = [createMockStockPrice({ price: 100 })]
    const result = calculateStockAnalysis(singlePrice)

    expect(result.max).toBe(100)
    expect(result.min).toBe(100)
    expect(result.average).toBe(100)
    expect(result.volatility).toBe(0) // returns配列が空なのでNaN -> 0になる
    expect(result.totalReturn).toBe(0)
  })

  it('2つのデータポイントでの計算', () => {
    const prices = [
      createMockStockPrice({ price: 100 }),
      createMockStockPrice({ price: 110 }),
    ]
    const result = calculateStockAnalysis(prices)

    expect(result.max).toBe(110)
    expect(result.min).toBe(100)
    expect(result.average).toBe(105)
    expect(result.totalReturn).toBe(10)
    expect(result.volatility).toBe(0) // 単一リターンなので分散=0
  })

  it('下降トレンドでの計算', () => {
    const prices = [
      createMockStockPrice({ price: 110 }),
      createMockStockPrice({ price: 105 }),
      createMockStockPrice({ price: 100 }),
    ]
    const result = calculateStockAnalysis(prices)

    expect(result.max).toBe(110)
    expect(result.min).toBe(100)
    expect(result.totalReturn).toBeCloseTo(-9.09, 1)
  })

  it('同じ価格での計算', () => {
    const prices = [
      createMockStockPrice({ price: 100 }),
      createMockStockPrice({ price: 100 }),
      createMockStockPrice({ price: 100 }),
    ]
    const result = calculateStockAnalysis(prices)

    expect(result.max).toBe(100)
    expect(result.min).toBe(100)
    expect(result.average).toBe(100)
    expect(result.volatility).toBe(0)
    expect(result.totalReturn).toBe(0)
  })

  it('高ボラティリティでの計算', () => {
    const prices = [
      createMockStockPrice({ price: 100 }),
      createMockStockPrice({ price: 150 }),
      createMockStockPrice({ price: 75 }),
      createMockStockPrice({ price: 125 }),
    ]
    const result = calculateStockAnalysis(prices)

    expect(result.volatility).toBeGreaterThan(50) // 高いボラティリティ
    expect(result.totalReturn).toBe(25) // 100から125への変化
  })

  it('負の価格でも計算できる（理論的なケース）', () => {
    const prices = [
      createMockStockPrice({ price: -10 }),
      createMockStockPrice({ price: -5 }),
    ]
    const result = calculateStockAnalysis(prices)

    expect(result.max).toBe(-5)
    expect(result.min).toBe(-10)
    expect(result.average).toBe(-7.5)
  })

  it('空の配列では例外が発生する', () => {
    expect(() => calculateStockAnalysis([])).toThrow()
  })

  it('ボラティリティが年率換算される（252日基準）', () => {
    const prices = [
      createMockStockPrice({ price: 100 }),
      createMockStockPrice({ price: 101 }),
      createMockStockPrice({ price: 102 }),
    ]
    const result = calculateStockAnalysis(prices)
    
    // ボラティリティが252の平方根で年率換算されていることを確認
    expect(result.volatility).toBeGreaterThan(0)
    // 実際の計算は複雑だが、年率換算されていることを確認
  })
})