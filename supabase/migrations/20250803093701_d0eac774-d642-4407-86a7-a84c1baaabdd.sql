
-- Create custom_categories table to store user-defined expense categories
CREATE TABLE IF NOT EXISTS public.custom_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280', -- Default gray color
  is_default BOOLEAN DEFAULT FALSE, -- To distinguish between default and custom categories
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique category names per user
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own categories" ON public.custom_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON public.custom_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.custom_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.custom_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON public.custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_name ON public.custom_categories(user_id, name);

-- Insert default categories for existing functionality
INSERT INTO public.custom_categories (user_id, name, color, is_default)
SELECT DISTINCT 
  auth.uid(),
  category_name,
  CASE category_name
    WHEN 'Food' THEN '#EF4444'        -- Red
    WHEN 'Rent' THEN '#3B82F6'        -- Blue  
    WHEN 'Utilities' THEN '#F59E0B'   -- Amber
    WHEN 'Transportation' THEN '#10B981' -- Emerald
    WHEN 'Entertainment' THEN '#8B5CF6'  -- Violet
    WHEN 'Shopping' THEN '#EC4899'    -- Pink
    WHEN 'Healthcare' THEN '#06B6D4'  -- Cyan
    WHEN 'Other' THEN '#6B7280'       -- Gray
    ELSE '#6B7280'
  END as color,
  TRUE
FROM (
  VALUES 
    ('Food'), ('Rent'), ('Utilities'), ('Transportation'), 
    ('Entertainment'), ('Shopping'), ('Healthcare'), ('Other')
) AS default_categories(category_name)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;
