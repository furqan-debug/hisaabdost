-- Phase 1: Enable real-time updates on family_invitations table
-- This allows the real-time subscription to work properly

-- Set replica identity to FULL to capture all column changes
ALTER TABLE family_invitations REPLICA IDENTITY FULL;

-- Add family_invitations to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE family_invitations;