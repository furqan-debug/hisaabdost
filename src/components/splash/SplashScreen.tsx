
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

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

  const logoVariants = {
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
          <motion.img
            src="/lovable-uploads/12aae181-1a03-4067-a879-2f29d4213837.png"
            alt="Hisaab Dost Logo"
            className="w-20 h-20"
            variants={logoVariants}
          />
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
