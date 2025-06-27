
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Bell } from 'lucide-react';

export function TestNotificationPanel() {
  const [userId, setUserId] = useState('cd99bf25-1e04-400b-b1e4-7f662b0277ac');
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('Your push notification system is live and working perfectly!');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendTestNotification = async () => {
    if (!userId || !title || !body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending notification:', { userId, title, body });
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title,
          body,
          data: {
            type: 'test',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Notification error:', error);
        toast({
          title: "Error",
          description: `Failed to send notification: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Notification response:', data);
        toast({
          title: "Success",
          description: data?.message || "Notification sent successfully!",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Push Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message"
            rows={3}
          />
        </div>
        
        <Button 
          onClick={sendTestNotification} 
          disabled={isLoading}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send Test Notification'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>Note: The target user must have:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>A mobile device with your app installed</li>
            <li>Granted notification permissions</li>
            <li>An active FCM token registered</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
