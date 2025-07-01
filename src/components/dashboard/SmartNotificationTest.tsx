
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Brain, Bell, BarChart3 } from 'lucide-react';
import { NotificationAnalytics } from './NotificationAnalytics';
import { useState } from 'react';

export const SmartNotificationTest = () => {
  const { triggerSmartNotifications, isLoading } = useSmartNotifications();
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Notifications
          </CardTitle>
          <CardDescription>
            AI-powered personalized notifications (Auto-runs daily at 8 AM UTC)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={triggerSmartNotifications}
            disabled={isLoading}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            {isLoading ? 'Analyzing...' : 'Trigger Manual Test'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✅ Automated daily notifications</p>
            <p>🧠 AI analyzes budgets, goals, spending</p>
            <p>🌍 Multi-language support</p>
            <p>📊 One notification per user per day</p>
          </div>
        </CardContent>
      </Card>

      {showAnalytics && <NotificationAnalytics />}
    </div>
  );
};
