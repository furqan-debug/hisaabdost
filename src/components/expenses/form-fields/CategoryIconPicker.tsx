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
          className="overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <style>{`
            .category-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div 
            className="category-scroll grid auto-cols-[100px] gap-4 pb-1"
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
                    "snap-start flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-200",
                    "hover:scale-105 active:scale-95 w-[100px] h-[100px]",
                    isSelected 
                      ? "bg-primary/5 ring-2 ring-primary shadow-sm" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected ? "scale-110" : ""
                    )}
                    style={{ 
                      backgroundColor: isSelected ? cat.color : `${cat.color}15`,
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
                    "text-[10px] font-medium text-center leading-tight line-clamp-2 w-full px-1",
                    isSelected ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {cat.label}
                  </span>
                  {cat.isCustom && (
                    <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Fade indicators */}
        <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background via-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background via-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
