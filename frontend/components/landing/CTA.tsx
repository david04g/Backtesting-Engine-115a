import React from 'react';
import { Button } from '../ui/Button';

interface CTAProps {
  onGetStartedClick: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onGetStartedClick }) => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Build Your First Strategy?
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Join traders and developers who are already backtesting smarter.
        </p>
        <Button variant="primary" size="lg" onClick={onGetStartedClick}>
          Get Started for Free
        </Button>
      </div>
    </section>
  );
};