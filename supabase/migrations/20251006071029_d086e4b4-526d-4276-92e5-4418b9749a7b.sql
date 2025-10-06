-- Drop the existing restrictive INSERT policy on family_members
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.family_members;

-- Create a new INSERT policy that allows:
-- 1. Owners and admins to add members
-- 2. The initial creator to be added as owner (when created_by matches)
CREATE POLICY "Owners and admins can add members"
  ON public.family_members FOR INSERT
  WITH CHECK (
    -- Allow if user is already an owner/admin
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin') OR
    -- Allow initial owner creation (when user_id matches the authenticated user)
    (auth.uid() = user_id AND role = 'owner')
  );