import React from 'react';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroProps {
  onGetStartedClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Backtest Your Trading
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Strategies Simply
          </span>
        </h1>
        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Build, test, and optimize your trading strategies with our powerful yet intuitive backtesting engine. 
          No complex coding required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={onGetStartedClick}>
            <span>Start Building Strategies</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5" />
            <span>View on GitHub</span>
          </Button>
        </div>
      </div>
    </section>
  );
};