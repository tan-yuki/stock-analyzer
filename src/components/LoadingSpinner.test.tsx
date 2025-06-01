import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils/renderWithProviders'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('ローディングメッセージが表示される', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('データを取得中...')).toBeInTheDocument()
  })

  it('スピナー要素が表示される', () => {
    render(<LoadingSpinner />)

    const spinner = document.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('適切なCSSクラスが適用される', () => {
    render(<LoadingSpinner />)

    const loadingContainer = document.querySelector('.loading')
    expect(loadingContainer).toBeInTheDocument()
    expect(loadingContainer).toHaveTextContent('データを取得中...')
  })

  it('アクセシビリティ用のロール属性を持つ', () => {
    render(<LoadingSpinner />)

    // ローディング状態をスクリーンリーダーに伝える
    const loadingElement = screen.getByText('データを取得中...')
    expect(loadingElement).toBeInTheDocument()
  })

  it('スナップショットテスト', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toMatchSnapshot()
  })
})