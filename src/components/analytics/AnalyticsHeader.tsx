
import { motion } from "framer-motion";

export function AnalyticsHeader() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }}
      className="flex flex-col gap-2"
    >
      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Analytics
      </h1>
      <p className="text-sm text-muted-foreground">
        Track your spending patterns and financial trends
      </p>
    </motion.div>
  );
}
