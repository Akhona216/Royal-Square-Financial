import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.js';
import { NotificationDrawer } from './NotificationDrawer.js';

export const NotificationBell: React.FC = () => {
  const { stats, drawerOpen, setDrawerOpen } = useNotifications();

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="relative p-2 rounded-lg text-[#111111] hover:bg-[#F2F2F2] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#C62828]"
        aria-label={`Notifications ${stats.unread > 0 ? `(${stats.unread} unread)` : ''}`}
        title={`Notifications & Alerts (${stats.unread} unread)`}
      >
        <Bell className="w-5 h-5 text-[#1F1F1F]" />

        {/* Unread Counter Badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {stats.unread > 99 ? '99+' : stats.unread}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E53935] animate-ping opacity-75" />
          </span>
        )}
      </button>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
