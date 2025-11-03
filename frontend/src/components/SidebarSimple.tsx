import React from 'react';

type SidebarSimpleProps = {
  active: 'portfolio' | 'strategy';
};

const IconDot: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="3" />
  </svg>
);

const IconList: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="6" width="16" height="2" rx="1" />
    <rect x="4" y="11" width="16" height="2" rx="1" />
    <rect x="4" y="16" width="16" height="2" rx="1" />
  </svg>
);

export const SidebarSimple: React.FC<SidebarSimpleProps> = ({ active }) => {
  return (
    <aside className="flex flex-col justify-between" style={{ width: 200, backgroundColor: '#D9F2A6' }}>
      <div>
        <div className="px-6 pt-6 text-sm italic text-gray-700">Simple <span className="not-italic font-semibold">Strategies</span></div>
        <nav className="mt-6 space-y-3 px-4">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md ${active === 'portfolio' ? 'bg-white/40' : ''}`}>
            <IconDot />
            <span className="font-semibold">Portfolio</span>
            <span className="ml-auto">‹</span>
          </div>
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md ${active === 'strategy' ? 'bg-white/40' : ''}`}>
            <IconList />
            <span className="font-semibold">Strategy</span>
          </div>
        </nav>
      </div>
      <div className="px-6 pb-6 text-xs">
        <div>Account Holder</div>
        <div className="font-semibold">Jane Doe</div>
      </div>
    </aside>
  );
};

export default SidebarSimple;


