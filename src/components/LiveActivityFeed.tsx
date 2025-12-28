import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActivityFeed, Activity } from "@/hooks/useActivityFeed";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Zap, Sparkles, UserPlus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface LiveActivityFeedProps {
  className?: string;
  limit?: number;
  compact?: boolean;
}

const getActionIcon = (actionType: Activity['action_type']) => {
  switch (actionType) {
    case 'score_updated':
      return <TrendingUp className="w-4 h-4 text-primary" />;
    case 'nft_minted':
      return <Sparkles className="w-4 h-4 text-tier-gold" />;
    case 'tier_achieved':
      return <Trophy className="w-4 h-4 text-tier-diamond" />;
    case 'joined':
      return <UserPlus className="w-4 h-4 text-farcaster" />;
    default:
      return <Zap className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActionText = (activity: Activity): string => {
  const data = activity.action_data as Record<string, unknown>;
  
  switch (activity.action_type) {
    case 'score_updated':
      return `scored ${data.score || 'N/A'} points`;
    case 'nft_minted':
      return `minted a ${(data.tier as string) || ''} NFT card`;
    case 'tier_achieved':
      return `achieved ${(data.tier as string) || ''} tier!`;
    case 'joined':
      return 'joined Niner Score';
    default:
      return 'performed an action';
  }
};

const getTierColor = (tier: string | undefined): string => {
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return 'text-tier-bronze';
    case 'silver':
      return 'text-tier-silver';
    case 'gold':
      return 'text-tier-gold';
    case 'diamond':
    case 'diamond pro':
      return 'text-tier-diamond';
    default:
      return 'text-foreground';
  }
};

const ActivityItem = ({ activity, compact }: { activity: Activity; compact?: boolean }) => {
  const data = activity.action_data as Record<string, unknown>;
  const tierColor = getTierColor(data.tier as string | undefined);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-center gap-3 ${compact ? 'py-2' : 'p-3'} rounded-lg hover:bg-card/50 transition-colors group`}
    >
      {/* Activity indicator dot with pulse */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <span className="relative block w-2 h-2 rounded-full bg-primary" />
      </motion.div>

      {/* Avatar */}
      <Link to={`/profile/${activity.username}`} className="shrink-0">
        <Avatar className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-border group-hover:border-primary/50 transition-colors`}>
          <AvatarImage src={activity.avatar_url || undefined} alt={activity.username} />
          <AvatarFallback className="bg-muted font-display text-xs">
            {activity.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-sm'} truncate`}>
          <Link 
            to={`/profile/${activity.username}`}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {activity.username}
          </Link>
          <span className="text-muted-foreground"> </span>
          <span className={`text-muted-foreground ${tierColor}`}>
            {getActionText(activity)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground/60">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Icon */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`${compact ? 'p-1.5' : 'p-2'} rounded-full bg-card border border-border`}
      >
        {getActionIcon(activity.action_type)}
      </motion.div>
    </motion.div>
  );
};

const ActivitySkeleton = ({ compact }: { compact?: boolean }) => (
  <div className={`flex items-center gap-3 ${compact ? 'py-2' : 'p-3'}`}>
    <Skeleton className="w-2 h-2 rounded-full" />
    <Skeleton className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full`} />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} rounded-full`} />
  </div>
);

export const LiveActivityFeed = ({ className = "", limit = 10, compact = false }: LiveActivityFeedProps) => {
  const { activities, isLoading, error } = useActivityFeed(limit);

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <h3 className={`font-display font-bold ${compact ? 'text-sm' : 'text-lg'}`}>
            Live Activity
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {activities.length} recent
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <ActivitySkeleton key={i} compact={compact} />
          ))}
        </div>
      )}

      {/* Activity list */}
      {!isLoading && !error && (
        <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} compact={compact} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Zap className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Be the first to check your score!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LiveActivityFeed;
