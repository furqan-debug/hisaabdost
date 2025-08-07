-- Update the fund_type check constraint to allow 'finny' as a valid value
ALTER TABLE wallet_additions 
DROP CONSTRAINT IF EXISTS wallet_additions_fund_type_check;

ALTER TABLE wallet_additions 
ADD CONSTRAINT wallet_additions_fund_type_check 
CHECK (fund_type = ANY (ARRAY['manual'::text, 'carryover'::text, 'finny'::text]));