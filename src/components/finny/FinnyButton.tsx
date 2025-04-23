
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FinnyButton = ({ onClick, isOpen }: FinnyButtonProps) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className={`fixed right-4 bottom-20 md:bottom-8 z-50 ${
        isMobile ? 'bottom-24' : ''
      }`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-md bg-primary hover:bg-primary/90"
        aria-label="Open Finny Chat"
      >
        <X className="w-6 h-6 text-white" />
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
