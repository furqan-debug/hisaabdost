import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquareText, X } from 'lucide-react';
interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}
const FinnyButton = ({
  onClick,
  isOpen
}: FinnyButtonProps) => {
  return <motion.div className="fixed right-4 bottom-20 md:bottom-8 z-50" initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20
  }} whileTap={{
    scale: 0.9
  }}>
      <Button onClick={onClick} aria-label={isOpen ? "Close Finny Chat" : "Open Finny Chat"} className="my-[61px]">
        <motion.div animate={{
        rotate: isOpen ? 45 : 0
      }} transition={{
        duration: 0.2
      }}>
          {isOpen ? <X size={22} className="text-white" /> : <MessageSquareText size={22} className="text-white" />}
        </motion.div>
      </Button>
    </motion.div>;
};
export default FinnyButton;