import React from 'react';
import SidebarSimple from '../../components/SidebarSimple';

const StatCard: React.FC<{ title: string; value?: string; className?: string }> = ({ title, value, className }) => (
  <div className={`rounded-md p-4 border border-black/10`} style={{ backgroundColor: '#D9F2A6' }}>
    <div className="text-xs font-bold uppercase tracking-wide text-gray-700">{title}</div>
    {value && (
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-bold">$</span>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    )}
  </div>
);

export const ProfileContent: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      <div className="mx-auto max-w-6xl py-6">
        <div className="text-2xl font-semibold text-gray-700 mb-4">Profile</div>
        <div className="bg-white rounded-md border border-black/10 overflow-hidden">
          <div className="flex">
            <SidebarSimple active="portfolio" />
            <div className="flex-1">
              <div className="px-8 pt-8 pb-6 border-b border-black/10">
                <div className="text-2xl font-bold text-center">Portfolio Overview</div>
                <div className="mt-6 flex items-center gap-6">
                  <div className="rounded-full" style={{ width: 80, height: 80, backgroundColor: '#D9F2A6' }} />
                  <div className="flex-1">
                    <div className="font-semibold">Jane Doe</div>
                    <div className="text-sm text-gray-700">jane@gmail.com</div>
                  </div>
                  <button className="px-5 py-2 rounded-full bg-black text-white text-sm">Edit</button>
                </div>
              </div>

              <div className="px-8 py-6 grid grid-cols-12 gap-6">
                <div className="col-span-6">
                  <StatCard title="Total Portfolio Value" value="50,000.25" />
                </div>
                <div className="col-span-6">
                  <div className="rounded-md p-4 border border-black/10 h-full" style={{ backgroundColor: '#D9F2A6' }}>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-700">Top Strategies</div>
                    <div className="mt-3 text-sm">
                      <div className="flex font-semibold"><span className="w-2/3">Name</span><span className="w-1/3">Profit</span></div>
                      <div className="mt-4 text-xs text-gray-700">EndYear</div>
                      <div className="mt-1 flex"><span className="w-2/3">2000</span><span className="w-1/3">&nbsp;</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12">
                  <StatCard title="Total Portfolio Value" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;


