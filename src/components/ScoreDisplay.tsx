import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TierType } from "./NinerCard";
import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  score: number;
  tier: TierType;
  isAnimating?: boolean;
}

const tierConfig = {
  bronze: {
    color: "hsl(30 60% 50%)",
    textClass: "text-tier-bronze",
    glowClass: "glow-bronze",
  },
  silver: {
    color: "hsl(220 15% 70%)",
    textClass: "text-tier-silver",
    glowClass: "glow-silver",
  },
  gold: {
    color: "hsl(45 100% 55%)",
    textClass: "text-tier-gold",
    glowClass: "glow-gold",
  },
  diamond: {
    color: "hsl(200 100% 70%)",
    textClass: "text-tier-diamond",
    glowClass: "glow-diamond",
  },
};

export const ScoreDisplay = ({ score, tier }: ScoreDisplayProps) => {
  const config = tierConfig[tier];
  const [displayScore, setDisplayScore] = useState(0);
  
  // Animate score counting up
  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });
    return () => controls.stop();
  }, [score]);

  // Calculate progress for the ring (max 999)
  const progress = (score / 999) * 100;
  const circumference = 2 * Math.PI * 68; // radius = 68
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="text-center"
    >
      <div className="relative inline-flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          animate={{ 
            boxShadow: [
              `0 0 30px ${config.color}40`,
              `0 0 60px ${config.color}60`,
              `0 0 30px ${config.color}40`,
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
        />
        
        {/* SVG Ring */}
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <motion.circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${config.color})`,
            }}
          />
          {/* Glow effect on progress end */}
          <motion.circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke={config.color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `blur(4px)`,
              opacity: 0.5,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            className={cn(
              "block font-display font-black text-5xl",
              config.textClass
            )}
            style={{
              textShadow: `0 0 20px ${config.color}80`,
            }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Niner Score
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <motion.span 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "inline-block px-6 py-2.5 rounded-full cursor-default",
            "font-display font-bold text-sm uppercase tracking-wider",
            "border transition-all duration-300"
          )}
          style={{
            background: `${config.color}20`,
            borderColor: `${config.color}40`,
            color: config.color,
            boxShadow: `0 0 20px ${config.color}30`,
          }}
        >
          {tier} Tier
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default ScoreDisplay;
