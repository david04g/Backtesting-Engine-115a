import React from 'react';
import SidebarSimple from '../../components/SidebarSimple';

const Card: React.FC<{ title?: string; children?: React.ReactNode; bg?: string; className?: string }> = ({ title, children, bg = '#D9F2A6', className }) => (
  <div className={`rounded-md p-6 border border-black/10 ${className || ''}`} style={{ backgroundColor: bg }}>
    {title && <div className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</div>}
    {children}
  </div>
);

export const ProfileContent: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6E6E6' }}>
      <div className="mx-auto max-w-6xl py-6 min-h-[calc(100vh-72px)]">
        <div className="bg-white rounded-md border border-black/10 overflow-hidden h-full flex">
          <SidebarSimple active="portfolio" />
          <div className="flex-1 flex flex-col">
            <div className="px-12 pt-10 pb-8 border-b border-black/10">
              <div className="text-3xl font-bold text-center">Profile Overview</div>
              <div className="mt-8 flex items-center gap-8">
                <div className="rounded-full" style={{ width: 110, height: 110, backgroundColor: '#D9F2A6' }} />
                <div className="flex-1">
                  <div className="font-semibold text-lg">Jane Doe</div>
                  <div className="text-sm text-gray-700">jane@gmail.com</div>
                </div>
                <button className="px-6 py-3 rounded-full bg-black text-white text-sm">Edit</button>
              </div>
            </div>

            <div className="px-12 py-8 grid grid-cols-12 gap-8 flex-1 items-start">
              <div className="col-span-8">
                <Card title="Learn">
                  <div className="mt-4 flex items-center gap-4 rounded-md px-6 py-4" style={{ backgroundColor: '#E8B6B6' }}>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">▶</span>
                    <span className="text-base font-semibold">Grow your market mastery</span>
                  </div>
                </Card>
                <div className="mt-6">
                  <Card title="Create">
                    <div className="mt-4 flex items-center gap-4 rounded-md px-6 py-4" style={{ backgroundColor: '#E8B6B6' }}>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-black font-bold">＋</span>
                      <span className="text-base font-semibold">Create new strategy</span>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="col-span-4">
                <Card>
                  <div className="text-xs font-bold uppercase text-center mb-3">Current Level</div>
                  <div className="mx-auto rounded-md p-8 text-center" style={{ backgroundColor: '#F0B3BD' }}>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#D9F2A6' }}>
                      <span className="text-3xl">⤴</span>
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
  );
};

export default ProfileContent;




