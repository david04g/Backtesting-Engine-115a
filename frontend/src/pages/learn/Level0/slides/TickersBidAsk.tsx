import React from 'react';

export const TickersBidAsk: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">Tickers, Bid/Ask, Market Hours</h2>
        <p className="text-base leading-relaxed">
          A ticker is a short symbol identifying a stock (AAPL for Apple). A bid is the highest price a buyer offers 
          and the ask is the lowest price a seller accepts. The difference between them is the spread.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <div className="flex flex-col gap-4 items-center">
          <div className="rounded-md px-4 py-2 w-full max-w-md text-center" style={{ backgroundColor: '#D9F2A6' }}>
            <span className="font-semibold">TICKER: AAPL</span>
          </div>
          
          <div className="flex items-center justify-center gap-8 w-full max-w-2xl">
            <div className="rounded-md px-6 py-4 text-center" style={{ backgroundColor: '#D9F2A6' }}>
              <div className="text-sm font-semibold mb-1">BID</div>
              <div className="text-xl font-bold">$155</div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-full flex items-center justify-center">
                {/* Double-sided arrow */}
                <svg width="200" height="40" className="absolute">
                  <line x1="0" y1="20" x2="200" y2="20" stroke="black" strokeWidth="3" />
                  <polygon points="0,20 10,15 10,25" fill="black" />
                  <polygon points="200,20 190,15 190,25" fill="black" />
                </svg>
                {/* Spread text centered on arrow */}
                <div className="relative z-10 bg-transparent px-2">
                  <div className="text-sm font-semibold text-center">SPREAD</div>
                  <div className="text-sm font-semibold text-center">$.10</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-md px-6 py-4 text-center" style={{ backgroundColor: '#D9F2A6' }}>
              <div className="text-sm font-semibold mb-1">ASK</div>
              <div className="text-xl font-bold">155.10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

