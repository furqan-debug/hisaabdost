
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useFinny } from "@/components/finny/FinnyProvider";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function FinnyCard() {
  const { openChat, remainingDailyMessages, isMessageLimitReached } = useFinny();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("");
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserName(data.full_name || '');
        } else {
          // Fallback to user metadata if profile data is not available
          setUserName(user.user_metadata?.full_name || '');
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const getMessageText = () => {
    if (!user) {
      return "Sign in to access personalized finance assistance";
    }

    if (isMessageLimitReached) {
      return "Message limit reached for today. Try again tomorrow!";
    }

    if (userName) {
      return `Hello ${userName}! Get instant help with your expenses (${remainingDailyMessages} messages left)`;
    }

    return `Get instant help with your expenses and budgeting (${remainingDailyMessages} messages left)`;
  };

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
              {getMessageText()}
            </p>
          </div>
        </div>
        
        <div>
          <Button
            onClick={openChat}
            variant="default"
            className="w-full sm:w-auto rounded-full transition-all duration-300 hover:shadow-md"
            disabled={user && isMessageLimitReached}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {user ? (isMessageLimitReached ? "Limit Reached" : "Chat Now") : "Try Finny"}
          </Button>
        </div>
      </motion.div>
    </Card>
  );
}
