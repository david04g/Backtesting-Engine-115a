import React from 'react';

const ProductContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="px-12 py-16">
        <div className="flex items-start justify-between gap-12">
          {/* Left Column - Placeholder */}
          <div className="flex-1 max-w-xl">
            <div className="bg-white border-2 border-gray-200 rounded-lg h-96 flex items-center justify-center shadow-sm">
              <div className="text-gray-300 text-lg">Image/Demo Placeholder</div>
            </div>
          </div>

          {/* Right Column - Product Description */}
          <div className="flex-1 max-w-2xl pt-8">
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Our Backtesting uses advanced algorithms to simulate how your trading strategies would have performed using historical market data. Our product uses quantitative analysis, machine learning models, and comprehensive performance metrics to help you optimize parameters and make data-driven decisions before deploying real capital.
            </p>

            <button className="px-8 py-4 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium text-lg transition-colors">
              View demo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductContent;

