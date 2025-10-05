-- Fix security warning: Set search_path for update_loans_updated_at function
-- Drop trigger first, then recreate both function and trigger
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
DROP FUNCTION IF EXISTS public.update_loans_updated_at();

CREATE OR REPLACE FUNCTION public.update_loans_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loans_updated_at();