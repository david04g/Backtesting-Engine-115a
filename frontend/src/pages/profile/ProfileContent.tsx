import React from 'react';
import SidebarSimple from '../../components/SidebarSimple';

const Card: React.FC<{ title?: string; children?: React.ReactNode; bg?: string; className?: string }> = ({ title, children, bg = '#D9F2A6', className }) => (
  <div className={`rounded-md p-4 border border-black/10 ${className || ''}`} style={{ backgroundColor: bg }}>
    {title && <div className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</div>}
    {children}
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
                <div className="col-span-7">
                  <Card title="Learn">
                    <div className="mt-3 flex items-center gap-3 rounded-md px-4 py-3" style={{ backgroundColor: '#E8B6B6' }}>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">▶</span>
                      <span className="text-sm font-semibold">Grow your market mastery</span>
                    </div>
                  </Card>
                  <div className="mt-6">
                    <Card title="Create">
                      <div className="mt-3 flex items-center gap-3 rounded-md px-4 py-3" style={{ backgroundColor: '#E8B6B6' }}>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white text-black font-bold">＋</span>
                        <span className="text-sm font-semibold">Create new strategy</span>
                      </div>
                    </Card>
                  </div>
                </div>
                <div className="col-span-5">
                  <Card>
                    <div className="text-xs font-bold uppercase text-center mb-3">Current Level</div>
                    <div className="mx-auto rounded-md p-6 text-center" style={{ backgroundColor: '#F0B3BD' }}>
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#D9F2A6' }}>
                        <span className="text-2xl">⤴</span>
                      </div>
                      <div className="font-extrabold">Level 1</div>
                    </div>
                  </Card>
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

