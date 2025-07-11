import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StockData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  data: StockData;
}

const styles = {
  chartContainer: {
    margin: '24px 0',
    height: '350px',
    position: 'relative' as const,
  },
};

export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const chartData = {
    labels: data.prices.map(p => p.date.toLocaleDateString('ja-JP')),
    datasets: [
      {
        label: '株価',
        data: data.prices.map(p => p.price),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: string | number) {
            return '$' + Number(value).toFixed(2);
          }
        }
      },
      x: {
        ticks: {
          maxTicksLimit: 10
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return '株価: $' + context.parsed.y.toFixed(2);
          }
        }
      }
    }
  };

  return (
    <div style={styles.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
};