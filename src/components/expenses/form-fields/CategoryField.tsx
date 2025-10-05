import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllCategories } from "@/hooks/useAllCategories";
import { getCategoryNames } from "@/config/categories";

export const EXPENSE_CATEGORIES = getCategoryNames();

interface CategoryFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  const { categories, loading } = useAllCategories();

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-category">Category</Label>
      <Select name="category" value={value} onValueChange={onChange}>
        <SelectTrigger id="expense-category" className="bg-background">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="touch-scroll-container max-h-[40vh]">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={`${cat.value}-${cat.isCustom}`} value={cat.value}>
                  <div className="flex items-center gap-2">
                    {Icon ? (
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <span>{cat.label}</span>
                    {cat.isCustom && (
                      <span className="text-xs px-1 py-0.5 bg-primary/10 text-primary rounded">
                        Custom
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
