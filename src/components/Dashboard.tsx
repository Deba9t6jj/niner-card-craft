import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import NinerCard from "./NinerCard";
import ScoreDisplay from "./ScoreDisplay";
import StatsGrid from "./StatsGrid";
import { Share2, Download, ExternalLink, LogOut } from "lucide-react";
import type { TierType } from "./NinerCard";

interface UserData {
  username: string;
  displayName: string;
  avatar: string;
  fid: number;
}

interface DashboardProps {
  user: UserData;
  onDisconnect: () => void;
}

// Mock score calculation - in production this would come from API
const calculateScore = () => {
  const baseScore = Math.floor(Math.random() * 400) + 200;
  return Math.min(999, baseScore);
};

const getTier = (score: number): TierType => {
  if (score >= 801) return "diamond";
  if (score >= 501) return "gold";
  if (score >= 251) return "silver";
  return "bronze";
};

// Mock stats - in production from Neynar API
const generateMockStats = () => ({
  casts: Math.floor(Math.random() * 2000) + 100,
  replies: Math.floor(Math.random() * 1500) + 50,
  recasts: Math.floor(Math.random() * 500) + 20,
  likes: Math.floor(Math.random() * 5000) + 200,
  followers: Math.floor(Math.random() * 10000) + 100,
  engagement: Math.floor(Math.random() * 30) + 5,
});

export const Dashboard = ({ user, onDisconnect }: DashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState(generateMockStats());
  const tier = getTier(score);

  useEffect(() => {
    // Simulate score calculation
    const timer = setTimeout(() => {
      const calculatedScore = calculateScore();
      setScore(calculatedScore);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
              <img 
                src={user.avatar} 
                alt={user.displayName}
                className="w-8 h-8 rounded-full border border-border"
              />
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
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-farcaster border-t-transparent"
            />
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl mb-2">
                Calculating Your Score
              </h2>
              <p className="text-muted-foreground">
                Analyzing your Farcaster activity...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            {/* Left column - Card */}
            <div className="flex flex-col items-center gap-8">
              <NinerCard
                username={user.username}
                displayName={user.displayName}
                avatar={user.avatar}
                score={score}
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
                  Hey, <span className="text-gradient-primary">{user.displayName}</span>!
                </motion.h1>
                <p className="text-muted-foreground text-lg">
                  Your Niner Score is ready. Here's your social reputation breakdown.
                </p>
              </div>

              <div className="flex justify-center lg:justify-start">
                <ScoreDisplay score={score} tier={tier} />
              </div>

              <div>
                <h3 className="font-display font-bold text-lg mb-4">
                  Activity Breakdown
                </h3>
                <StatsGrid stats={stats} />
              </div>

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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
