import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, RefreshCw, FileText, ChevronRight, X, Sparkles } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const UpcomingPriorityBanner: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activeUrgentAlert, dismissUrgentAlert, setDrawerOpen, setSelectedCategory, markAsRead } =
    useNotifications();

  if (!activeUrgentAlert) return null;

  const handleBannerClick = () => {
    markAsRead(activeUrgentAlert.id);
    if (activeUrgentAlert.type) {
      setSelectedCategory(activeUrgentAlert.type);
    }
    setDrawerOpen(true);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(activeUrgentAlert.id);
    if (activeUrgentAlert.link) {
      navigate(activeUrgentAlert.link);
    } else {
      handleBannerClick();
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissUrgentAlert(activeUrgentAlert.id);
  };

  return (
    <aside
      aria-label="Upcoming priority alert banner"
      className="w-full bg-[#1F1F1F] text-white border-b border-[#333333] px-4 py-2 transition-all cursor-pointer hover:bg-[#252525]"
      onClick={handleBannerClick}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {activeUrgentAlert.type === 'birthday' ? (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Cake className="w-3.5 h-3.5" />
            </div>
          ) : activeUrgentAlert.type === 'policy_renewal' ? (
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-[#E53935] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="truncate">
            <span className="font-bold text-gray-200 mr-2">
              {activeUrgentAlert.type === 'birthday'
                ? 'Client Birthday Alert:'
                : activeUrgentAlert.type === 'policy_renewal'
                ? 'Policy Renewal Alert:'
                : 'Service Request Alert:'}
            </span>
            <span className="text-gray-300 font-normal">
              {activeUrgentAlert.title} — {activeUrgentAlert.message.substring(0, 110)}...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C62828] hover:bg-[#8E1B1B] text-white text-[11px] font-semibold transition-colors"
          >
            <span>{activeUrgentAlert.actionLabel || 'View Alert'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Dismiss alert"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
