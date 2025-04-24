
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
      scale: 0,
      rotate: -180
    },
    animate: {
      scale: 1,
      rotate: 0,
      transition: { 
        duration: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const textContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
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

  const glowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity
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
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FDE1D3] to-[#FFE8DC]"
      >
        <motion.div className="relative mb-8">
          <motion.div
            variants={glowVariants}
            animate="animate"
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
          <motion.img
            variants={logoVariants}
            src="/lovable-uploads/3f10c252-66a8-4cb7-aa08-8898805429dc.png"
            alt="Hisaab Dost Logo"
            className="w-24 h-24 relative z-10"
          />
        </motion.div>

        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-4 overflow-hidden"
        >
          {title.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-4xl font-bold text-[#6E59A5] inline-block"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          variants={taglineVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <motion.p 
            className="text-lg text-[#7E69AB] tracking-wide font-medium"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Master your home budget with ease
          </motion.p>
          <motion.div 
            className="absolute -inset-1 bg-primary/5 blur-sm rounded-lg -z-10"
            animate={{
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

