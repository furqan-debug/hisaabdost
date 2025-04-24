
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const controls = useAnimation();

  useEffect(() => {
    (async () => {
      // Fade container in
      await controls.start({ opacity: 1, transition: { duration: 0.5 } });

      // Scale logo up from 0 → 1
      await controls.start({
        scale: [0, 1.2, 1],
        transition: { duration: 1, times: [0, 0.6, 1], type: "spring", stiffness: 200 },
      });

      // Bounce logo once
      await controls.start({
        y: [0, -20, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      });

      // Reveal text
      controls.start("showText");

      // Hold for a moment
      await new Promise((r) => setTimeout(r, 1400));

      // Fade everything out
      await controls.start({ opacity: 0, transition: { duration: 0.5 } });

      // Done! Let App know to switch screens
      onComplete();
    })();
  }, [controls, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={controls}
      className="fixed inset-0 bg-[#FDE1D3] flex flex-col items-center justify-center z-50"
    >
      <motion.div 
        className="w-[120px] h-[120px] mb-5 relative"
        animate={controls}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M26.6667 20H53.3333C56.6667 20 60 23.3333 60 26.6667V53.3333C60 56.6667 56.6667 60 53.3333 60H26.6667C23.3333 60 20 56.6667 20 53.3333V26.6667C20 23.3333 23.3333 20 26.6667 20Z"
            stroke="#6E59A5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d="M60 33.3333H53.3333C51.6667 33.3333 50 35 50 36.6667V43.3333C50 45 51.6667 46.6667 53.3333 46.6667H60"
            stroke="#6E59A5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 20 },
          showText: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        className="text-4xl font-bold mb-2 text-[#6E59A5]"
      >
        Hisaab Dost
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0 },
          showText: { opacity: 1 },
        }}
        initial="hidden"
        animate={controls}
        className="text-lg text-[#7E69AB]"
      >
        Master your home budget with ease
      </motion.p>
    </motion.div>
  );
};

