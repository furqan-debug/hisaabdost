
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";

// Import the mobile-optimized export utilities
const isNativePlatform = () => {
  try {
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform && 
           window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const isAndroid = () => {
  try {
    return typeof window !== 'undefined' && 
           navigator.userAgent.toLowerCase().includes('android');
  } catch {
    return false;
  }
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Enhanced mobile file download using Capacitor
const downloadFileOnMobile = async (content: string, filename: string, mimeType: string, isBase64: boolean = false) => {
  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    
    console.log('Attempting to save budget file on mobile:', filename);
    
    let savedPath = '';
    let savedUri = '';
    
    if (isAndroid()) {
      try {
        // For Android, try to write to Documents directory first
        const docResult = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Documents,
          encoding: isBase64 ? undefined : Encoding.UTF8
        });
        
        savedPath = docResult.uri;
        console.log('Budget file saved to Documents:', savedPath);
        
        // Get URI for documents file
        const docUri = await Filesystem.getUri({
          directory: Directory.Documents,
          path: filename
        });
        savedUri = docUri.uri;
        
      } catch (docError) {
        console.log('Documents directory failed, trying Cache:', docError);
        
        // Fallback to Cache directory
        const cacheResult = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: isBase64 ? undefined : Encoding.UTF8
        });
        
        savedPath = cacheResult.uri;
        console.log('Budget file saved to Cache:', savedPath);
        
        // Get URI for cache file
        const cacheUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: filename
        });
        savedUri = cacheUri.uri;
      }
    } else {
      // For iOS, use Documents directory
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: isBase64 ? undefined : Encoding.UTF8
      });
      
      savedPath = result.uri;
      console.log('Budget file saved to Documents:', savedPath);
      
      // Get URI for documents file
      const docUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: filename
      });
      savedUri = docUri.uri;
    }
    
    console.log('Budget file URI for sharing:', savedUri);

    // Always share the file so user can save it to Downloads
    await Share.share({
      title: 'Hisaab Dost Budget Export',
      text: `Your exported budget file: ${filename}`,
      url: savedUri,
      dialogTitle: 'Save or Share your budget export'
    });
    
    toast({
      title: "Budget Export Complete!",
      description: `Budget file exported successfully. Use the share dialog to save to Downloads or share with other apps.`,
    });

    return { uri: savedPath };
  } catch (error) {
    console.error('Mobile budget file save error:', error);
    
    toast({
      title: "Budget Export Failed",
      description: "Unable to export budget file on mobile. Please try again.",
      variant: "destructive"
    });
    
    throw error;
  }
};

// Web-specific file download
const downloadFileOnWeb = (content: string, filename: string, mimeType: string) => {
  try {
    console.log('Attempting web budget download:', filename, mimeType);
    
    // Create blob with proper MIME type
    const blob = new Blob([content], { type: mimeType });
    
    // Enhanced mobile browser handling
    if (isMobileDevice()) {
      try {
        const dataUrl = URL.createObjectURL(blob);
        
        // Create a hidden download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to DOM and trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(dataUrl);
        }, 1000);
        
        toast({
          title: "Budget Download Started",
          description: "Check your Downloads folder or browser notifications",
        });
      } catch (mobileError) {
        console.error('Mobile web budget download failed:', mobileError);
        
        // Last resort: direct blob URL
        const dataUrl = URL.createObjectURL(blob);
        window.open(dataUrl, '_blank');
        
        toast({
          title: "Budget File Opened",
          description: "File opened in new tab. Use browser menu to save.",
        });
      }
    } else {
      // Desktop browser - standard download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast({
        title: "Budget Export Success",
        description: "Budget file downloaded successfully"
      });
    }
  } catch (error) {
    console.error('Web budget download error:', error);
    toast({
      title: "Budget Export Error",
      description: "Failed to download budget file. Please try again.",
      variant: "destructive"
    });
  }
};

