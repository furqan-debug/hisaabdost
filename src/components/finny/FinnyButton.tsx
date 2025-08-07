
import React, { useState, useEffect, useRef } from 'react';
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
  const { user } = useAuth(); // We will only rely on the user object
  const [authChecked, setAuthChecked] = useState(false); // New state to track if the check is done
  const y = useMotionValue(0); // Start y at a neutral position
  
  useEffect(() => {
    // This hook now waits for the user object to be loaded (when it's not undefined)
    // before confirming the authentication check is complete.
    if (user !== undefined) {
      setAuthChecked(true);
    }
    // This also safely sets the button's initial "peeking" position.
    const initialY = window.innerHeight - NAV_HEIGHT + 20;
    y.set(initialY);
  }, [user, y]); // This runs whenever the user object changes
  
  // --- NEW, RELIABLE DRAGGING LOGIC ---
  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newY = y.get() + info.delta.y;
  
    const topLimit = HEADER_HEIGHT + SAFE_MARGIN;
    const bottomLimit = window.innerHeight - NAV_HEIGHT - SAFE_MARGIN;
  
    // This "clamps" the position within the boundaries, making it impossible to disappear.
    const clampedY = Math.max(topLimit, Math.min(newY, bottomLimit));
    y.set(clampedY);
  };
  
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // This handles the "Tap vs. Drag" logic.
    const dragDistance = Math.abs(info.offset.x) + Math.abs(info.offset.y);
    if (dragDistance < 5) {
      onClick();
    }
  };
  // --- END OF NEW DRAGGING LOGIC ---
  
  // This is the new, more robust check that solves the "not showing" bug.
  if (isOpen || !authChecked || !user) {
    return null;
  }
  
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
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05, y: y.get() - 2 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        style={{
          y, // Position is now controlled solely by this motion value
          padding: '16px',
          margin: '-16px',
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
