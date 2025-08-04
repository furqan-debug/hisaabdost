import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useCustomCategories, CustomCategory } from '@/hooks/useCustomCategories';
import { useAllCategories } from '@/hooks/useAllCategories';
import { AddEditCategoryModal } from '@/components/categories/AddEditCategoryModal';
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

export default function ManageCategories() {
  const navigate = useNavigate();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCustomCategories();
  const { categories: allCategories } = useAllCategories();
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategory | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowAddEditModal(true);
  };

  const handleEditCategory = (category: CustomCategory) => {
    setEditingCategory(category);
    setShowAddEditModal(true);
  };

  const handleDeleteCategory = (category: CustomCategory) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async (name: string, color: string) => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, name, color);
    } else {
      return await createCategory(name, color);
    }
  };

  const defaultCategories = allCategories
    .filter(cat => !cat.isCustom)
    .map(cat => ({
      name: cat.value,
      color: cat.color,
      isDefault: true
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-6 border-b safe-area-top">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/settings')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Manage Categories</h1>
              <p className="text-sm text-muted-foreground">Create and organize your expense categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Add New Category Button */}
        <Button
          onClick={handleAddCategory}
          className="w-full justify-start gap-3 h-12"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </Button>

        {/* Default Categories Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Default Categories</h2>
          <div className="space-y-2">
            {defaultCategories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                    Default
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Categories Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Custom Categories ({categories.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No custom categories yet</p>
              <p className="text-sm text-muted-foreground/70">
                Create your first custom category to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AddEditCategoryModal
        open={showAddEditModal}
        onOpenChange={setShowAddEditModal}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              Any expenses using this category will keep their current category assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}