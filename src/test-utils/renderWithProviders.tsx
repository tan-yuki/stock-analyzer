import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// カスタムレンダー関数（将来的にContextやProviderが必要になった場合に使用）
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// React Fast Refreshの警告を避けるため、re-exportと関数を分離
export { customRender as render }
export * from '@testing-library/react'