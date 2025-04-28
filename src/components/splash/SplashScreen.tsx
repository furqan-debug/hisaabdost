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
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, delay: 2.5 } }
  };

  const backgroundVariants = {
    animate: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, rotate: -10 },
    animate: {
      scale: [0.8, 1.2, 1],
      rotate: 0,
      transition: {
        duration: 1,
        type: "spring",
        stiffness: 200,
        damping: 18
      }
    }
  };

  const textContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 1
      }
    }
  };

  const letterVariants = {
    initial: { y: 80, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
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
        delay: 2,
        duration: 0.6,
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
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]"
          variants={backgroundVariants}
          animate="animate"
        />

        {/* Logo */}
        <motion.div className="relative mb-8 z-10">
          <motion.img
            variants={logoVariants}
            src="/lovable-uploads/6ae88669-fd86-4d19-b0fc-0f136c7013c4.png"
            alt="Hisaab Dost Logo"
            className="w-24 h-24"
          />
          <motion.div
            className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl -z-10"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-2 z-10"
        >
          {title.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-5xl font-bold text-[#6E59A5] inline-block"
              style={{ textShadow: '0 3px 6px rgba(0,0,0,0.2)' }}
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
          className="text-lg text-[#7E69AB] tracking-wide font-medium z-10"
        >
          Master your home budget with ease
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
