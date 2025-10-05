import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  gradient: string;
}

export function FeatureCard({ icon: Icon, title, description, delay, gradient }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="relative group cursor-pointer"
    >
      {/* Ripple effect container */}
      <div className="relative overflow-hidden backdrop-blur-sm bg-card/50 border border-primary/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Icon with rotation animation */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient}`}
          >
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </motion.div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Corner accent */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity duration-300`} />
      </div>
    </motion.div>
  );
}
