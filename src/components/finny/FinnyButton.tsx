
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FinnyButton = ({ onClick, isOpen }: FinnyButtonProps) => {
  const isMobile = useIsMobile();

  // Don't show the button when chat is open
  if (isOpen) return null;

  return (
    <motion.div
      className={`fixed z-40 ${
        isMobile ? 'right-4 bottom-20' : 'right-4 bottom-8'
      }`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={onClick}
        className="w-12 h-12 rounded-full shadow-md bg-primary hover:bg-primary/90"
        aria-label="Open Finny Chat"
      >
        <motion.div>
          <Bot className="w-5 h-5 text-white" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
