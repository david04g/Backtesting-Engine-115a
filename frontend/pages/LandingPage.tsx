import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';
import { AuthModal } from '../components/auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
      <Hero onGetStartedClick={handleSignupClick} />
      <Features />
      <CTA onGetStartedClick={handleSignupClick} />
      <Footer />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};