
-- Create table for storing user device tokens
CREATE TABLE public.user_device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

-- Enable RLS
ALTER TABLE public.user_device_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own device tokens"
  ON public.user_device_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_device_tokens_user_id ON public.user_device_tokens(user_id);
CREATE INDEX idx_user_device_tokens_platform ON public.user_device_tokens(platform);
