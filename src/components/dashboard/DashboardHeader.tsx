
import React from "react";
import { useAuth } from "@/lib/auth";

interface DashboardHeaderProps {
  isNewUser: boolean;
}

export const DashboardHeader = ({ isNewUser }: DashboardHeaderProps) => {
  const { user } = useAuth();
  
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-bold">
        {isNewUser ? `Welcome, ${user?.user_metadata?.full_name || 'there'}! 👋` : 'Dashboard'}
      </h1>
      <p className="text-muted-foreground">
        {isNewUser 
          ? "Let's start tracking your expenses. Add your first expense to get started!"
          : "Here's an overview of your expenses"}
      </p>
    </header>
  );
};
