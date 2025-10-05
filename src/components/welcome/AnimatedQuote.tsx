import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedQuote() {
  const quote = "Your financial journey starts with a single step. Let's make it count.";
  const words = quote.split(" ");
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => [
        ...prev.slice(-10),
        {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now(),
        },
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative max-w-2xl mx-auto"
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -50 }}
            transition={{ duration: 2 }}
          />
        ))}
      </div>

      {/* Glass card */}
      <div className="relative backdrop-blur-xl bg-card/40 border border-primary/20 rounded-3xl p-8 shadow-2xl">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-20 animate-gradient bg-[length:200%_200%]" />
        
        {/* Sparkle icon */}
        <motion.div
          className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>

        {/* Quote text with word-by-word animation */}
        <div className="relative z-10 text-xl md:text-2xl font-medium text-center text-foreground/90 leading-relaxed">
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.8 + index * 0.1,
                duration: 0.5,
              }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Gradient glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 blur-xl opacity-50 animate-pulse" />
      </div>
    </motion.div>
  );
}
