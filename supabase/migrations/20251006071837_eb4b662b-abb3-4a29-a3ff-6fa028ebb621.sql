-- Remove the problematic trigger that's causing the RLS violation
DROP TRIGGER IF EXISTS on_family_created ON public.families;
DROP FUNCTION IF EXISTS public.handle_new_family();

-- We'll handle the family_members insertion in the application code instead