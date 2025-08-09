import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomCategory } from '@/hooks/useCustomCategories';
import { useAllCategories } from '@/hooks/useAllCategories';
import { toast } from 'sonner';
interface AddEditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CustomCategory | null;
  onSave: (name: string, color: string) => Promise<boolean>;
}
const BASE_PRESET_COLORS = ['#ef4444',
// red
'#f97316',
// orange
'#eab308',
// yellow
'#22c55e',
// green
'#06b6d4',
// cyan
'#3b82f6',
// blue
'#8b5cf6',
// violet
'#ec4899',
// pink
'#64748b',
// slate
'#0ea5e9',
// sky
'#10b981',
// emerald
'#f59e0b',
// amber
'#dc2626',
// red-600
'#ea580c',
// orange-600
'#ca8a04',
// yellow-600
'#16a34a',
// green-600
'#0891b2',
// cyan-600
'#2563eb',
// blue-600
'#7c3aed',
// violet-600
'#db2777',
// pink-600
'#475569',
// slate-600
'#0284c7',
// sky-600
'#059669',
// emerald-600
'#d97706',
// amber-600
'#be123c',
// rose-600
'#c2410c',
// orange-700
'#a16207',
// yellow-700
'#15803d',
// green-700
'#0e7490',
// cyan-700
'#1d4ed8',
// blue-700
'#6d28d9',
// violet-700
'#be185d',
// pink-700
'#334155',
// slate-700
'#0369a1',
// sky-700
'#047857',
// emerald-700
'#b45309' // amber-700
];
export function AddEditCategoryModal({
  open,
  onOpenChange,
  category,
  onSave
}: AddEditCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    categories
  } = useAllCategories();
  const isEditing = !!category;

  // Get colors that are already in use by other categories
  const usedColors = categories.filter(cat => isEditing ? cat.value !== category?.name : true).map(cat => cat.color.toLowerCase());

  // Get 12 available colors, filling from the larger pool
  const getAvailableColors = () => {
    const available = BASE_PRESET_COLORS.filter(color => !usedColors.includes(color.toLowerCase()));

    // Always return exactly 12 colors
    if (available.length >= 12) {
      return available.slice(0, 12);
    } else {
      // If we have fewer than 12 unused colors, pad with the least recently used colors
      const remaining = 12 - available.length;
      const additionalColors = BASE_PRESET_COLORS.filter(color => usedColors.includes(color.toLowerCase())).slice(0, remaining);
      return [...available, ...additionalColors];
    }
  };
  const availablePresetColors = getAvailableColors();
  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    } else {
      setName('');
      setColor('#6B7280');
    }
  }, [category, open]);
  const handleSave = async () => {
    if (!name.trim()) return;

    // Check if color is already in use
    const isColorTaken = usedColors.includes(color.toLowerCase());
    if (isColorTaken) {
      toast.error('This color is already taken. Please choose another.');
      return;
    }
    setIsSubmitting(true);
    const success = await onSave(name.trim(), color);
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false);
      setName('');
      setColor('#6B7280');
    }
  };
  const handleCancel = () => {
    onOpenChange(false);
    setName('');
    setColor('#6B7280');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category name and color.' : 'Create a new expense category with a custom name and color.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input id="category-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Hobbies, Car Maintenance" className="w-full" maxLength={50} />
          </div>

          <div className="space-y-3">
            <Label>Category Color</Label>
            <div className="grid grid-cols-6 gap-3 py-[3px]">
              {availablePresetColors.map(presetColor => <button key={presetColor} type="button" className={`w-8 h-8 rounded-full border-2 transition-all ${color === presetColor ? 'border-foreground scale-110' : 'border-muted-foreground/30 hover:scale-105'}`} style={{
              backgroundColor: presetColor
            }} onClick={() => setColor(presetColor)} />)}
            </div>
            
            <div className="flex items-center gap-3">
              <Label htmlFor="custom-color" className="text-sm">Custom:</Label>
              <div className="flex items-center gap-2">
                <input id="custom-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded border border-input bg-background cursor-pointer" />
                <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#000000" className="w-20 text-xs" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-4 h-4 rounded-full" style={{
            backgroundColor: color
          }} />
            <span className="text-sm font-medium">{name || 'Category Name'}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="py-0 my-[12px] mx-0">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}