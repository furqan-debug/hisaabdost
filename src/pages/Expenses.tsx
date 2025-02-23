
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseTableHeader } from "@/components/expenses/ExpenseTableHeader";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";

type SortField = 'date' | 'amount' | 'category' | 'description';
type SortOrder = 'asc' | 'desc';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
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

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (newExpense: Expense) => {
    if (expenseToEdit) {
      setExpenses(expenses.map(exp => exp.id === newExpense.id ? newExpense : exp));
      setExpenseToEdit(undefined);
    } else {
      setExpenses([...expenses, newExpense]);
    }
    setShowAddExpense(false);
  };

  const handleDeleteSelected = () => {
    setExpenses(expenses.filter(exp => !selectedExpenses.has(exp.id)));
    setSelectedExpenses(new Set());
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
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Manage and analyze your expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Expense List</CardTitle>
            <p className="text-sm text-muted-foreground">
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

            <div className="rounded-md border">
              <Table>
                <ExpenseTableHeader
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  selectedExpenses={selectedExpenses}
                  filteredExpenses={filteredExpenses}
                  toggleSelectAll={toggleSelectAll}
                />
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">No expenses found</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddExpense(true)}
                          >
                            Add an expense
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
                        onDelete={(id) => {
                          setExpenses(expenses.filter(exp => exp.id !== id));
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
