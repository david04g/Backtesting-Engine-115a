import React from 'react';

const AboutContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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

export default AboutContent;

