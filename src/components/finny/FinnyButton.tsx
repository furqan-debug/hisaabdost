
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
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
  const [isReady, setIsReady] = useState(false);
  const { user, loading } = useAuth();
  
  // Single motion value for Y position
  const y = useMotionValue(0);

  // Wait for auth to complete and set initial position
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Calculate safe initial position
        const screenHeight = window.innerHeight;
        const headerHeight = 64;
        const navHeight = isMobile ? 80 : 0;
        const safeMargin = 16;
        const initialBottomDistance = navHeight + safeMargin + 84; // 100px from bottom as shown in images
        const initialYPosition = screenHeight - initialBottomDistance;
        
        y.set(initialYPosition);
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    }
  }, [user, loading, isMobile, y]);

  // Don't render until auth is complete and user is authenticated
  if (loading || !user || !isReady || isOpen) {
    return null;
  }

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
    
    const screenHeight = window.innerHeight;
    const headerHeight = 64;
    const navHeight = isMobile ? 80 : 0;
    const buttonSize = 64;
    const safeMargin = 16;
    
    // Calculate safe boundaries
    const topLimit = headerHeight + safeMargin; // ~80px from top as shown in images
    const bottomLimit = screenHeight - navHeight - safeMargin - buttonSize; // ~96px from bottom as shown in images
    
    // Get current position and apply offset
    const currentY = y.get();
    const newY = currentY + info.delta.y;
    
    // Clamp position to safe boundaries
    const clampedY = Math.max(topLimit, Math.min(newY, bottomLimit));
    
    // Update position
    y.set(clampedY);
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    // Check if this was a tap (small movement) vs drag
    const totalMovement = Math.abs(info.offset.y);
    const isClick = totalMovement < 5;
    
    if (isClick) {
      onClick();
    }
  };

  return (
    <motion.div 
      className="fixed z-40 right-2"
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
        stiffness: 300,
        damping: 25,
        delay: 0.2
      }}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      whileTap={{
        scale: 0.9
      }}
      whileHover={{
        scale: 1.05
      }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      style={{
        y,
        padding: '16px',
        margin: '-16px'
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
        onClick={() => {}} // Handled by pan logic
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
          before:opacity-0 hover:before:opacity-100 before:before:transition-opacity before:duration-300
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
  );
};

export default FinnyButton;
