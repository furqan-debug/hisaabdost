
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Receipt, Wallet, Target, BarChart2, User, DollarSign } from 'lucide-react';
import { format, parseISO, isWithinInterval, subDays, subMonths } from 'date-fns';

interface ActivityLog {
  id: string;
  action_type: string;
  action_description: string;
  amount: number | null;
  category: string | null;
  metadata: any;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const { currencyCode } = useCurrency();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const actionTypeConfig = {
    expense: { icon: Receipt, color: 'bg-red-100 text-red-800', label: 'Expense' },
    budget: { icon: BarChart2, color: 'bg-blue-100 text-blue-800', label: 'Budget' },
    goal: { icon: Target, color: 'bg-green-100 text-green-800', label: 'Goal' },
    wallet: { icon: Wallet, color: 'bg-purple-100 text-purple-800', label: 'Wallet' },
    income: { icon: DollarSign, color: 'bg-yellow-100 text-yellow-800', label: 'Income' },
    profile: { icon: User, color: 'bg-gray-100 text-gray-800', label: 'Profile' }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, typeFilter, dateFilter]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action_type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateRange;

      switch (dateFilter) {
        case 'week':
          dateRange = { start: subDays(now, 7), end: now };
          break;
        case 'month':
          dateRange = { start: subMonths(now, 1), end: now };
          break;
        case 'quarter':
          dateRange = { start: subMonths(now, 3), end: now };
          break;
        default:
          dateRange = null;
      }

      if (dateRange) {
        filtered = filtered.filter(activity =>
          isWithinInterval(parseISO(activity.created_at), dateRange)
        );
      }
    }

    setFilteredActivities(filtered);
  };

  const getActionIcon = (actionType: string) => {
    const config = actionTypeConfig[actionType as keyof typeof actionTypeConfig];
    const IconComponent = config?.icon || Receipt;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActionBadge = (actionType: string) => {
    const config = actionTypeConfig[actionType as keyof typeof actionTypeConfig];
    return (
      <Badge variant="secondary" className={config?.color || 'bg-gray-100 text-gray-800'}>
        {config?.label || actionType}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy');
  };

  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  };

  const getAmountDisplay = (activity: ActivityLog) => {
    if (!activity.amount) return null;
    
    // For income activities, show the change amount if available
    if (activity.action_type === 'income' && activity.metadata?.change_amount !== undefined) {
      const changeAmount = activity.metadata.change_amount;
      if (changeAmount === 0) return formatCurrency(activity.amount, currencyCode);
      
      return (
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(activity.amount, currencyCode)}
          </p>
          <p className={`text-xs ${changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changeAmount > 0 ? '+' : ''}{formatCurrency(changeAmount, currencyCode)}
          </p>
        </div>
      );
    }
    
    return (
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(activity.amount, currencyCode)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity History
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="goal">Goals</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities found</p>
              {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      {getActionIcon(activity.action_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionBadge(activity.action_type)}
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.created_at)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action_description}
                      </p>
                      
                      {activity.category && (
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {activity.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {getAmountDisplay(activity)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
