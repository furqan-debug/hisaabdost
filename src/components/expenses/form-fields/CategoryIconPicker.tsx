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
      <div className="relative -mx-4 px-4">
        <div 
          className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div 
            className="grid grid-flow-col auto-cols-[90px] gap-3"
            style={{ 
              gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
              gridAutoFlow: 'column',
            }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = value === cat.value;
              
              return (
                <button
                  key={`${cat.value}-${cat.isCustom}`}
                  type="button"
                  onClick={() => onChange(cat.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all",
                    "hover:scale-105 active:scale-95 min-w-[90px]",
                    isSelected 
                      ? "bg-primary/10 ring-2 ring-primary" 
                      : "bg-card hover:bg-accent"
                  )}
                >
                  <div 
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                      isSelected ? "scale-110" : ""
                    )}
                    style={{ 
                      backgroundColor: isSelected ? cat.color : `${cat.color}20`,
                    }}
                  >
                    {Icon ? (
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: isSelected ? "#fff" : cat.color }} 
                      />
                    ) : (
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium text-center leading-tight line-clamp-2 px-1",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}>
                    {cat.label}
                  </span>
                  {cat.isCustom && (
                    <span className="text-[9px] px-1 py-0.5 bg-primary/10 text-primary rounded">
                      Custom
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Scroll indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
