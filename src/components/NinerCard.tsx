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
    accentColor: "hsl(30 60% 50%)",
    glowColor: "hsl(30 60% 50% / 0.3)",
    label: "BRONZE",
  },
  silver: {
    accentColor: "hsl(220 15% 70%)",
    glowColor: "hsl(220 15% 70% / 0.3)",
    label: "SILVER",
  },
  gold: {
    accentColor: "hsl(45 100% 55%)",
    glowColor: "hsl(45 100% 55% / 0.3)",
    label: "GOLD",
  },
  diamond: {
    accentColor: "hsl(200 100% 70%)",
    glowColor: "hsl(200 100% 70% / 0.3)",
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
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative w-80 aspect-[3/4] rounded-3xl overflow-hidden",
        className
      )}
      style={{ 
        perspective: "1000px",
        boxShadow: `0 0 60px ${config.glowColor}, 0 0 120px ${config.glowColor}`,
      }}
    >
      {/* Glass card background */}
      <div 
        className="absolute inset-0 bg-card/80 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, 
            hsl(var(--card) / 0.9) 0%, 
            hsl(var(--card) / 0.7) 50%, 
            hsl(var(--card) / 0.8) 100%)`,
        }}
      />
      
      {/* Subtle border glow */}
      <div 
        className="absolute inset-0 rounded-3xl"
        style={{
          border: `1px solid hsl(var(--border) / 0.3)`,
          boxShadow: `inset 0 1px 0 0 hsl(var(--foreground) / 0.05)`,
        }}
      />

      {/* Dotted grid pattern at top */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Tier indicator line */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i === 0 ? "w-6" : "w-4",
              i <= ["bronze", "silver", "gold", "diamond"].indexOf(tier)
                ? "opacity-100"
                : "opacity-30"
            )}
            style={{
              backgroundColor: i <= ["bronze", "silver", "gold", "diamond"].indexOf(tier)
                ? config.accentColor
                : 'hsl(var(--muted-foreground))',
            }}
          />
        ))}
      </div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col p-6 pt-14">
        {/* Avatar section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Avatar with glass container */}
            <div 
              className="w-24 h-24 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)',
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 0 hsl(var(--foreground) / 0.1)`,
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-3xl font-bold">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
            
            {/* Score badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}88)`,
                boxShadow: `0 4px 20px ${config.glowColor}`,
              }}
            >
              <span className="font-display font-black text-sm text-background">{score}</span>
            </motion.div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <h3 className="font-display font-bold text-xl text-foreground">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">@{username}</p>
          </motion.div>

          {/* Tier badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-4 px-4 py-1.5 rounded-full"
            style={{
              background: `${config.accentColor}20`,
              border: `1px solid ${config.accentColor}40`,
            }}
          >
            <span 
              className="text-xs font-display font-bold"
              style={{ color: config.accentColor }}
            >
              {config.label} TIER
            </span>
          </motion.div>
        </div>

        {/* Stats footer - styled like option rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2 mt-4"
        >
          {[
            { label: "Casts", value: stats.casts.toLocaleString(), icon: "📝" },
            { label: "Followers", value: stats.followers.toLocaleString(), icon: "👥" },
            { label: "Engagement", value: `${stats.engagement}%`, icon: "⚡" },
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-foreground/5"
              style={{
                background: `linear-gradient(90deg, ${config.accentColor}10 0%, transparent 100%)`,
                borderLeft: `3px solid ${config.accentColor}`,
              }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{
                  background: `${config.accentColor}20`,
                }}
              >
                {stat.icon}
              </div>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground uppercase">{stat.label}</span>
              </div>
              <span className="font-display font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Card footer */}
        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>FARCASTER IDENTITY</span>
          <span>#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Light reflection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--foreground) / 0.03) 0%, transparent 50%, transparent 100%)',
        }}
      />
    </motion.div>
  );
};

export default NinerCard;
