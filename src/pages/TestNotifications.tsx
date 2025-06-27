
import React from 'react';
import { TestNotificationPanel } from '@/components/admin/TestNotificationPanel';

export default function TestNotifications() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Push Notification Testing</h1>
          <p className="text-muted-foreground">
            Test your FCM v1 push notification system by sending notifications to specific users.
          </p>
        </div>
        
        <div className="flex justify-center">
          <TestNotificationPanel />
        </div>
      </div>
    </div>
  );
}
