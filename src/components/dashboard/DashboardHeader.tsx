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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isNewUser ? "Welcome! Let's get you started." : "Here's your financial overview"}
          </p>
        </div>
        <NetworkStatusIndicator className="group relative" />
      </div>
    </div>
  );
}
