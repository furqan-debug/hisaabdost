import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFirstTimeVisit } from "@/hooks/useFirstTimeVisit";
import { FloatingElements } from "@/components/welcome/FloatingElements";
import { AnimatedQuote } from "@/components/welcome/AnimatedQuote";
import { StatsCounter } from "@/components/welcome/StatsCounter";
import { FeatureCard } from "@/components/welcome/FeatureCard";
import { MagneticButton } from "@/components/welcome/MagneticButton";
import { Wallet, TrendingUp, Target, Shield } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const { markVisitComplete } = useFirstTimeVisit();

  const handleGetStarted = () => {
    markVisitComplete();
    navigate("/auth");
  };

  const features = [
    {
      icon: Wallet,
      title: "Track Every Expense",
      description: "Monitor your spending with intelligent categorization and detailed insights",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Build Real Wealth",
      description: "Smart investment tracking and portfolio management to grow your money",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Achieve Your Goals",
      description: "Set financial targets and watch your progress with AI-powered recommendations",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is encrypted and protected with industry-leading security",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(var(--primary), 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(var(--primary), 0.1) 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
      </div>

      {/* Floating money elements */}
      <FloatingElements />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 max-w-4xl"
        >
          {/* App logo/title with staggered animation */}
          <div className="space-y-4">
            <motion.h1 className="text-6xl md:text-8xl font-black tracking-tight">
              {["Hisaab", "Dost"].map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8, type: "spring" }}
                  className="inline-block mr-6 bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                  style={{
                    textShadow: "0 0 80px rgba(var(--primary), 0.3)",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Typewriter subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-2xl md:text-3xl font-semibold text-muted-foreground"
            >
              Your Smart Money Manager
            </motion.p>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your financial future with intelligent tracking, smart insights, and personalized goals
          </motion.p>
        </motion.div>

        {/* Animated Quote Card */}
        <AnimatedQuote />

        {/* Statistics Counter */}
        <StatsCounter />

        {/* Feature Cards */}
        <div className="w-full max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Everything You Need to Succeed
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={1.8 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="flex flex-col items-center space-y-4"
        >
          <MagneticButton onClick={handleGetStarted}>
            Get Started Free
          </MagneticButton>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            className="text-sm text-muted-foreground"
          >
            No credit card required • Free forever
          </motion.p>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="text-center text-base md:text-lg font-medium text-foreground/60 max-w-2xl"
        >
          Join thousands of users who have transformed their financial lives with Hisaab Dost
        </motion.p>
      </div>
    </div>
  );
}
