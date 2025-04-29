
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function DateField({ 
  value, 
  onChange, 
  label = "Date", 
  placeholder = "Select date...",
  id = "expense-date",
  name = "date"
}: DateFieldProps) {
  // Format the displayed date if there's a value
  const displayValue = value ? format(new Date(value), "PP") : "";
  
  // Check if this is today's date
  const today = new Date().toISOString().split('T')[0];
  const isToday = value === today;
  
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="date-input-custom"
        required
      />
      {displayValue && (
        <div className="text-xs text-muted-foreground">
          {isToday ? "Today" : displayValue}
        </div>
      )}
    </div>
  );
}
