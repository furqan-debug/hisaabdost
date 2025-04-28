
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
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
      scale: 0.95,
      transition: { duration: 0.4, delay: 2.5 }
    }
  };

  const logoVariants = {
    initial: { 
      scale: 0.8,
      rotate: -10
    },
    animate: {
      scale: 1,
      rotate: 0,
      transition: { 
        duration: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const textContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.6
      }
    }
  };

  const letterVariants = {
    initial: { y: 400 },
    animate: {
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const title = "Hisaab Dost".split("");

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]"
      >
        <motion.div className="relative mb-8">
          <motion.img
            variants={logoVariants}
            src="/lovable-uploads/6ae88669-fd86-4d19-b0fc-0f136c7013c4.png"
            alt="Hisaab Dost Logo"
            className="w-24 h-24 relative z-10"
          />
          <motion.div 
            className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-4"
        >
          {title.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-4xl font-bold text-[#6E59A5] inline-block"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          variants={taglineVariants}
          initial="initial"
          animate="animate"
          className="text-lg text-[#7E69AB] tracking-wide font-medium"
        >
          Master your home budget with ease
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
