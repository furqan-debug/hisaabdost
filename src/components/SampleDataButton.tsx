
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Expense } from "./AddExpenseSheet";

interface SampleDataButtonProps {
  onApply: (expenses: Expense[]) => void;
}

const sampleExpenses: Expense[] = [
  {
    id: "sample-1",
    description: "Groceries",
    amount: 120.50,
    category: "Food",
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: "sample-2",
    description: "Internet Bill",
    amount: 65.00,
    category: "Utilities",
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: "sample-3",
    description: "Movie Night",
    amount: 30.00,
    category: "Entertainment",
    date: new Date().toISOString().split('T')[0],
  },
];

export function SampleDataButton({ onApply }: SampleDataButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      onApply(sampleExpenses);
      setLoading(false);
    }, 500);
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="w-full mt-2"
    >
      Try Sample Data
    </Button>
  );
}
