
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Plus } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";
import { EmptyState } from "@/components/EmptyState";
import { SampleDataButton } from "@/components/SampleDataButton";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecentExpensesCardProps {
  expenses: Expense[];
  isNewUser: boolean;
  isLoading: boolean;
  setExpenseToEdit: (expense: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
}

export const RecentExpensesCard = ({
  expenses,
  isNewUser,
  isLoading,
  setExpenseToEdit,
  setShowAddExpense,
}: RecentExpensesCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      );
    }
    
    if (isNewUser || expenses.length === 0) {
      return (
        <div className="space-y-4 p-4">
          <EmptyState
            title="No expenses yet"
            description="Start tracking your spending by adding your first expense."
            onAction={() => setShowAddExpense(true)}
          />
          
          {isNewUser && (
            <div className="flex justify-center">
              <SampleDataButton onApply={async (sampleExpenses) => {
                if (!user) return;
                
                try {
                  const formattedExpenses = sampleExpenses.map(exp => ({
                    user_id: user.id,
                    amount: exp.amount,
                    description: exp.description,
                    date: exp.date,
                    category: exp.category,
                  }));
                  
                  const { error } = await supabase
                    .from('expenses')
                    .insert(formattedExpenses);
                  
                  if (error) throw error;
                  
                  await queryClient.invalidateQueries({ queryKey: ['expenses'] });
                  
                  toast({
                    title: "Sample Data Added",
                    description: "Sample expenses have been added successfully.",
                  });
                } catch (error) {
                  console.error('Error adding sample data:', error);
                  toast({
                    title: "Error",
                    description: "Failed to add sample data. Please try again.",
                    variant: "destructive",
                  });
                }
              }} />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="-mx-2 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right w-[80px]">Amount</TableHead>
              <TableHead className="text-right w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.slice(0, 5).map((expense) => (
              <TableRow key={expense.id} className="hover:bg-muted/40">
                <TableCell className="text-xs">
                  {format(new Date(expense.date), 'MMM dd')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm truncate">{expense.description}</span>
                    <span className="text-xs text-muted-foreground truncate">{expense.category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(expense.amount, currencyCode)}
                </TableCell>
                <TableCell className="p-0 pr-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                      >
                        <MoreVertical className="h-3 w-3" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[120px]">
                      <DropdownMenuItem
                        onClick={() => {
                          setExpenseToEdit(expense);
                          setShowAddExpense(true);
                        }}
                        className="text-xs"
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {expenses.length > 5 && (
          <div className="flex justify-center py-2">
            <Button variant="ghost" size="sm" className="text-xs">
              View all expenses
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Expenses</CardTitle>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => setShowAddExpense(true)}
            className="h-7 w-7"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-1">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
