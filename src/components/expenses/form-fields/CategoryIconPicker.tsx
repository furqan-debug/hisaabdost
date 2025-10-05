import { Label } from "@/components/ui/label";
import { useAllCategories } from "@/hooks/useAllCategories";
import { cn } from "@/lib/utils";

interface CategoryIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const { categories, loading } = useAllCategories();

  if (loading) {
    return (
      <div className="space-y-3">
        <Label>Select Category</Label>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Select Category</Label>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.value;
          
          return (
            <button
              key={`${cat.value}-${cat.isCustom}`}
              type="button"
              onClick={() => onChange(cat.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                "hover:scale-105 active:scale-95",
                isSelected 
                  ? "bg-primary/10 ring-2 ring-primary" 
                  : "bg-card hover:bg-accent"
              )}
            >
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isSelected ? "scale-110" : ""
                )}
                style={{ 
                  backgroundColor: isSelected ? cat.color : `${cat.color}20`,
                }}
              >
                {Icon ? (
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: isSelected ? "#fff" : cat.color }} 
                  />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium text-center leading-tight line-clamp-2",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {cat.label}
              </span>
              {cat.isCustom && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                  Custom
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
