
-- Add an income_date column to the profiles table, defaulting to 1 (the 1st of each month)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS income_date integer NOT NULL DEFAULT 1;

-- Optionally, add a check constraint to ensure values between 1 and 31
ALTER TABLE profiles
ADD CONSTRAINT income_date_range CHECK (income_date >= 1 AND income_date <= 31);

-- (No RLS policy changes are needed as profiles are already protected)
