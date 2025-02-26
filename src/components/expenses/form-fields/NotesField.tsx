
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesField({ value, onChange }: NotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="expense-notes">Notes</Label>
      <Textarea
        id="expense-notes"
        name="notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any additional details about the expense..."
        className="min-h-[100px]"
      />
    </div>
  );
}
