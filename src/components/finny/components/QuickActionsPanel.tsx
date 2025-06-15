
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  QUICK_EXPENSE_ACTIONS, 
  QUICK_BUDGET_ACTIONS, 
  QUICK_GOAL_ACTIONS, 
  QUICK_QUERY_ACTIONS,
  QuickAction 
} from '../constants/quickActions';
import { motion } from 'framer-motion';

interface QuickActionsPanelProps {
  onActionSelect: (action: QuickAction) => void;
  isLoading: boolean;
}

export const QuickActionsPanel = ({ onActionSelect, isLoading }: QuickActionsPanelProps) => {
  const renderActionButton = (action: QuickAction, index: number) => (
    <motion.div
      key={action.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Button
        variant="outline"
        className="h-auto p-3 flex flex-col items-center gap-2 text-center hover:bg-primary/5 transition-all duration-200"
        onClick={() => onActionSelect(action)}
        disabled={isLoading}
      >
        <action.icon className="w-5 h-5 text-primary" />
        <span className="text-xs font-medium leading-tight">{action.label}</span>
      </Button>
    </motion.div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          ⚡ Quick Actions
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Save API Credits</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="expenses" className="text-xs">Expenses</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs">Budgets</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">Goals</TabsTrigger>
            <TabsTrigger value="queries" className="text-xs">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_EXPENSE_ACTIONS.map(renderActionButton)}
            </div>
          </TabsContent>
          
          <TabsContent value="budgets" className="mt-0">
            <div className="grid grid-cols-1 gap-2">
              {QUICK_BUDGET_ACTIONS.map(renderActionButton)}
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="mt-0">
            <div className="grid grid-cols-1 gap-2">
              {QUICK_GOAL_ACTIONS.map(renderActionButton)}
            </div>
          </TabsContent>
          
          <TabsContent value="queries" className="mt-0">
            <div className="grid grid-cols-1 gap-2">
              {QUICK_QUERY_ACTIONS.map(renderActionButton)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
