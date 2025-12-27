import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HelpCircle, MessageSquare, Reply, Heart, Repeat2, Users, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreBreakdownProps {
  stats: {
    casts: number;
    replies: number;
    recasts: number;
    likes: number;
    followers: number;
    engagement: number;
  };
  totalScore: number;
}

// Score calculation weights (matching the backend calculation)
const SCORE_WEIGHTS = {
  casts: { multiplier: 2, max: 200, label: "Casts", icon: MessageSquare },
  replies: { multiplier: 1.5, max: 150, label: "Replies", icon: Reply },
  likes: { multiplier: 0.5, max: 100, label: "Likes Received", icon: Heart },
  recasts: { multiplier: 1, max: 100, label: "Recasts", icon: Repeat2 },
  followers: { multiplier: 0.1, max: 300, label: "Followers", icon: Users },
  engagement: { multiplier: 10, max: 150, label: "Engagement Rate", icon: TrendingUp },
};

export const ScoreBreakdownTooltip = ({ stats, totalScore }: ScoreBreakdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate individual score contributions
  const breakdown = [
    {
      label: "Casts",
      icon: MessageSquare,
      value: stats.casts,
      points: Math.min(SCORE_WEIGHTS.casts.max, Math.floor(stats.casts * SCORE_WEIGHTS.casts.multiplier)),
      max: SCORE_WEIGHTS.casts.max,
      color: "hsl(263 70% 58%)",
      formula: `${stats.casts} × ${SCORE_WEIGHTS.casts.multiplier}`,
    },
    {
      label: "Replies",
      icon: Reply,
      value: stats.replies,
      points: Math.min(SCORE_WEIGHTS.replies.max, Math.floor(stats.replies * SCORE_WEIGHTS.replies.multiplier)),
      max: SCORE_WEIGHTS.replies.max,
      color: "hsl(200 100% 60%)",
      formula: `${stats.replies} × ${SCORE_WEIGHTS.replies.multiplier}`,
    },
    {
      label: "Likes",
      icon: Heart,
      value: stats.likes,
      points: Math.min(SCORE_WEIGHTS.likes.max, Math.floor(stats.likes * SCORE_WEIGHTS.likes.multiplier)),
      max: SCORE_WEIGHTS.likes.max,
      color: "hsl(350 80% 60%)",
      formula: `${stats.likes} × ${SCORE_WEIGHTS.likes.multiplier}`,
    },
    {
      label: "Recasts",
      icon: Repeat2,
      value: stats.recasts,
      points: Math.min(SCORE_WEIGHTS.recasts.max, Math.floor(stats.recasts * SCORE_WEIGHTS.recasts.multiplier)),
      max: SCORE_WEIGHTS.recasts.max,
      color: "hsl(140 70% 50%)",
      formula: `${stats.recasts} × ${SCORE_WEIGHTS.recasts.multiplier}`,
    },
    {
      label: "Followers",
      icon: Users,
      value: stats.followers,
      points: Math.min(SCORE_WEIGHTS.followers.max, Math.floor(stats.followers * SCORE_WEIGHTS.followers.multiplier)),
      max: SCORE_WEIGHTS.followers.max,
      color: "hsl(45 100% 55%)",
      formula: `${stats.followers} × ${SCORE_WEIGHTS.followers.multiplier}`,
    },
    {
      label: "Engagement",
      icon: TrendingUp,
      value: stats.engagement,
      points: Math.min(SCORE_WEIGHTS.engagement.max, Math.floor(stats.engagement * SCORE_WEIGHTS.engagement.multiplier)),
      max: SCORE_WEIGHTS.engagement.max,
      color: "hsl(280 80% 65%)",
      formula: `${stats.engagement}% × ${SCORE_WEIGHTS.engagement.multiplier}`,
    },
  ];

  const calculatedTotal = breakdown.reduce((sum, item) => sum + item.points, 0);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Score breakdown"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-bold text-sm">Score Breakdown</h4>
                  <span className="font-display font-black text-lg text-primary">{totalScore}</span>
                </div>

                <div className="space-y-3">
                  {breakdown.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}20` }}
                          >
                            <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">{item.formula}</span>
                          <span 
                            className="font-display font-bold text-sm"
                            style={{ color: item.color }}
                          >
                            +{item.points}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.points / item.max) * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground/60">0</span>
                        <span className="text-[10px] text-muted-foreground/60">max {item.max}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Calculated Total</span>
                    <span className="font-display font-black text-lg">{calculatedTotal}</span>
                  </div>
                  {calculatedTotal !== totalScore && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      * Server-side calculation may include additional factors
                    </p>
                  )}
                </div>

                {/* Tips */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <p className="text-[11px] text-primary">
                    💡 Tip: Reply to more casts to boost your score faster!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScoreBreakdownTooltip;
