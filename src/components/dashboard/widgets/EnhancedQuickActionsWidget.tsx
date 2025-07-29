import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Upload, Camera, PlusCircle, Target, Bell, 
  TrendingUp, FileText, Calculator, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSmartBudgetAlerts } from '@/hooks/useSmartBudgetAlerts';
import { useNativeCamera } from '@/hooks/useNativeCamera';

interface EnhancedQuickActionsWidgetProps {
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onAddBudget: () => void;
}

export function EnhancedQuickActionsWidget({
  onAddExpense,
  onUploadReceipt,
  onTakePhoto,
  onAddBudget
}: EnhancedQuickActionsWidgetProps) {
  const [viewMode, setViewMode] = useState<'primary' | 'secondary'>('primary');
  const { alerts, hasWarnings, hasCritical } = useSmartBudgetAlerts();
  const { capturePhoto } = useNativeCamera();

  const handleNativeCameraCapture = async () => {
    console.log('Enhanced Quick Actions: Taking native camera photo...');
    try {
      const file = await capturePhoto();
      if (file) {
        console.log('Enhanced Quick Actions: Camera capture successful');
        // Dispatch event with the captured file
        window.dispatchEvent(new CustomEvent('open-expense-form', { 
          detail: { mode: 'camera', file: file } 
        }));
      } else {
        console.log('Enhanced Quick Actions: Camera capture cancelled');
      }
    } catch (error) {
      console.error('Enhanced Quick Actions: Camera capture error:', error);
    }
  };

  const primaryActions = [
    {
      title: 'Add Expense',
      icon: Plus,
      onClick: () => {
        console.log('Quick Actions: Add Expense clicked');
        onAddExpense();
      },
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Manual entry',
      urgent: false
    },
    {
      title: 'Upload Receipt',
      icon: Upload,
      onClick: () => {
        console.log('Quick Actions: Upload Receipt clicked');
        onUploadReceipt();
      },
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Scan from gallery',
      urgent: false
    },
    {
      title: 'Take Photo',
      icon: Camera,
      onClick: async () => {
        console.log('Quick Actions: Take Photo clicked - using native camera');
        await handleNativeCameraCapture();
      },
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Camera capture',
      urgent: false
    },
    {
      title: 'Add Budget',
      icon: PlusCircle,
      onClick: () => {
        console.log('Quick Actions: Add Budget clicked');
        onAddBudget();
      },
      color: hasCritical ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600',
      description: 'Set new budget',
      urgent: hasCritical
    }
  ];

  const secondaryActions = [
    {
      title: 'Set Goals',
      icon: Target,
      onClick: () => {
        console.log('Quick Actions: Set Goals clicked');
        window.location.href = '/app/goals';
      },
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Financial goals',
      urgent: false
    },
    {
      title: 'View Analytics',
      icon: TrendingUp,
      onClick: () => {
        console.log('Quick Actions: View Analytics clicked');
        window.location.href = '/app/analytics';
      },
      color: 'bg-cyan-500 hover:bg-cyan-600',
      description: 'Spending insights',
      urgent: false
    },
    {
      title: 'Export Data',
      icon: FileText,
      onClick: () => {
        console.log('Quick Actions: Export Data clicked');
        window.location.href = '/app/expenses';
      },
      color: 'bg-amber-500 hover:bg-amber-600',
      description: 'Export reports',
      urgent: false
    },
    {
      title: 'Calculator',
      icon: Calculator,
      onClick: () => {
        console.log('Quick Actions: Calculator clicked');
        // Open calculator in new tab/window
        window.open('https://www.google.com/search?q=calculator', '_blank');
      },
      color: 'bg-rose-500 hover:bg-rose-600',
      description: 'Quick math',
      urgent: false
    }
  ];

  const currentActions = viewMode === 'primary' ? primaryActions : secondaryActions;

  const handleActionClick = async (action: typeof currentActions[0], event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`Quick action clicked: ${action.title}`);
    
    setTimeout(async () => {
      try {
        await action.onClick();
      } catch (error) {
        console.error(`Error executing ${action.title}:`, error);
      }
    }, 50);
  };

  return (
    <Card className="cursor-default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            {(hasWarnings || hasCritical) && (
              <Badge variant={hasCritical ? 'destructive' : 'secondary'} className="gap-1">
                <Bell className="h-3 w-3" />
                {alerts.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'primary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('primary')}
            >
              Primary
            </Button>
            <Button
              variant={viewMode === 'secondary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('secondary')}
            >
              More
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {currentActions.map((action, index) => (
            <motion.div
              key={`${viewMode}-${action.title}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={(e) => handleActionClick(action, e)}
                className={`h-auto p-4 flex flex-col items-center gap-2 w-full hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 ${
                  action.urgent ? 'border-red-200 bg-red-50 hover:bg-red-100' : ''
                }`}
                type="button"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white transition-colors relative`}>
                  <action.icon className="h-5 w-5" />
                  {action.urgent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm flex items-center gap-1">
                    {action.title}
                    {action.urgent && <Bell className="h-3 w-3 text-red-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Quick tips based on alerts */}
        {(hasWarnings || hasCritical) && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Budget Alerts</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {hasCritical ? 
                "You have budget overruns that need attention!" :
                "Some budgets are approaching their limits."
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
