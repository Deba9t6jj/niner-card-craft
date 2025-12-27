import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, Gem, ArrowLeft, Loader2, TrendingUp, Flame, Sparkles } from "lucide-react";

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
  base_score: number | null;
  combined_score: number | null;
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

// 3D Tilt component for top 3 entries
const TiltLeaderboardCard = ({ children, isTop3, tierColor }: { children: React.ReactNode; isTop3: boolean; tierColor: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isTop3) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => { if (isTop3) scale.set(1.02); };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  if (!isTop3) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Glow effect for top 3 */}
        <motion.div
          className="absolute -inset-1 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
          style={{ background: `${tierColor}30` }}
        />
        {children}
      </motion.div>
    </motion.div>
  );
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
      <motion.div 
        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
        animate={{ 
          boxShadow: ['0 0 20px rgba(255, 215, 0, 0.3)', '0 0 40px rgba(255, 215, 0, 0.6)', '0 0 20px rgba(255, 215, 0, 0.3)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Crown className="w-6 h-6 text-background" />
      </motion.div>
    );
    if (index === 1) return (
      <motion.div 
        className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 20px rgba(192, 192, 192, 0.4)' }}
      >
        <Medal className="w-5 h-5 text-background" />
      </motion.div>
    );
    if (index === 2) return (
      <motion.div 
        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 20px rgba(205, 127, 50, 0.4)' }}
      >
        <Trophy className="w-5 h-5 text-background" />
      </motion.div>
    );
    return (
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center border border-border/50">
        <span className="font-display font-bold text-lg text-muted-foreground">{index + 1}</span>
      </div>
    );
  };

  // Calculate score change simulation (would come from DB in real app)
  const getScoreChange = (index: number) => {
    const changes = [12, 8, -3, 5, 0, -2, 15, 3, -1, 7];
    return changes[index % changes.length];
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
          
          {/* Stats bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Flame className="w-4 h-4 text-tier-gold" />
              <span className="text-sm text-muted-foreground">Total Players: <span className="text-foreground font-bold">{entries.length}</span></span>
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading rankings...</span>
            </div>
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
          <div className="max-w-4xl mx-auto space-y-3">
            {entries.map((entry, index) => {
              const isTop3 = index < 3;
              const scoreChange = getScoreChange(index);
              
              return (
                <TiltLeaderboardCard key={entry.id} isTop3={isTop3} tierColor={tierColors[entry.tier]}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ 
                      borderColor: tierColors[entry.tier] + '60',
                      transition: { duration: 0.2 }
                    }}
                    className={`relative bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all cursor-pointer group ${
                      isTop3 
                        ? 'border-2' 
                        : 'border-border hover:border-primary/30'
                    }`}
                    style={{
                      borderColor: isTop3 ? tierColors[entry.tier] + '40' : undefined,
                      boxShadow: isTop3 ? `0 0 30px ${tierColors[entry.tier]}15` : undefined,
                    }}
                  >
                    {/* Top 3 special effects */}
                    {isTop3 && (
                      <>
                        <div 
                          className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                          style={{
                            background: `linear-gradient(135deg, ${tierColors[entry.tier]}10 0%, transparent 50%)`,
                          }}
                        />
                        <motion.div 
                          className="absolute top-2 right-2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-4 h-4" style={{ color: tierColors[entry.tier] }} />
                        </motion.div>
                      </>
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Rank */}
                      {getRankBadge(index)}
                      
                      {/* Avatar */}
                      <div className="relative">
                        {entry.avatar_url ? (
                          <motion.img 
                            src={entry.avatar_url} 
                            alt={entry.display_name || entry.username}
                            className="w-14 h-14 rounded-full border-2 object-cover"
                            style={{ borderColor: tierColors[entry.tier] }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          />
                        ) : (
                          <div 
                            className="w-14 h-14 rounded-full border-2 bg-muted flex items-center justify-center"
                            style={{ borderColor: tierColors[entry.tier] }}
                          >
                            <span className="font-bold text-lg">{entry.username[0].toUpperCase()}</span>
                          </div>
                        )}
                        {entry.nft_minted && (
                          <motion.div 
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-farcaster flex items-center justify-center border-2 border-background"
                            whileHover={{ scale: 1.2 }}
                          >
                            <Gem className="w-3 h-3" />
                          </motion.div>
                        )}
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-lg truncate group-hover:text-primary transition-colors">
                            {entry.display_name || entry.username}
                          </span>
                          {tierIcons[entry.tier]}
                        </div>
                        <span className="text-sm text-muted-foreground">@{entry.username}</span>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-8 text-sm">
                        <div className="text-center">
                          <span className="block text-muted-foreground text-xs mb-1">Casts</span>
                          <span className="font-display font-bold">{entry.casts?.toLocaleString() || 0}</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-muted-foreground text-xs mb-1">Followers</span>
                          <span className="font-display font-bold">{entry.followers?.toLocaleString() || 0}</span>
                        </div>
                        {entry.base_score && entry.base_score > 0 && (
                          <div className="text-center">
                            <span className="block text-muted-foreground text-xs mb-1">Base</span>
                            <span className="font-display font-bold text-base">{entry.base_score}</span>
                          </div>
                        )}
                      </div>

                      {/* Score with change indicator */}
                      <div className="text-right">
                        <motion.div 
                          className="px-4 py-2 rounded-xl flex items-center gap-2"
                          style={{ 
                            backgroundColor: `${tierColors[entry.tier]}20`,
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span 
                            className="font-display font-black text-2xl"
                            style={{ color: tierColors[entry.tier] }}
                          >
                            {entry.score}
                          </span>
                          {scoreChange !== 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-center text-xs font-bold ${scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}
                            >
                              <TrendingUp className={`w-3 h-3 ${scoreChange < 0 ? 'rotate-180' : ''}`} />
                              <span>{Math.abs(scoreChange)}</span>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </TiltLeaderboardCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
