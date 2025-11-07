import React from 'react';

export const BrokerageAccounts: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">Brokerage Accounts</h2>
        <p className="text-base leading-relaxed">
          A brokerage account lets you deposit cash and place orders. Flow: Deposit → Choose asset → Broker routes order → Trade executes → You hold the asset.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#D9F2A6' }}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">Deposit</span>
            </div>
            <span className="text-2xl">→</span>
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">Choose Asset</span>
            </div>
            <span className="text-2xl">→</span>
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">Place Order</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">Routing</span>
            </div>
            <span className="text-2xl">→</span>
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">Execution</span>
            </div>
            <span className="text-2xl">→</span>
            <div className="rounded-full px-6 py-3" style={{ backgroundColor: '#E8B6B6' }}>
              <span className="font-semibold">You Hold Shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


