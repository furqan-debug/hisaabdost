
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RecurringFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function RecurringField({ value, onChange }: RecurringFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="expense-recurring"
        name="isRecurring"
        checked={value}
        onCheckedChange={onChange}
      />
      <Label htmlFor="expense-recurring">Recurring Expense</Label>
    </div>
  );
}
