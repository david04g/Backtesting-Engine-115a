import React from 'react';
import { DragAndDropQuiz, Category } from '../../../../components/quiz';

interface WhatIsAStockProps {
  onQuizComplete?: (isComplete: boolean) => void;
}

export const WhatIsAStock: React.FC<WhatIsAStockProps> = ({ onQuizComplete }) => {
  const items = [
    'AAPL (Company Shares)',
    'BTC (Crypto Token)',
    'Gold ETF',
    'S&P 500 Index Fund',
    'Gym Membership',
    'Coffee Mug',
    'Gift Card',
    'Crude Oil Futures',
  ];
  
  const categories: Category[] = [
    {
      id: 'investable',
      label: 'Investable Assets',
      correctAnswers: [
        'AAPL (Company Shares)',
        'BTC (Crypto Token)',
        'Gold ETF',
        'S&P 500 Index Fund',
        'Crude Oil Futures',
      ],
    },
    {
      id: 'not',
      label: 'Not Financial Assets',
      correctAnswers: [
        'Gym Membership',
        'Coffee Mug',
        'Gift Card',
      ],
    },
  ];
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-md p-4 flex-shrink-0" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-xl font-bold mb-2">What is a stock?</h2>
        <p className="text-sm leading-relaxed">
          A stock is a small slice of a company. Its price changes over time. If you buy at a lower price and later 
          the price is higher, the position has profit.
        </p>
      </div>
      
      <DragAndDropQuiz
        items={items}
        categories={categories}
        onQuizComplete={onQuizComplete}
      />
    </div>
  );
};

