
-- Add last_notification_date to profiles table for daily limit enforcement
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_date DATE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_last_notification_date 
ON profiles(last_notification_date);
