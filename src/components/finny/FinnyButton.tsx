
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Twitch } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/auth';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FinnyButton = ({
  onClick,
  isOpen
}: FinnyButtonProps) => {
  const isMobile = useIsMobile();
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useAuth();

  // Don't show the button when chat is open or user is not authenticated
  if (isOpen || !user) return null;
  
  return (
    <motion.div 
      className={`fixed z-40 ${isMobile ? 'right-4 bottom-20' : 'right-4 bottom-8'}`} 
      initial={{
        scale: 0,
        opacity: 0
      }} 
      animate={{
        scale: 1,
        opacity: 1
      }} 
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }} 
      whileTap={{
        scale: 0.9
      }}
      whileHover={{
        scale: 1.1
      }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <Button 
        onClick={onClick} 
        aria-label="Open Finny Chat" 
        className={`
          relative w-16 h-16 rounded-full shadow-lg shadow-primary/40
          bg-gradient-to-br from-primary to-purple-500 hover:from-primary/90 hover:to-purple-400
          border-2 border-white/20 backdrop-blur-sm
          flex items-center justify-center
        `}
      >
        {/* Animated pulse ring effect */}
        <motion.div 
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
        />
        
        <motion.div
          animate={{
            scale: isHovering ? 1.1 : [1, 1.05, 1],
            rotate: isHovering ? [0, -10, 10, -5, 0] : 0,
          }}
          transition={{
            scale: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            },
            rotate: { 
              duration: 0.7, 
              ease: "easeInOut"
            }
          }}
        >
          <Twitch className="w-8 h-8 text-white" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
