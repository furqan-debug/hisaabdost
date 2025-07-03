
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function DescriptionField({ value, onChange, label = "Description" }: DescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">{label}</Label>
      <Input
        id="description"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What did you spend on?"
        required
      />
    </div>
  );
}
