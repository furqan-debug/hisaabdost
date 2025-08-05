
import React, { useState, useRef, useEffect } from 'react';
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
  const [isOnLeftSide, setIsOnLeftSide] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { user } = useAuth();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Motion values for dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create safe drag constraints that prevent the button from disappearing
  const [dragConstraints, setDragConstraints] = useState({ 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0 
  });

  useEffect(() => {
    const updateConstraints = () => {
      const buttonSize = 64; // 16 * 4 = 64px (w-16 h-16)
      const padding = 16; // Extra padding for glow effects
      const safeMargin = 8; // Additional safe margin
      
      const totalBuffer = buttonSize / 2 + padding + safeMargin;
      
      setDragConstraints({
        left: -window.innerWidth / 2 + totalBuffer,
        right: window.innerWidth / 2 - totalBuffer,
        top: -window.innerHeight / 2 + totalBuffer,
        bottom: window.innerHeight / 2 - totalBuffer
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Don't show the button when chat is open or user is not authenticated
  if (isOpen || !user) return null;

  const handleDragEnd = (event: any, info: PanInfo) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const centerX = screenWidth / 2;
    
    // Get current position from motion values
    const currentX = x.get();
    const currentY = y.get();
    
    // Calculate final position based on current position + drag offset
    const finalX = screenWidth / 2 + currentX;
    const finalY = screenHeight / 2 + currentY;
    
    // Determine which side to snap to
    const shouldBeOnLeft = finalX < centerX;
    setIsOnLeftSide(shouldBeOnLeft);
    
    // Calculate the Y position to maintain
    const buttonSize = 64;
    const minY = buttonSize / 2 + 8;
    const maxY = screenHeight - buttonSize / 2 - 8;
    const clampedY = Math.max(minY, Math.min(maxY, finalY));
    
    // Set the new position
    setPosition({ 
      x: 0, // Will be handled by CSS positioning 
      y: clampedY - screenHeight / 2 // Relative to center
    });
    
    // Reset motion values and set final Y position
    x.set(0);
    y.set(clampedY - screenHeight / 2);
  };
  
  return (
    <>
      {/* Drag constraints container positioned at screen center */}
      <div 
        ref={constraintsRef} 
        className="fixed left-1/2 top-1/2 pointer-events-none w-0 h-0" 
      />
      
      <motion.div 
        className={`fixed z-40 left-1/2 top-1/2`}
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
        drag
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragMomentum={false}
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
          // Position based on side and Y offset
          marginLeft: isOnLeftSide 
            ? `${-window.innerWidth / 2 + 32 + 8}px` 
            : `${window.innerWidth / 2 - 32 - 8}px`,
          marginTop: `${position.y}px`,
          // Add padding to prevent clipping of glow effects
          padding: '16px',
          margin: '-16px',
          x,
          y,
          // Ensure the button stays within bounds during drag
          overflow: 'visible'
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
