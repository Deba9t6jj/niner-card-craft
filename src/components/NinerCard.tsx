import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageSquare, Users } from "lucide-react";

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
    accentColor: "#CD7F32",
    glowColor: "rgba(205, 127, 50, 0.4)",
    gradientStart: "rgba(205, 127, 50, 0.15)",
    label: "BRONZE",
  },
  silver: {
    accentColor: "#C0C0C0",
    glowColor: "rgba(192, 192, 192, 0.4)",
    gradientStart: "rgba(192, 192, 192, 0.15)",
    label: "SILVER",
  },
  gold: {
    accentColor: "#FFD700",
    glowColor: "rgba(255, 215, 0, 0.5)",
    gradientStart: "rgba(255, 215, 0, 0.2)",
    label: "GOLD",
  },
  diamond: {
    accentColor: "#00BFFF",
    glowColor: "rgba(0, 191, 255, 0.5)",
    gradientStart: "rgba(0, 191, 255, 0.2)",
    label: "DIAMOND",
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
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative w-[320px] rounded-[28px] overflow-hidden",
        className
      )}
      style={{ 
        perspective: "1000px",
      }}
    >
      {/* Outer glow border */}
      <div 
        className="absolute -inset-[1px] rounded-[28px]"
        style={{
          background: `linear-gradient(135deg, ${config.accentColor}60 0%, transparent 50%, ${config.accentColor}30 100%)`,
          boxShadow: `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
        }}
      />
      
      {/* Main card container */}
      <div 
        className="relative rounded-[27px] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, 
            rgba(20, 20, 30, 0.95) 0%, 
            rgba(15, 15, 22, 0.98) 100%)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Inner border gradient */}
        <div 
          className="absolute inset-0 rounded-[27px] pointer-events-none"
          style={{
            border: '1px solid',
            borderImage: `linear-gradient(180deg, ${config.accentColor}40 0%, transparent 50%, ${config.accentColor}20 100%) 1`,
          }}
        />

        {/* Top glow effect */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px]"
          style={{
            background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* Dotted grid pattern */}
        <div className="absolute top-0 left-0 right-0 h-28">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, ${config.accentColor}30 1.5px, transparent 1.5px)`,
              backgroundSize: '16px 16px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Tier indicator bars */}
        <div className="relative z-10 pt-5 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => {
            const tierIndex = ["bronze", "silver", "gold", "diamond"].indexOf(tier);
            const isActive = i <= tierIndex;
            return (
              <motion.div 
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="h-[3px] rounded-full origin-left"
                style={{
                  width: i === 0 ? '28px' : '20px',
                  backgroundColor: isActive ? config.accentColor : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? `0 0 8px ${config.accentColor}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Card content */}
        <div className="relative z-10 px-6 pt-6 pb-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative"
            >
              {/* Avatar glow */}
              <div 
                className="absolute -inset-2 rounded-2xl blur-xl opacity-60"
                style={{ backgroundColor: config.accentColor }}
              />
              
              {/* Avatar container */}
              <div 
                className="relative w-28 h-28 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${config.accentColor} 0%, ${config.accentColor}80 100%)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 2px ${config.accentColor}50`,
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <span className="text-4xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              {/* Score badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${config.accentColor} 0%, ${config.accentColor}CC 100%)`,
                  boxShadow: `0 4px 15px ${config.glowColor}`,
                }}
              >
                <span className="font-display font-black text-sm text-black">{score}</span>
              </motion.div>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5 text-center"
            >
              <h3 className="font-display font-bold text-xl text-white">
                {displayName}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">@{username}</p>
            </motion.div>

            {/* Tier badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <span 
                className="inline-block px-5 py-1.5 rounded-full font-display font-bold text-xs tracking-wider"
                style={{
                  color: config.accentColor,
                  textShadow: `0 0 10px ${config.accentColor}`,
                }}
              >
                {config.label} TIER
              </span>
            </motion.div>
          </div>

          {/* Stats rows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-2"
          >
            {[
              { label: "CASTS", value: stats.casts, icon: MessageSquare },
              { label: "FOLLOWERS", value: stats.followers, icon: Users },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden group"
                style={{
                  background: `linear-gradient(90deg, ${config.gradientStart} 0%, transparent 100%)`,
                }}
              >
                {/* Left accent bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                  style={{ 
                    backgroundColor: config.accentColor,
                    boxShadow: `0 0 10px ${config.accentColor}`,
                  }}
                />
                
                {/* Icon */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.accentColor}20` }}
                >
                  <stat.icon 
                    className="w-4 h-4" 
                    style={{ color: config.accentColor }}
                  />
                </div>
                
                {/* Label */}
                <span className="flex-1 text-xs text-gray-400 font-medium tracking-wide">
                  {stat.label}
                </span>
                
                {/* Value */}
                <span className="font-display font-bold text-lg text-white">
                  {stat.value.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(10,10,15,0.8) 0%, transparent 100%)`,
          }}
        />

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <motion.div
            animate={{ 
              translateX: ["-100%", "200%"]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 55%, transparent 60%)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NinerCard;
