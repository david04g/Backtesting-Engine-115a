import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import { AboutContent } from './pages/about';
import { ProfileContent } from './pages/profile';

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
      </Routes>
    </Router>
  );
};

export default App;