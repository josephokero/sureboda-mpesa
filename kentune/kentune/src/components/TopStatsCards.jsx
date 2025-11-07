import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopStatsCards({ stats }) {
  const navigate = useNavigate();
  if (!stats || stats.length === 0) return null;
  // Sort by streams descending, take top 3
  const topStats = [...stats].sort((a, b) => b.streams - a.streams).slice(0, 3);
  const platformColors = {
    spotify: '#1DB954',
    apple: '#FA243C',
    youtube: '#FF0000',
    tiktok: '#010101',
    default: '#F59E42',
  };
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Top Analytics</h2>
        <button
          className="text-primary font-medium hover:underline text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => navigate('/analytics-revenue-tracking')}
        >
          View All
        </button>
      </div>
      <div
        className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-10 relative z-10 px-1"
      >
        {topStats.map((stat, i) => {
          const color = platformColors[(stat.platform || '').toLowerCase()] || platformColors.default;
          // Use a different gradient for each card for visual interest
          const gradients = [
            'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
            'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)',
            'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
          ];
          return (
            <div
              key={stat.id || i}
              className={`group analytics-glass-card relative rounded-[2.2rem] shadow-2xl px-8 py-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:shadow-3xl animate-fade-in border-0 ${i < topStats.length - 1 ? 'mb-6 md:mb-0' : ''}`}
              style={{
                animationDelay: `${i * 0.1 + 0.1}s`,
                animationDuration: '0.7s',
                minWidth: 220,
                maxWidth: 260,
                background: gradients[i % gradients.length],
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                border: `2.5px solid ${color}33`,
                marginTop: i === 1 ? '-1.5rem' : '0', // center card floats higher on desktop
                zIndex: i === 1 ? 2 : 1,
              }}
              tabIndex={0}
              aria-label={`Top stat: ${stat.platform}, ${stat.streams} streams, ${stat.month}`}
              onClick={() => navigate('/analytics-revenue-tracking')}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-lg font-bold capitalize drop-shadow"
                  style={{ color }}
                >
                  {stat.platform}
                </span>
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }}></span>
              </div>
              <div className="text-4xl font-extrabold mb-1 text-gray-900 group-hover:text-primary transition-colors duration-200 animate-bounce-in tracking-tight">
                {stat.streams.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mb-1 tracking-wide">streams</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.month}</div>
            </div>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .analytics-glass-card {
          background: rgba(255,255,255,0.55);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border: 2.5px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.3,1) both; }
        @keyframes bounce-in {
          0% { transform: scale(0.7); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.4,2,.3,1) both; }
      `}</style>
      {/* Soft background gradient for the section */}
      <div className="absolute left-0 right-0 top-0 h-64 -z-10 w-full" style={{background: 'linear-gradient(120deg, #a5b4fc 0%, #f0fdfa 100%)', filter: 'blur(32px)', opacity: 0.7}} />
    </div>
  );
}
