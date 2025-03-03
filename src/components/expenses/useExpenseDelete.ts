
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useExpenseDelete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Error",
          description: "Failed to delete the expense. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        await queryClient.invalidateQueries({ queryKey: ['expenses'] });
        await queryClient.invalidateQueries({ queryKey: ['budgets'] });
        toast({
          title: "Expense Deleted",
          description: "Expense has been deleted successfully.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMultipleExpenses = async (ids: string[]) => {
    if (ids.length === 0) return false;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      toast({
        title: "Expenses Deleted",
        description: `Successfully deleted ${ids.length} expense(s).`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting expenses:', error);
      toast({
        title: "Error",
        description: "Failed to delete expenses. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    deleteExpense,
    deleteMultipleExpenses
  };
}
