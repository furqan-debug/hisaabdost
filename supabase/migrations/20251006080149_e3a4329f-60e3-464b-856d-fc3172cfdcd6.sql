-- Add new columns to family_invitations table for enhanced invitation flow
ALTER TABLE public.family_invitations
ADD COLUMN IF NOT EXISTS inviter_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_family_invitations_invited_user_id 
ON public.family_invitations(invited_user_id);

-- Add RLS policy for invited users to view their own invitations
CREATE POLICY "Invited users can view their invitations"
ON public.family_invitations
FOR SELECT
TO authenticated
USING (auth.uid() = invited_user_id OR is_family_member(auth.uid(), family_id));

-- Add RLS policy for invited users to update their invitations (accept/reject)
CREATE POLICY "Invited users can update their invitations"
ON public.family_invitations
FOR UPDATE
TO authenticated
USING (auth.uid() = invited_user_id);