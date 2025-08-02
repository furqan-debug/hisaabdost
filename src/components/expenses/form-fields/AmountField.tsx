import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
}
export function AmountField({
  value,
  onChange
}: AmountFieldProps) {
  return <div className="space-y-2">
      <Label htmlFor="expense-amount">Expense Amount</Label>
      <Input id="expense-amount" name="amount" type="number" min="0" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder="Enter amount" required className="focus:ring-2 focus:ring-primary" onFocus={e => {
      // Gentle scroll to keep input visible without breaking layout
      setTimeout(() => {
        e.target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }, 150);
    }} />
    </div>;
}