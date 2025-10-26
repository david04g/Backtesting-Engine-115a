import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Hero />
    </div>
  );
};

export default App;