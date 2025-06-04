
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
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
      <Card className="border-0 shadow-sm bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-sm">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {isNewUser ? "Welcome to your Dashboard!" : "Financial Overview"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(selectedMonth, 'MMMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
