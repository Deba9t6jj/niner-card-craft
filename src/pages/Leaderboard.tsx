import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, Gem, ArrowLeft, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  fid: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
  tier: string;
  casts: number | null;
  followers: number | null;
  nft_minted: boolean | null;
}

const tierIcons: Record<string, React.ReactNode> = {
  diamond: <Gem className="w-5 h-5 text-tier-diamond" />,
  gold: <Crown className="w-5 h-5 text-tier-gold" />,
  silver: <Medal className="w-5 h-5 text-tier-silver" />,
  bronze: <Trophy className="w-5 h-5 text-tier-bronze" />,
};

const tierColors: Record<string, string> = {
  diamond: 'hsl(200 100% 70%)',
  gold: 'hsl(45 100% 55%)',
  silver: 'hsl(220 15% 70%)',
  bronze: 'hsl(30 60% 50%)',
};

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
        <span className="font-display font-bold text-lg">1</span>
      </div>
    );
    if (index === 1) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
        <span className="font-display font-bold text-lg">2</span>
      </div>
    );
    if (index === 2) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-600/30">
        <span className="font-display font-bold text-lg">3</span>
      </div>
    );
    return (
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <span className="font-display font-medium text-muted-foreground">{index + 1}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-hero light-beam-bg">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-farcaster flex items-center justify-center shadow-lg shadow-farcaster/30">
                <span className="font-display font-bold text-sm">N9</span>
              </div>
              <span className="font-display font-bold text-xl">LEADERBOARD</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
            TOP <span className="text-gradient-gold">NINERS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The highest scoring Farcaster users. Claim your spot on the leaderboard.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">No entries yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to claim your Niner Score and appear on the leaderboard!
            </p>
            <Link to="/">
              <Button variant="farcaster">Get Your Score</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
                style={{
                  boxShadow: index < 3 ? `0 0 20px ${tierColors[entry.tier]}20` : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  {getRankBadge(index)}
                  
                  {/* Avatar */}
                  <div className="relative">
                    {entry.avatar_url ? (
                      <img 
                        src={entry.avatar_url} 
                        alt={entry.display_name || entry.username}
                        className="w-12 h-12 rounded-full border-2 object-cover"
                        style={{ borderColor: tierColors[entry.tier] }}
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full border-2 bg-muted flex items-center justify-center"
                        style={{ borderColor: tierColors[entry.tier] }}
                      >
                        <span className="font-bold">{entry.username[0].toUpperCase()}</span>
                      </div>
                    )}
                    {entry.nft_minted && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-farcaster flex items-center justify-center">
                        <Gem className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold truncate">
                        {entry.display_name || entry.username}
                      </span>
                      {tierIcons[entry.tier]}
                    </div>
                    <span className="text-sm text-muted-foreground">@{entry.username}</span>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <span className="block text-muted-foreground text-xs">Casts</span>
                      <span className="font-display font-bold">{entry.casts?.toLocaleString() || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-muted-foreground text-xs">Followers</span>
                      <span className="font-display font-bold">{entry.followers?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div 
                    className="text-right px-4 py-2 rounded-lg"
                    style={{ 
                      backgroundColor: `${tierColors[entry.tier]}20`,
                      color: tierColors[entry.tier],
                    }}
                  >
                    <span className="font-display font-black text-2xl">{entry.score}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
