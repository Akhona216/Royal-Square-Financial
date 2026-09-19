import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { NotificationItem, NotificationStats, NotificationType } from '../types/index.js';
import { useAuth } from './AuthContext.js';

interface NotificationContextType {
  notifications: NotificationItem[];
  stats: NotificationStats;
  loading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  selectedCategory: 'all' | NotificationType;
  setSelectedCategory: (cat: 'all' | NotificationType) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  sendBirthdayGreeting: (clientId: string, clientName: string, message?: string) => Promise<boolean>;
  activeUrgentAlert: NotificationItem | null;
  dismissUrgentAlert: (id: string) => void;
}

const defaultStats: NotificationStats = {
  total: 0,
  unread: 0,
  serviceRequests: 0,
  birthdays: 0,
  renewals: 0,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationType>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setStats(defaultStats);
      return;
    }
    setLoading(true);
    try {
      const response = await api.notifications.getAll();
      if (response && response.notifications) {
        setNotifications(response.notifications);
        setStats(response.stats || defaultStats);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setStats((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }));
    try {
      await api.notifications.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setStats((prev) => ({ ...prev, unread: 0 }));
    try {
      await api.notifications.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const dismissNotification = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (item && !item.read) {
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1), total: prev.total - 1 }));
    } else {
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    }
    try {
      await api.notifications.dismiss(id);
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const sendBirthdayGreeting = async (clientId: string, clientName: string, message?: string) => {
    try {
      const res = await api.notifications.sendGreeting({ clientId, clientName, message });
      if (res.success) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send birthday greeting:', err);
      return false;
    }
  };

  const dismissUrgentAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(id));
  };

  // Find the top priority unread alert for the ticker bar (e.g. birthday in <= 7 days or renewal in <= 14 days or urgent SRQ)
  const activeUrgentAlert =
    notifications.find(
      (n) =>
        !n.read &&
        !dismissedAlerts.has(n.id) &&
        (n.priority === 'high' ||
          (n.type === 'birthday' && (n.metadata?.daysRemaining ?? 99) <= 7) ||
          (n.type === 'policy_renewal' && (n.metadata?.daysRemaining ?? 99) <= 14))
    ) || null;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        stats,
        loading,
        drawerOpen,
        setDrawerOpen,
        selectedCategory,
        setSelectedCategory,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        sendBirthdayGreeting,
        activeUrgentAlert,
        dismissUrgentAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
