
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useFinny } from "@/components/finny";
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
      return `Need help with budgeting or expenses? Ask me anything!`;
    }

    return `Get expert financial advice and insights about your spending`;
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-medium text-base flex items-center">
            <span className="text-primary mr-2">✦</span> 
            Talk to Finny
          </h3>
          <p className="text-sm text-muted-foreground">
            {getMessageText()}
          </p>
          {!isMessageLimitReached && user && (
            <p className="text-xs text-muted-foreground">
              {remainingDailyMessages} messages remaining today
            </p>
          )}
        </div>
        
        <div className="mt-2">
          <Button
            onClick={openChat}
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary"
            disabled={user && isMessageLimitReached}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            {user ? (isMessageLimitReached ? "Limit Reached" : "Chat Now") : "Try Finny"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
