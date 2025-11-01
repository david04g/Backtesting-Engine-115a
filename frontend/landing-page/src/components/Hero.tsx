import React from 'react';
import StockChart from './StockChart';

const Hero: React.FC = () => {
  return (
    <main className="px-12 py-16">
      <div className="flex items-start justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl pt-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-8 leading-tight">
            Test Your Trading Strategies
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Backtest your trading strategies with historical data, optimize parameters, and make data-driven decisions before risking real capital.
          </p>

          <div className="flex gap-6">
            <button className="px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-800 text-gray-800 rounded-full font-medium text-lg transition-colors">
              Get started
            </button>
            <button className="px-8 py-4 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium text-lg transition-colors">
              View demo
            </button>
          </div>
        </div>

        {/* Right Content - Stock Chart */}
        <div className="flex-1 max-w-xl">
          <StockChart />
        </div>
      </div>
    </main>
  );
};

export default Hero;