import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import { ProductContent } from './pages/product';
import { AboutContent } from './pages/about';
import { ProfileContent } from './pages/profile';
import { PortfolioContent } from './pages/portfolio';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Hero />
          </div>
        } />
        <Route path="/product" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <ProductContent />
          </div>
        } />
        <Route path="/about" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <AboutContent />
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <ProfileContent />
          </div>
        } />
        <Route path="/portfolio" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <PortfolioContent />
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;