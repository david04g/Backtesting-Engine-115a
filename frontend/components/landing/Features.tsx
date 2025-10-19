import React from 'react';
import { Zap, Code, TestTube, BarChart3, Shield, Github } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Lightning Fast',
      description: 'Run backtests on years of historical data in seconds. Optimize your strategies with blazing performance.',
      iconBgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: <Code className="w-7 h-7" />,
      title: 'Simple Interface',
      description: 'Intuitive strategy builder that makes complex backtesting accessible to everyone, from beginners to pros.',
      iconBgColor: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      icon: <TestTube className="w-7 h-7" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive metrics and visualizations to understand your strategy\'s performance and risk profile.',
      iconBgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Rich Data Sources',
      description: 'Access multiple market data providers and asset classes for comprehensive strategy testing.',
      iconBgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Reliable & Accurate',
      description: 'Industry-standard backtesting methodologies ensure your results are accurate and trustworthy.',
      iconBgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
    },
    {
      icon: <Github className="w-7 h-7" />,
      title: 'Open Source',
      description: 'Fully open source and transparent. Contribute, customize, and deploy on your own infrastructure.',
      iconBgColor: 'bg-pink-500/10',
      iconColor: 'text-pink-400',
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};