export function useBudgetData() {
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading, updateMonthData } = useMonthContext();
  const { user } = useAuth();
  const currentMonthData = getCurrentMonthData();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());
  
  // Refs to store previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    usagePercentage: 0
  });

  // Local state to prevent glitching during calculation
  const [stableValues, setStableValues] = useState({
    totalBudget: currentMonthData.totalBudget || 0,
    totalSpent: currentMonthData.monthlyExpenses || 0,
    remainingBalance: currentMonthData.remainingBudget || 0,
    usagePercentage: currentMonthData.budgetUsagePercentage || 0,
    monthlyIncome: currentMonthData.monthlyIncome || 0
  });

  // Update debounce timer ref
  const updateTimerRef = useRef<number | null>(null);
  
  // Listen for budget update events
  useEffect(() => {
    // Handler function for budget events
    const handleBudgetUpdate = (e: Event) => {
      console.log("Budget update detected, refreshing data", e);
      // Force refetch by invalidating the query and updating refresh trigger
      queryClient.invalidateQueries({ queryKey: ['budgets', monthKey, user?.id] });
      setRefreshTrigger(Date.now());
    };
    
    // Add event listeners
    window.addEventListener('budget-updated', handleBudgetUpdate);
    window.addEventListener('budget-deleted', handleBudgetUpdate);
    window.addEventListener('budget-refresh', handleBudgetUpdate);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('budget-updated', handleBudgetUpdate);
      window.removeEventListener('budget-deleted', handleBudgetUpdate);
      window.removeEventListener('budget-refresh', handleBudgetUpdate);
    };
  }, [queryClient, monthKey, user?.id]);
  
  // Query budgets with the monthly income
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching budgets for user:", user.id);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} budgets:`, data);
      return data as Budget[];
    },
    enabled: !!user,
    // Adding staleTime to prevent frequent refetches
    staleTime: 1000, // 1 second
  });
  
  // Query to get monthly income specifically
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      const { data, error } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', user.id)
        .limit(1);
        
      if (error) throw error;
      return { monthlyIncome: data?.[0]?.monthly_income || 0 };
    },
    enabled: !!user,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} expenses for ${monthKey}`);
      return data;
    },
    enabled: !!user,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading || incomeLoading;

  const exportBudgetData = async () => {
    if (!budgets || budgets.length === 0) {
      toast({
        title: "No Budget Data",
        description: "No budget data available to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Starting budget export...');
      
      // Add UTF-8 BOM for proper encoding
      const BOM = '\uFEFF';
      
      // Calculate spending for each budget category
      const budgetWithSpending = budgets.map(budget => {
        const categoryExpenses = expenses?.filter(expense => expense.category === budget.category) || [];
        const totalSpent = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const remaining = Number(budget.amount) - totalSpent;
        const usagePercentage = Number(budget.amount) > 0 ? (totalSpent / Number(budget.amount)) * 100 : 0;
        
        return {
          category: budget.category,
          budgetAmount: Number(budget.amount),
          period: budget.period,
          totalSpent: totalSpent,
          remaining: remaining,
          usagePercentage: usagePercentage.toFixed(1),
          carryForward: budget.carry_forward ? 'Yes' : 'No',
          createdAt: format(new Date(budget.created_at), 'yyyy-MM-dd')
        };
      });
      
      // Add Hisaab Dost branding in header
      const headers = ['Category', 'Budget Amount', 'Period', 'Total Spent', 'Remaining', 'Usage %', 'Carry Forward', 'Created Date'];
      const csvContent = BOM + [
        'Hisaab Dost - Budget Report',
        `Generated on: ${format(new Date(), 'PPP')}`,
        `Report Period: ${format(selectedMonth, 'MMMM yyyy')}`,
        '',
        headers.join(','),
        ...budgetWithSpending.map(budget => [
          `"${budget.category}"`,
          budget.budgetAmount,
          budget.period,
          budget.totalSpent,
          budget.remaining,
          `${budget.usagePercentage}%`,
          budget.carryForward,
          budget.createdAt
        ].join(','))
      ].join('\n');

      const filename = `Hisaab_Dost_Budget_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const mimeType = 'text/csv;charset=utf-8;';

      console.log('Budget CSV content prepared, filename:', filename);

      // Check if running on mobile platform
      if (isNativePlatform()) {
        console.log('Using native platform for budget download');
        await downloadFileOnMobile(csvContent, filename, mimeType, false);
      } else {
        console.log('Using web download for budget');
        downloadFileOnWeb(csvContent, filename, mimeType);
      }

    } catch (error) {
      console.error('Error exporting budget data:', error);
      toast({
        title: "Budget Export Failed",
        description: "Failed to export budget data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Transform budgets data for notification triggers
  const budgetNotificationData = budgets?.map(budget => {
    const categoryExpenses = expenses?.filter(expense => expense.category === budget.category) || [];
    const spent = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    return {
      category: budget.category,
      budget: Number(budget.amount),
      spent,
    };
  }) || [];

  // Calculate and debounce summary data updates
  useEffect(() => {
    if (isLoading || !budgets || !expenses || !incomeData) return;
    
    // Get monthly income from Supabase data
    const monthlyIncome = incomeData.monthlyIncome || 0;
    
    // Calculate new values
    const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.amount), 0) || 0;
    const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const remainingBalance = totalBudget - totalSpent;
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Check if values have meaningfully changed (prevent tiny floating point differences)
    const hasChanged = 
      Math.abs(totalBudget - prevValuesRef.current.totalBudget) > 0.01 ||
      Math.abs(totalSpent - prevValuesRef.current.totalSpent) > 0.01 ||
      Math.abs(remainingBalance - prevValuesRef.current.remainingBalance) > 0.01 ||
      Math.abs(usagePercentage - prevValuesRef.current.usagePercentage) > 0.01;
    
    if (!hasChanged && monthlyIncome === stableValues.monthlyIncome) return;
    
    console.log('Budget data changed, updating values:', {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage,
      monthlyIncome
    });
    
    // Store new values in ref
    prevValuesRef.current = {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage
    };
    
    // Clear any existing timeout
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    
    // Debounce the state update (wait 200ms before applying)
    updateTimerRef.current = window.setTimeout(() => {
      setStableValues({
        totalBudget,
        totalSpent,
        remainingBalance,
        usagePercentage,
        monthlyIncome
      });
      
      // Update monthly context with stable values
      updateMonthData(monthKey, {
        totalBudget,
        remainingBudget: remainingBalance,
        budgetUsagePercentage: usagePercentage,
        monthlyIncome,
      });
    }, 200);
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [budgets, expenses, incomeData, currentMonthData, monthKey, updateMonthData, isLoading, stableValues.monthlyIncome]);

  return {
    budgets,
    expenses,
    isLoading,
    exportBudgetData,
    budgetNotificationData,
    ...stableValues
  };
}
