import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import { AboutContent } from './pages/about';
import { ProfileContent } from './pages/profile';
import { CreatePage } from './pages/create';
import { useState } from 'react';
import { UserProps } from './types';
import PageContent from './pages/learn/[Level]/[PageContent]';



const App: React.FC = () => {
  const [user, setUser] = useState<UserProps | null>(null);
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
          <>
            <Navigation />
            <ProfileContent />
          </>
        } />
        <Route path="/create" element={
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <CreatePage />
          </div>
        } />
        <Route path="/learn/:level/:lesson" element={
          <>
            <Navigation />
            <PageContent />
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;