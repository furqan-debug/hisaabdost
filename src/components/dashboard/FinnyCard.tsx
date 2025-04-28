
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useFinny } from "@/components/finny/FinnyProvider";

export function FinnyCard() {
  const { openChat } = useFinny();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-background border-border/50">
      <motion.div
        className="p-4 flex flex-col gap-3"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-base">Talk to Finny</h3>
            <p className="text-sm text-muted-foreground">
              Get instant help with your expenses and budgeting
            </p>
          </div>
        </div>
        
        <div>
          <Button
            onClick={openChat}
            variant="default"
            className="w-full sm:w-auto rounded-full transition-all duration-300 hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Now
          </Button>
        </div>
      </motion.div>
    </Card>
  );
}
