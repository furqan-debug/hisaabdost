
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Camera, PieChart, TrendingUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsWidgetProps {
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onViewAnalytics: () => void;
  onViewTrends: () => void;
  onOpenCalculator: () => void;
}

export function QuickActionsWidget({
  onAddExpense,
  onUploadReceipt,
  onTakePhoto,
  onViewAnalytics,
  onViewTrends,
  onOpenCalculator
}: QuickActionsWidgetProps) {
  const actions = [
    {
      title: 'Add Expense',
      icon: Plus,
      onClick: onAddExpense,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Quick manual entry'
    },
    {
      title: 'Upload Receipt',
      icon: Upload,
      onClick: onUploadReceipt,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Scan from gallery'
    },
    {
      title: 'Take Photo',
      icon: Camera,
      onClick: onTakePhoto,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Camera capture'
    },
    {
      title: 'Analytics',
      icon: PieChart,
      onClick: onViewAnalytics,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'View insights'
    },
    {
      title: 'Trends',
      icon: TrendingUp,
      onClick: onViewTrends,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Spending patterns'
    },
    {
      title: 'Calculator',
      icon: Calculator,
      onClick: onOpenCalculator,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Quick math'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                className="h-auto p-4 flex flex-col items-center gap-2 w-full hover:shadow-md transition-all duration-200"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
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
