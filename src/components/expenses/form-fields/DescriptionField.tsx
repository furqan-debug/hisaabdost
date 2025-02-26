
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="expense-description">Expense Name</Label>
      <Input
        id="expense-description"
        name="description"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter expense name"
        required
      />
    </div>
  );
}
