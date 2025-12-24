import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TierType } from "./NinerCard";

interface ScoreDisplayProps {
  score: number;
  tier: TierType;
  isAnimating?: boolean;
}

const tierColors = {
  bronze: "text-tier-bronze",
  silver: "text-tier-silver",
  gold: "text-tier-gold",
  diamond: "text-tier-diamond",
};

const tierGlows = {
  bronze: "glow-bronze",
  silver: "glow-silver",
  gold: "glow-gold",
  diamond: "glow-diamond",
};

export const ScoreDisplay = ({ score, tier, isAnimating = false }: ScoreDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="text-center"
    >
      <motion.div
        animate={isAnimating ? { 
          scale: [1, 1.05, 1],
          rotate: [0, 1, -1, 0]
        } : {}}
        transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
        className={cn(
          "inline-flex items-center justify-center",
          "w-40 h-40 rounded-full",
          "bg-card border-4 border-border",
          tierGlows[tier]
        )}
      >
        <div className="text-center">
          <motion.span
            key={score}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "block font-display font-black text-5xl",
              tierColors[tier]
            )}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Niner Score
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4"
      >
        <span className={cn(
          "inline-block px-4 py-2 rounded-full",
          "font-display font-bold text-sm uppercase tracking-wider",
          "bg-card border border-border",
          tierColors[tier]
        )}>
          {tier} Tier
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ScoreDisplay;
