
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Other"
];

interface CategoryFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="expense-category">Category</Label>
      <Select name="category" value={value} onValueChange={onChange}>
        <SelectTrigger id="expense-category" className="bg-background">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="touch-scroll-container max-h-[40vh]">
          {EXPENSE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
