import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import { StickyNav } from "@/components/StickyNav";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { TopProgressBar } from "@/components/PageLoader";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";

const Index = () => {
  const { isConnecting, isConnected, data, connectByUsername, disconnect, refresh } = useFarcasterAuth();

  if (isConnected && data) {
    return (
      <>
        <TopProgressBar isLoading={isConnecting} />
        <Dashboard data={data} onDisconnect={disconnect} onRefresh={refresh} isRefreshing={isConnecting} />
        <StickyNav />
      </>
    );
  }

  return (
    <main className="relative">
      <TopProgressBar isLoading={isConnecting} />
      <HeroSection onConnect={connectByUsername} isConnecting={isConnecting} />
      
      {/* Features section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.06)_0%,transparent_40%)]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-black text-4xl md:text-5xl mb-4">
              HOW IT <span className="text-gradient-primary">WORKS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to claim your unique NFT identity card
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Username",
                description: "Enter your Farcaster username to connect your account",
                icon: "🔗",
              },
              {
                step: "02",
                title: "Get Your Score",
                description: "We analyze your casts, engagement, and social metrics",
                icon: "📊",
              },
              {
                step: "03",
                title: "Claim Your NFT",
                description: "Receive a free NFT card that reflects your tier",
                icon: "🏆",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:bg-card/80 transition-all group interactive-card cursor-pointer shadow-lg shadow-black/5"
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute -top-4 left-8">
                  <span className="font-display font-black text-5xl text-muted/20 group-hover:text-primary/30 transition-colors">
                    {item.step}
                  </span>
                </div>
                <div className="relative text-4xl mb-4 mt-4">{item.icon}</div>
                <h3 className="relative font-display font-bold text-xl mb-2">
                  {item.title}
                </h3>
                <p className="relative text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--tier-gold)/0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.05)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--base)/0.05)_0%,transparent_40%)]" />
        
        {/* Animated glow orbs */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-tier-gold/10 blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-tier-diamond/10 blur-[80px]"
        />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-black text-4xl md:text-5xl mb-4">
              TIER <span className="text-gradient-gold">LEVELS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Higher engagement unlocks better card designs and exclusive perks
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-5">
            {[
              {
                tier: "Bronze",
                range: "0-250",
                color: "card-bronze",
                glow: "glow-bronze",
                perks: ["Basic NFT Card", "Profile Badge", "Community Access"],
                basePerks: ["Gas fee rebates"],
              },
              {
                tier: "Silver",
                range: "251-500",
                color: "card-silver",
                glow: "glow-silver",
                perks: ["Animated Card", "Silver Badge", "Early Access"],
                basePerks: ["Priority transactions", "5% fee discount"],
              },
              {
                tier: "Gold",
                range: "501-800",
                color: "card-gold",
                glow: "glow-gold",
                perks: ["Holographic Card", "Gold Badge", "Exclusive Drops"],
                basePerks: ["Free gas days", "10% fee discount", "Beta access"],
              },
              {
                tier: "Diamond",
                range: "801-899",
                color: "card-diamond",
                glow: "glow-diamond",
                perks: ["Legendary Card", "Diamond Badge", "VIP Perks"],
                basePerks: ["Priority support", "15% fee discount", "Airdrop eligibility"],
              },
              {
                tier: "Diamond Pro",
                range: "900+",
                color: "bg-gradient-to-br from-base/30 to-base-glow/20 border border-base/50",
                glow: "shadow-[0_0_30px_hsl(220_90%_60%/0.3)]",
                perks: ["Elite Card", "Pro Badge", "Governance Rights"],
                basePerks: ["Max gas rebates", "20% fee discount", "Exclusive NFT drops", "Whale perks"],
                isBasePro: true,
              },
            ].map((item, index) => (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-5 ${item.color} ${item.glow} holographic`}
              >
                <div className="relative z-10">
                  {item.isBasePro && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-full bg-base/30 border border-base/50 w-fit">
                      <svg className="w-3 h-3 text-base" viewBox="0 0 111 111" fill="currentColor">
                        <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
                      </svg>
                      <span className="text-[10px] font-bold text-base uppercase">Base Pro</span>
                    </div>
                  )}
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">
                    {item.tier}
                  </h3>
                  <p className="text-xs text-foreground/70 mb-3">{item.range} pts</p>
                  
                  {/* Social Perks */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wide text-foreground/50 mb-1.5">Social Perks</p>
                    <ul className="space-y-1">
                      {item.perks.map((perk) => (
                        <li key={perk} className="text-xs text-foreground/80 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-farcaster" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Base Perks */}
                  <div className="pt-3 border-t border-foreground/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3 h-3 text-base" viewBox="0 0 111 111" fill="currentColor">
                        <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
                      </svg>
                      <p className="text-[10px] uppercase tracking-wide text-base">Base Perks</p>
                    </div>
                    <ul className="space-y-1">
                      {item.basePerks.map((perk) => (
                        <li key={perk} className="text-xs text-foreground/80 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-base" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section with Live Activity Feed */}
      <section className="py-24 px-6 bg-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-farcaster/10 blur-3xl"
          />
        </div>
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: CTA content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="font-display font-black text-4xl md:text-6xl mb-6">
                READY TO CLAIM YOUR <span className="text-gradient-primary">IDENTITY</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of Farcaster users who've already claimed their unique NFT cards.
              </p>
            </motion.div>

            {/* Right: Live Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6"
            >
              <LiveActivityFeed limit={8} compact />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-farcaster flex items-center justify-center">
              <span className="font-display font-bold text-xs">N9</span>
            </div>
            <span className="font-display font-bold">NINER SCORE</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built for Farcaster • Powered by Neynar</span>
            <span className="text-muted-foreground/50">•</span>
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
        </div>
      </footer>
    </main>
  );
};

export default Index;
