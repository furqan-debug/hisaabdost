
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, Smile } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
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

  const walletVariants = {
    initial: { pathLength: 0, scale: 0.9 },
    animate: {
      pathLength: 1,
      scale: 1,
      transition: { 
        pathLength: { duration: 1, delay: 0.5 },
        scale: { duration: 0.3, delay: 1.5 }
      }
    }
  };

  const bounceVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0],
      transition: {
        duration: 0.6,
        delay: 1.8,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const faceVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, delay: 1.5 }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 2.2 }
    }
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
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
          <motion.div className="text-[#6E59A5] w-20 h-20">
            <Wallet 
              size={80}
              strokeWidth={1.5}
              className="w-full h-full"
              style={{ pathLength: 0 }}
              initial="initial"
              animate="animate"
              variants={walletVariants}
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

        <motion.h1
          variants={textVariants}
          className="text-4xl font-bold mb-2 text-[#6E59A5]"
        >
          Hisaab Dost
        </motion.h1>

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
