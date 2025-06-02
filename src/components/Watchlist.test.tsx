import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils/renderWithProviders';
import { Watchlist } from './Watchlist';
import { WatchlistItem } from '../types';

describe('Watchlist', () => {
  const mockOnSelectStock = vi.fn();
  const mockOnRemoveStock = vi.fn();

  const sampleItems: WatchlistItem[] = [
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      addedAt: new Date('2024-01-01'),
      lastPrice: 150.0,
      priceChange: 5.0
    },
    {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc. Class A',
      addedAt: new Date('2024-01-02'),
      lastPrice: 2800.0,
      priceChange: -15.0
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('空のウォッチリスト', () => {
    it('空の状態を表示する', () => {
      render(
        <Watchlist
          items={[]}
          onSelectStock={mockOnSelectStock}
          onRemoveStock={mockOnRemoveStock}
        />
      );

      expect(screen.getByText('⭐ ウォッチリスト')).toBeInTheDocument();
      expect(screen.getByText('ウォッチリストに銘柄を追加すると、ここに表示されます')).toBeInTheDocument();
      expect(screen.getByTestId('watchlist-container')).toBeInTheDocument();
    });
  });

  describe('アイテムがあるウォッチリスト', () => {
    beforeEach(() => {
      render(
        <Watchlist
          items={sampleItems}
          onSelectStock={mockOnSelectStock}
          onRemoveStock={mockOnRemoveStock}
        />
      );
    });

    it('ウォッチリストのアイテム数を表示する', () => {
      expect(screen.getByText('⭐ ウォッチリスト (2)')).toBeInTheDocument();
    });

    it('すべてのウォッチリストアイテムを表示する', () => {
      expect(screen.getByTestId('watchlist-item-AAPL')).toBeInTheDocument();
      expect(screen.getByTestId('watchlist-item-GOOGL')).toBeInTheDocument();
      
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('Alphabet Inc. Class A')).toBeInTheDocument();
    });

    it('価格情報を正しく表示する', () => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('+$5.00')).toBeInTheDocument();
      expect(screen.getByText('$2800.00')).toBeInTheDocument();
      expect(screen.getByText('$-15.00')).toBeInTheDocument();
    });

    it('価格変動の色分けが正しく適用される', () => {
      const positiveChange = screen.getByText('+$5.00');
      const negativeChange = screen.getByText('$-15.00');
      
      expect(positiveChange).toHaveStyle({ color: '#2e7d32' });
      expect(negativeChange).toHaveStyle({ color: '#c62828' });
    });

    it('銘柄をクリックすると選択コールバックが呼ばれる', () => {
      const aaplItem = screen.getByTestId('watchlist-item-AAPL');
      fireEvent.click(aaplItem);
      
      expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL');
    });

    it('削除ボタンをクリックすると削除コールバックが呼ばれる', () => {
      const removeButton = screen.getByTestId('remove-watchlist-AAPL');
      fireEvent.click(removeButton);
      
      expect(mockOnRemoveStock).toHaveBeenCalledWith('AAPL');
      // onSelectStockは呼ばれない（イベントの伝播が停止される）
      expect(mockOnSelectStock).not.toHaveBeenCalled();
    });

    it('削除ボタンにホバー効果がある', () => {
      const removeButton = screen.getByTestId('remove-watchlist-AAPL');
      
      fireEvent.mouseEnter(removeButton);
      expect(removeButton).toHaveStyle({ 
        background: '#ffebee',
        color: '#c62828'
      });
      
      fireEvent.mouseLeave(removeButton);
    });
  });

  describe('価格情報なしのアイテム', () => {
    const itemsWithoutPrice: WatchlistItem[] = [
      {
        symbol: 'TSLA',
        companyName: 'Tesla, Inc.',
        addedAt: new Date('2024-01-01')
        // lastPrice と priceChange がない
      }
    ];

    it('価格情報がない場合は価格セクションを表示しない', () => {
      render(
        <Watchlist
          items={itemsWithoutPrice}
          onSelectStock={mockOnSelectStock}
          onRemoveStock={mockOnRemoveStock}
        />
      );

      expect(screen.getByText('TSLA')).toBeInTheDocument();
      expect(screen.getByText('Tesla, Inc.')).toBeInTheDocument();
      
      // 価格情報は表示されない
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('長い会社名の処理', () => {
    const itemsWithLongName: WatchlistItem[] = [
      {
        symbol: 'VERY',
        companyName: 'Very Long Company Name That Should Be Truncated With Ellipsis',
        addedAt: new Date('2024-01-01')
      }
    ];

    it('長い会社名を適切に処理する', () => {
      render(
        <Watchlist
          items={itemsWithLongName}
          onSelectStock={mockOnSelectStock}
          onRemoveStock={mockOnRemoveStock}
        />
      );

      const companyNameElement = screen.getByText('Very Long Company Name That Should Be Truncated With Ellipsis');
      expect(companyNameElement).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      });
      expect(companyNameElement).toHaveAttribute('title', 'Very Long Company Name That Should Be Truncated With Ellipsis');
    });
  });
});