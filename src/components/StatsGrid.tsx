import { motion } from "framer-motion";
import { MessageSquare, Users, Repeat2, Heart, TrendingUp } from "lucide-react";
import { useState } from "react";

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
  { key: "casts", label: "Casts", icon: MessageSquare, color: "hsl(263 70% 58%)", bgColor: "hsl(263 70% 58% / 0.1)" },
  { key: "replies", label: "Replies", icon: MessageSquare, color: "hsl(280 80% 65%)", bgColor: "hsl(280 80% 65% / 0.1)" },
  { key: "recasts", label: "Recasts", icon: Repeat2, color: "hsl(45 100% 55%)", bgColor: "hsl(45 100% 55% / 0.1)" },
  { key: "likes", label: "Likes", icon: Heart, color: "hsl(0 84% 60%)", bgColor: "hsl(0 84% 60% / 0.1)" },
  { key: "followers", label: "Followers", icon: Users, color: "hsl(220 15% 70%)", bgColor: "hsl(220 15% 70% / 0.1)" },
  { key: "engagement", label: "Engage Rate", icon: TrendingUp, color: "hsl(200 100% 70%)", bgColor: "hsl(200 100% 70% / 0.1)", suffix: "%" },
];

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof typeof stats];
        const isHovered = hoveredIndex === index;
        
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-card border border-border rounded-xl p-4 cursor-default overflow-hidden transition-all duration-300"
            style={{
              borderColor: isHovered ? `${item.color}50` : undefined,
              boxShadow: isHovered ? `0 8px 32px ${item.color}20, inset 0 1px 0 0 ${item.color}10` : undefined,
            }}
          >
            {/* Hover gradient background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${item.bgColor} 0%, transparent 60%)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon 
                    className="w-4 h-4" 
                    style={{ color: item.color }}
                  />
                </motion.div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {item.label}
                </span>
              </div>
              
              <motion.span 
                className="font-display font-bold text-2xl text-foreground block"
                animate={{ 
                  color: isHovered ? item.color : undefined,
                }}
                transition={{ duration: 0.2 }}
              >
                {typeof value === 'number' ? value.toLocaleString() : value}
                {item.suffix || ''}
              </motion.span>
            </div>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
              style={{ backgroundColor: item.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
