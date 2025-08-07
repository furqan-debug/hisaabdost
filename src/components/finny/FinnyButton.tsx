import React, 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/auth';

interface FinnyButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

// Define the safe area boundaries for the button
const HEADER_HEIGHT = 64; // Height of your top header
const NAV_HEIGHT = 80;    // Height of your bottom navigation bar
const SAFE_MARGIN = 16;   // A small gap from the edges

const FinnyButton = ({ onClick, isOpen }: FinnyButtonProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // We will now control the Y position directly with a motion value
  const y = useMotionValue(window.innerHeight - NAV_HEIGHT - 40); // Initial position "peeking out"

  // Don't show the button when chat is open or user is not authenticated
  if (isOpen || !user) return null;

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate the new Y position based on the drag
    const newY = y.get() + info.delta.y;

    // Define the top and bottom limits for the button's center
    const topLimit = HEADER_HEIGHT + SAFE_MARGIN;
    const bottomLimit = window.innerHeight - NAV_HEIGHT - SAFE_MARGIN;
    
    // Clamp the new Y position to stay within the safe boundaries
    const clampedY = Math.max(topLimit, Math.min(newY, bottomLimit));
    
    // Update the button's position. This prevents it from ever going off-screen.
    y.set(clampedY);
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // This is the fix for "Tap vs. Drag".
    // If the button was dragged only a tiny amount, consider it a tap.
    const dragDistance = Math.abs(info.offset.x) + Math.abs(info.offset.y);
    if (dragDistance < 5) {
      onClick();
    }
    // No need to do anything else, the button is already in its final position.
  };

  return (
    <motion.div 
      className="fixed z-50 right-4" // Always on the right side
      style={{ y }} // Control position directly with the y motion value
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        aria-label="Open Finny AI Assistant" 
        className="w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
      >
        <Bot className="w-8 h-8 text-white" />
        
        {/* Status Indicator Dot */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-background" />
      </Button>
    </motion.div>
  );
};

export default FinnyButton;