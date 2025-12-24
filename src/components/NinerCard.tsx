import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TierType = "bronze" | "silver" | "gold" | "diamond";

interface NinerCardProps {
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  tier: TierType;
  stats: {
    casts: number;
    followers: number;
    engagement: number;
  };
  className?: string;
}

const tierConfig = {
  bronze: {
    gradient: "card-bronze",
    glow: "glow-bronze",
    label: "BRONZE",
    borderColor: "border-tier-bronze/50",
    scoreRange: "0-250",
  },
  silver: {
    gradient: "card-silver",
    glow: "glow-silver",
    label: "SILVER",
    borderColor: "border-tier-silver/50",
    scoreRange: "251-500",
  },
  gold: {
    gradient: "card-gold",
    glow: "glow-gold",
    label: "GOLD",
    borderColor: "border-tier-gold/50",
    scoreRange: "501-800",
  },
  diamond: {
    gradient: "card-diamond",
    glow: "glow-diamond",
    label: "DIAMOND",
    borderColor: "border-tier-diamond/50",
    scoreRange: "801+",
  },
};

export const NinerCard = ({
  username,
  displayName,
  avatar,
  score,
  tier,
  stats,
  className,
}: NinerCardProps) => {
  const config = tierConfig[tier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative w-80 aspect-[3/4] rounded-2xl overflow-hidden",
        config.glow,
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {/* Card background */}
      <div className={cn("absolute inset-0", config.gradient, "holographic")} />

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header with tier badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-background/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-display font-bold">N9</span>
            </div>
            <span className="text-xs font-medium opacity-80">NINER SCORE</span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-display font-bold",
            "bg-background/30 backdrop-blur-sm border",
            config.borderColor
          )}>
            {config.label}
          </div>
        </div>

        {/* Avatar section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className={cn(
              "w-28 h-28 rounded-full overflow-hidden border-4",
              config.borderColor,
              "shadow-2xl"
            )}>
              <img
                src={avatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Score badge overlay */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={cn(
                "absolute -bottom-2 -right-2 w-14 h-14 rounded-full",
                "bg-background/90 backdrop-blur-sm",
                "flex items-center justify-center",
                "border-2",
                config.borderColor,
                config.glow
              )}
            >
              <span className="font-display font-black text-lg">{score}</span>
            </motion.div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <h3 className="font-display font-bold text-xl text-foreground">
              {displayName}
            </h3>
            <p className="text-sm opacity-70">@{username}</p>
          </motion.div>
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2 mt-4"
        >
          <div className="bg-background/20 backdrop-blur-sm rounded-lg p-2 text-center">
            <span className="block font-display font-bold text-lg">
              {stats.casts.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase opacity-70">Casts</span>
          </div>
          <div className="bg-background/20 backdrop-blur-sm rounded-lg p-2 text-center">
            <span className="block font-display font-bold text-lg">
              {stats.followers.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase opacity-70">Followers</span>
          </div>
          <div className="bg-background/20 backdrop-blur-sm rounded-lg p-2 text-center">
            <span className="block font-display font-bold text-lg">
              {stats.engagement}%
            </span>
            <span className="text-[10px] uppercase opacity-70">Engage</span>
          </div>
        </motion.div>

        {/* Card number / edition */}
        <div className="mt-4 flex items-center justify-between text-[10px] opacity-50">
          <span>FARCASTER IDENTITY</span>
          <span>#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Holographic overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default NinerCard;
