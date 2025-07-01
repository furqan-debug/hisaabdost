
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Brain, BarChart3, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotificationAnalytics = () => {
  const { getNotificationAnalytics, getNotificationStats } = useSmartNotifications();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const [analyticsData, statsData] = await Promise.all([
          getNotificationAnalytics(),
          getNotificationStats()
        ]);
        setAnalytics(analyticsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading notification analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <Target className="h-4 w-4" />;
      case 'goal': return <TrendingUp className="h-4 w-4" />;
      case 'wastage': return <Zap className="h-4 w-4" />;
      case 'savings': return <BarChart3 className="h-4 w-4" />;
      case 'achievement': return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'destructive';
      case 'goal': return 'default';
      case 'wastage': return 'secondary';
      case 'savings': return 'outline';
      case 'achievement': return 'default';
      default: return 'secondary';
    }
  };

  // Helper function to safely render financial context values
  const renderContextValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    return String(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Notification Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalSent || 0}</div>
            <p className="text-sm text-muted-foreground">Total Sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.averagePriority?.toFixed(1) || 0}</div>
            <p className="text-sm text-muted-foreground">Avg Priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Object.keys(stats.byType || {}).length}</div>
            <p className="text-sm text-muted-foreground">Notification Types</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {stats.lastSent ? new Date(stats.lastSent).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Last Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types Distribution</CardTitle>
          <CardDescription>
            Breakdown of notification types sent to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType || {}).map(([type, count]) => (
              <Badge 
                key={type} 
                variant={getTypeColor(type) as any}
                className="flex items-center gap-1"
              >
                {getTypeIcon(type)}
                {type}: {String(count)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recent Smart Notifications
          </CardTitle>
          <CardDescription>
            Latest AI-generated notifications with reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.slice(0, 10).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={getTypeColor(item.notification_type) as any}>
                    {getTypeIcon(item.notification_type)}
                    {item.notification_type}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.sent_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-sm">
                  <strong>AI Reasoning:</strong> {item.ai_reasoning}
                </div>
                
                {item.financial_context && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Context:</strong> 
                    {item.financial_context.totalSpent && ` Spent: ${renderContextValue(item.financial_context.totalSpent)}`}
                    {item.financial_context.budgetUtilization && ` | Budget: ${renderContextValue(item.financial_context.budgetUtilization)}%`}
                    {item.financial_context.spendingTrend && ` | Trend: ${Number(renderContextValue(item.financial_context.spendingTrend)) > 0 ? '+' : ''}${renderContextValue(item.financial_context.spendingTrend)}%`}
                  </div>
                )}
              </motion.div>
            ))}
            
            {analytics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notifications sent yet. The system will automatically send intelligent notifications daily.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
