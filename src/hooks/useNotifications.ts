
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  category?: string;
  read?: boolean;
}

interface NotificationSettings {
  budgetWarnings: boolean;
  overspendingAlerts: boolean;
  monthlyReset: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  categoryInsights: boolean;
  savingsUpdates: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetWarnings: true,
    overspendingAlerts: true,
    monthlyReset: true,
    dailyReminders: true,
    weeklyReports: true,
    categoryInsights: true,
    savingsUpdates: true,
  });

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('app-notifications');
    const savedSettings = localStorage.getItem('notification-settings');
    
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const validNotifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          read: n.read || false // Ensure read property exists
        })).filter((n: any) => n.id && n.title); // Filter out invalid notifications
        
        setNotifications(validNotifications);
        console.log('Loaded notifications:', validNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Clear corrupted data
        localStorage.removeItem('app-notifications');
        setNotifications([]);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app-notifications', JSON.stringify(notifications));
      console.log('Saved notifications to localStorage:', notifications);
    }
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    console.log('Adding new notification:', newNotification);

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep only last 50
      console.log('Updated notifications list:', updated);
      return updated;
    });

    // Show toast notification based on type
    const getToastVariant = (type: string) => {
      switch (type) {
        case 'error':
        case 'warning':
          return 'destructive';
        case 'success':
          return 'default';
        case 'info':
        default:
          return 'default';
      }
    };

    toast({
      title: notification.title,
      description: notification.description,
      variant: getToastVariant(notification.type),
    });

    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    console.log('Marking notification as read:', id);
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      console.log('Updated notifications after mark as read:', updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    console.log('Marking all notifications as read');
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      console.log('Updated notifications after mark all as read:', updated);
      return updated;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    console.log('Removing notification:', id);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      console.log('Updated notifications after removal:', updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    console.log('Clearing all notifications');
    setNotifications([]);
    localStorage.removeItem('app-notifications');
  }, []);

  // Calculate unread count from actual notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  console.log('Current notifications count:', notifications.length, 'Unread count:', unreadCount);

  return {
    notifications,
    unreadCount,
    settings,
    setSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}
