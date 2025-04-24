
import { motion } from 'framer-motion';
import React from 'react';

export const WalletLogo = () => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
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
  );
};
