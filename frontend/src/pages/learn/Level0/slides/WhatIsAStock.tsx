import React, { useState, useEffect, useCallback, useRef } from 'react';

interface WhatIsAStockProps {
  onQuizComplete?: (isComplete: boolean) => void;
}

export const WhatIsAStock: React.FC<WhatIsAStockProps> = ({ onQuizComplete }) => {
  const [investableAssets, setInvestableAssets] = useState<string[]>([]);
  const [notFinancialAssets, setNotFinancialAssets] = useState<string[]>([]);
  
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
  
  const [availableItems, setAvailableItems] = useState<string[]>(items);
  
  // Correct answers
  const correctInvestableAssets = [
    'AAPL (Company Shares)',
    'BTC (Crypto Token)',
    'Gold ETF',
    'S&P 500 Index Fund',
    'Crude Oil Futures',
  ];
  
  const correctNotFinancialAssets = [
    'Gym Membership',
    'Coffee Mug',
    'Gift Card',
  ];
  
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Define checkAnswers first so it can be used in useEffect
  const checkAnswers = useCallback(() => {
    const wrongItems: string[] = [];
    
    // Check investable assets
    investableAssets.forEach(item => {
      if (!correctInvestableAssets.includes(item)) {
        wrongItems.push(item);
      }
    });
    
    // Check not financial assets
    notFinancialAssets.forEach(item => {
      if (!correctNotFinancialAssets.includes(item)) {
        wrongItems.push(item);
      }
    });
    
    // Check if correct items are missing
    correctInvestableAssets.forEach(item => {
      if (!investableAssets.includes(item)) {
        wrongItems.push(item);
      }
    });
    
    correctNotFinancialAssets.forEach(item => {
      if (!notFinancialAssets.includes(item)) {
        wrongItems.push(item);
      }
    });
    
    // Remove duplicates
    const uniqueWrongItems = Array.from(new Set(wrongItems));
    
    // Mark that answers have been checked and save current state
    setAnswersChecked(true);
    lastCheckedState.current = JSON.stringify({ investableAssets, notFinancialAssets, availableItems });
    
    if (uniqueWrongItems.length === 0) {
      setFeedback('All answers are correct!');
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    } else {
      setFeedback(`The following items are in the wrong place: ${uniqueWrongItems.join(', ')}`);
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [investableAssets, notFinancialAssets, onQuizComplete]);
  
  // Check if all items are correctly placed
  const checkIfComplete = useCallback((): boolean => {
    // All items must be placed (availableItems should be empty)
    if (availableItems.length > 0) {
      return false;
    }
    
    // Check if all investable assets are correct
    if (investableAssets.length !== correctInvestableAssets.length) {
      return false;
    }
    
    const investableCorrect = correctInvestableAssets.every(item => 
      investableAssets.includes(item)
    );
    
    // Check if all not financial assets are correct
    if (notFinancialAssets.length !== correctNotFinancialAssets.length) {
      return false;
    }
    
    const notFinancialCorrect = correctNotFinancialAssets.every(item => 
      notFinancialAssets.includes(item)
    );
    
    return investableCorrect && notFinancialCorrect;
  }, [investableAssets, notFinancialAssets, availableItems]);
  
  // Track if answers have been checked and are correct
  const [answersChecked, setAnswersChecked] = useState(false);
  const lastCheckedState = useRef<string>('');
  
  // Reset checked state when items change (user moved items, need to re-check)
  useEffect(() => {
    const currentState = JSON.stringify({ investableAssets, notFinancialAssets, availableItems });
    if (answersChecked && lastCheckedState.current !== currentState) {
      setAnswersChecked(false);
      setFeedback(null);
    }
  }, [investableAssets, notFinancialAssets, availableItems, answersChecked]);
  
  // Check completion only after answers have been checked
  useEffect(() => {
    if (answersChecked) {
      const isComplete = checkIfComplete();
      if (onQuizComplete) {
        onQuizComplete(isComplete);
      }
    } else {
      // If answers haven't been checked yet, disable next button
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [answersChecked, checkIfComplete, onQuizComplete]);
  
  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.setData('source', e.currentTarget.getAttribute('data-source') || 'items');
  };
  
  const handleDrop = (e: React.DragEvent, targetCategory: 'items' | 'investable' | 'not') => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    const source = e.dataTransfer.getData('source');
    
    // Remove from source
    if (source === 'items') {
      setAvailableItems(prev => prev.filter(i => i !== item));
    } else if (source === 'investable') {
      setInvestableAssets(prev => prev.filter(i => i !== item));
    } else if (source === 'not') {
      setNotFinancialAssets(prev => prev.filter(i => i !== item));
    }
    
    // Add to target
    if (targetCategory === 'items') {
      setAvailableItems(prev => [...prev, item]);
    } else if (targetCategory === 'investable') {
      setInvestableAssets(prev => [...prev, item]);
    } else if (targetCategory === 'not') {
      setNotFinancialAssets(prev => [...prev, item]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-md p-4 flex-shrink-0" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-xl font-bold mb-2">What is a stock?</h2>
        <p className="text-sm leading-relaxed">
          A stock is a small slice of a company. Its price changes over time. If you buy at a lower price and later 
          the price is higher, the position has profit.
        </p>
      </div>
      
      <div className="rounded-md p-4 flex-1 flex flex-col min-h-0" style={{ backgroundColor: '#E8B6B6' }}>
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          <div
            onDrop={(e) => handleDrop(e, 'items')}
            onDragOver={handleDragOver}
            className="rounded-md p-3 overflow-y-auto"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-2 text-sm">Items</h3>
            <div className="space-y-1.5">
              {availableItems.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="items"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-3 py-1.5 text-sm cursor-move transition-all hover:opacity-80"
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div
            onDrop={(e) => handleDrop(e, 'investable')}
            onDragOver={handleDragOver}
            className="rounded-md p-3 overflow-y-auto"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-2 text-sm">Investable Assets</h3>
            <div className="space-y-1.5">
              {investableAssets.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="investable"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-3 py-1.5 text-sm cursor-move transition-all hover:opacity-80"
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div
            onDrop={(e) => handleDrop(e, 'not')}
            onDragOver={handleDragOver}
            className="rounded-md p-3 overflow-y-auto"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-2 text-sm">Not Financial Assets</h3>
            <div className="space-y-1.5">
              {notFinancialAssets.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="not"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-3 py-1.5 text-sm cursor-move transition-all hover:opacity-80"
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col items-center gap-2 flex-shrink-0">
          <button
            onClick={checkAnswers}
            className="rounded-md px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md border-2"
            style={{ backgroundColor: '#8B5A5A', borderColor: '#6B3E3E' }}
          >
            Check Answers
          </button>
          {feedback && (
            <div className="rounded-md px-3 py-1.5 text-xs text-center" style={{ backgroundColor: '#D9F2A6' }}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

