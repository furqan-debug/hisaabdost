
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageCircleHeart } from 'lucide-react';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FinnyButton = ({ onClick, isOpen }: FinnyButtonProps) => {
  return (
    <motion.div
      className="fixed right-4 bottom-20 md:bottom-8 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={onClick}
        className={`w-14 h-14 rounded-full shadow-lg ${isOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
        aria-label="Open Finny Chat"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <span className="text-xl font-bold">×</span>
          ) : (
            <MessageCircleHeart size={24} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
