import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  CheckCheck,
  Cake,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
  Sparkles,
  Calendar,
  CreditCard,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { NotificationItem, NotificationType } from '../../types/index.js';
import { BirthdayGreetingModal } from './BirthdayGreetingModal.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const {
    notifications,
    stats,
    selectedCategory,
    setSelectedCategory,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const [greetingModalNotif, setGreetingModalNotif] = useState<NotificationItem | null>(null);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  const handleAction = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.type === 'birthday' && role === 'adviser' && !item.metadata?.greetingSent) {
      setGreetingModalNotif(item);
      return;
    }
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.round((now.getTime() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.round(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[#D9D9D9] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#D9D9D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                  Notifications & Alerts
                </h3>
                {stats.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C62828] text-white">
                    {stats.unread} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                {role === 'adviser'
                  ? 'Service queues, client birthdays & policy renewals'
                  : 'Updates on your requests, policies & wealth milestone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {stats.unread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="p-1.5 text-xs text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline text-[11px] font-medium">Read all</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#E5E5E5] bg-[#F8F9FA] overflow-x-auto text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1F1F1F] text-white shadow-xs font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-200/60'
            }`}
          >
            All ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('service_request')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'service_request'
                ? 'bg-[#C62828] text-white shadow-xs font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Services ({stats.serviceRequests})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('birthday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'birthday'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-200/60'
            }`}
          >
            <Cake className="w-3.5 h-3.5" />
            Birthdays ({stats.birthdays})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('policy_renewal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'policy_renewal'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-200/60'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Renewals ({stats.renewals})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('claim_update')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'claim_update'
                ? 'bg-purple-700 text-white shadow-xs font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-gray-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Claims ({stats.claims || 0})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-[#111111]">All caught up</h4>
              <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto mt-1">
                {selectedCategory === 'all'
                  ? 'No pending service updates, upcoming birthdays, or renewals at this time.'
                  : `No notifications found in the ${selectedCategory.replace('_', ' ')} category.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isUnread = !item.read;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all text-left relative group ${
                    isUnread
                      ? 'bg-white border-red-200/90 shadow-sm ring-1 ring-red-100'
                      : 'bg-gray-50/70 border-[#E5E5E5] hover:bg-white'
                  }`}
                >
                  {/* Category & Status Indicator Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'birthday' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          <Cake className="w-3 h-3 text-amber-600" />
                          Client Birthday
                        </span>
                      ) : item.type === 'policy_renewal' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                          Policy Renewal
                        </span>
                      ) : item.type === 'claim_update' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200">
                          <Wrench className="w-3 h-3 text-purple-600" />
                          Claim / Repair Update
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#C62828] border border-red-200">
                          <FileText className="w-3 h-3 text-[#C62828]" />
                          Service Request
                        </span>
                      )}

                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#C62828] animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#6B6B6B]">
                        {getRelativeTime(item.timestamp)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-0.5"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <h4 className="text-xs font-bold text-[#111111] leading-tight flex items-start justify-between gap-2">
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Metadata Tags */}
                  {item.type === 'birthday' && item.metadata && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-amber-200 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-mono text-[#6B6B6B]">
                        <span>ID:</span>
                        <span className="font-semibold text-[#111111]">
                          {item.metadata.idNumber?.substring(0, 6)}•••••••
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded">
                          Age {item.metadata.ageTurning}
                        </span>
                      </div>
                      <span className="font-semibold text-amber-800">
                        {item.metadata.daysRemaining === 0
                          ? 'Today! 🎉'
                          : `In ${item.metadata.daysRemaining} days`}
                      </span>
                    </div>
                  )}

                  {item.type === 'policy_renewal' && item.metadata && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-blue-200 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-mono text-[#6B6B6B]">
                        <span className="font-semibold text-[#111111]">
                          {item.metadata.policyNumber}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          R{item.metadata.premium?.toLocaleString()}/m
                        </span>
                      </div>
                      <span className="font-medium text-blue-800">
                        Renewal: {item.metadata.renewalDate}
                      </span>
                    </div>
                  )}

                  {item.type === 'claim_update' && item.metadata && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-purple-200 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-mono text-[#6B6B6B]">
                        <span className="font-semibold text-[#111111]">
                          {item.metadata.claimNumber}
                        </span>
                        {item.metadata.stage && (
                          <span className="text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded font-sans font-bold">
                            {item.metadata.stage}
                          </span>
                        )}
                      </div>
                      {item.metadata.repairerName && (
                        <span className="text-[#6B6B6B]">
                          Workshop: <strong className="text-[#111111]">{item.metadata.repairerName}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interactive Actions Footer */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#E5E5E5]">
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        className="text-[11px] text-[#6B6B6B] hover:text-[#111111] font-medium"
                      >
                        Mark as read
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">Read</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAction(item)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                        item.type === 'birthday' && role === 'adviser'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : item.type === 'policy_renewal'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-[#C62828] hover:bg-[#8E1B1B] text-white'
                      }`}
                    >
                      {item.type === 'birthday' && role === 'adviser' ? (
                        <Send className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <span>{item.actionLabel || 'View Details'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#D9D9D9] text-center">
          <p className="text-[11px] text-[#6B6B6B] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C62828]" />
            Real-time compliance notifications & advisory synchronization
          </p>
        </div>
      </aside>

      {/* Birthday Greeting Modal */}
      <BirthdayGreetingModal
        isOpen={Boolean(greetingModalNotif)}
        onClose={() => setGreetingModalNotif(null)}
        notification={greetingModalNotif}
      />
    </>
  );
};
