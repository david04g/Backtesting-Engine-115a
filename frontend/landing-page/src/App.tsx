import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Product from './components/Product';
import About from './components/About';

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
        <Route path="/product" element={<Product />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;