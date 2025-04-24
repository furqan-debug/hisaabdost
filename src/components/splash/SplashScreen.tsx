
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Reduced from 3500 for a snappier experience
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, delay: 2 }
    }
  };

  const logoVariants = {
    initial: { 
      scale: 0.9,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const textContainerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const textItemVariants = {
    initial: { y: 10, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
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
          variants={logoVariants}
          className="mb-8 relative"
        >
          <motion.img
            src="/lovable-uploads/3f10c252-66a8-4cb7-aa08-8898805429dc.png"
            alt="Hisaab Dost Logo"
            className="w-24 h-24"
          />
        </motion.div>

        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <motion.h1
            variants={textItemVariants}
            className="text-4xl font-bold mb-3 text-[#6E59A5] tracking-tight"
          >
            Hisaab Dost
          </motion.h1>

          <motion.p
            variants={textItemVariants}
            className="text-lg text-[#7E69AB] tracking-wide"
          >
            Master your home budget with ease
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
