
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const isCurrentMonth = format(selectedMonth, 'MMM yyyy') === format(currentDate, 'MMM yyyy');

  return (
    <div className="space-y-4 mb-6">
      {/* Simple Header */}
      <motion.div 
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-1"
            >
              {isNewUser ? "Welcome!" : "Welcome back"}
            </Badge>
            <NetworkStatusIndicator />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          
          <p className="text-sm text-muted-foreground max-w-md">
            {isNewUser 
              ? "Get started with your financial tracking" 
              : "Your financial overview and insights"
            }
          </p>
        </div>
      </motion.div>

      {/* Clean Date Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Current Month */}
        <Card className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {isCurrentMonth ? "Current Month" : "Viewing"}
                  </p>
                  {isCurrentMonth && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-sm">
                  {format(selectedMonth, 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Date */}
        <Card className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Today</p>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {format(currentDate, 'EEE')}
                  </Badge>
                </div>
                <p className="font-semibold text-sm">
                  {format(currentDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
