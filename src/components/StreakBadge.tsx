import { motion } from "framer-motion";
import { Flame, Zap, Star, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakBadgeProps {
  streakDays: number;
  lastCastDate?: string;
}

const STREAK_MILESTONES = [
  { days: 3, label: "3 Day Streak", multiplier: 1.1, icon: Flame, color: "hsl(30 100% 50%)" },
  { days: 7, label: "Week Warrior", multiplier: 1.25, icon: Zap, color: "hsl(45 100% 55%)" },
  { days: 14, label: "2 Week Legend", multiplier: 1.4, icon: Star, color: "hsl(280 80% 60%)" },
  { days: 30, label: "Monthly Master", multiplier: 1.5, icon: Crown, color: "hsl(200 100% 70%)" },
];

export const getStreakMultiplier = (streakDays: number): number => {
  let multiplier = 1;
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays >= milestone.days) {
      multiplier = milestone.multiplier;
    }
  }
  return multiplier;
};

export const getCurrentMilestone = (streakDays: number) => {
  let current = null;
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays >= milestone.days) {
      current = milestone;
    }
  }
  return current;
};

export const getNextMilestone = (streakDays: number) => {
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays < milestone.days) {
      return milestone;
    }
  }
  return null;
};

export const StreakBadge = ({ streakDays, lastCastDate }: StreakBadgeProps) => {
  if (streakDays < 1) return null;

  const currentMilestone = getCurrentMilestone(streakDays);
  const nextMilestone = getNextMilestone(streakDays);
  const multiplier = getStreakMultiplier(streakDays);

  const IconComponent = currentMilestone?.icon || Flame;
  const color = currentMilestone?.color || "hsl(30 80% 55%)";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            whileHover={{ scale: 1.1 }}
            className="relative cursor-pointer"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 10px ${color}40`,
                  `0 0 25px ${color}60`,
                  `0 0 10px ${color}40`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
            />

            {/* Badge container */}
            <motion.div
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}50`,
              }}
            >
              {/* Animated flame */}
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <IconComponent className="w-4 h-4" style={{ color }} />
              </motion.div>

              {/* Streak count */}
              <span 
                className="font-display font-bold text-sm"
                style={{ color }}
              >
                {streakDays}
              </span>
            </motion.div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-card/95 backdrop-blur-xl border-border/50 p-4 max-w-xs"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <IconComponent className="w-5 h-5" style={{ color }} />
              <span className="font-display font-bold">
                {currentMilestone?.label || `${streakDays} Day Streak`}
              </span>
            </div>

            {/* Multiplier info */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-xs text-muted-foreground">Score Multiplier</span>
              <span className="font-display font-bold text-primary">
                {multiplier.toFixed(2)}x
              </span>
            </div>

            {/* Progress to next milestone */}
            {nextMilestone && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Next: {nextMilestone.label}</span>
                  <span style={{ color: nextMilestone.color }}>
                    {nextMilestone.days - streakDays} days to go
                  </span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(streakDays / nextMilestone.days) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: nextMilestone.color }}
                  />
                </div>
              </div>
            )}

            {/* All milestones max reached */}
            {!nextMilestone && (
              <div className="text-xs text-center text-tier-diamond">
                🎉 Maximum streak bonus achieved!
              </div>
            )}

            {/* Tip */}
            <p className="text-[10px] text-muted-foreground/70">
              💡 Cast daily to maintain your streak and boost your score!
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const StreakDisplay = ({ streakDays }: { streakDays: number }) => {
  const milestones = STREAK_MILESTONES;
  const currentMilestone = getCurrentMilestone(streakDays);
  const multiplier = getStreakMultiplier(streakDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-tier-gold" />
          <span className="font-display font-bold text-sm">Daily Streak</span>
        </div>
        <StreakBadge streakDays={streakDays} />
      </div>

      {/* Milestone progress */}
      <div className="flex gap-2">
        {milestones.map((milestone, index) => {
          const isActive = streakDays >= milestone.days;
          const IconComp = milestone.icon;
          
          return (
            <motion.div
              key={milestone.days}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex-1 p-2 rounded-lg text-center transition-all ${
                isActive 
                  ? 'border-2' 
                  : 'border border-border/50 opacity-50'
              }`}
              style={{
                backgroundColor: isActive ? `${milestone.color}15` : undefined,
                borderColor: isActive ? milestone.color : undefined,
              }}
            >
              <IconComp 
                className="w-4 h-4 mx-auto mb-1" 
                style={{ color: isActive ? milestone.color : undefined }}
              />
              <div className="text-[10px] text-muted-foreground">{milestone.days}d</div>
              <div 
                className="text-xs font-bold"
                style={{ color: isActive ? milestone.color : undefined }}
              >
                {milestone.multiplier}x
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current bonus */}
      {streakDays >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-xs text-muted-foreground"
        >
          Your score is boosted by{' '}
          <span className="font-bold text-primary">
            {((multiplier - 1) * 100).toFixed(0)}%
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakBadge;
