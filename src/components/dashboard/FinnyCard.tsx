import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useFinny } from "@/components/finny";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
export function FinnyCard() {
  const {
    openChat,
    remainingDailyMessages,
    isMessageLimitReached
  } = useFinny();
  const {
    user
  } = useAuth();
  const [userName, setUserName] = useState<string>("");
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const {
          data,
          error
        } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
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
  const getAdvancedMessageText = () => {
    if (!user) {
      return "Sign in to unlock your advanced AI financial advisor";
    }
    if (isMessageLimitReached) {
      return "Your advanced AI assistant will return tomorrow with fresh insights!";
    }
    if (userName) {
      return `Hey ${userName}! 🧠 Your advanced AI financial advisor is ready with personalized insights (${remainingDailyMessages} messages left)`;
    }
    return `🚀 Get advanced financial analysis, smart budgeting tips, and personalized investment advice (${remainingDailyMessages} messages left)`;
  };
  const features = [{
    icon: Brain,
    text: "AI-Powered Analysis"
  }, {
    icon: TrendingUp,
    text: "Smart Insights"
  }, {
    icon: Zap,
    text: "Instant Actions"
  }];
  return <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg px-[11px] my-0 py-0 mx-0">
      <motion.div whileHover={{
      scale: 1.02
    }} transition={{
      duration: 0.2
    }} className="p-6 flex flex-col gap-4 mx-px px-[16px]">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-lg">Advanced AI Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getAdvancedMessageText()}
            </p>
          </div>
        </div>
        
        {/* Advanced Features Grid */}
        <div className="grid grid-cols-3 gap-3 py-2">
          {features.map((feature, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-center text-muted-foreground">{feature.text}</span>
            </motion.div>)}
        </div>
        
        <div>
          <Button onClick={openChat} variant="default" className="w-full rounded-full transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" disabled={user && isMessageLimitReached}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {user ? isMessageLimitReached ? "Available Tomorrow" : "Chat with Advanced Finny" : "Unlock Advanced Features"}
          </Button>
        </div>

        {user && !isMessageLimitReached}
      </motion.div>
    </Card>;
}