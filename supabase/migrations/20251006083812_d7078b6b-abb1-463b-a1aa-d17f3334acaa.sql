-- Drop the problematic RLS policy that references auth.users incorrectly
DROP POLICY IF EXISTS "Users can view invitations for their families" ON family_invitations;

-- Recreate a simpler policy that doesn't reference auth.users
CREATE POLICY "Users can view invitations for their families"
ON family_invitations
FOR SELECT
USING (
  is_family_member(auth.uid(), family_id)
);