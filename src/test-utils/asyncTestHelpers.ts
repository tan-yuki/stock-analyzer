import { vi, expect } from 'vitest'

// 順序を保証する非同期テストヘルパー
export const sequentialAsync = async <T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> => {
  const results: T[] = []
  
  for (const operation of operations) {
    const result = await operation()
    results.push(result)
  }
  
  return results
}

// モック呼び出し順序の検証ヘルパー
export const verifyCallOrder = (mockFn: ReturnType<typeof vi.fn>, expectedCalls: unknown[][]) => {
  const actualCalls = mockFn.mock.calls
  
  expect(actualCalls).toHaveLength(expectedCalls.length)
  
  expectedCalls.forEach((expectedCall, index) => {
    expect(actualCalls[index]).toEqual(expectedCall)
  })
}

// タイムアウト付きPromise実行
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

// リトライ機能付きテスト実行
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}