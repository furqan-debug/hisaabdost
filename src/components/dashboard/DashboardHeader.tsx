
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";

interface DashboardHeaderProps {
  isNewUser: boolean;
}

export function DashboardHeader({ isNewUser }: DashboardHeaderProps) {
  const { selectedMonth } = useMonthContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm">
        <CardContent className="py-8 px-6 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* Main Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-3">
                {/* Welcome Message */}
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {isNewUser ? "Welcome to your financial journey!" : "Welcome back!"}
                  </span>
                </motion.div>
                
                {/* Main Title */}
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Dashboard
                </motion.h1>
              </div>
              
              {/* Date Badge */}
              <motion.div 
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50 border"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {format(selectedMonth, 'MMM yyyy')}
                </span>
              </motion.div>
            </div>
            
            {/* Subtitle Section */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Month Overview */}
              <p className="text-xl font-semibold text-muted-foreground">
                {format(selectedMonth, 'MMMM yyyy')} Overview
              </p>
              
              {/* Current Date */}
              <p className="text-sm text-muted-foreground/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
            </motion.div>
            
            {/* Progress Indicator */}
            <motion.div 
              className="mt-6 flex items-center gap-3"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(new Date().getDate() / 30) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Day {new Date().getDate()} of {format(selectedMonth, 'MMMM')}
              </span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
