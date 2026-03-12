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

export function ChartCard() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a1a1aa', // zinc-400
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#18181b', // zinc-900
        titleColor: '#f4f4f5', // zinc-100
        bodyColor: '#a1a1aa', // zinc-400
        borderColor: '#27272a', // zinc-800
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: '#27272a', // zinc-800
        },
        ticks: {
          color: '#71717a', // zinc-500
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#71717a', // zinc-500
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717a', // zinc-500
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const labels = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  const data = {
    labels,
    datasets: [
      {
        label: '온도 (°C)',
        data: [14, 18, 24, 25, 20, 15],
        borderColor: '#fbbf24', // amber-400
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        yAxisID: 'y',
        fill: true,
        tension: 0.4,
      },
      {
        label: '토양 수분 (%)',
        data: [45, 42, 38, 35, 38, 41],
        borderColor: '#38bdf8', // sky-400
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        yAxisID: 'y1',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <Line options={options} data={data} />
    </div>
  );
}
