import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import NinerCard from "./NinerCard";
import ScoreDisplay from "./ScoreDisplay";
import StatsGrid from "./StatsGrid";
import { Share2, Download, ExternalLink, LogOut, Sparkles } from "lucide-react";
import type { TierType } from "./NinerCard";
import type { FarcasterData } from "@/hooks/useFarcasterAuth";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  data: FarcasterData;
  onDisconnect: () => void;
}

const getTier = (score: number): TierType => {
  if (score >= 801) return "diamond";
  if (score >= 501) return "gold";
  if (score >= 251) return "silver";
  return "bronze";
};

const tierThresholds = [
  { tier: "Bronze", min: 0, max: 250, color: "hsl(30 60% 50%)" },
  { tier: "Silver", min: 251, max: 500, color: "hsl(220 15% 70%)" },
  { tier: "Gold", min: 501, max: 800, color: "hsl(45 100% 55%)" },
  { tier: "Diamond", min: 801, max: 999, color: "hsl(200 100% 70%)" },
];

export const Dashboard = ({ data, onDisconnect }: DashboardProps) => {
  const { user, activity, ninerScore } = data;
  const tier = getTier(ninerScore);
  const { toast } = useToast();

  // Map activity to stats format
  const stats = {
    casts: activity.totalCasts,
    replies: activity.totalReplies,
    recasts: activity.totalRecasts,
    likes: activity.totalLikes,
    followers: user.followerCount,
    engagement: user.followerCount > 0 
      ? Math.round((activity.totalLikes + activity.totalRecasts) / Math.max(activity.totalCasts, 1) * 10) / 10
      : 0,
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`🎯 My Niner Score: ${ninerScore} (${tier.toUpperCase()} Tier)\n\nCheck your Farcaster reputation at ninerscore.app`);
    toast({
      title: "Copied to clipboard!",
      description: "Share your score on Farcaster or Twitter.",
    });
  };

  // Calculate next tier info
  const currentTierIndex = tierThresholds.findIndex(t => t.tier.toLowerCase() === tier);
  const nextTier = tierThresholds[currentTierIndex + 1];
  const pointsToNextTier = nextTier ? nextTier.min - ninerScore : 0;

  return (
    <div className="min-h-screen bg-hero light-beam-bg">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-farcaster flex items-center justify-center shadow-lg shadow-farcaster/30">
              <span className="font-display font-bold text-sm">N9</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline">NINER SCORE</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50"
              whileHover={{ scale: 1.02 }}
            >
              {user.pfpUrl ? (
                <img 
                  src={user.pfpUrl} 
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full border border-border bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold">{user.username[0].toUpperCase()}</span>
                </div>
              )}
              <span className="text-sm text-foreground font-medium hidden sm:inline">
                @{user.username}
              </span>
            </motion.div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDisconnect}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left column - Card */}
          <motion.div 
            className="flex flex-col items-center gap-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NinerCard
              username={user.username}
              displayName={user.displayName || user.username}
              avatar={user.pfpUrl || ''}
              score={ninerScore}
              tier={tier}
              stats={{
                casts: stats.casts,
                followers: stats.followers,
                engagement: stats.engagement,
              }}
            />

            {/* Action buttons */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="farcaster" 
                className="gap-2 shadow-lg shadow-farcaster/20"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2 hover:bg-card transition-colors">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="outline" className="gap-2 hover:bg-card transition-colors">
                <ExternalLink className="w-4 h-4" />
                OpenSea
              </Button>
            </motion.div>
          </motion.div>

          {/* Right column - Stats */}
          <motion.div 
            className="space-y-8"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Welcome message */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-black text-4xl md:text-5xl mb-4"
              >
                Hey, <span className="text-gradient-primary">{user.displayName || user.username}</span>!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg"
              >
                Your Niner Score is ready. Here's your social reputation breakdown.
              </motion.p>
              {user.powerBadge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-tier-gold/20 border border-tier-gold/40"
                >
                  <Sparkles className="w-4 h-4 text-tier-gold" />
                  <span className="text-tier-gold text-sm font-semibold">Power Badge Holder</span>
                </motion.div>
              )}
            </div>

            {/* Score display */}
            <div className="flex justify-center lg:justify-start">
              <ScoreDisplay score={ninerScore} tier={tier} />
            </div>

            {/* Next tier progress */}
            {nextTier && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress to {nextTier.tier}</span>
                  <span className="text-sm font-medium" style={{ color: nextTier.color }}>
                    {pointsToNextTier} pts to go
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, ((ninerScore - tierThresholds[currentTierIndex].min) / (nextTier.min - tierThresholds[currentTierIndex].min)) * 100)}%` 
                    }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: nextTier.color,
                      boxShadow: `0 0 10px ${nextTier.color}`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Stats grid */}
            <div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-display font-bold text-lg mb-4"
              >
                Activity Breakdown
              </motion.h3>
              <StatsGrid stats={stats} />
            </div>

            {/* Bio if available */}
            {user.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <h4 className="font-display font-bold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Bio</h4>
                <p className="text-foreground">{user.bio}</p>
              </motion.div>
            )}

            {/* Tier legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-5"
            >
              <h4 className="font-display font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide">All Tiers</h4>
              <div className="grid grid-cols-4 gap-3">
                {tierThresholds.map((t, i) => {
                  const isActive = t.tier.toLowerCase() === tier;
                  return (
                    <motion.div 
                      key={t.tier} 
                      className={`text-center p-3 rounded-lg transition-all ${isActive ? 'bg-foreground/5' : ''}`}
                      style={{ 
                        boxShadow: isActive ? `inset 0 0 0 1px ${t.color}` : 'none',
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span 
                        className="font-display font-bold block text-sm"
                        style={{ color: t.color }}
                      >
                        {t.tier}
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {t.min}-{t.max === 999 ? '999+' : t.max}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTier"
                          className="w-1.5 h-1.5 rounded-full mx-auto mt-2"
                          style={{ backgroundColor: t.color }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
