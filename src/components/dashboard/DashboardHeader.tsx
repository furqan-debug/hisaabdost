
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";

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
    <header className="mb-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">
          {isNewUser ? 
            `Welcome, ${userName || 'there'}!` : 
            isCurrentMonth ? 
              'Financial Overview' : 
              format(selectedMonth, 'MMMM yyyy')
          }
        </h1>
        
        {!isCurrentMonth && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{format(selectedMonth, 'MMMM yyyy')}</span>
          </div>
        )}
      </div>
      
      {isNewUser && (
        <p className="text-sm text-muted-foreground mt-1">
          Let's start tracking your expenses. Add your first expense to get started!
        </p>
      )}
    </header>
  );
};
