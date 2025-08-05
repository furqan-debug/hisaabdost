
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Camera, PlusCircle } from 'lucide-react';

interface QuickActionsWidgetProps {
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onAddBudget: () => void;
}

export function QuickActionsWidget({
  onAddExpense,
  onUploadReceipt,
  onTakePhoto,
  onAddBudget
}: QuickActionsWidgetProps) {

  const handleAddExpense = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Add Expense clicked');
    onAddExpense();
  };

  const handleUploadReceipt = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Upload Receipt clicked');
    onUploadReceipt();
  };

  const handleTakePhoto = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Take Photo clicked');
    onTakePhoto();
  };

  const handleAddBudget = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Add Budget clicked');
    onAddBudget();
  };

  const actions = [
    {
      title: 'Add Expense',
      icon: Plus,
      onClick: handleAddExpense,
      color: 'bg-primary text-primary-foreground hover:bg-primary/90',
      description: 'Manual entry'
    },
    {
      title: 'Upload Receipt',
      icon: Upload,
      onClick: handleUploadReceipt,
      color: 'bg-green-600 text-white hover:bg-green-700',
      description: 'From gallery'
    },
    {
      title: 'Take Photo',
      icon: Camera,
      onClick: handleTakePhoto,
      color: 'bg-purple-600 text-white hover:bg-purple-700',
      description: 'Camera scan'
    },
    {
      title: 'Set Budget',
      icon: PlusCircle,
      onClick: handleAddBudget,
      color: 'bg-orange-600 text-white hover:bg-orange-700',
      description: 'Budget planning'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Button
          key={action.title}
          variant="outline"
          onClick={action.onClick}
          className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary/20 transition-all duration-200 cursor-pointer group"
          type="button"
        >
          <div className={`p-2 rounded-lg ${action.color} transition-all duration-200 group-hover:scale-110`}>
            <action.icon className="h-5 w-5" />
          </div>
          <div className="text-center">
            <div className="font-medium text-xs">{action.title}</div>
            <div className="text-xs text-muted-foreground">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
