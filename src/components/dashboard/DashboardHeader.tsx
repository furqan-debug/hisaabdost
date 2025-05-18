
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, SmilePlus, Rocket, Wallet } from "lucide-react";

interface DashboardHeaderProps {
  isNewUser: boolean;
  monthlyExpenses?: number;
  monthlyIncome?: number;
  savingsRate?: number;
}

export const DashboardHeader = ({ 
  isNewUser, 
  monthlyExpenses = 0,
  monthlyIncome = 0,
  savingsRate = 0
}: DashboardHeaderProps) => {
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

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get contextual message based on user data
  const getContextualMessage = () => {
    if (isNewUser) {
      return "Let's start tracking your expenses to gain financial insights 📊";
    }
    
    // If it's an existing user with data
    if (monthlyIncome > 0 && monthlyExpenses > 0) {
      // User is spending within their means
      if (monthlyExpenses < monthlyIncome * 0.85) {
        return "You're managing your expenses well this month 💰";
      }
      
      // User is close to their income limit
      if (monthlyExpenses > monthlyIncome * 0.85 && monthlyExpenses < monthlyIncome) {
        return "You're getting close to your monthly income limit 📉";
      }
      
      // User has exceeded their income
      if (monthlyExpenses > monthlyIncome) {
        return "Let's find ways to reduce expenses this month 🛑";
      }
    }
    
    // If savings rate is good
    if (savingsRate > 20) {
      return "Great job saving! Keep it up 🚀";
    }
    
    // Default message if we don't have enough data
    return "Track your finances to gain valuable insights 📈";
  };

  // Get appropriate icon based on message
  const getMessageIcon = () => {
    if (isNewUser) return <SmilePlus className="h-5 w-5 text-primary" />;
    
    if (monthlyIncome > 0 && monthlyExpenses > 0) {
      // Good financial status
      if (monthlyExpenses < monthlyIncome * 0.85 || savingsRate > 20) {
        return <Rocket className="h-5 w-5 text-emerald-500" />;
      }
      
      // Warning financial status
      if (monthlyExpenses > monthlyIncome * 0.85 && monthlyExpenses < monthlyIncome) {
        return <Wallet className="h-5 w-5 text-amber-500" />;
      }
      
      // Bad financial status
      if (monthlyExpenses > monthlyIncome) {
        return <Wallet className="h-5 w-5 text-rose-500" />;
      }
    }
    
    // Default icon
    return <SmilePlus className="h-5 w-5 text-primary" />;
  };
  
  return (
    <header className="mb-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">
          {isNewUser ? 
            `Welcome, ${userName || 'there'}!` : 
            `${getTimeBasedGreeting()}, ${userName || 'there'} 👋`
          }
        </h1>
        
        {!isCurrentMonth && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{format(selectedMonth, 'MMMM yyyy')}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        {getMessageIcon()}
        <p className="text-sm text-muted-foreground">
          {getContextualMessage()}
        </p>
      </div>
    </header>
  );
};
