
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';

interface SpendingTrendsWidgetProps {
  expenses: any[];
}

export function SpendingTrendsWidget({ expenses }: SpendingTrendsWidgetProps) {
  const { currencyCode } = useCurrency();
  
  // Calculate trends (mock data for now)
  const trends = [
    { category: 'Food', amount: 450, change: -12, isPositive: false },
    { category: 'Transport', amount: 280, change: 8, isPositive: true },
    { category: 'Shopping', amount: 320, change: 15, isPositive: true },
  ];

  return (
    <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            className="p-2 rounded-lg bg-primary/10"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <BarChart3 className="h-5 w-5 text-primary" />
          </motion.div>
          Spending Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium">{trend.category}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(trend.amount, currencyCode)}
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.change)}%
            </div>
          </motion.div>
        ))}
        
        {expenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Add expenses to see trends</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
