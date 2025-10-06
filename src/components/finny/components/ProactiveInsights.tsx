
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocalInsightsService, LocalInsight } from '../services/localInsightsService';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { startOfMonth } from 'date-fns';
import { useFamilyContext } from '@/hooks/useFamilyContext';

interface ProactiveInsightsProps {
  onInsightAction: (action: string) => void;
}

export const ProactiveInsights = ({ onInsightAction }: ProactiveInsightsProps) => {
  const { user } = useAuth();
  const { currencyCode } = useCurrency();
  const { activeFamilyId, isPersonalMode } = useFamilyContext();
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', activeFamilyId],
    queryFn: async () => {
      if (!user) return [];
      const startDate = startOfMonth(new Date());
      
      let query = supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0]);
      
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('family_id', null);
      } else {
        query = query.eq('family_id', activeFamilyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch budgets
  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', activeFamilyId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('budgets')
        .select('*');
      
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('family_id', null);
      } else {
        query = query.eq('family_id', activeFamilyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch monthly income
  const { data: monthlyIncome = 0 } = useQuery({
    queryKey: ['monthly-income', activeFamilyId],
    queryFn: async () => {
      if (!user) return 0;
      
      let query = supabase
        .from('budgets')
        .select('monthly_income')
        .limit(1);
      
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('family_id', null);
      } else {
        query = query.eq('family_id', activeFamilyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data?.[0]?.monthly_income || 0;
    },
    enabled: !!user
  });

  const [insights, setInsights] = useState<LocalInsight[]>([]);

  useEffect(() => {
    if (expenses.length > 0 || budgets.length > 0) {
      const generatedInsights = LocalInsightsService.generateInsights(
        expenses,
        budgets,
        monthlyIncome,
        currencyCode
      );
      
      const filteredInsights = generatedInsights.filter(
        insight => !dismissedInsights.includes(insight.title)
      );
      
      setInsights(filteredInsights);
      
      const motivational = LocalInsightsService.generateMotivationalMessage(
        expenses,
        budgets,
        currencyCode
      );
      setMotivationalMessage(motivational);
    }
  }, [expenses, budgets, monthlyIncome, currencyCode, dismissedInsights]);

  const handleDismissInsight = (insightTitle: string) => {
    setDismissedInsights(prev => [...prev, insightTitle]);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  if (insights.length === 0 && !motivationalMessage) {
    return null;
  }

  return (
    <div className="space-y-3">
      {motivationalMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
        >
          <p className="text-sm font-medium text-center">{motivationalMessage}</p>
        </motion.div>
      )}
      
      <AnimatePresence>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-primary/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.message}
                      </p>
                      {insight.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => onInsightAction(insight.action!)}
                        >
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDismissInsight(insight.title)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
