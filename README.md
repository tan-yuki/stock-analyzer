## ⚠️　Notice　⚠️

これはClaude Codeで作ったサンプルアプリです。

---

# 📈 株価分析アプリ

[![CI/CD Pipeline](https://github.com/tan-yuki/stock-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/tan-yuki/stock-analyzer/actions/workflows/ci.yml)
[![Detailed Test Analysis](https://github.com/tan-yuki/stock-analyzer/actions/workflows/test-detail.yml/badge.svg)](https://github.com/tan-yuki/stock-analyzer/actions/workflows/test-detail.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-8.57.1-4B32C3?logo=eslint)](https://eslint.org/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6.1-6E9F18?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

React + TypeScript で構築された日本語の株価分析ツールです。銘柄コードを入力するだけで、株価チャートと統計分析を表示します。

## 🌐 ライブデモ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tan-yuki/stock-analyzer)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tan-yuki/stock-analyzer)

> **デモサイト**: [https://stock-analyzer-mocha.vercel.app/](https://stock-analyzer-mocha.vercel.app/) 

## ✨ 機能

- **リアルタイム株価取得**: Alpha Vantage API から実際の株価データを取得
- **銘柄検索**: 主要な米国株（AAPL、GOOGL、TSLA等）の分析
- **期間選択**: 1ヶ月〜2年の期間を選択可能
- **インタラクティブチャート**: Chart.js による滑らかな価格推移表示
- **統計分析**: 最高値・最安値・平均値・ボラティリティ・期間収益率を自動計算
- **自動フォールバック**: API制限時はモックデータで継続利用可能
- **レスポンシブデザイン**: モバイル・デスクトップ両対応

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Chart Library**: Chart.js + react-chartjs-2
- **Styling**: CSS (カスタムスタイル)
- **Linting**: ESLint + TypeScript rules

## 🔧 品質保証・CI/CD

### 自動化されたテスト
- **テストカバレッジ**: 90%以上の高いカバレッジを維持
- **単体テスト**: コンポーネント・ユーティリティ・サービス層の包括的テスト
- **統合テスト**: API連携を含むエンドツーエンドフローテスト
- **Flaky防止**: 確定的なテストデータとタイムアウト制御で安定したテスト実行

### 継続的インテグレーション
- **GitHub Actions**: プッシュ・プルリクエスト時の自動実行
- **Node.js 22/24対応**: 最新のNode.js環境での動作確認
- **コード品質チェック**: ESLint・TypeScript型チェック・セキュリティ監査
- **ビルド検証**: 本番環境ビルドの自動検証

### 開発品質
- **TypeScript厳格設定**: `any`型禁止・完全型安全
- **Modern React**: 関数コンポーネント・Hooks・コンテキスト対応
- **アクセシビリティ**: WAI-ARIA準拠・キーボードナビゲーション対応

## 🚀 セットアップ

### 前提条件

- Node.js 22+ がインストールされていること（推奨: 22 または 24）
- npm または yarn がインストールされていること

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/tan-yuki/stock-analyzer.git
cd stock-analyzer

# 依存関係をインストール
npm install

# 環境変数を設定（オプション）
cp .env.example .env
# .env ファイルを編集してAPIキーを設定

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセスできます。

### API設定（オプション）

実際の株価データを取得するために、Alpha Vantage の無料APIキーを取得できます：

1. [Alpha Vantage](https://www.alphavantage.co/support/#api-key) で無料APIキーを取得
2. `.env.example` を `.env` にコピー
3. `.env` ファイルで `VITE_ALPHA_VANTAGE_API_KEY` を設定

APIキーが設定されていない場合は、デモデータで動作します。

## 📋 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクション用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview

# TypeScript型チェック
npm run typecheck

# ESLintによるコードチェック
npm run lint
```

## 📊 対応銘柄

現在、以下の主要な米国株に対応しています：

- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet Inc.
- **TSLA** - Tesla Inc.
- **MSFT** - Microsoft Corporation
- **AMZN** - Amazon.com Inc.
- **NVDA** - NVIDIA Corporation
- **META** - Meta Platforms Inc.

※ APIキーが設定されている場合は実際の株価データを取得し、未設定の場合はデモ用データを使用します。

## 📱 使用方法

1. **銘柄コード入力**: 上記の対応銘柄コードを入力
2. **期間選択**: 分析したい期間を選択（1ヶ月〜2年）
3. **分析開始**: ボタンをクリックして分析を実行
4. **結果確認**: チャートと統計データを確認

## 🏗️ プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── StockForm.tsx       # 銘柄・期間入力フォーム
│   ├── LoadingSpinner.tsx  # ローディング表示
│   ├── StockInfo.tsx       # 銘柄情報表示
│   ├── StockChart.tsx      # チャート表示
│   └── AnalysisResults.tsx # 分析結果表示
├── services/            # API関連サービス
│   └── stockApiService.ts  # Alpha Vantage API呼び出し
├── types/               # TypeScript型定義
│   └── index.ts
├── utils/               # ユーティリティ関数
│   ├── stockDataGenerator.ts  # モックデータ生成（フォールバック用）
│   └── stockAnalysis.ts       # 統計計算
├── App.tsx             # メインアプリケーション
├── main.tsx           # エントリーポイント
└── style.css         # グローバルスタイル
```

## 🔧 開発情報

### 統計計算

アプリケーションでは以下の指標を計算しています：

- **最高値・最安値**: 選択期間内の価格範囲
- **平均値**: 期間内の平均株価
- **ボラティリティ**: 年率換算した価格変動率（252営業日基準）
- **期間収益率**: 期間開始から終了までの総リターン

### データ取得

**実際のAPIデータ（推奨）:**
- Alpha Vantage API から実際の株価データを取得
- 会社名、日次終値データを含む詳細情報
- レート制限: 無料プランでは1分間に5回、1日500回のリクエスト

**フォールバックデータ:**
- API制限やエラー時は自動的にモックデータに切り替え
- 土日を除く営業日のみ生成
- 日次変動率 ±5% 以内のランダムな価格変動
- 各銘柄のリアルな基準価格を設定

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- [Chart.js](https://www.chartjs.org/) - 美しいチャート描画ライブラリ
- [React](https://reactjs.org/) - ユーザーインターフェース構築
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発環境
- [Vite](https://vitejs.dev/) - 高速なビルドツール

---

🤖 Generated with [Claude Code](https://claude.ai/code)
