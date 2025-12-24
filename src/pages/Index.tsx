import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";

const Index = () => {
  const { isConnecting, isConnected, data, connectByUsername, disconnect, refresh } = useFarcasterAuth();

  if (isConnected && data) {
    return <Dashboard data={data} onDisconnect={disconnect} onRefresh={refresh} isRefreshing={isConnecting} />;
  }

  return (
    <main className="relative">
      <HeroSection onConnect={connectByUsername} isConnecting={isConnecting} />
      
      {/* Features section */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
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
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors group"
              >
                <div className="absolute -top-4 left-8">
                  <span className="font-display font-black text-5xl text-muted/30 group-hover:text-primary/30 transition-colors">
                    {item.step}
                  </span>
                </div>
                <div className="text-4xl mb-4 mt-4">{item.icon}</div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers section */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
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

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                tier: "Bronze",
                range: "0-250",
                color: "card-bronze",
                glow: "glow-bronze",
                perks: ["Basic NFT Card", "Profile Badge", "Community Access"],
              },
              {
                tier: "Silver",
                range: "251-500",
                color: "card-silver",
                glow: "glow-silver",
                perks: ["Animated Card", "Silver Badge", "Early Access"],
              },
              {
                tier: "Gold",
                range: "501-800",
                color: "card-gold",
                glow: "glow-gold",
                perks: ["Holographic Card", "Gold Badge", "Exclusive Drops"],
              },
              {
                tier: "Diamond",
                range: "801+",
                color: "card-diamond",
                glow: "glow-diamond",
                perks: ["Legendary Card", "Diamond Badge", "VIP Perks"],
              },
            ].map((item, index) => (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 ${item.color} ${item.glow} holographic`}
              >
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-1">
                    {item.tier}
                  </h3>
                  <p className="text-sm text-foreground/70 mb-4">{item.range} pts</p>
                  <ul className="space-y-2">
                    {item.perks.map((perk) => (
                      <li key={perk} className="text-sm text-foreground/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
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
        
        <div className="relative z-10 container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-black text-4xl md:text-6xl mb-6">
              READY TO CLAIM YOUR <span className="text-gradient-primary">IDENTITY</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of Farcaster users who've already claimed their unique NFT cards.
            </p>
          </motion.div>
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
