
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
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
        opacity: 0,
        y: 20
      }} 
      animate={{
        scale: 1,
        opacity: 1,
        y: 0
      }} 
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.2
      }} 
      whileTap={{
        scale: 0.9
      }}
      whileHover={{
        scale: 1.05,
        y: -2
      }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isHovering 
            ? '0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)' 
            : '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      />

      <Button 
        onClick={onClick} 
        aria-label="Open Finny AI Assistant" 
        className={`
          relative w-16 h-16 rounded-full shadow-lg
          bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600
          hover:from-purple-400 hover:via-purple-500 hover:to-indigo-500
          border-2 border-white/30 backdrop-blur-sm
          flex items-center justify-center
          transition-all duration-300
          shadow-purple-500/25 hover:shadow-purple-400/40
          before:absolute before:inset-0 before:rounded-full 
          before:bg-gradient-to-br before:from-white/20 before:to-transparent
          before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        `}
      >
        {/* Animated pulse rings */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-purple-400"
          animate={{ 
            scale: [1, 1.6, 1],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute inset-0 rounded-full bg-indigo-400"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.4, 0, 0.4]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Main icon with enhanced animations */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: isHovering ? 1.1 : [1, 1.05, 1],
            rotate: isHovering ? [0, -5, 5, -3, 0] : 0,
          }}
          transition={{
            scale: {
              duration: isHovering ? 0.3 : 2,
              repeat: isHovering ? 0 : Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            },
            rotate: { 
              duration: 0.6, 
              ease: "easeInOut"
            }
          }}
        >
          <Bot className="w-8 h-8 text-white drop-shadow-lg" />
        </motion.div>

        {/* AI indicator dot */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-1 bg-white rounded-full opacity-30" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FinnyButton;
