
-- Make user_id nullable in notification_logs for broadcast messages
ALTER TABLE notification_logs ALTER COLUMN user_id DROP NOT NULL;

-- Ensure the database can handle emojis by setting proper encoding
-- This should already be UTF8, but let's make sure text columns can handle emojis
ALTER TABLE notification_logs ALTER COLUMN title TYPE TEXT;
ALTER TABLE notification_logs ALTER COLUMN body TYPE TEXT;

-- Create an index on user_device_tokens for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_device 
ON user_device_tokens(user_id, device_token);

-- Add a column to track failed attempts (optional, for future use)
ALTER TABLE user_device_tokens ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;
ALTER TABLE user_device_tokens ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMP WITH TIME ZONE;
