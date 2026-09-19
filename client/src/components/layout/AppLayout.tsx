import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { UpcomingPriorityBanner } from '../notifications/UpcomingPriorityBanner.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111111]">
      <Header />
      <UpcomingPriorityBanner />
      <div className="flex-1 flex flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

