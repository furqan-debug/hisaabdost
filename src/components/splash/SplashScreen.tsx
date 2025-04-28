
"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const backgroundVariants = {
    animate: {
      scale: [1, 1.03, 1],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.1, 1],
      opacity: 1,
      transition: {
        duration: 1.2,
        type: "spring",
        stiffness: 200,
        damping: 18
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.5
      }
    }
  };

  const letterVariants = {
    initial: { y: 50, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 150
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
        duration: 0.7,
        ease: "easeOut"
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
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Animated pastel background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]"
          variants={backgroundVariants}
          animate="animate"
        />

        {/* Logo with pulse effect */}
        <div className="relative mb-10 z-10">
          <motion.div
            className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl -z-10"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.img
            variants={logoVariants}
            src="/lovable-uploads/c7ab51e7-0804-495b-a69f-879166069459.png"
            alt="Hisaab Dost Logo"
            className="w-28 h-28 relative z-10"
          />
        </div>

        {/* App Title */}
        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-4 z-10"
        >
          {title.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-5xl font-bold text-[#6E59A5] inline-block"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={taglineVariants}
          initial="initial"
          animate="animate"
          className="text-lg font-medium tracking-wide text-[#7E69AB] z-10"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          Master your home budget with ease
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
