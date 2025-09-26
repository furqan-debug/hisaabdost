import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const steps = [
    "Initializing your financial journey...",
    "Loading your personalized dashboard...", 
    "Setting up intelligent insights...",
    "Welcome to Hisaab Dost!"
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
          }, 1500);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(stepInterval);
  }, [onComplete, steps.length]);

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(220 100% 60%), hsl(260 100% 70%), hsl(300 100% 80%))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 70%, transparent 100%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 70%, transparent 100%)',
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center px-8">
            {/* Logo Animation */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.6, -0.05, 0.01, 0.99],
                delay: 0.2
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 w-24 h-24 mx-auto"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.3)',
                      '0 0 40px rgba(255,255,255,0.6)',
                      '0 0 20px rgba(255,255,255,0.3)'
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ borderRadius: '50%' }}
                />
                
                {/* Main logo */}
                <div className="relative w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <PiggyBank className="h-12 w-12 text-white" />
                  
                  {/* Sparkle effects */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Hisaab Dost
            </motion.h1>
            
            <motion.p
              className="text-xl text-white/80 mb-12 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              Your Smart Financial Companion
            </motion.p>

            {/* Progress Section */}
            <div className="w-full max-w-sm mx-auto">
              {/* Progress Bar */}
              <motion.div
                className="h-1 bg-white/20 rounded-full mb-6 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-white to-yellow-200 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </motion.div>

              {/* Status Text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStep}
                  className="text-white/90 text-sm font-medium h-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {steps[currentStep]}
                </motion.p>
              </AnimatePresence>

              {/* Loading Dots */}
              <motion.div
                className="flex justify-center space-x-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-2 h-2 bg-white/60 rounded-full"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: dot * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Bottom Decoration */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="text-white/60 text-xs"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Powered by Intelligence
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;