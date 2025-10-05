import { motion } from "framer-motion";
import { Wallet, TrendingUp, PiggyBank, Coins, DollarSign, BadgeIndianRupee } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingElements() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingIcons = [
    { Icon: Wallet, delay: 0, x: 10, y: 15, rotate: 15 },
    { Icon: TrendingUp, delay: 0.2, x: 85, y: 20, rotate: -10 },
    { Icon: PiggyBank, delay: 0.4, x: 15, y: 75, rotate: 20 },
    { Icon: Coins, delay: 0.6, x: 80, y: 70, rotate: -15 },
    { Icon: DollarSign, delay: 0.8, x: 50, y: 85, rotate: 10 },
    { Icon: BadgeIndianRupee, delay: 1, x: 90, y: 45, rotate: -20 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map(({ Icon, delay, x, y, rotate }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
            x: mousePosition.x * (index % 2 === 0 ? 1 : -1),
            y: mousePosition.y * (index % 2 === 0 ? 1 : -1),
            rotate: [rotate, rotate + 10, rotate],
          }}
          transition={{
            opacity: {
              duration: 4,
              repeat: Infinity,
              delay: delay,
            },
            scale: {
              duration: 3,
              repeat: Infinity,
              delay: delay,
            },
            rotate: {
              duration: 5,
              repeat: Infinity,
              delay: delay,
            },
            x: {
              duration: 0.3,
            },
            y: {
              duration: 0.3,
            },
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <Icon
              className="w-16 h-16 md:w-24 md:h-24 text-primary/30"
              strokeWidth={1}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
