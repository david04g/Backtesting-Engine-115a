import React from 'react';
import { ButtonProps } from '../../types';

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  target,
  rel,
}) => {
  const baseStyles = 'font-semibold transition-all rounded-lg inline-flex items-center justify-center space-x-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600',
    ghost: 'text-slate-300 hover:text-white',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={combinedClassName}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};