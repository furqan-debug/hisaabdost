
import { useState, useEffect, useCallback } from 'react';
import { usePushNotifications } from './usePushNotifications';

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
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetWarnings: true,
    overspendingAlerts: true,
    monthlyReset: true,
    dailyReminders: true,
    weeklyReports: true,
    categoryInsights: true,
    savingsUpdates: true,
  });

  const { sendNotification: sendPushNotification } = usePushNotifications();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('Sending push notification:', notification);

    // Send push notification instead of showing in-app notification
    await sendPushNotification(
      notification.title,
      notification.description,
      {
        type: notification.type,
        category: notification.category
      }
    );

    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [sendPushNotification]);

  // Remove unused functions since we're not storing notifications locally anymore
  const markAsRead = useCallback(() => {}, []);
  const markAllAsRead = useCallback(() => {}, []);
  const removeNotification = useCallback(() => {}, []);
  const clearAll = useCallback(() => {}, []);

  return {
    notifications: [], // Empty array since we're not storing notifications locally
    unreadCount: 0, // Always 0 since we're not tracking in-app notifications
    settings,
    setSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}
