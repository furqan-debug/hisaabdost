"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Apply no-scroll class to body when splash screen is active
    document.body.classList.add('no-scroll');
    
    // Show content after a brief delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    // Complete splash screen after timeout
    const completeTimer = setTimeout(() => {
      // Remove no-scroll class when splash screen completes
      document.body.classList.remove('no-scroll');
      onComplete();
    }, 2500); // Reduced to 2.5 seconds for app loading

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(completeTimer);
      document.body.classList.remove('no-scroll');
    };
  }, [onComplete]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.4 } }
  };

  const backgroundVariants = {
    animate: {
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        times: [0, 0.5, 1],
        repeat: Infinity,
        ease: "easeInOut"
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
    initial: { y: 30, opacity: 0 },
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
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
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
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden z-50"
        style={{ position: 'fixed', height: '100vh', width: '100vw' }}
      >
        {/* Animated pastel background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]"
          variants={backgroundVariants}
          animate="animate"
        />

        {/* Logo with pulse effect */}
        {showContent && (
          <div className="relative mb-8 z-10">
            <motion.div
              className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl -z-10"
              variants={pulseVariants}
              initial="initial"
              animate="animate"
            />
            <motion.img
              variants={logoVariants}
              initial="initial"
              animate="animate"
              src="/lovable-uploads/c7ab51e7-0804-495b-a69f-879166069459.png"
              alt="Hisaab Dost Logo"
              className="w-24 h-24 relative z-10"
            />
          </div>
        )}

        {/* App Title */}
        {showContent && (
          <motion.div
            variants={textContainerVariants}
            initial="initial"
            animate="animate"
            className="flex justify-center mb-3 z-10"
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
        )}

        {/* Tagline */}
        {showContent && (
          <motion.p
            variants={taglineVariants}
            initial="initial"
            animate="animate"
            className="text-base font-medium tracking-wide text-[#7E69AB] z-10"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Master your home budget with ease
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
