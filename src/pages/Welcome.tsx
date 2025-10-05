import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFirstTimeVisit } from "@/hooks/useFirstTimeVisit";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  const navigate = useNavigate();
  const { markVisitComplete } = useFirstTimeVisit();

  const handleGetStarted = () => {
    markVisitComplete();
    navigate("/auth");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-12 max-w-2xl text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl scale-110" />
            <img
              src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png"
              alt="Hisaab Dost Logo"
              className="relative w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          </motion.div>

          {/* App Name */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-foreground"
            >
              Hisaab Dost
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground font-medium"
            >
              Your Smart Money Manager
            </motion.p>
          </div>

          {/* Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-foreground/80 leading-relaxed max-w-xl"
          >
            Take control of your finances with intelligent tracking and actionable insights
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
