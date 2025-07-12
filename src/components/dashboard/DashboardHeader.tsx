
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
interface DashboardHeaderProps {
  isNewUser: boolean;
}
export function DashboardHeader({
  isNewUser
}: DashboardHeaderProps) {
  const {
    selectedMonth
  } = useMonthContext();
  return <motion.div initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5,
    ease: "easeOut"
  }} className="relative overflow-hidden mt-2">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background/95 to-muted/30 backdrop-blur-sm my-0 py-16 md:py-20">
        <CardContent className="py-4 md:py-6 px-4 md:px-6 relative">
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 right-6 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-6 left-6 w-32 h-32 bg-accent rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/30 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="relative z-10">
            {/* Main Header Section */}
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                {/* Welcome Message */}
                <motion.div className="flex items-center gap-2 md:gap-3" initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.2
              }}>
                  <div className="p-2 md:p-2.5 rounded-xl bg-primary/15 text-primary flex-shrink-0 shadow-sm">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-muted-foreground truncate">
                    {isNewUser ? "Welcome to your journey!" : "Welcome back!"}
                  </span>
                </motion.div>
                
                {/* Main Title */}
                <motion.h1 initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.3
              }} className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                  Dashboard
                </motion.h1>
              </div>
              
              {/* Date Badge */}
              <motion.div className="flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-muted/60 border border-border/50 shadow-sm flex-shrink-0 ml-2 md:ml-3" initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.4
            }}>
                <Calendar className="h-4 w-4 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-sm md:text-base font-medium text-muted-foreground whitespace-nowrap">
                  {format(selectedMonth, 'MMM yyyy')}
                </span>
              </motion.div>
            </div>
            
            {/* Subtitle Section */}
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }} className="space-y-2 md:space-y-2.5 py-2">
              {/* Month Overview */}
              <p className="text-base md:text-xl font-semibold text-muted-foreground">
                {format(selectedMonth, 'MMMM yyyy')} Overview
              </p>
              
              {/* Current Date */}
              <p className="text-sm md:text-base text-muted-foreground/90 flex items-center gap-2 md:gap-3">
                <span className="w-2 h-2 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                <span className="truncate">
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </span>
              </p>
            </motion.div>
            
            {/* Progress Indicator */}
            <motion.div className="mt-4 md:mt-5 flex items-center gap-2 md:gap-3" initial={{
            opacity: 0,
            width: 0
          }} animate={{
            opacity: 1,
            width: "100%"
          }} transition={{
            delay: 0.6,
            duration: 0.8
          }}>
              <div className="flex-1 h-1 md:h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-sm" initial={{
                width: "0%"
              }} animate={{
                width: `${new Date().getDate() / 30 * 100}%`
              }} transition={{
                delay: 0.8,
                duration: 1
              }} />
              </div>
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                Day {new Date().getDate()} of {format(selectedMonth, 'MMMM')}
              </span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>;
}
