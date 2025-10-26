import React from 'react';

const StockChart: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-8 shadow-lg">
      {/* Stock Info Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-gray-700 font-semibold mb-1">AAPL</div>
          <div className="text-sm text-gray-500">1D 1m</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">212.68</div>
          <div className="text-sm text-green-600">+1.04 +0.49%</div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="relative h-48 mb-4">
        <svg viewBox="0 0 400 150" className="w-full h-full">
          {/* Red downtrend line */}
          <path
            d="M 0,80 L 20,85 L 40,75 L 60,90 L 80,95 L 100,110 L 120,105 L 140,100 L 160,85 L 180,80 L 200,75 L 220,80 L 240,70 L 260,65 L 280,55 L 300,45 L 320,35 L 340,30 L 360,25 L 380,20 L 400,15"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            className="opacity-80"
          />
          {/* Green uptrend line */}
          <path
            d="M 200,75 L 220,80 L 240,70 L 260,65 L 280,55 L 300,45 L 320,35 L 340,30 L 360,25 L 380,20 L 400,15"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            className="opacity-80"
          />
        </svg>
      </div>

      {/* Volume Bars */}
      <div className="flex items-end justify-between h-12 gap-1">
        {Array.from({ length: 50 }).map((_, i) => {
          const height = Math.random() * 100;
          const isGreen = i > 25;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t ${
                isGreen ? 'bg-green-400' : 'bg-red-400'
              } opacity-60`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StockChart;