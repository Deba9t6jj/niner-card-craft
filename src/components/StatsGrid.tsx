import { motion } from "framer-motion";
import { MessageSquare, Users, Repeat2, Heart, TrendingUp, Zap } from "lucide-react";

interface StatsGridProps {
  stats: {
    casts: number;
    replies: number;
    recasts: number;
    likes: number;
    followers: number;
    engagement: number;
  };
}

const statItems = [
  { key: "casts", label: "Casts", icon: MessageSquare, color: "text-farcaster" },
  { key: "replies", label: "Replies", icon: MessageSquare, color: "text-accent" },
  { key: "recasts", label: "Recasts", icon: Repeat2, color: "text-tier-gold" },
  { key: "likes", label: "Likes", icon: Heart, color: "text-destructive" },
  { key: "followers", label: "Followers", icon: Users, color: "text-tier-silver" },
  { key: "engagement", label: "Engage Rate", icon: TrendingUp, color: "text-tier-diamond", suffix: "%" },
];

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof typeof stats];
        
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {item.suffix || ''}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
