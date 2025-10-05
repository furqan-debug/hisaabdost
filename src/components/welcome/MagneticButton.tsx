import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

interface MagneticButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function MagneticButton({ onClick, children }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative group overflow-hidden"
    >
      {/* Background layers */}
      <div className="relative px-8 py-4 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary shadow-2xl">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-primary/50 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Button content */}
        <div className="relative flex items-center space-x-3">
          <span className="text-lg font-bold text-primary-foreground">
            {children}
          </span>
          
          <motion.div
            animate={{
              x: isHovered ? [0, 5, 0] : 0,
            }}
            transition={{
              duration: 0.6,
              repeat: isHovered ? Infinity : 0,
            }}
          >
            <ArrowRight className="w-5 h-5 text-primary-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Pulse rings */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.5, 1.8] : 1,
          opacity: isHovered ? [0.5, 0.2, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
        }}
        className="absolute inset-0 border-2 border-primary rounded-full"
      />
    </motion.button>
  );
}
