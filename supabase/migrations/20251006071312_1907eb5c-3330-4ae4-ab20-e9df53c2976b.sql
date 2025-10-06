-- Drop existing INSERT policy on families
DROP POLICY IF EXISTS "Users can create their own families" ON public.families;

-- Create simpler policy that just checks authentication
-- The created_by will be validated by the application layer
CREATE POLICY "Authenticated users can create families"
  ON public.families FOR INSERT
  TO authenticated
  WITH CHECK (true);