import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StickyNav } from "@/components/StickyNav";
import { DashboardSkeleton } from "@/components/Skeletons";
import { StreakDisplay } from "@/components/StreakBadge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Crown, 
  Gem, 
  Medal, 
  Trophy,
  Users,
  MessageSquare,
  TrendingUp,
  Zap,
  ExternalLink,
  CheckCircle,
  Copy,
  Wallet,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserProfile {
  id: string;
  fid: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
  tier: string;
  casts: number | null;
  followers: number | null;
  engagement: number | null;
  nft_minted: boolean | null;
  nft_transaction_hash: string | null;
  base_score: number | null;
  combined_score: number | null;
  wallet_addresses: string[] | null;
  created_at: string;
  updated_at: string;
}

const tierConfig: Record<string, { icon: React.ReactNode; color: string; label: string; bgClass: string }> = {
  diamond: { 
    icon: <Gem className="w-6 h-6" />, 
    color: 'hsl(200 100% 70%)', 
    label: 'Diamond',
    bgClass: 'bg-tier-diamond/20 border-tier-diamond/30'
  },
  gold: { 
    icon: <Crown className="w-6 h-6" />, 
    color: 'hsl(45 100% 55%)', 
    label: 'Gold',
    bgClass: 'bg-tier-gold/20 border-tier-gold/30'
  },
  silver: { 
    icon: <Medal className="w-6 h-6" />, 
    color: 'hsl(220 15% 70%)', 
    label: 'Silver',
    bgClass: 'bg-tier-silver/20 border-tier-silver/30'
  },
  bronze: { 
    icon: <Trophy className="w-6 h-6" />, 
    color: 'hsl(30 60% 50%)', 
    label: 'Bronze',
    bgClass: 'bg-tier-bronze/20 border-tier-bronze/30'
  },
};

const StatCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
  >
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display font-bold text-xl">{value}</p>
      </div>
    </div>
  </motion.div>
);

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUser();
    }
  }, [username]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  const tier = user?.tier || 'bronze';
  const tierInfo = tierConfig[tier];

  if (loading) {
    return (
      <div className="min-h-screen bg-hero light-beam-bg pb-24">
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-12">
          <DashboardSkeleton />
        </main>
        <StickyNav />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-hero light-beam-bg pb-24">
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">User not found</h3>
            <p className="text-muted-foreground mb-6">
              The user @{username} hasn't claimed their Niner Score yet.
            </p>
            <Link to="/explore">
              <Button variant="farcaster">Explore Users</Button>
            </Link>
          </motion.div>
        </main>
        <StickyNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero light-beam-bg pb-24">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <a 
            href={`https://warpcast.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Warpcast
            </Button>
          </a>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 md:p-8 mb-8 ${tierInfo.bgClass}`}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.display_name || user.username}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 object-cover"
                  style={{ borderColor: tierInfo.color }}
                />
              ) : (
                <div 
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 bg-muted flex items-center justify-center"
                  style={{ borderColor: tierInfo.color }}
                >
                  <span className="font-bold text-4xl">{user.username[0].toUpperCase()}</span>
                </div>
              )}
              <div 
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-2 border-background"
                style={{ backgroundColor: tierInfo.color }}
              >
                {tierInfo.icon}
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="font-display font-black text-2xl md:text-3xl">
                  {user.display_name || user.username}
                </h1>
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mx-auto md:mx-0"
                  style={{ backgroundColor: `${tierInfo.color}30`, color: tierInfo.color }}
                >
                  {tierInfo.icon}
                  {tierInfo.label} Tier
                </div>
              </div>
              <p className="text-muted-foreground mb-4">@{user.username}</p>
              
              {/* Score display */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="px-6 py-3 rounded-xl cursor-help flex items-center gap-2"
                        style={{ backgroundColor: `${tierInfo.color}20` }}
                      >
                        <div>
                          <span className="text-sm text-muted-foreground">Niner Score</span>
                          <p 
                            className="font-display font-black text-4xl"
                            style={{ color: tierInfo.color }}
                          >
                            {user.score}
                          </p>
                        </div>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">Score based on casts, followers, and engagement rate.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {user.combined_score && user.combined_score > 0 && (
                  <div className="px-6 py-3 rounded-xl bg-base/20">
                    <span className="text-sm text-muted-foreground">Combined</span>
                    <p className="font-display font-black text-4xl text-base">
                      {user.combined_score}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NFT Status */}
          {user.nft_minted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-400">NFT Minted</p>
                {user.nft_transaction_hash && (
                  <a 
                    href={`https://basescan.org/tx/${user.nft_transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-green-400 transition-colors"
                  >
                    View on Basescan →
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Streak Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StreakDisplay 
            streakDays={Math.min(30, Math.floor((user.engagement || 0) * 3))}
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-xl mb-4">Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<MessageSquare className="w-5 h-5" />}
              label="Casts"
              value={user.casts?.toLocaleString() || 0}
              color="hsl(263 70% 58%)"
            />
            <StatCard 
              icon={<Users className="w-5 h-5" />}
              label="Followers"
              value={user.followers?.toLocaleString() || 0}
              color="hsl(263 60% 55%)"
            />
            <StatCard 
              icon={<TrendingUp className="w-5 h-5" />}
              label="Engagement"
              value={`${user.engagement?.toFixed(1) || 0}%`}
              color="hsl(140 70% 50%)"
            />
            <StatCard 
              icon={<Zap className="w-5 h-5" />}
              label="Base Score"
              value={user.base_score || 0}
              color="hsl(220 90% 55%)"
            />
          </div>
        </motion.div>

        {/* Wallet Addresses */}
        {user.wallet_addresses && user.wallet_addresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connected Wallets
            </h2>
            <div className="space-y-2">
              {user.wallet_addresses.map((address, index) => (
                <div 
                  key={address}
                  className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-base/20 flex items-center justify-center">
                      <span className="text-base font-bold text-sm">{index + 1}</span>
                    </div>
                    <code className="text-sm font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyAddress(address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <a 
                      href={`https://basescan.org/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Member Since */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </motion.div>
      </main>

      <StickyNav />
    </div>
  );
};

export default Profile;