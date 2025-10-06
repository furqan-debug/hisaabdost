-- Drop all existing problematic RLS policies on family_invitations
DROP POLICY IF EXISTS "Family members can create invitations" ON family_invitations;
DROP POLICY IF EXISTS "Family members can update invitations" ON family_invitations;
DROP POLICY IF EXISTS "Invited users can update their invitations" ON family_invitations;
DROP POLICY IF EXISTS "Invited users can view their invitations" ON family_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their families" ON family_invitations;

-- Create simplified, non-recursive RLS policies for family_invitations
CREATE POLICY "Users can view their own invitations"
ON family_invitations
FOR SELECT
USING (auth.uid() = invited_user_id);

CREATE POLICY "Family admins can view family invitations"
ON family_invitations
FOR SELECT
USING (
  has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
  has_family_role(auth.uid(), family_id, 'admin'::family_role)
);

CREATE POLICY "Family admins can create invitations"
ON family_invitations
FOR INSERT
WITH CHECK (
  has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
  has_family_role(auth.uid(), family_id, 'admin'::family_role)
);

CREATE POLICY "Invited users can update their own invitations"
ON family_invitations
FOR UPDATE
USING (auth.uid() = invited_user_id);

CREATE POLICY "Family admins can update their family invitations"
ON family_invitations
FOR UPDATE
USING (
  has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
  has_family_role(auth.uid(), family_id, 'admin'::family_role)
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_family_invitations_invited_user_id ON family_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);
CREATE INDEX IF NOT EXISTS idx_family_invitations_expires_at ON family_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id_status ON family_invitations(family_id, status);