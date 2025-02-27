
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { SampleDataButton } from "@/components/SampleDataButton";
import { useAuth } from "@/lib/auth";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { formatCurrency } from "@/utils/chartUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyIncome');
    return saved ? Number(saved) : 0;
  });
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
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

  // Calculate insights based on expenses
  const insights = useAnalyticsInsights(expenses);
  
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  useEffect(() => {
    localStorage.setItem('monthlyIncome', monthlyIncome.toString());
  }, [monthlyIncome]);

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <ExpensePieChart expenses={expenses} />;
      case 'bar':
        return <ExpenseBarChart expenses={expenses} />;
      case 'line':
        return <ExpenseLineChart expenses={expenses} />;
      default:
        return null;
    }
  };

  const isNewUser = expenses.length === 0;

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

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">
          {isNewUser ? `Welcome, ${user?.user_metadata?.full_name || 'there'}! 👋` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isNewUser 
            ? "Let's start tracking your expenses. Add your first expense to get started!"
            : "Here's an overview of your expenses"}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OnboardingTooltip
          content="Track your remaining balance after expenses"
          defaultOpen={isNewUser}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {isNewUser ? "Add expenses to see your balance" : "Current account balance"}
              </p>
            </CardContent>
          </Card>
        </OnboardingTooltip>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
            <div className="flex items-center text-expense-high text-xs mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setMonthlyIncome(value ? parseInt(value, 10) : 0);
                }}
                className="pl-9 pr-4"
                min={0}
              />
            </div>
            <div className="flex items-center text-expense-low text-xs mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(savingsRate)}</div>
            <div className="flex items-center text-expense-low text-xs">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <OnboardingTooltip
          content="Click here to add your first expense"
          defaultOpen={isNewUser}
        >
          <AddExpenseSheet 
            onAddExpense={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })}
            expenseToEdit={expenseToEdit}
            onClose={() => {
              setExpenseToEdit(undefined);
              setShowAddExpense(false);
            }}
            open={showAddExpense || expenseToEdit !== undefined}
            onOpenChange={setShowAddExpense}
          />
        </OnboardingTooltip>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          ) : isNewUser ? (
            <div className="space-y-4">
              <EmptyState
                title="No expenses yet"
                description="Start tracking your spending by adding your first expense."
                onAction={() => setShowAddExpense(true)}
              />
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 5).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpenseToEdit(expense);
                          setShowAddExpense(true);
                        }}
                        className="h-8 w-8 p-0 mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Analytics</CardTitle>
          <Select value={chartType} onValueChange={(value: 'pie' | 'bar' | 'line') => setChartType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Add some expenses to see analytics
            </div>
          ) : (
            renderChart()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
