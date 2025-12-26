import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import NinerCard from "./NinerCard";
import ScoreDisplay from "./ScoreDisplay";
import StatsGrid from "./StatsGrid";
import { MintNFTButton } from "./MintNFTButton";
import { BaseScorePanel } from "./base/BaseScorePanel";
import { CombinedScoreCard, type CombinedTierType } from "./base/CombinedScoreCard";
import { BaseTransactions } from "./base/BaseTransactions";
import { WalletConnector } from "./base/WalletConnector";
import { Share2, Download, LogOut, Sparkles, MessageCircle, Trophy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { TierType } from "./NinerCard";
import type { FarcasterData } from "@/hooks/useFarcasterAuth";
import { useBaseScore } from "@/hooks/useBaseScore";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  data: FarcasterData;
  onDisconnect: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const getTier = (score: number): TierType => {
  if (score >= 801) return "diamond";
  if (score >= 501) return "gold";
  if (score >= 251) return "silver";
  return "bronze";
};

const getCombinedTier = (combinedScore: number): CombinedTierType => {
  if (combinedScore >= 900) return "diamond-pro";
  if (combinedScore >= 801) return "diamond";
  if (combinedScore >= 501) return "gold";
  if (combinedScore >= 251) return "silver";
  return "bronze";
};

const tierThresholds = [
  { tier: "Bronze", min: 0, max: 250, color: "hsl(30 60% 50%)" },
  { tier: "Silver", min: 251, max: 500, color: "hsl(220 15% 70%)" },
  { tier: "Gold", min: 501, max: 800, color: "hsl(45 100% 55%)" },
  { tier: "Diamond", min: 801, max: 899, color: "hsl(200 100% 70%)" },
  { tier: "Diamond Pro", min: 900, max: 1000, color: "hsl(220 90% 60%)" },
];

export const Dashboard = ({ data, onDisconnect, onRefresh, isRefreshing }: DashboardProps) => {
  const { user, activity, ninerScore } = data;
  const tier = getTier(ninerScore);
  const { toast } = useToast();
  const { baseData, isLoading: baseLoading, fetchBaseScore } = useBaseScore();
  const [manualWallets, setManualWallets] = useState<string[]>([]);

  // Combine verified addresses with manually added wallets
  const allWallets = [...(user.verifiedAddresses || []), ...manualWallets];

  // Calculate combined score
  const baseScore = baseData?.score || 0;
  const combinedScore = Math.round((ninerScore * 0.7) + (baseScore * 0.3));
  const combinedTier = getCombinedTier(combinedScore);

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

  // Fetch Base activity if user has verified addresses or manual wallets
  useEffect(() => {
    if (allWallets.length > 0) {
      fetchBaseScore(allWallets);
    }
  }, [allWallets.length, fetchBaseScore]);

  // Cache Base score when it's calculated
  useEffect(() => {
    if (baseScore > 0 && user.fid) {
      supabase.functions.invoke('cache-base-score', {
        body: {
          fid: user.fid,
          baseScore,
          walletAddresses: allWallets,
        },
      }).catch(console.error);
    }
  }, [baseScore, user.fid, allWallets]);

  // Handle adding a manual wallet
  const handleAddWallet = useCallback(async (address: string) => {
    setManualWallets(prev => [...prev, address]);
  }, []);

  // Handle removing a manual wallet
  const handleRemoveWallet = useCallback((address: string) => {
    setManualWallets(prev => prev.filter(w => w.toLowerCase() !== address.toLowerCase()));
  }, []);
  
  // Save to leaderboard on mount - only sends FID and username
  // Score is calculated server-side for security
  useEffect(() => {
    const saveToLeaderboard = async () => {
      try {
        await supabase.functions.invoke('save-to-leaderboard', {
          body: {
            fid: user.fid,
            username: user.username,
          },
        });
      } catch (error) {
        console.error('Error saving to leaderboard:', error);
      }
    };
    saveToLeaderboard();
  }, [user.fid]);

  const handleShare = () => {
    navigator.clipboard.writeText(`🎯 My Niner Score: ${ninerScore} (${tier.toUpperCase()} Tier)\n\nCheck your Farcaster reputation at ninerscore.app`);
    toast({
      title: "Copied to clipboard!",
      description: "Share your score on Farcaster or Twitter.",
    });
  };

  const handleWarpcastShare = () => {
    // Create Warpcast intent URL with pre-filled cast
    const castText = encodeURIComponent(
      `🎯 My Niner Score: ${ninerScore} (${tier.toUpperCase()} Tier)\n\n` +
      `📊 Stats:\n` +
      `• ${stats.casts} casts\n` +
      `• ${stats.followers.toLocaleString()} followers\n` +
      `• ${stats.engagement}% engagement\n\n` +
      `Check your Farcaster reputation 👇`
    );
    
    const warpcastUrl = `https://warpcast.com/~/compose?text=${castText}`;
    window.open(warpcastUrl, '_blank');
    
    toast({
      title: "Opening Warpcast",
      description: "Share your Niner Score with your followers!",
    });
  };


  const handleDownload = async () => {
    toast({
      title: "Preparing download...",
      description: "Generating your NFT card image.",
    });
    
    // Create a canvas to draw the card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 640;
    canvas.height = 800;
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#14141e');
    gradient.addColorStop(1, '#0f0f16');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
    ctx.fill();
    
    // Draw tier accent glow at top
    const tierColors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0', 
      gold: '#FFD700',
      diamond: '#00BFFF',
    };
    const accentColor = tierColors[tier];
    
    ctx.fillStyle = accentColor + '30';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, 50, 150, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw tier indicators
    const indicatorY = 40;
    const indicatorSpacing = 28;
    const startX = canvas.width / 2 - (indicatorSpacing * 1.5);
    const tierIndex = ["bronze", "silver", "gold", "diamond"].indexOf(tier);
    
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i <= tierIndex ? accentColor : 'rgba(255,255,255,0.2)';
      const width = i === 0 ? 36 : 24;
      ctx.beginPath();
      ctx.roundRect(startX + i * indicatorSpacing - (i === 0 ? 6 : 0), indicatorY, width, 4, 2);
      ctx.fill();
    }
    
    // Draw avatar placeholder
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 80, 100, 160, 160, 24);
    ctx.fill();
    
    // Load and draw avatar if available
    if (user.pfpUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = user.pfpUrl;
        });
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 80, 100, 160, 160, 24);
        ctx.clip();
        ctx.drawImage(img, canvas.width / 2 - 80, 100, 160, 160);
        ctx.restore();
      } catch (e) {
        // Keep placeholder
      }
    }
    
    // Draw score badge
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 + 50, 220, 60, 60, 16);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ninerScore.toString(), canvas.width / 2 + 80, 260);
    
    // Draw name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(user.displayName || user.username, canvas.width / 2, 320);
    
    ctx.fillStyle = '#888';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText('@' + user.username, canvas.width / 2, 350);
    
    // Draw tier label
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.fillText(tier.toUpperCase() + ' TIER', canvas.width / 2, 400);
    
    // Draw stats
    const statsData = [
      { label: 'CASTS', value: stats.casts.toLocaleString() },
      { label: 'FOLLOWERS', value: stats.followers.toLocaleString() },
    ];
    
    let yPos = 460;
    statsData.forEach(stat => {
      // Background
      const bgGradient = ctx.createLinearGradient(60, yPos, canvas.width - 60, yPos);
      bgGradient.addColorStop(0, accentColor + '30');
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.roundRect(60, yPos, canvas.width - 120, 60, 12);
      ctx.fill();
      
      // Left accent
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(60, yPos, 4, 60, 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#888';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, 90, yPos + 38);
      
      // Value
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Orbitron, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(stat.value, canvas.width - 80, yPos + 38);
      
      yPos += 80;
    });
    
    // Draw footer
    ctx.fillStyle = '#444';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NINER SCORE • Farcaster Identity', canvas.width / 2, canvas.height - 30);
    
    // Download
    const link = document.createElement('a');
    link.download = `niner-score-${user.username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast({
      title: "Downloaded!",
      description: "Your NFT card has been saved.",
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
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-2 hover:bg-farcaster/10"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            )}
            <Link to="/leaderboard">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-farcaster/10">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </Link>
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
              className="flex flex-wrap items-center justify-center gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <MintNFTButton
                fid={user.fid}
                username={user.username}
                displayName={user.displayName || user.username}
                score={ninerScore}
                tier={tier}
                avatarUrl={user.pfpUrl}
                stats={{
                  casts: stats.casts,
                  followers: stats.followers,
                  engagement: stats.engagement,
                }}
              />
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-card transition-colors"
                onClick={handleWarpcastShare}
              >
                <MessageCircle className="w-4 h-4" />
                Cast It
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-card transition-colors"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-card transition-colors"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
                Download
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
                Farcaster Activity
              </motion.h3>
              <StatsGrid stats={stats} />
            </div>

            {/* Combined Score Card */}
            <CombinedScoreCard
              farcasterScore={ninerScore}
              baseScore={baseScore}
              combinedScore={combinedScore}
              tier={combinedTier}
              isLoading={baseLoading}
            />

            {/* Base Chain Activity */}
            <BaseScorePanel
              activity={baseData?.activity || null}
              score={baseScore}
              isLoading={baseLoading}
            />

            {/* Wallet Connector */}
            <WalletConnector
              verifiedAddresses={allWallets}
              onAddWallet={handleAddWallet}
              onRemoveWallet={handleRemoveWallet}
              isLoading={baseLoading}
            />

            {/* Base Transactions */}
            {baseData?.activity?.recentTransactions && baseData.activity.recentTransactions.length > 0 && (
              <BaseTransactions transactions={baseData.activity.recentTransactions} />
            )}

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

      {/* Footer with creator credit */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built by</span>
          <a 
            href="https://x.com/0xleo_ip" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground hover:text-farcaster transition-colors font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            0xleo_ip
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
