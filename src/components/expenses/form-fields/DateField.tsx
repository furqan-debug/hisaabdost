
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "date-input-custom pl-8",
            isToday && "border-primary border-opacity-50"
          )}
          required
        />
        <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {displayValue && (
        <div className={cn(
          "text-xs", 
          isToday ? "text-primary font-medium" : "text-muted-foreground"
        )}>
          {isToday ? "Today" : displayValue}
        </div>
      )}
    </div>
  );
}
