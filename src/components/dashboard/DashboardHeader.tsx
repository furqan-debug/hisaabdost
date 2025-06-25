
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Calendar, TrendingUp, Sparkles, Clock, ArrowRight } from "lucide-react";
import { NetworkStatusIndicator } from "@/components/ui/network-status-indicator";

interface DashboardHeaderProps {
  isNewUser?: boolean;
}

export function DashboardHeader({ isNewUser }: DashboardHeaderProps) {
  const { selectedMonth } = useMonthContext();
  const currentDate = new Date();
  const isCurrentMonth = format(selectedMonth, 'MMM yyyy') === format(currentDate, 'MMM yyyy');

  return (
    <div className="space-y-6 mb-8">
      {/* Hero Section with Enhanced Design */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-8 w-24 h-24 bg-primary/3 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <Card className="relative border-0 shadow-xl bg-gradient-to-br from-background/98 to-background/95 backdrop-blur-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-6 flex-1">
                {/* Welcome Badge */}
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    {isNewUser ? "Welcome aboard!" : "Welcome back!"}
                  </Badge>
                </motion.div>

                {/* Main Title with Enhanced Typography */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight">
                    Dashboard
                  </h1>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    <p className="text-lg leading-relaxed max-w-2xl">
                      {isNewUser 
                        ? "Let's get you started on your financial journey with smart insights and easy tracking" 
                        : "Your comprehensive financial overview and insights await"
                      }
                    </p>
                  </div>
                </motion.div>

                {/* Quick Stats Row */}
                <motion.div
                  className="flex items-center gap-6 pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: Just now</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>All systems active</span>
                  </div>
                </motion.div>
              </div>

              {/* Network Status - Enhanced Position */}
              <motion.div
                className="flex flex-col items-end gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <NetworkStatusIndicator className="group relative" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Month & Date Info Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {/* Current/Selected Month Card */}
        <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-500 border border-primary/15 hover:border-primary/30 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300 group-hover:scale-110 transform">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {isCurrentMonth ? "Current Month" : "Viewing Month"}
                    </p>
                    {isCurrentMonth && (
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-primary/5 text-primary border-primary/20">
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Date Card */}
        <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-500 border border-primary/15 hover:border-primary/30 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300 group-hover:scale-110 transform">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Today's Date
                    </p>
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-green-500/5 text-green-600 border-green-500/20">
                      {format(currentDate, 'EEE')}
                    </Badge>
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {format(currentDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Visual Separator */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
      </motion.div>
    </div>
  );
}
