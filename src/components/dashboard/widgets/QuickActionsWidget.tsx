
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Camera, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinny } from '@/components/finny/context/FinnyContext';

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
  const { triggerChat } = useFinny();

  const handleAddExpense = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Add Expense clicked');
    
    // Dispatch custom event that AddExpenseButton listens for
    const customEvent = new CustomEvent('open-expense-form', {
      detail: { mode: 'manual' }
    });
    window.dispatchEvent(customEvent);
    
    // Also call the provided callback as fallback
    setTimeout(() => {
      try {
        onAddExpense();
      } catch (error) {
        console.error('Error executing onAddExpense:', error);
      }
    }, 100);
  };

  const handleUploadReceipt = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Upload Receipt clicked');
    
    // Dispatch custom event for file upload
    const customEvent = new CustomEvent('open-expense-form', {
      detail: { mode: 'upload' }
    });
    window.dispatchEvent(customEvent);
    
    // Also call the provided callback as fallback
    setTimeout(() => {
      try {
        onUploadReceipt();
      } catch (error) {
        console.error('Error executing onUploadReceipt:', error);
      }
    }, 100);
  };

  const handleTakePhoto = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Take Photo clicked');
    
    // Dispatch custom event for camera capture
    const customEvent = new CustomEvent('open-expense-form', {
      detail: { mode: 'camera' }
    });
    window.dispatchEvent(customEvent);
    
    // Also call the provided callback as fallback
    setTimeout(() => {
      try {
        onTakePhoto();
      } catch (error) {
        console.error('Error executing onTakePhoto:', error);
      }
    }, 100);
  };

  const handleAddBudget = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Quick action: Add Budget clicked');
    
    // Use Finny to set a budget
    triggerChat('Help me set up a new budget');
    
    // Also call the provided callback as fallback
    setTimeout(() => {
      try {
        onAddBudget();
      } catch (error) {
        console.error('Error executing onAddBudget:', error);
      }
    }, 100);
  };

  const actions = [
    {
      title: 'Add Expense',
      icon: Plus,
      onClick: handleAddExpense,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Quick manual entry'
    },
    {
      title: 'Upload Receipt',
      icon: Upload,
      onClick: handleUploadReceipt,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Scan from gallery'
    },
    {
      title: 'Take Photo',
      icon: Camera,
      onClick: handleTakePhoto,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Camera capture'
    },
    {
      title: 'Add Budget',
      icon: PlusCircle,
      onClick: handleAddBudget,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Set new budget'
    }
  ];

  return (
    <Card className="cursor-default">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center gap-2 w-full hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                type="button"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white transition-colors`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
