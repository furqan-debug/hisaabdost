
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryColorPicker } from './CategoryColorPicker';
import { CustomCategory } from '@/hooks/useCustomCategories';

interface AddEditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<boolean>;
  category?: CustomCategory;
  existingNames: string[];
}

export function AddEditCategoryDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  existingNames 
}: AddEditCategoryDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!category;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setColor(category.color);
      } else {
        setName('');
        setColor('#6B7280');
      }
      setError('');
    }
  }, [isOpen, category]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    // Check for duplicate names (case-insensitive, excluding current category if editing)
    const isDuplicate = existingNames.some(existingName => 
      existingName.toLowerCase() === name.trim().toLowerCase() && 
      (!category || existingName !== category.name)
    );

    if (isDuplicate) {
      setError('A category with this name already exists');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = await onSave(name.trim(), color);
    
    setIsLoading(false);

    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    setName('');
    setColor('#6B7280');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter category name"
              maxLength={50}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <CategoryColorPicker
            selectedColor={color}
            onColorSelect={setColor}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
