-- Fix password reset security vulnerability
-- Remove the overly permissive policy that allows all operations
DROP POLICY IF EXISTS "Service role can manage password reset codes" ON password_reset_codes;

-- Add restrictive policies that deny all client access
-- Only server-side edge functions with service role should access this table

-- Policy to deny all SELECT operations from clients
-- (Service role bypasses RLS so edge functions can still read)
CREATE POLICY "Deny client access to password reset codes" 
ON password_reset_codes 
FOR ALL 
USING (false);