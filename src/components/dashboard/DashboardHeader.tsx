
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";

interface DashboardHeaderProps {
  isNewUser: boolean;
}

export function DashboardHeader({ isNewUser }: DashboardHeaderProps) {
  const { selectedMonth } = useMonthContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-background/95 to-accent/5 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
        </div>
        
        <CardContent className="py-6 px-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon with enhanced styling */}
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                {isNewUser ? (
                  <Sparkles className="h-6 w-6 text-primary" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-primary" />
                )}
              </motion.div>
              
              <div className="space-y-2">
                {/* Main heading with enhanced typography */}
                <motion.h1 
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {isNewUser ? "Welcome to your Dashboard! 🎉" : "Welcome back!"}
                </motion.h1>
                
                {/* Subheading with month overview */}
                <motion.div 
                  className="space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-base text-muted-foreground font-medium">
                    {isNewUser 
                      ? `Let's get started with your ${format(selectedMonth, 'MMMM yyyy')} overview`
                      : `Here's your ${format(selectedMonth, 'MMMM yyyy')} overview`
                    }
                  </p>
                  
                  {/* Date indicator with icon */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                    <Calendar className="h-4 w-4" />
                    <span>{format(selectedMonth, 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Optional action area for future features */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:block"
            >
              {/* This space can be used for quick actions or notifications in the future */}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
