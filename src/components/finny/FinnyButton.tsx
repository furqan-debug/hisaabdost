import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageCircleHeart, X } from 'lucide-react';
interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}
const FinnyButton = ({
  onClick,
  isOpen
}: FinnyButtonProps) => {
  return <motion.div initial={{
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
  }} className="fixed right-5 bottom-15 md:bottom-8 z-20 rounded-full">
      <Button onClick={onClick} className={`w-14 h-14 rounded-full shadow-lg ${isOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-[#9b87f5] hover:bg-[#8674d6]'}`} aria-label={isOpen ? "Close Finny Chat" : "Open Finny Chat"}>
        <motion.div animate={{
        rotate: isOpen ? 45 : 0
      }} transition={{
        duration: 0.2
      }} className="py-[3px] mx-0 px-[22px]">
          {isOpen ? <X size={24} className="text-white" /> : <MessageCircleHeart size={24} className="text-white" />}
        </motion.div>
      </Button>
    </motion.div>;
};
export default FinnyButton;