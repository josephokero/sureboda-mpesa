import React, { useRef, useEffect } from 'react';

const COLORS = [
  '#ea580c', // orange
  '#22c55e', // green
  '#2563eb', // blue
  '#f59e42', // yellow
  '#a21caf', // purple
  '#e11d48', // pink/red
];

const DashboardTeaser = () => {
  const pathRef = useRef(null);
  const arrowRef = useRef(null);
  const colorIndex = useRef(0);

  useEffect(() => {
    let timeout;
    const animateColor = () => {
      if (pathRef.current && arrowRef.current) {
        colorIndex.current = (colorIndex.current + 1) % COLORS.length;
        pathRef.current.style.stroke = COLORS[colorIndex.current];
        arrowRef.current.style.stroke = COLORS[colorIndex.current];
        arrowRef.current.style.fill = COLORS[colorIndex.current];
      }
      timeout = setTimeout(animateColor, 2000);
    };
    animateColor();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 px-0 py-0 shadow-lg w-full max-w-[320px] mx-auto flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center py-8">
        {/* Animated SVG Graph with grid, line, points, and animated arrow */}
        <svg width="140" height="70" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <g stroke="#f3f4f6" strokeWidth="1">
            <line x1="10" y1="60" x2="130" y2="60" />
            <line x1="10" y1="40" x2="130" y2="40" />
            <line x1="10" y1="20" x2="130" y2="20" />
            <line x1="10" y1="0" x2="130" y2="0" />
          </g>
          {/* Graph line */}
          <path
            ref={pathRef}
            d="M15 60 Q 35 40 55 50 Q 75 65 95 25 Q 115 10 125 15"
            fill="none"
            stroke={COLORS[0]}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 220,
              strokeDashoffset: 220,
              animation: 'graphUp 2s cubic-bezier(.4,1.6,.6,1) infinite',
            }}
          />
          {/* Data points */}
          <circle cx="15" cy="60" r="3" fill="#fff" stroke={COLORS[0]} strokeWidth="2" />
          <circle cx="55" cy="50" r="3" fill="#fff" stroke={COLORS[0]} strokeWidth="2" />
          <circle cx="75" cy="65" r="3" fill="#fff" stroke={COLORS[0]} strokeWidth="2" />
          <circle cx="95" cy="25" r="3" fill="#fff" stroke={COLORS[0]} strokeWidth="2" />
          <circle cx="125" cy="15" r="3" fill="#fff" stroke={COLORS[0]} strokeWidth="2" />
          {/* Animated arrow at the end of the graph */}
          <g ref={arrowRef} style={{
            opacity: 1,
            transformOrigin: '125px 15px',
            animation: 'arrowPop 2s cubic-bezier(.4,1.6,.6,1) infinite',
          }}>
            <polygon points="125,15 133,11 129,19" />
          </g>
          <style>{`
            @keyframes graphUp {
              0% { stroke-dashoffset: 220; }
              60% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes arrowPop {
              0% { opacity: 0; transform: scale(0.5); }
              60% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </svg>
      </div>
    </div>
  );
};

export default DashboardTeaser;
