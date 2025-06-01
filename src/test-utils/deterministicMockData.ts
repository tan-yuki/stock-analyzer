// 確定的なテストデータ生成（Flakyテスト対策）
export const createDeterministicStockData = (symbol: string, period: string) => {
  // シードベースの確定的な価格生成
  const seed = symbol.charCodeAt(0) + period.length
  let randomSeed = seed
  
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }
  
  const basePrice = 150 // 固定ベース価格
  const dates = generateTradingDates(period)
  
  return dates.map((date, _index) => {
    const variance = (seededRandom() - 0.5) * 10 // ±5の変動
    return {
      date,
      price: parseFloat((basePrice + variance).toFixed(2))
    }
  })
}

const generateTradingDates = (period: string): Date[] => {
  const now = new Date('2025-06-01') // 固定日付でタイムゾーン問題を回避
  const dates: Date[] = []
  const periodDays = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730 }
  const days = periodDays[period as keyof typeof periodDays] || 30
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // 平日のみ追加（土日スキップで確定的な取引日生成）
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push(date)
    }
  }
  
  return dates
}

// 特定銘柄の確定的なベース価格を設定
export const getDeterministicBasePrice = (symbol: string): number => {
  const basePrices: Record<string, number> = {
    'AAPL': 150.00,
    'GOOGL': 2800.00,
    'TSLA': 800.00,
    'MSFT': 420.00,
    'AMZN': 3400.00,
    'NVDA': 900.00,
    'META': 500.00
  }
  
  return basePrices[symbol] || 150.00
}