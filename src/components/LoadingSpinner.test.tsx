import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils/renderWithProviders'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('ローディングメッセージが表示される', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('データを取得中...')).toBeInTheDocument()
  })

  it('スピナー要素が表示される', () => {
    const { container } = render(<LoadingSpinner />)

    // Check for div elements that should contain the spinner
    const divElements = container.querySelectorAll('div')
    expect(divElements.length).toBeGreaterThanOrEqual(2) // container + spinner
  })

  it('適切な構造で表示される', () => {
    const { container } = render(<LoadingSpinner />)

    // Check that the loading message is displayed
    expect(screen.getByText('データを取得中...')).toBeInTheDocument()
    
    // Check that the component has the expected structure
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv).toBeInTheDocument()
    expect(outerDiv.tagName).toBe('DIV')
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