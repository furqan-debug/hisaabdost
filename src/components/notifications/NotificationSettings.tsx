
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { settings, setSettings } = useNotifications();

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/40">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Push Notification Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your mobile push notifications</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings */}
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="budget-warnings" className="text-sm font-medium">
              Budget Warnings
            </Label>
            <Switch
              id="budget-warnings"
              checked={settings.budgetWarnings}
              onCheckedChange={() => handleToggle('budgetWarnings')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="overspending-alerts" className="text-sm font-medium">
              Overspending Alerts
            </Label>
            <Switch
              id="overspending-alerts"
              checked={settings.overspendingAlerts}
              onCheckedChange={() => handleToggle('overspendingAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="monthly-reset" className="text-sm font-medium">
              Monthly Reset Notifications
            </Label>
            <Switch
              id="monthly-reset"
              checked={settings.monthlyReset}
              onCheckedChange={() => handleToggle('monthlyReset')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminders" className="text-sm font-medium">
              Daily Reminders
            </Label>
            <Switch
              id="daily-reminders"
              checked={settings.dailyReminders}
              onCheckedChange={() => handleToggle('dailyReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-reports" className="text-sm font-medium">
              Weekly Reports
            </Label>
            <Switch
              id="weekly-reports"
              checked={settings.weeklyReports}
              onCheckedChange={() => handleToggle('weeklyReports')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="category-insights" className="text-sm font-medium">
              Category Insights
            </Label>
            <Switch
              id="category-insights"
              checked={settings.categoryInsights}
              onCheckedChange={() => handleToggle('categoryInsights')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="savings-updates" className="text-sm font-medium">
              Savings Updates
            </Label>
            <Switch
              id="savings-updates"
              checked={settings.savingsUpdates}
              onCheckedChange={() => handleToggle('savingsUpdates')}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Push notifications will be sent directly to your mobile device. Make sure you have enabled notifications for this app in your device settings.
          </p>
        </div>
      </div>
    </div>
  );
}
