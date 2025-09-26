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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm my-[-9px] py-px">
        <CardContent className="py-2 md:py-4 px-3 md:px-4 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 px-0 mx-0 my-[2px] py-0">
            {/* Main Header Section */}
            <div className="flex items-start justify-between mb-2 md:mb-3 py-0">
              <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
                {/* Welcome Message */}
                <motion.div className="flex items-center gap-1.5 md:gap-2" initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.2
              }}>
                  <div className="p-1 md:p-1.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <TrendingUp className="h-2.5 w-2.5 md:h-4 md:w-4" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground truncate">
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
              }} className="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                  Dashboard
                </motion.h1>
              </div>
              
              {/* Date Badge */}
              <motion.div className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-full bg-muted/50 border flex-shrink-0 ml-1 md:ml-2" initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.4
            }}>
                <Calendar className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-muted-foreground" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
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
          }} className="space-y-1 md:space-y-1.5 py-1">
              {/* Month Overview */}
              <p className="text-sm md:text-lg font-semibold text-muted-foreground">
                {format(selectedMonth, 'MMMM yyyy')} Overview
              </p>
              
              {/* Current Date */}
              <p className="text-xs md:text-sm text-muted-foreground/80 flex items-center gap-1.5 md:gap-2">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                <span className="truncate">
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </span>
              </p>
            </motion.div>
            
            {/* Progress Indicator */}
            <motion.div className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2" initial={{
            opacity: 0,
            width: 0
          }} animate={{
            opacity: 1,
            width: "100%"
          }} transition={{
            delay: 0.6,
            duration: 0.8
          }}>
              <div className="flex-1 h-0.5 md:h-1 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" initial={{
                width: "0%"
              }} animate={{
                width: `${new Date().getDate() / 30 * 100}%`
              }} transition={{
                delay: 0.8,
                duration: 1
              }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Day {new Date().getDate()} of {format(selectedMonth, 'MMMM')}
              </span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>;
}