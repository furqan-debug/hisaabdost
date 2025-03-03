import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Download, Plus } from "lucide-react";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseTableHeader } from "@/components/expenses/ExpenseTableHeader";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

const Expenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({ field: 'date', order: 'desc' });
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Fetch expenses from Supabase using React Query
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        category: exp.category,
        paymentMethod: exp.payment || undefined,
        notes: exp.notes || undefined,
        isRecurring: exp.is_recurring || false,
        receiptUrl: exp.receipt_url || undefined,
      }));
    },
    enabled: !!user,
  });

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedExpenses.size === 0) return;
    
    try {
      const selectedIds = Array.from(selectedExpenses);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
      
      setSelectedExpenses(new Set());
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      toast({
        title: "Expenses Deleted",
        description: `Successfully deleted ${selectedIds.length} expense(s).`,
      });
    } catch (error) {
      console.error('Error deleting expenses:', error);
      toast({
        title: "Error",
        description: "Failed to delete expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map(exp => exp.id)));
    }
  };

  const toggleExpenseSelection = (expenseId: string) => {
    const newSelection = new Set(selectedExpenses);
    if (newSelection.has(expenseId)) {
      newSelection.delete(expenseId);
    } else {
      newSelection.add(expenseId);
    }
    setSelectedExpenses(newSelection);
  };

  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      order: 
        sortConfig.field === field && sortConfig.order === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const expenseDate = new Date(expense.date);
      const isInDateRange = expenseDate >= new Date(dateRange.start) && 
                           expenseDate <= new Date(dateRange.end);
      
      return matchesSearch && matchesCategory && isInDateRange;
    })
    .sort((a, b) => {
      const order = sortConfig.order === 'asc' ? 1 : -1;
      
      switch (sortConfig.field) {
        case 'date':
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
        case 'amount':
          return (a.amount - b.amount) * order;
        case 'category':
          return a.category.localeCompare(b.category) * order;
        case 'description':
          return a.description.localeCompare(b.description) * order;
        default:
          return 0;
      }
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(exp => [
        format(new Date(exp.date), 'yyyy-MM-dd'),
        `"${exp.description}"`,
        exp.category,
        exp.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Manage and analyze your expenses
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <AddExpenseSheet 
            onAddExpense={() => {}} // This is now handled internally in the component
            expenseToEdit={expenseToEdit}
            onClose={() => {
              setExpenseToEdit(undefined);
              setShowAddExpense(false);
            }}
            open={showAddExpense || expenseToEdit !== undefined}
            onOpenChange={setShowAddExpense}
          />
          
          {isMobile ? (
            <>
              {selectedExpenses.size > 0 && (
                <Button 
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Delete ({selectedExpenses.size})
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon-sm"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Export</span>
              </Button>
            </>
          ) : (
            <>
              {selectedExpenses.size > 0 && (
                <Button 
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  className="whitespace-nowrap"
                >
                  Delete Selected ({selectedExpenses.size})
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Expense List</CardTitle>
            <p className="text-sm font-medium">
              Total: {formatCurrency(totalFilteredAmount)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ExpenseFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <div className="rounded-lg border border-border/40 overflow-hidden">
              <Table>
                <ExpenseTableHeader
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  selectedExpenses={selectedExpenses}
                  filteredExpenses={filteredExpenses}
                  toggleSelectAll={toggleSelectAll}
                />
                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">Loading expenses...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">No expenses found</p>
                          <Button 
                            variant="purple" 
                            onClick={() => setShowAddExpense(true)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add expense
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        selectedExpenses={selectedExpenses}
                        toggleExpenseSelection={toggleExpenseSelection}
                        onEdit={(expense) => {
                          setExpenseToEdit(expense);
                          setShowAddExpense(true);
                        }}
                        onDelete={async (id) => {
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
                          } else {
                            await queryClient.invalidateQueries({ queryKey: ['expenses'] });
                            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
                            toast({
                              title: "Expense Deleted",
                              description: "Expense has been deleted successfully.",
                            });
                          }
                        }}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
