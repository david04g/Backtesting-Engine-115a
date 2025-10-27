import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const About: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-12 py-6">
        <Link to="/" className="text-2xl font-semibold">
          <span className="text-pink-500 italic">Simple</span>
          <span className="text-gray-800"> Strategies</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link 
            to="/"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === '/' 
                ? 'bg-lime-300 hover:bg-lime-400 text-gray-800' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/product"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === '/product' 
                ? 'bg-lime-300 hover:bg-lime-400 text-gray-800' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Product
          </Link>
          <Link 
            to="/about"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === '/about' 
                ? 'bg-lime-300 hover:bg-lime-400 text-gray-800' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            About
          </Link>
        </div>

        <button className="px-8 py-3 bg-lime-300 hover:bg-lime-400 text-gray-800 rounded-full font-medium transition-colors">
          Sign in
        </button>
      </nav>

      {/* Main Content */}
      <main className="px-12 py-16 flex items-center justify-center">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-bold text-gray-800 mb-8 text-center">
            About
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed text-center">
            This backtesting engine was created by Rohan Shukla, David Garcia, Nathan Nham, Nishan Lama, and Sanjana Manikandan.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;

