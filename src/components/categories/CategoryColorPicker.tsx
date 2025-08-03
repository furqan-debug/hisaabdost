
import { Button } from '@/components/ui/button';

interface CategoryColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const CATEGORY_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Purple
  '#6B7280', // Gray
  '#DC2626', // Red 600
  '#059669', // Emerald 600
  '#7C3AED', // Violet 600
];

export function CategoryColorPicker({ selectedColor, onColorSelect }: CategoryColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Color</label>
      <div className="grid grid-cols-8 gap-2">
        {CATEGORY_COLORS.map((color) => (
          <Button
            key={color}
            type="button"
            variant="outline"
            size="sm"
            className={`w-8 h-8 p-0 border-2 ${
              selectedColor === color 
                ? 'border-primary border-2' 
                : 'border-border hover:border-primary/50'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          >
            {selectedColor === color && (
              <div className="w-full h-full rounded-sm border-2 border-white" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
