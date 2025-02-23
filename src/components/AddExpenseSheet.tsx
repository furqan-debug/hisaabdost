
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Other"
];

const AddExpenseSheet = ({ onAddExpense, expenseToEdit, onClose }: AddExpenseSheetProps) => {
  const [amount, setAmount] = useState<string>(expenseToEdit?.amount.toString() || "");
  const [description, setDescription] = useState<string>(expenseToEdit?.description || "");
  const [date, setDate] = useState<string>(expenseToEdit?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(expenseToEdit?.category || "Other");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date || !category) return;

    onAddExpense({
      id: expenseToEdit?.id || crypto.randomUUID(),
      amount: parseFloat(amount),
      description,
      date,
      category,
    });

    // Reset form and close sheet
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("Other");
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {expenseToEdit ? "Edit Expense" : "Add Expense"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit ? "Edit your expense details below." : "Add your expense details here. Click save when you're done."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Expense Name
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount ($)
            </label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {expenseToEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
