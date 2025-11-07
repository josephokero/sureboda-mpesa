import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const MonthlyStreamsChart = ({ analytics = [] }) => {
  // Always show 12 months for the current year
  const now = new Date();
  const year = now.getFullYear();
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  // Map: month index (0-11) => streams
  const streamsByMonth = Array(12).fill(0);
  analytics.forEach(a => {
    if (!a.month) return;
    // Accept formats like '2025-08' or '2025-8'
    const [y, m] = a.month.split('-');
    if (Number(y) === year) {
      const monthIdx = Number(m) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        streamsByMonth[monthIdx] += Number(a.streams) || 0;
      }
    }
  });

  const data = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Streams',
        data: streamsByMonth,
        backgroundColor: '#ff9800',
        borderRadius: 2,
        barPercentage: 0.7, // slightly wider bars
        categoryPercentage: 0.8, // a bit less space between bars
        maxBarThickness: 22, // slightly larger bars
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Streams: ${ctx.parsed.y.toLocaleString()}`,
        },
        bodyFont: { size: 9 },
        titleFont: { size: 10 },
        padding: 4,
      },
    },
    layout: {
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: { color: '#333', font: { size: 9 }, maxRotation: 0, minRotation: 0 },
        grid: { color: '#e3e3e3', drawOnChartArea: false },
      },
      y: {
        title: { display: false },
    ticks: {
      color: '#333',
      font: { size: 9 },
      callback: v => v.toLocaleString(),
      stepSize: 20000,
      padding: 8,
    },
    grid: { color: '#e3e3e3' },
    beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded shadow p-2" style={{ height: 260, minHeight: 180 }}>
      <Bar data={data} options={options} height={220} />
    </div>
  );
};

export default MonthlyStreamsChart;
