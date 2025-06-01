import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

// MSWの応答を意図的に遅延させるヘルパー
export const createDelayedMSWHandler = (delay: number = 100) => {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    // 元のハンドラーロジック
  }
}

// 確定的なタイミングテスト用のヘルパー（Flakyテスト対策）
export const waitForElementToAppear = async (
  getElement: () => HTMLElement | null,
  timeout: number = 5000
) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const element = getElement()
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  throw new Error(`Element did not appear within ${timeout}ms`)
}

// 状態変化を確実に検出するヘルパー
export const waitForStateChange = async <T>(
  getCurrentState: () => T,
  expectedState: T,
  timeout: number = 5000
) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (getCurrentState() === expectedState) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  throw new Error(`State did not change to expected value within ${timeout}ms`)
}

// より安全な要素待機ヘルパー（Testing LibraryのwaitForを使用）
export const waitForElementSafely = async (
  textOrTestId: string | RegExp,
  options: { timeout?: number; testId?: boolean } = {}
) => {
  const { timeout = 5000, testId = false } = options
  
  return waitFor(() => {
    if (testId) {
      return screen.getByTestId(textOrTestId as string)
    }
    return screen.getByText(textOrTestId)
  }, { timeout })
}

// 複数要素の安全な取得
export const getAllElementsSafely = (
  textOrSelector: string | RegExp,
  options: { testId?: boolean } = {}
) => {
  const { testId = false } = options
  
  if (testId) {
    return screen.getAllByTestId(textOrSelector as string)
  }
  return screen.getAllByText(textOrSelector)
}

// アラート呼び出しの確実な検証
export const verifyAlertCalled = async (
  mockAlert: ReturnType<typeof vi.fn>,
  expectedMessage: string,
  timeout: number = 3000
) => {
  return waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith(expectedMessage)
  }, { timeout })
}