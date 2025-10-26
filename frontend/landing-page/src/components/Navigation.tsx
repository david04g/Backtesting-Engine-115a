import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="px-12 py-6 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">
          TradingBacktest
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-gray-800 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-800 transition-colors">
            Pricing
          </a>
          <a href="#docs" className="text-gray-600 hover:text-gray-800 transition-colors">
            Docs
          </a>
          <button className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-medium transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;