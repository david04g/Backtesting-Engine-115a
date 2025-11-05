import React from 'react';

const AboutContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="px-12 py-16">
        <div className="flex items-center justify-center">
          {/* Product Description */}
          <div className="max-w-2xl pt-8 text-center">
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Our educational backtesting engine site uses advanced algorithms to simulate how your trading strategies would have performed using historical market data. Our product uses quantitative analysis and comprehensive performance metrics to help you optimize parameters and make data-driven decisions before deploying real capital. Our site teaches users the fundamentals of trading including what a stock is, what a strategy is, what backtesting is, and much more.
            </p>

            <div className="flex justify-center">
              <button className="px-8 py-4 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium text-lg transition-colors">
                View demo
              </button>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16 flex items-center justify-center">
          <div className="max-w-4xl">
            <p className="text-xl text-gray-600 leading-relaxed text-center">
              This backtesting engine was created by Rohan Shukla, David Garcia, Nathan Nham, Nishan Lama, and Sanjana Manikandan.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutContent;
