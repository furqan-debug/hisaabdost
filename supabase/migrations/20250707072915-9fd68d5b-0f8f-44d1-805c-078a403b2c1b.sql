-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up daily cron job to trigger smart notifications at 8 AM UTC
SELECT cron.schedule(
  'daily-smart-notifications',
  '0 8 * * *', -- Every day at 8 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://bklfolfivjonzpprytkz.supabase.co/functions/v1/smart-push-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbGZvbGZpdmpvbnpwcHJ5dGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjM0NjQsImV4cCI6MjA1NTg5OTQ2NH0.oipdwmQ4lRIyeYX00Irz4q0ZEDlKc9wuQhSPbHRzOKE"}'::jsonb,
    body := '{"automated": true, "timestamp": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);