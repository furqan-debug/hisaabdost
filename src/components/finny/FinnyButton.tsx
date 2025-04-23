
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FinnyButton = ({
  onClick,
  isOpen
}: FinnyButtonProps) => {
  const isMobile = useIsMobile();

  // Don't show the button when chat is open
  if (isOpen) return null;
  
  return (
    <motion.div 
      className={`fixed z-40 ${isMobile ? 'right-4 bottom-20' : 'right-6 bottom-6'}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={onClick} 
        aria-label="Open Finny Chat" 
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Bot className="w-6 h-6 text-primary-foreground" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
