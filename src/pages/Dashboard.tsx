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

const Dashboard = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyIncome');
    return saved ? Number(saved) : 0;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { user } = useAuth();
  
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

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

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

  const handleAddExpense = (newExpense: Expense) => {
    if (expenseToEdit) {
      setExpenses(expenses.map(exp => exp.id === newExpense.id ? newExpense : exp));
      setExpenseToEdit(undefined);
    } else {
      setExpenses([...expenses, newExpense]);
    }
    setShowAddExpense(false);
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
            onAddExpense={handleAddExpense} 
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
          {isNewUser ? (
            <div className="space-y-4">
              <EmptyState
                title="No expenses yet"
                description="Start tracking your spending by adding your first expense."
                onAction={() => setShowAddExpense(true)}
              />
              <SampleDataButton onApply={setExpenses} />
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
                {expenses.map((expense) => (
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
                        onClick={() => {
                          setExpenses(expenses.filter(exp => exp.id !== expense.id));
                        }}
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
          {expenses.length === 0 ? (
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
