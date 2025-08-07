
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
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
  const [isDragging, setIsDragging] = useState(false);
  // Initial position: completely above bottom nav (around 100px from bottom)
  const [verticalPosition, setVerticalPosition] = useState(100);
  const { user } = useAuth();
  const constraintsRef = useRef(null);

  // Motion values for dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Don't show the button when chat is open or user is not authenticated
  if (isOpen || !user) return null;

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const screenHeight = window.innerHeight;
    const finalY = info.point.y;
    
    // More precise boundary calculations
    const headerHeight = 64; // Standard header height
    const navHeight = isMobile ? 80 : 0; // Mobile bottom nav height
    const buttonSize = 64; // Button height (16 * 4 = 64px)
    const safeMargin = 16; // Safe margin from boundaries
    
    // Calculate limits with safe margins
    const topLimit = headerHeight + safeMargin;
    const bottomLimit = navHeight + safeMargin;
    
    // Convert screen Y to bottom offset, ensuring button stays within safe boundaries
    let newBottomOffset = screenHeight - finalY - (buttonSize / 2);
    
    // Constrain to safe boundaries with elastic behavior
    if (newBottomOffset < bottomLimit) {
      newBottomOffset = bottomLimit;
    } else if (newBottomOffset > screenHeight - topLimit - buttonSize) {
      newBottomOffset = screenHeight - topLimit - buttonSize;
    }
    
    // Ensure minimum and maximum bounds are respected
    newBottomOffset = Math.max(bottomLimit, Math.min(newBottomOffset, screenHeight - topLimit - buttonSize));
    
    setVerticalPosition(newBottomOffset);
    
    // Reset motion values smoothly
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    // Only trigger onClick if we weren't dragging
    if (!isDragging) {
      onClick();
    }
  };
  
  return (
    <>
      {/* Invisible drag constraints - restrict to right side vertical movement only */}
      <div 
        ref={constraintsRef} 
        className="fixed pointer-events-none"
        style={{
          top: isMobile ? 80 : 64, // Account for mobile vs desktop header
          right: 0,
          width: 120, // Slightly wider for better drag area
          bottom: isMobile ? 96 : 16 // Account for mobile nav
        }}
      />
      
      <motion.div 
        className="fixed z-40 right-2"
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
        drag="y"
        dragConstraints={constraintsRef}
        dragElastic={{
          top: 0.2,
          bottom: 0.2
        }}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 300,
          bounceDamping: 40
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{
          scale: 1.1,
          zIndex: 50
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
        style={{
          // Add padding to prevent clipping of glow effects
          padding: '16px',
          margin: '-16px',
          x,
          y,
          bottom: `${verticalPosition}px`
        }}
      >
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-4 rounded-full pointer-events-none"
        animate={{
          boxShadow: isHovering 
            ? '0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)' 
            : '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      />

      <Button 
        onClick={handleClick}
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
          className="absolute inset-0 rounded-full bg-purple-400 pointer-events-none"
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
          className="absolute inset-0 rounded-full bg-indigo-400 pointer-events-none"
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
    </>
  );
};

export default FinnyButton;
