
-- Update the password_reset_codes table to use secure tokens instead of 6-digit codes
ALTER TABLE password_reset_codes 
ADD COLUMN token TEXT;

-- Create an index on the token column for better performance
CREATE INDEX idx_password_reset_codes_token ON password_reset_codes(token);

-- Update existing records to have tokens (for any existing data)
UPDATE password_reset_codes 
SET token = gen_random_uuid()::text 
WHERE token IS NULL;

-- Make token column required
ALTER TABLE password_reset_codes 
ALTER COLUMN token SET NOT NULL;

-- We'll keep the code column for backward compatibility but it's no longer required
ALTER TABLE password_reset_codes 
ALTER COLUMN code DROP NOT NULL;
