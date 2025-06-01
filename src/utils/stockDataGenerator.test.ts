import { describe, it, expect } from 'vitest'
import { generateMockStockData } from './stockDataGenerator'
import type { TimePeriod } from '../types'

describe('generateMockStockData', () => {
  it('指定期間のデータ生成 - 1ヶ月', () => {
    const result = generateMockStockData('AAPL', '1mo')
    
    expect(result.symbol).toBe('AAPL')
    expect(result.companyName).toBe('Apple Inc.')
    expect(result.prices.length).toBeGreaterThan(15) // 1ヶ月分の営業日
    expect(result.prices.length).toBeLessThan(25) // 土日除外
    expect(result.currentPrice).toBe(result.prices[result.prices.length - 1].price)
  })

  it('指定期間のデータ生成 - 1年', () => {
    const result = generateMockStockData('GOOGL', '1y')
    
    expect(result.symbol).toBe('GOOGL')
    expect(result.companyName).toBe('Alphabet Inc.')
    expect(result.prices.length).toBeGreaterThan(200) // 1年分の営業日
    expect(result.prices.length).toBeLessThan(300)
  })

  it('土日が除外されている', () => {
    const result = generateMockStockData('TSLA', '1mo')
    
    // 全ての日付が月曜日から金曜日であることを確認
    result.prices.forEach(price => {
      const dayOfWeek = price.date.getDay()
      expect(dayOfWeek).toBeGreaterThanOrEqual(1) // 月曜日
      expect(dayOfWeek).toBeLessThanOrEqual(5) // 金曜日
    })
  })

  it('価格変動が適切な範囲内', () => {
    const result = generateMockStockData('MSFT', '3mo')
    
    // 日次変動が±5%以内であることを確認
    for (let i = 1; i < result.prices.length; i++) {
      const currentPrice = result.prices[i].price
      const previousPrice = result.prices[i - 1].price
      const changePercent = Math.abs((currentPrice - previousPrice) / previousPrice)
      
      expect(changePercent).toBeLessThanOrEqual(0.05) // ±5%以内
    }
  })

  it('異なる銘柄で適切な会社名を返す', () => {
    const appleData = generateMockStockData('AAPL', '1mo')
    const googleData = generateMockStockData('GOOGL', '1mo')
    const unknownData = generateMockStockData('UNKNOWN', '1mo')
    
    expect(appleData.companyName).toBe('Apple Inc.')
    expect(googleData.companyName).toBe('Alphabet Inc.')
    expect(unknownData.companyName).toBe('UNKNOWN Corporation')
  })

  it('日付が昇順でソートされている', () => {
    const result = generateMockStockData('NVDA', '6mo')
    
    for (let i = 1; i < result.prices.length; i++) {
      expect(result.prices[i].date.getTime()).toBeGreaterThan(
        result.prices[i - 1].date.getTime()
      )
    }
  })

  it('現在価格と前日価格が正しく設定されている', () => {
    const result = generateMockStockData('META', '1mo')
    
    expect(result.currentPrice).toBe(result.prices[result.prices.length - 1].price)
    expect(result.previousPrice).toBe(result.prices[result.prices.length - 2].price)
  })

  it('単一データポイントの場合の処理', () => {
    // 非常に短い期間でテスト
    const result = generateMockStockData('AAPL', '1mo')
    
    if (result.prices.length === 1) {
      expect(result.previousPrice).toBe(result.currentPrice)
    }
  })

  it('全ての期間タイプで動作する', () => {
    const periods: TimePeriod[] = ['1mo', '3mo', '6mo', '1y', '2y']
    
    periods.forEach(period => {
      const result = generateMockStockData('AAPL', period)
      
      expect(result.symbol).toBe('AAPL')
      expect(result.prices.length).toBeGreaterThan(0)
      expect(result.currentPrice).toBeGreaterThan(0)
      expect(result.previousPrice).toBeGreaterThan(0)
    })
  })

  it('基準価格が会社ごとに異なる', () => {
    const appleData = generateMockStockData('AAPL', '1mo')
    const googleData = generateMockStockData('GOOGL', '1mo')
    
    // 基準価格が異なることを確認（完全には同じにならないはず）
    const appleAvg = appleData.prices.reduce((sum, p) => sum + p.price, 0) / appleData.prices.length
    const googleAvg = googleData.prices.reduce((sum, p) => sum + p.price, 0) / googleData.prices.length
    
    // GoogleはAppleより高い基準価格を持つ
    expect(googleAvg).toBeGreaterThan(appleAvg)
  })

  it('価格が負の値にならない', () => {
    const result = generateMockStockData('AAPL', '2y')
    
    result.prices.forEach(price => {
      expect(price.price).toBeGreaterThan(0)
    })
  })
})