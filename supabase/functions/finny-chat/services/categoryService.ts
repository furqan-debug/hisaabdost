
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function fetchUserCategories(
  userId: string, 
  supabase: SupabaseClient
): Promise<string[]> {
  console.log("Fetching user categories for user:", userId);
  
  try {
    // Official default categories - must match CategoryField.tsx exactly
    const defaultCategories = [
      'Food',
      'Rent', 
      'Utilities',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Other'
    ];

    // Fetch custom categories from database
    const { data: customCategories, error } = await supabase
      .from('custom_categories')
      .select('name')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching custom categories:', error);
      return defaultCategories; // Return defaults if there's an error
    }

    // Combine default and custom categories
    const customCategoryNames = customCategories?.map(cat => cat.name) || [];
    const allCategories = [...defaultCategories, ...customCategoryNames];
    
    console.log("Available categories for user:", allCategories);
    return allCategories;
    
  } catch (error) {
    console.error('Error in fetchUserCategories:', error);
    return [
      'Food',
      'Rent',
      'Utilities', 
      'Transportation',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Other'
    ];
  }
}
