
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Calendar, TrendingUp, Sparkles } from "lucide-react";
import { NetworkStatusIndicator } from "@/components/ui/network-status-indicator";

interface DashboardHeaderProps {
  isNewUser?: boolean;
}

export function DashboardHeader({ isNewUser }: DashboardHeaderProps) {
  const { selectedMonth } = useMonthContext();
  const currentDate = new Date();
  const isCurrentMonth = format(selectedMonth, 'MMM yyyy') === format(currentDate, 'MMM yyyy');

  return (
    <div className="space-y-6">
      {/* Main Header Section */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 rounded-2xl" />
        
        <Card className="relative border-0 shadow-lg bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                {/* Welcome Message */}
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isNewUser ? "Welcome aboard!" : "Welcome back!"}
                  </span>
                </motion.div>

                {/* Main Title */}
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Dashboard
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  className="text-muted-foreground max-w-md leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {isNewUser 
                    ? "Let's get you started on your financial journey" 
                    : "Here's your financial overview"
                  }
                </motion.p>
              </div>

              {/* Network Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <NetworkStatusIndicator className="group relative" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month & Date Info Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {/* Current Month Card */}
        <Card className="group hover:shadow-md transition-all duration-300 border border-primary/10 hover:border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {isCurrentMonth ? "Current Month" : "Viewing Month"}
                </p>
                <p className="font-semibold text-sm">
                  {format(selectedMonth, 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Date Card */}
        <Card className="group hover:shadow-md transition-all duration-300 border border-primary/10 hover:border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Today's Date
                </p>
                <p className="font-semibold text-sm">
                  {format(currentDate, 'EEEE, MMM dd')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/3 rounded-full blur-2xl -z-10" />
    </div>
  );
}
