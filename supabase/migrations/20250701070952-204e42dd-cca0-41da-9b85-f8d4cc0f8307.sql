
-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a daily cron job to trigger smart notifications at 8 AM UTC
SELECT cron.schedule(
  'daily-smart-notifications',
  '0 8 * * *', -- Daily at 8:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://bklfolfivjonzpprytkz.supabase.co/functions/v1/smart-push-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbGZvbGZpdmpvbnpwcHJ5dGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjM0NjQsImV4cCI6MjA1NTg5OTQ2NH0.oipdwmQ4lRIyeYX00Irz4q0ZEDlKc9wuQhSPbHRzOKE"}'::jsonb,
    body := '{"automated": true, "timestamp": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);

-- Add a column to track the last notification date to enforce daily limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_date DATE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_last_notification_date 
ON profiles(last_notification_date);

-- Create a table to track notification analytics for monitoring
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  notification_type TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_timezone TEXT,
  financial_context JSONB,
  ai_reasoning TEXT
);

-- Enable RLS on the analytics table
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for notification_analytics
CREATE POLICY "Users can view their own notification analytics" 
ON notification_analytics FOR SELECT 
USING (auth.uid() = user_id);
