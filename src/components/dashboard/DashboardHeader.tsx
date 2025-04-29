
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  isNewUser: boolean;
}

export const DashboardHeader = ({ isNewUser }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const [userName, setUserName] = useState<string>("");
  const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() && 
                        selectedMonth.getFullYear() === new Date().getFullYear();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserName(data.full_name || '');
        } else {
          // Fallback to user metadata if profile data is not available
          setUserName(user.user_metadata?.full_name || 'there');
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold text-foreground">
        {isNewUser ? `Welcome, ${userName || 'there'}!` : isCurrentMonth ? 'Dashboard' : `${format(selectedMonth, 'MMMM yyyy')}`}
      </h1>
      <p className="text-muted-foreground text-sm">
        {isNewUser 
          ? "Let's start tracking your expenses. Add your first expense to get started!"
          : isCurrentMonth 
            ? "Here's an overview of your expenses" 
            : `Viewing your financial data for ${format(selectedMonth, 'MMMM yyyy')}`}
      </p>
    </header>
  );
};
