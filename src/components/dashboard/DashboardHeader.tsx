
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="border-0 shadow-sm bg-background">
        <CardContent className="py-6 px-6">
          <div className="space-y-2">
            {/* Main title */}
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Dashboard
            </motion.h1>
            
            {/* Subtitle with month overview */}
            <motion.p 
              className="text-lg text-muted-foreground font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {format(selectedMonth, 'MMMM yyyy')} Overview
            </motion.p>
            
            {/* Date indicator */}
            <motion.p 
              className="text-sm text-muted-foreground/70"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {format(selectedMonth, 'EEEE, MMMM do, yyyy')}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
