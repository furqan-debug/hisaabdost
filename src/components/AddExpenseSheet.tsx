
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
import { Plus } from "lucide-react";
import { useState } from "react";

interface Expense {
  amount: number;
  description: string;
  date: string;
}

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
}

const AddExpenseSheet = ({ onAddExpense }: AddExpenseSheetProps) => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    onAddExpense({
      amount: parseFloat(amount),
      description,
      date,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
          <SheetDescription>
            Add your expense details here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
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
            Save Expense
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
