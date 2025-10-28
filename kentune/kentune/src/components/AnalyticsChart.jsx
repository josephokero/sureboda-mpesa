import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsChart({ stats }) {
  // Group by month and sum streams per platform
  const months = Array.from(new Set(stats.map(s => s.month))).sort();
  const platforms = Array.from(new Set(stats.map(s => s.platform)));
  const datasets = platforms.map(platform => ({
    label: platform,
    data: months.map(month => {
      const stat = stats.find(s => s.month === month && s.platform === platform);
      return stat ? stat.streams : 0;
    }),
    fill: false,
    borderColor: platform === 'Spotify' ? '#1DB954' : platform === 'Apple Music' ? '#000' : '#FF0000',
    backgroundColor: platform === 'Spotify' ? '#1DB954' : platform === 'Apple Music' ? '#000' : '#FF0000',
    tension: 0.3,
  }));

  const data = {
    labels: months,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Streams by Platform' },
    },
  };

  return <Line data={data} options={options} />;
}
