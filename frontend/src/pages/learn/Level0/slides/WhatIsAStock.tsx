import React, { useState } from 'react';

export const WhatIsAStock: React.FC = () => {
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
    <div className="flex flex-col gap-6">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">What is a stock?</h2>
        <p className="text-base leading-relaxed">
          A stock is a small slice of a company. Its price changes over time. If you buy at a lower price and later 
          the price is higher, the position has profit.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <div className="grid grid-cols-3 gap-6">
          <div
            onDrop={(e) => handleDrop(e, 'items')}
            onDragOver={handleDragOver}
            className="rounded-md p-4 min-h-[300px]"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {availableItems.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="items"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-4 py-2 cursor-move transition-all hover:opacity-80"
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
            className="rounded-md p-4 min-h-[300px]"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-3">Investable Assets</h3>
            <div className="space-y-2">
              {investableAssets.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="investable"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-4 py-2 cursor-move transition-all hover:opacity-80"
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
            className="rounded-md p-4 min-h-[300px]"
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-3">Not Financial Assets</h3>
            <div className="space-y-2">
              {notFinancialAssets.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="not"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-md px-4 py-2 cursor-move transition-all hover:opacity-80"
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

