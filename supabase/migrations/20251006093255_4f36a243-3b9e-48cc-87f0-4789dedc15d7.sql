-- Phase 1: Add family_id column to missing tables

-- Add family_id to wallet_additions
ALTER TABLE wallet_additions 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

-- Add family_id to goals  
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

-- Add family_id to loans
ALTER TABLE loans  
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

-- Add family_id to monthly_incomes
ALTER TABLE monthly_incomes
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_additions_family_id ON wallet_additions(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON goals(family_id);
CREATE INDEX IF NOT EXISTS idx_loans_family_id ON loans(family_id);
CREATE INDEX IF NOT EXISTS idx_monthly_incomes_family_id ON monthly_incomes(family_id);

-- Update RLS policies for wallet_additions
DROP POLICY IF EXISTS "Users can view their own wallet additions" ON wallet_additions;
DROP POLICY IF EXISTS "Users can insert their own wallet additions" ON wallet_additions;
DROP POLICY IF EXISTS "Users can update their own wallet additions" ON wallet_additions;
DROP POLICY IF EXISTS "Users can delete their own wallet additions" ON wallet_additions;

CREATE POLICY "Users can view their own or family wallet additions" 
ON wallet_additions FOR SELECT 
USING (
  (auth.uid() = user_id AND family_id IS NULL) OR 
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can insert their own or family wallet additions"
ON wallet_additions FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND family_id IS NULL) OR
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can update their own or family admins can update wallet"
ON wallet_additions FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND 
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

CREATE POLICY "Users can delete their own or family admins can delete wallet"
ON wallet_additions FOR DELETE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

-- Update RLS policies for goals
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;

CREATE POLICY "Users can view their own or family goals" 
ON goals FOR SELECT 
USING (
  (auth.uid() = user_id AND family_id IS NULL) OR 
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can insert their own or family goals"
ON goals FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND family_id IS NULL) OR
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can update their own or family admins can update goals"
ON goals FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND 
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

CREATE POLICY "Users can delete their own or family admins can delete goals"
ON goals FOR DELETE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

-- Update RLS policies for loans
DROP POLICY IF EXISTS "Users can view their own loans" ON loans;
DROP POLICY IF EXISTS "Users can insert their own loans" ON loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON loans;
DROP POLICY IF EXISTS "Users can delete their own loans" ON loans;

CREATE POLICY "Users can view their own or family loans" 
ON loans FOR SELECT 
USING (
  (auth.uid() = user_id AND family_id IS NULL) OR 
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can insert their own or family loans"
ON loans FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND family_id IS NULL) OR
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can update their own or family admins can update loans"
ON loans FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND 
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

CREATE POLICY "Users can delete their own or family admins can delete loans"
ON loans FOR DELETE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

-- Update RLS policies for monthly_incomes
DROP POLICY IF EXISTS "Users can view their own monthly incomes" ON monthly_incomes;
DROP POLICY IF EXISTS "Users can insert their own monthly incomes" ON monthly_incomes;
DROP POLICY IF EXISTS "Users can update their own monthly incomes" ON monthly_incomes;
DROP POLICY IF EXISTS "Users can delete their own monthly incomes" ON monthly_incomes;

CREATE POLICY "Users can view their own or family monthly incomes" 
ON monthly_incomes FOR SELECT 
USING (
  (auth.uid() = user_id AND family_id IS NULL) OR 
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can insert their own or family monthly incomes"
ON monthly_incomes FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND family_id IS NULL) OR
  (family_id IN (SELECT get_user_family_ids(auth.uid())))
);

CREATE POLICY "Users can update their own or family admins can update incomes"
ON monthly_incomes FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND 
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR 
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);

CREATE POLICY "Users can delete their own or family admins can delete incomes"
ON monthly_incomes FOR DELETE
USING (
  (auth.uid() = user_id) OR
  ((family_id IN (SELECT get_user_family_ids(auth.uid()))) AND
   (has_family_role(auth.uid(), family_id, 'owner'::family_role) OR
    has_family_role(auth.uid(), family_id, 'admin'::family_role)))
);