import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-12 py-6">
      {/* Logo */}
      <div className="text-2xl font-semibold">
        <span className="text-pink-500 italic">Simple</span>
        <span className="text-gray-800"> Strategies</span>
      </div>
      
      {/* Center Navigation */}
      <div className="flex items-center gap-8">
        <button className="px-8 py-3 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium transition-colors">
          Home
        </button>
        <button className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors">
          Product
        </button>
        <button className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors">
          About
        </button>
      </div>

      {/* Sign In Button */}
      <button className="px-8 py-3 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium transition-colors">
        Sign in
      </button>
    </nav>
  );
};

export default Navigation;