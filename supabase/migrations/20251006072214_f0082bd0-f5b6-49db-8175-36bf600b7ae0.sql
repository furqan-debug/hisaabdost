-- Completely rebuild the families RLS policies with simple, clear rules
-- First, disable RLS temporarily and drop all policies
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;
DROP POLICY IF EXISTS "Users can create their own families" ON public.families;
DROP POLICY IF EXISTS "Users can view families they are members of" ON public.families;
DROP POLICY IF EXISTS "Only owners can update families" ON public.families;
DROP POLICY IF EXISTS "Only owners can delete families" ON public.families;

-- Re-enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Create simple, clear policies
-- Allow any authenticated user to insert families (they set created_by themselves)
CREATE POLICY "Allow authenticated users to create families"
  ON public.families
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow family members to view their families
CREATE POLICY "Users can view families they are members of"
  ON public.families
  FOR SELECT
  TO authenticated
  USING (is_family_member(auth.uid(), id));

-- Only owners can update families
CREATE POLICY "Only owners can update families"
  ON public.families
  FOR UPDATE
  TO authenticated
  USING (has_family_role(auth.uid(), id, 'owner'::family_role));

-- Only owners can delete families
CREATE POLICY "Only owners can delete families"
  ON public.families
  FOR DELETE
  TO authenticated
  USING (has_family_role(auth.uid(), id, 'owner'::family_role));