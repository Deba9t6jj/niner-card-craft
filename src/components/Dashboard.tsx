import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import NinerCard from "./NinerCard";
import ScoreDisplay from "./ScoreDisplay";
import StatsGrid from "./StatsGrid";
import { Share2, Download, ExternalLink, LogOut } from "lucide-react";
import type { TierType } from "./NinerCard";
import type { FarcasterData } from "@/hooks/useFarcasterAuth";

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

export const Dashboard = ({ data, onDisconnect }: DashboardProps) => {
  const { user, activity, ninerScore } = data;
  const tier = getTier(ninerScore);

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

  return (
    <div className="min-h-screen bg-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-farcaster flex items-center justify-center">
              <span className="font-display font-bold text-sm">N9</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline">NINER SCORE</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.pfpUrl ? (
                <img 
                  src={user.pfpUrl} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold">{user.username[0].toUpperCase()}</span>
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                @{user.username}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onDisconnect}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left column - Card */}
          <div className="flex flex-col items-center gap-8">
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
            <div className="flex items-center gap-4">
              <Button variant="farcaster" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                OpenSea
              </Button>
            </div>
          </div>

          {/* Right column - Stats */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-black text-4xl md:text-5xl mb-4"
              >
                Hey, <span className="text-gradient-primary">{user.displayName || user.username}</span>!
              </motion.h1>
              <p className="text-muted-foreground text-lg">
                Your Niner Score is ready. Here's your social reputation breakdown.
              </p>
              {user.powerBadge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-tier-gold/20 border border-tier-gold/30"
                >
                  <span className="text-tier-gold text-sm font-medium">⚡ Power Badge Holder</span>
                </motion.div>
              )}
            </div>

            <div className="flex justify-center lg:justify-start">
              <ScoreDisplay score={ninerScore} tier={tier} />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg mb-4">
                Activity Breakdown
              </h3>
              <StatsGrid stats={stats} />
            </div>

            {/* Bio if available */}
            {user.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h4 className="font-display font-bold mb-2">Bio</h4>
                <p className="text-muted-foreground text-sm">{user.bio}</p>
              </motion.div>
            )}

            {/* Tier explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h4 className="font-display font-bold mb-4">Score Tiers</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { tier: "Bronze", range: "0-250", color: "text-tier-bronze" },
                  { tier: "Silver", range: "251-500", color: "text-tier-silver" },
                  { tier: "Gold", range: "501-800", color: "text-tier-gold" },
                  { tier: "Diamond", range: "801+", color: "text-tier-diamond" },
                ].map((item) => (
                  <div key={item.tier} className="text-center">
                    <span className={`font-display font-bold ${item.color}`}>
                      {item.tier}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.range}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
