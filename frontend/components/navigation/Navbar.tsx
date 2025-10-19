import React from 'react';
import { TrendingUp, Github } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onSignupClick }) => {
  return (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Simple Strategies</span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <Button variant="ghost" onClick={onLoginClick}>
              Login
            </Button>
            <Button variant="primary" size="md" onClick={onSignupClick}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};