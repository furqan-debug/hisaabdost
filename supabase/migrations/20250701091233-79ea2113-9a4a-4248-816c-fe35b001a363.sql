
-- Phase 1: Create monthly_incomes table for proper month-specific income storage
CREATE TABLE IF NOT EXISTS public.monthly_incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  income_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS on the monthly_incomes table
ALTER TABLE public.monthly_incomes ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_incomes
CREATE POLICY "Users can view their own monthly incomes" 
  ON public.monthly_incomes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly incomes" 
  ON public.monthly_incomes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly incomes" 
  ON public.monthly_incomes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly incomes" 
  ON public.monthly_incomes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_monthly_incomes_user_month 
ON public.monthly_incomes(user_id, month_year);

-- Migrate existing monthly_income data from profiles to monthly_incomes
INSERT INTO public.monthly_incomes (user_id, month_year, income_amount)
SELECT 
  id as user_id,
  to_char(CURRENT_DATE, 'YYYY-MM') as month_year,
  COALESCE(monthly_income, 0) as income_amount
FROM public.profiles 
WHERE monthly_income IS NOT NULL AND monthly_income > 0
ON CONFLICT (user_id, month_year) DO NOTHING;
