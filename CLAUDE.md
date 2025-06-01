# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese stock price analysis web application built with React, TypeScript, and Vite. The application allows users to analyze stock prices with interactive charts and statistical calculations.

## Architecture

### Core Technologies

- **React 18**: Frontend framework with functional components and hooks
- **TypeScript**: Type-safe JavaScript with strict typing enabled
- **Vite**: Build tool and development server with hot module replacement
- **Chart.js + react-chartjs-2**: Interactive chart visualization
- **ESLint**: Code linting with TypeScript and React rules

### Project Structure

```
src/
├── components/          # React components
│   ├── StockForm.tsx       # Form for stock symbol and period input
│   ├── LoadingSpinner.tsx  # Loading state component
│   ├── StockInfo.tsx       # Stock information display
│   ├── StockChart.tsx      # Chart.js wrapper component
│   └── AnalysisResults.tsx # Statistical analysis display
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   ├── stockDataGenerator.ts  # Mock data generation
│   └── stockAnalysis.ts       # Statistical calculations
├── App.tsx             # Main application component
├── main.tsx           # React app entry point
└── style.css         # Global styles
```

### Key Architectural Patterns

- **Component-based architecture**: Each UI section is a separate React component with defined props interfaces
- **TypeScript strict mode**: All functions and components are fully typed with interfaces
- **Custom hooks pattern**: State management using React useState and useEffect hooks
- **Separation of concerns**: Business logic separated into utility functions, UI logic in components
- **Mock data system**: Realistic stock data generation with configurable time periods

### Data Flow

1. User interacts with `StockForm` component (symbol input, period selection)
2. Form submission triggers `handleAnalyzeStock` in main `App` component
3. `generateMockStockData` utility creates realistic price data based on inputs
4. `calculateStockAnalysis` utility computes statistical metrics
5. State updates trigger re-render of `StockInfo`, `StockChart`, and `AnalysisResults` components
6. Chart.js renders interactive visualization via `react-chartjs-2`

## Development Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Type checking without emitting files
```

## Type Definitions

Key TypeScript interfaces defined in `src/types/index.ts`:
- `StockPrice`: Individual price point with date and value
- `StockData`: Complete dataset with company info and price history
- `StockAnalysis`: Statistical calculations (volatility, returns, etc.)
- `TimePeriod`: Union type for supported time ranges
- `StockFormData`: Form input data structure

## Code Conventions

- **Functional components**: All React components use function syntax with TypeScript
- **Interface-first design**: TypeScript interfaces defined before implementation
- **Japanese UI text**: All user-facing labels and messages in Japanese
- **Consistent naming**: PascalCase for components, camelCase for functions/variables
- **Clean imports**: Relative imports for local modules, absolute for dependencies
- **Modern React patterns**: Hooks-based state management, no class components

## Mock Data Details

The application includes realistic mock data for major tech stocks (AAPL, GOOGL, TSLA, MSFT, AMZN, NVDA, META). Data generation:
- Excludes weekends (trading days only)
- Applies random daily fluctuations of ±5%
- Configurable time periods (1mo, 3mo, 6mo, 1y, 2y)
- Realistic base prices for each company

## Statistical Calculations

Implemented in `src/utils/stockAnalysis.ts`:
- Maximum/minimum prices for the period
- Average price calculation
- Annualized volatility (using 252 trading days)
- Total return percentage
- Daily return calculations for volatility analysis