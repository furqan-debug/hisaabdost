
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 10000); // Extended to 10 seconds
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      background: [
        "linear-gradient(to br, #F2FCE2, #E5DEFF)",
        "linear-gradient(to br, #E5DEFF, #F2FCE2)",
        "linear-gradient(to br, #F2FCE2, #E5DEFF)"
      ],
      transition: { 
        duration: 10,
        background: {
          repeat: Infinity,
          duration: 8,
          ease: "linear"
        }
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, delay: 9.5 }
    }
  };

  const logoVariants = {
    initial: { 
      scale: 0.8,
      rotate: -10,
      opacity: 0
    },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: { 
        duration: 1,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 1.2,
      }
    }
  };

  const letterVariants = {
    initial: { 
      y: 100,
      opacity: 0,
      scale: 0.5
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.8
      }
    }
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 2.5,
        duration: 0.8,
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
        className="fixed inset-0 flex flex-col items-center justify-center"
      >
        <div className="relative mb-12">
          <motion.div 
            className="absolute inset-0 bg-purple-400/20 rounded-full blur-3xl -z-10"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.img
            variants={logoVariants}
            src="/lovable-uploads/6ae88669-fd86-4d19-b0fc-0f136c7013c4.png"
            alt="Hisaab Dost Logo"
            className="w-32 h-32 relative z-10"
          />
        </div>

        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-6"
        >
          {title.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-5xl font-bold text-[#6E59A5] inline-block"
              style={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                filter: 'drop-shadow(0 2px 4px rgba(110, 89, 165, 0.2))'
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          variants={taglineVariants}
          initial="initial"
          animate="animate"
          className="text-xl text-[#7E69AB] tracking-wide font-medium"
          style={{ 
            textShadow: '0 1px 2px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #7E69AB 0%, #9B87F5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Master your home budget with ease
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
