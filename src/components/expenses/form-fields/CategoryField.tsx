
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomCategories } from "@/hooks/useCustomCategories";

interface CategoryFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  const { categories, isLoading } = useCustomCategories();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="expense-category">Category</Label>
        <Select disabled>
          <SelectTrigger id="expense-category" className="bg-background">
            <SelectValue placeholder="Loading categories..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-category">Category</Label>
      <Select name="category" value={value} onValueChange={onChange}>
        <SelectTrigger id="expense-category" className="bg-background">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="touch-scroll-container max-h-[40vh]">
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
