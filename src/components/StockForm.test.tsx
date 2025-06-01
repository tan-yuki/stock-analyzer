import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils/renderWithProviders'
import userEvent from '@testing-library/user-event'
import { StockForm } from './StockForm'
import type { StockFormData } from '../types'

describe('StockForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('初期値が正しく表示される', () => {
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument()
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('6mo')
    
    expect(screen.getByRole('button', { name: '分析開始' })).toBeInTheDocument()
  })

  it('銘柄コードの入力が動作する', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    await user.clear(input)
    await user.type(input, 'GOOGL')

    expect(screen.getByDisplayValue('GOOGL')).toBeInTheDocument()
  })

  it('期間選択が動作する', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const select = screen.getByLabelText('期間：')
    await user.selectOptions(select, '1y')

    expect(select).toHaveValue('1y')
  })

  it('フォーム送信が正しいデータで実行される', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    const select = screen.getByLabelText('期間：')
    const button = screen.getByRole('button', { name: '分析開始' })

    await user.clear(input)
    await user.type(input, 'TSLA')
    await user.selectOptions(select, '3mo')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      symbol: 'TSLA',
      period: '3mo'
    })
  })

  it('Enterキーでフォーム送信される', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    await user.clear(input)
    await user.type(input, 'MSFT')
    await user.keyboard('{Enter}')

    expect(mockOnSubmit).toHaveBeenCalledWith({
      symbol: 'MSFT',
      period: '6mo'
    })
  })

  it('ローディング中はフォームが無効化される', () => {
    render(<StockForm onSubmit={mockOnSubmit} loading={true} />)

    expect(screen.getByLabelText('銘柄コード：')).toBeDisabled()
    expect(screen.getByLabelText('期間：')).toBeDisabled()
    expect(screen.getByRole('button', { name: '分析開始' })).toBeDisabled()
  })

  it('空の銘柄コードでは送信されない', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    const button = screen.getByRole('button', { name: '分析開始' })

    await user.clear(input)
    await user.click(button)

    // 空の場合は送信されない
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('銘柄コードが大文字に変換される', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    const button = screen.getByRole('button', { name: '分析開始' })

    await user.clear(input)
    await user.type(input, 'aapl')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      symbol: 'AAPL',
      period: '6mo'
    })
  })

  it('スペースが前後から削除される', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const input = screen.getByLabelText('銘柄コード：')
    const button = screen.getByRole('button', { name: '分析開始' })

    await user.clear(input)
    await user.type(input, '  NVDA  ')
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      symbol: 'NVDA',
      period: '6mo'
    })
  })

  it('すべての期間オプションが表示される', () => {
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    expect(screen.getByRole('option', { name: '1ヶ月' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '3ヶ月' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '6ヶ月' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '1年' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '2年' })).toBeInTheDocument()
  })

  it('プレースホルダーテキストが表示される', () => {
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    expect(screen.getByPlaceholderText('例: AAPL, GOOGL, TSLA')).toBeInTheDocument()
  })

  it('適切なラベルが関連付けられている', () => {
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    expect(screen.getByLabelText('銘柄コード：')).toBeInTheDocument()
    expect(screen.getByLabelText('期間：')).toBeInTheDocument()
  })

  it('フォームが複数回送信できる', async () => {
    const user = userEvent.setup()
    render(<StockForm onSubmit={mockOnSubmit} loading={false} />)

    const button = screen.getByRole('button', { name: '分析開始' })

    await user.click(button)
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledTimes(2)
  })
})