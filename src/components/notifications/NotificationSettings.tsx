
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { PushNotificationService } from '@/services/pushNotificationService';
import { Settings, Bell, BellOff, Check, X } from 'lucide-react';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { settings, setSettings } = useNotifications();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    // Check initial permission status
    setPermissionStatus(PushNotificationService.getPermissionStatus());
  }, []);

  const handlePermissionRequest = async () => {
    setIsRequestingPermission(true);
    try {
      const permission = await PushNotificationService.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Initialize push notifications after permission granted
        await PushNotificationService.initialize();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Requested</Badge>;
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your notification preferences and permissions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permission Status</span>
            {getPermissionBadge()}
          </div>
          
          {permissionStatus !== 'granted' && (
            <Button 
              onClick={handlePermissionRequest}
              disabled={isRequestingPermission}
              className="w-full"
              size="sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isRequestingPermission ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          )}
          
          {permissionStatus === 'denied' && (
            <p className="text-xs text-muted-foreground">
              Notifications are blocked. Please enable them in your device's app settings.
            </p>
          )}
        </div>

        {/* Notification Categories */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Notification Types</h4>
          
          {[
            { key: 'budgetWarnings', label: 'Budget Warnings', desc: 'When approaching budget limits' },
            { key: 'overspendingAlerts', label: 'Overspending Alerts', desc: 'When exceeding budgets' },
            { key: 'monthlyReset', label: 'Monthly Reset', desc: 'Start of new month notifications' },
            { key: 'dailyReminders', label: 'Daily Reminders', desc: 'Daily expense tracking reminders' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly spending summaries' },
            { key: 'categoryInsights', label: 'Category Insights', desc: 'Smart spending insights' },
            { key: 'savingsUpdates', label: 'Savings Updates', desc: 'Goal progress updates' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
              <Switch
                checked={settings[key as keyof typeof settings]}
                onCheckedChange={(checked) => handleSettingChange(key as keyof typeof settings, checked)}
                disabled={permissionStatus !== 'granted'}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onClose} variant="outline" size="sm" className="w-full">
            Close Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
