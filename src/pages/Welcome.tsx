import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, PieChart, Sparkles } from "lucide-react";
import { useFirstTimeVisit } from "@/hooks/useFirstTimeVisit";

export default function Welcome() {
  const navigate = useNavigate();
  const { markVisitComplete } = useFirstTimeVisit();

  const handleGetStarted = () => {
    markVisitComplete();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#F2FCE2] via-[#E5DEFF] to-[#D3E4FD] overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-32 h-32 rounded-full bg-success/10"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-16 h-16 rounded-full bg-[#9b87f5]/10"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="max-w-2xl w-full text-center space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and Icons */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wallet className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <PieChart className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#6E59A5] mb-2 flex items-center justify-center gap-2">
            Hisaab Dost
            <Sparkles className="w-8 h-8 text-[#9b87f5]" />
          </h1>
          <p className="text-xl text-[#7E69AB] font-medium">
            Master your home budget with ease
          </p>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-3xl" />
          <div className="relative px-8 py-10 rounded-3xl border border-white/50 shadow-xl">
            <div className="text-6xl text-primary/30 mb-2">"</div>
            <p className="text-2xl md:text-3xl font-semibold text-[#6E59A5] leading-relaxed mb-4">
              Every rupee saved is a step towards your dreams
            </p>
            <p className="text-lg text-[#7E69AB] font-medium">
              Take control of your money, take control of your life
            </p>
            <div className="text-6xl text-primary/30 text-right -mt-6">"</div>
          </div>
        </motion.div>

        {/* Features highlight */}
        <motion.div
          className="grid grid-cols-3 gap-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-[#6E59A5]">Track Expenses</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm font-medium text-[#6E59A5]">Build Wealth</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#9b87f5]/20 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-[#9b87f5]" />
            </div>
            <p className="text-sm font-medium text-[#6E59A5]">Achieve Goals</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="text-lg px-12 py-6 h-auto rounded-full shadow-2xl bg-gradient-to-r from-primary to-[#9b87f5] hover:from-primary/90 hover:to-[#9b87f5]/90 transform hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Button>
        </motion.div>

        <motion.p
          className="text-sm text-[#7E69AB]/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Your journey to financial wellness starts here
        </motion.p>
      </motion.div>
    </div>
  );
}
