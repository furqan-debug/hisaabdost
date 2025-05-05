
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BotMessageSquare } from 'lucide-react';
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
  const [isHovering, setIsHovering] = useState(false);

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
  
  return (
    <motion.div 
      className={`fixed z-40 ${isMobile ? 'right-4 bottom-20' : 'right-4 bottom-8'}`} 
      initial={{
        scale: 0,
        opacity: 0
      }} 
      animate={{
        scale: 1,
        opacity: 1,
        y: hasAnimated ? 0 : [0, -15, 0] // Gentle bounce only on initial render
      }} 
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        y: {
          duration: 1,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }
      }} 
      whileTap={{
        scale: 0.9
      }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <Button 
        onClick={onClick} 
        aria-label="Open Finny Chat" 
        className={`
          w-14 h-14 rounded-full shadow-lg 
          bg-gradient-to-br from-primary to-purple-500 hover:from-primary/90 hover:to-purple-400
          border-2 border-white/20 backdrop-blur-sm
          ${!hasAnimated ? 'animate-pulse' : ''}
        `}
      >
        <motion.div 
          animate={!hasAnimated ? {
            scale: [1, 1.2, 1]
          } : isHovering ? {
            rotate: [0, -10, 10, -5, 0],
            transition: { duration: 0.7, ease: "easeInOut" }
          } : undefined} 
          transition={!hasAnimated ? {
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: 0
          } : undefined}
          className="relative"
        >
          {/* Main icon */}
          <BotMessageSquare className="w-6 h-6 text-white" />
          
          {/* Animated pulse ring effect */}
          {!hasAnimated && (
            <motion.div 
              className="absolute inset-0 rounded-full"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
