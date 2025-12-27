import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StickyNav } from "@/components/StickyNav";
import { LeaderboardSkeleton } from "@/components/Skeletons";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Crown, 
  Gem, 
  Medal,
  Trophy,
  ArrowLeft,
  Sparkles,
  Flame,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserEntry {
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
  base_score: number | null;
}

interface CategorySection {
  title: string;
  icon: React.ReactNode;
  color: string;
  users: UserEntry[];
  description: string;
}

const tierColors: Record<string, string> = {
  diamond: 'hsl(200 100% 70%)',
  gold: 'hsl(45 100% 55%)',
  silver: 'hsl(220 15% 70%)',
  bronze: 'hsl(30 60% 50%)',
};

const tierIcons: Record<string, React.ReactNode> = {
  diamond: <Gem className="w-4 h-4 text-tier-diamond" />,
  gold: <Crown className="w-4 h-4 text-tier-gold" />,
  silver: <Medal className="w-4 h-4 text-tier-silver" />,
  bronze: <Trophy className="w-4 h-4 text-tier-bronze" />,
};

const UserCard = ({ user, rank }: { user: UserEntry; rank?: number }) => (
  <Link to={`/profile/${user.username}`}>
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
    >
      {rank && (
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.display_name || user.username}
            className="w-12 h-12 rounded-full border-2 object-cover"
            style={{ borderColor: tierColors[user.tier] }}
          />
        ) : (
          <div 
            className="w-12 h-12 rounded-full border-2 bg-muted flex items-center justify-center"
            style={{ borderColor: tierColors[user.tier] }}
          >
            <span className="font-bold">{user.username[0].toUpperCase()}</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm truncate group-hover:text-primary transition-colors">
              {user.display_name || user.username}
            </span>
            {tierIcons[user.tier]}
          </div>
          <span className="text-xs text-muted-foreground">@{user.username}</span>
        </div>
        
        <div 
          className="px-3 py-1.5 rounded-lg text-right"
          style={{ 
            backgroundColor: `${tierColors[user.tier]}20`,
          }}
        >
          <span 
            className="font-display font-black text-lg"
            style={{ color: tierColors[user.tier] }}
          >
            {user.score}
          </span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <span>{user.casts?.toLocaleString() || 0} casts</span>
        <span>{user.followers?.toLocaleString() || 0} followers</span>
        {user.base_score && user.base_score > 0 && (
          <span className="text-base">Base: {user.base_score}</span>
        )}
      </div>
    </motion.div>
  </Link>
);

const CategoryGrid = ({ section }: { section: CategorySection }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-12"
  >
    <div className="flex items-center gap-3 mb-2">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${section.color}20` }}
      >
        {section.icon}
      </div>
      <div>
        <h2 className="font-display font-bold text-xl">{section.title}</h2>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {section.users.map((user, index) => (
        <UserCard key={user.id} user={user} rank={index + 1} />
      ))}
    </div>
  </motion.div>
);

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySection[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;

      const users = data || [];

      // Create different category views
      const categorized: CategorySection[] = [
        {
          title: "Top Performers",
          icon: <Crown className="w-5 h-5 text-tier-gold" />,
          color: "hsl(45 100% 55%)",
          description: "Highest Niner Scores overall",
          users: users.slice(0, 6),
        },
        {
          title: "Rising Stars",
          icon: <TrendingUp className="w-5 h-5 text-green-400" />,
          color: "hsl(140 70% 50%)",
          description: "New users making waves",
          users: users
            .filter(u => u.score >= 200 && u.score < 500)
            .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
            .slice(0, 6),
        },
        {
          title: "Diamond Elite",
          icon: <Gem className="w-5 h-5 text-tier-diamond" />,
          color: "hsl(200 100% 70%)",
          description: "The exclusive Diamond tier members",
          users: users.filter(u => u.tier === 'diamond').slice(0, 6),
        },
        {
          title: "Content Creators",
          icon: <Sparkles className="w-5 h-5 text-primary" />,
          color: "hsl(263 70% 58%)",
          description: "Most prolific casters",
          users: [...users]
            .sort((a, b) => (b.casts || 0) - (a.casts || 0))
            .slice(0, 6),
        },
        {
          title: "Community Leaders",
          icon: <Users className="w-5 h-5 text-farcaster" />,
          color: "hsl(263 60% 55%)",
          description: "Most followed Niners",
          users: [...users]
            .sort((a, b) => (b.followers || 0) - (a.followers || 0))
            .slice(0, 6),
        },
        {
          title: "Base Builders",
          icon: <Zap className="w-5 h-5 text-base" />,
          color: "hsl(220 90% 55%)",
          description: "Highest Base chain activity scores",
          users: [...users]
            .filter(u => u.base_score && u.base_score > 0)
            .sort((a, b) => (b.base_score || 0) - (a.base_score || 0))
            .slice(0, 6),
        },
      ];

      // Filter out empty categories
      setCategories(categorized.filter(c => c.users.length > 0));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero light-beam-bg pb-24">
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
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl">EXPLORE</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4">
            DISCOVER <span className="text-gradient-primary">NINERS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore top performers, rising stars, and community leaders across the Farcaster ecosystem.
          </p>
        </motion.div>

        {loading ? (
          <LeaderboardSkeleton />
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">No users yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to claim your Niner Score!
            </p>
            <Link to="/">
              <Button variant="farcaster">Get Your Score</Button>
            </Link>
          </motion.div>
        ) : (
          <div>
            {categories.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryGrid section={section} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <StickyNav />
    </div>
  );
};

export default Explore;
