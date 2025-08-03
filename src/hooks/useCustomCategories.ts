import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  user_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
        return;
      }

      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchCategories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          name: name.trim(),
          color,
          user_id: user.id,
          is_default: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        toast({
          title: "Error",
          description: "Failed to create category",
          variant: "destructive"
        });
        return false;
      }

      setCategories(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Category created successfully"
      });
      return true;
    } catch (err) {
      console.error('Error in createCategory:', err);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .update({
          name: name.trim(),
          color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive"
        });
        return false;
      }

      setCategories(prev => 
        prev.map(cat => cat.id === id ? data : cat)
      );
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      return true;
    } catch (err) {
      console.error('Error in updateCategory:', err);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive"
        });
        return false;
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      return true;
    } catch (err) {
      console.error('Error in deleteCategory:', err);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user?.id]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
}