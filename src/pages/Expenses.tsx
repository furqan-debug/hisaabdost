
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CheckSquare,
  Filter, 
  Pencil, 
  Square, 
  Trash2, 
  Download,
  SlidersHorizontal
} from "lucide-react";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";

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

  // Save to localStorage whenever expenses change
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

  // Filter and sort expenses
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

  // Calculate total of filtered expenses
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

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.order === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
      <ArrowDownIcon className="h-4 w-4 ml-1" />;
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.keys(CATEGORY_COLORS).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-auto"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-auto"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSelectAll}
                        className="h-8 w-8 p-0"
                      >
                        {selectedExpenses.size === filteredExpenses.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('date')}
                        className="flex items-center"
                      >
                        Date {getSortIcon('date')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('description')}
                        className="flex items-center"
                      >
                        Description {getSortIcon('description')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('category')}
                        className="flex items-center"
                      >
                        Category {getSortIcon('category')}
                      </Button>
                    </TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('amount')}
                        className="flex items-center justify-end w-full"
                      >
                        Amount {getSortIcon('amount')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">No expenses found</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddExpense(true)}
                          >
                            Add an expense
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpenseSelection(expense.id)}
                            className="h-8 w-8 p-0"
                          >
                            {selectedExpenses.has(expense.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{expense.description}</div>
                            {expense.isRecurring && (
                              <div className="text-xs text-muted-foreground">
                                Recurring
                              </div>
                            )}
                            {expense.notes && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]}20`,
                              color: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]
                            }}
                          >
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          {expense.paymentMethod || 'Cash'}
                        </TableCell>
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
