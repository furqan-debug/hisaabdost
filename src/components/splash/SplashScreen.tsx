
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, Smile } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  // Auto-dismiss after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // Set to match our animation duration plus a small buffer
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  // Container animation - appears and disappears
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4, delay: 3 }
    }
  };

  // Wallet logo animation
  const walletVariants = {
    initial: { 
      scale: 0.8,
      rotate: -15
    },
    animate: {
      scale: 1,
      rotate: 0,
      transition: { 
        duration: 0.6, 
        delay: 0.5,
        type: "spring",
        stiffness: 200
      }
    }
  };

  // Bounce animation for logo
  const bounceVariants = {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 1.2,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  // Face elements animation
  const faceVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { 
        duration: 0.4,
        delay: 1.5,
        type: "spring",
        stiffness: 300
      }
    }
  };

  // Text appear animation
  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        delay: 2,
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Shimmer effect animation
  const shimmerVariants = {
    initial: { 
      background: "linear-gradient(45deg, transparent 0%, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%, transparent 100%)",
      backgroundSize: "200% 100%",
      backgroundPosition: "200% 0"
    },
    animate: {
      backgroundPosition: "-200% 0",
      transition: {
        duration: 1.5,
        delay: 2.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDE1D3]"
      >
        <motion.div
          variants={bounceVariants}
          className="relative mb-6"
        >
          <motion.div 
            className="text-[#6E59A5] w-20 h-20"
            variants={walletVariants}
          >
            <Wallet 
              size={80}
              strokeWidth={1.5}
              className="w-full h-full"
            />
            <motion.div
              variants={faceVariants}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Eye size={10} className="absolute left-[35%] top-[40%]" />
              <Eye size={10} className="absolute right-[35%] top-[40%]" />
              <Smile size={20} className="absolute left-[30%] top-[50%]" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={shimmerVariants}
          className="overflow-hidden"
        >
          <motion.h1
            variants={textVariants}
            className="text-4xl font-bold mb-2 text-[#6E59A5]"
          >
            Hisaab Dost
          </motion.h1>
        </motion.div>

        <motion.p
          variants={textVariants}
          className="text-lg text-[#7E69AB]"
        >
          Master your home budget with ease
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
