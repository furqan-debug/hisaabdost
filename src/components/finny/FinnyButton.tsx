import React, { useState, useEffect } from 'react';
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
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation will run only on the initial render
  useEffect(() => {
    // Set after component mounts to indicate animation has played
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1500); // Slightly longer than the animation duration to ensure it completes

    return () => clearTimeout(timer);
  }, []);

  // Don't show the button when chat is open
  if (isOpen) return null;
  return <motion.div className={`fixed z-40 ${isMobile ? 'right-4 bottom-20' : 'right-4 bottom-8'}`} initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1,
    y: hasAnimated ? 0 : [0, -15, 0] // Gentle bounce only on initial render
  }} transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20,
    y: {
      duration: 1,
      ease: "easeInOut",
      times: [0, 0.5, 1]
    }
  }} whileTap={{
    scale: 0.9
  }}>
      <Button onClick={onClick} aria-label="Open Finny Chat" className={`w-14 h-14 rounded-full shadow-lg ${!hasAnimated ? 'animate-pulse' : ''} bg-primary hover:bg-primary/90`}>
        <motion.div animate={!hasAnimated ? {
        scale: [1, 1.2, 1]
      } : undefined} transition={!hasAnimated ? {
        duration: 1.5,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: 0
      } : undefined}>
          <Bot className="w-6 h-6 text-white my-[21px]" />
        </motion.div>
      </Button>
    </motion.div>;
};
export default FinnyButton;