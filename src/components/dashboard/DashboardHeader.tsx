
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { NetworkStatusIndicator } from "@/components/ui/network-status-indicator";

interface DashboardHeaderProps {
  isNewUser?: boolean;
}

export function DashboardHeader({ isNewUser }: DashboardHeaderProps) {
  const { selectedMonth } = useMonthContext();
  const currentDate = new Date();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary">👋</span>
            <span>{isNewUser ? "Welcome!" : "Welcome back!"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{format(selectedMonth, "MMMM yyyy")} Overview</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(currentDate, "EEEE, MMMM do, yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Today</div>
            <div className="font-medium">Day {format(currentDate, "d")} of {format(currentDate, "MMMM")}</div>
          </div>
          <NetworkStatusIndicator className="group relative" />
        </div>
      </div>
    </div>
  );
}
