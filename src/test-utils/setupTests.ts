import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Chart.js のモック
vi.mock('chart.js', () => {
  const mockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
  }))
  
  mockChart.register = vi.fn()
  
  return {
    Chart: mockChart,
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    PointElement: vi.fn(),
    LineElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    Filler: vi.fn(),
    register: vi.fn(),
  }
})

vi.mock('react-chartjs-2', () => ({
  Line: vi.fn().mockImplementation(({ data, options }) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'mock-chart',
      'data-chart-data': JSON.stringify(data),
      'data-chart-options': JSON.stringify(options)
    }, 'Chart Placeholder')
  }),
}))

// Window alert のモック
global.alert = vi.fn()

// Console methods のモック (テスト中のログを抑制)
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
}

// Fetch API のモック (MSW使用時は不要だが、フォールバック用)
global.fetch = vi.fn()

// 環境変数のモック
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_ALPHA_VANTAGE_API_KEY: 'test-api-key'
  },
  writable: true
})

// 確定的な時間設定（Flakyテスト対策）
const FIXED_DATE = new Date('2025-06-01T00:00:00Z')

// Date.nowのモック
const originalDateNow = Date.now
Date.now = vi.fn(() => FIXED_DATE.getTime())

// new Date()のモック（引数なしの場合のみ）
const originalDate = global.Date
global.Date = class extends originalDate {
  constructor(...args: any[]) {
    if (args.length === 0) {
      super(FIXED_DATE.getTime())
    } else {
      super(...args)
    }
  }
  
  static now() {
    return FIXED_DATE.getTime()
  }
} as any