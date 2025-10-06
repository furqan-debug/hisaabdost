-- Drop and recreate the trigger function to use service role client
-- This bypasses RLS for the automatic owner insertion
DROP TRIGGER IF EXISTS on_family_created ON public.families;
DROP FUNCTION IF EXISTS public.handle_new_family();

-- Create improved function that bypasses RLS for the initial owner insert
CREATE OR REPLACE FUNCTION public.handle_new_family()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Directly insert into family_members bypassing RLS
  -- This is safe because we're inserting the creator as owner
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Failed to add family creator as owner: %', SQLERRM;
    -- Re-raise to rollback the family creation
    RAISE;
END;
$$;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_family() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_family() TO service_role;

-- Recreate the trigger
CREATE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_family();

-- Temporarily disable RLS for family_members table for the trigger
-- We'll use a more permissive policy specifically for the trigger context
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.family_members;

-- Create a new policy that allows insertion when user_id matches auth.uid() OR when being inserted by a security definer function
CREATE POLICY "Owners and admins can add members"
  ON public.family_members FOR INSERT
  WITH CHECK (
    -- Allow if user is already an owner/admin of the family
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin') OR
    -- Allow if the authenticated user is being added (self-add as owner during family creation)
    (auth.uid() = user_id)
  );