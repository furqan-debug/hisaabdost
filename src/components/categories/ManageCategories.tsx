
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { AddEditCategoryDialog } from './AddEditCategoryDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CustomCategory } from '@/hooks/useCustomCategories';

export function ManageCategories() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCustomCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<CustomCategory | undefined>();

  const handleAddNew = () => {
    setEditingCategory(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: CustomCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleSave = async (name: string, color: string) => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, name, color);
    } else {
      return await createCategory(name, color);
    }
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      const success = await deleteCategory(deletingCategory.id);
      if (success) {
        setDeletingCategory(undefined);
      }
    }
  };

  const existingNames = categories.map(cat => cat.name);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manage Categories</h2>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
                {category.is_default && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
              
              {!category.is_default && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCategory(category)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No categories found</p>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Category
          </Button>
        </Card>
      )}

      <AddEditCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        category={editingCategory}
        existingNames={existingNames}
      />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
