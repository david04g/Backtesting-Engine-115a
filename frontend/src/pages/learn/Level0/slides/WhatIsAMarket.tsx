import React from 'react';

export const WhatIsAMarket: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">What is a Market?</h2>
        <p className="text-base leading-relaxed">
          A market matches buyers and sellers. The stock market connects investors and companies via exchanges. 
          Prices change with supply and demand. When more want to buy than sell, price rises. When more sell than buy, price falls.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <div className="bg-white rounded-md p-8 flex items-center justify-center" style={{ minHeight: '300px' }}>
          <svg width="400" height="250" viewBox="0 0 400 250">
            {/* Axes */}
            <line x1="50" y1="200" x2="350" y2="200" stroke="black" strokeWidth="2" />
            <line x1="50" y1="200" x2="50" y2="50" stroke="black" strokeWidth="2" />
            
            {/* Supply curve (green, upward) */}
            <path
              d="M 50 180 Q 150 140, 200 100 Q 250 80, 350 60"
              stroke="#22c55e"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Demand curve (red, downward) */}
            <path
              d="M 50 60 Q 150 80, 200 100 Q 250 140, 350 180"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Equilibrium point */}
            <circle cx="200" cy="100" r="5" fill="black" />
          </svg>
        </div>
      </div>
    </div>
  );
};

