
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useFinny } from '@/components/finny/context/FinnyContext';
import { motion } from 'framer-motion';

export function CompactFinnyCard() {
  const { triggerChat } = useFinny();

  const handleOpenFinny = () => {
    triggerChat('Hi Finny! I need help with my finances.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-primary/5 to-purple-50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Ask Finny</h3>
                <p className="text-xs text-muted-foreground">Your AI financial assistant</p>
              </div>
            </div>
            <Button
              onClick={handleOpenFinny}
              size="sm"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
