import React from 'react';
import { FeatureCardProps } from '../../types';

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgColor,
  iconColor,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
      <div className={`${iconBgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
};