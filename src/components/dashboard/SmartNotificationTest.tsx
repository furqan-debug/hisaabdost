
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Brain, Bell } from 'lucide-react';

export const SmartNotificationTest = () => {
  const { triggerSmartNotifications, isLoading } = useSmartNotifications();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Notifications
        </CardTitle>
        <CardDescription>
          AI-powered personalized notifications based on spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={triggerSmartNotifications}
          disabled={isLoading}
          className="w-full"
        >
          <Bell className="h-4 w-4 mr-2" />
          {isLoading ? 'Analyzing...' : 'Trigger Smart Notifications'}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Analyzes spending patterns and sends personalized alerts in your preferred language
        </p>
      </CardContent>
    </Card>
  );
};
