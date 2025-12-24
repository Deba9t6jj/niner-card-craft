import { motion } from "framer-motion";
import FarcasterConnect from "./FarcasterConnect";

interface HeroSectionProps {
  onConnect: (username: string) => void;
  isConnecting?: boolean;
}

export const HeroSection = ({ onConnect, isConnecting }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-hero overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-farcaster/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-primary/30 backdrop-blur-sm mb-8 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-tier-gold animate-pulse" />
          <span className="text-sm text-foreground/90 font-medium">
            Free NFT Identity Cards for Farcaster
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-black text-5xl md:text-7xl lg:text-8xl mb-6 drop-shadow-2xl"
        >
          <span className="text-foreground drop-shadow-lg">YOUR</span>
          <br />
          <span className="text-gradient-primary drop-shadow-lg">NINER SCORE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 drop-shadow-md"
        >
          Connect your Farcaster account and receive a unique NFT identity card 
          based on your social reputation. Higher scores unlock better tiers.
        </motion.p>

        {/* Tier preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          {[
            { tier: "Bronze", color: "bg-tier-bronze", glow: "shadow-tier-bronze/30" },
            { tier: "Silver", color: "bg-tier-silver", glow: "shadow-tier-silver/30" },
            { tier: "Gold", color: "bg-tier-gold", glow: "shadow-tier-gold/30" },
            { tier: "Diamond", color: "card-diamond", glow: "shadow-tier-diamond/30" },
          ].map((item, index) => (
            <motion.div
              key={item.tier}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`w-12 h-16 md:w-16 md:h-20 rounded-lg ${item.color} shadow-lg ${item.glow} flex items-end justify-center pb-1`}
            >
              <span className="text-[8px] md:text-[10px] font-display font-bold text-foreground/80 uppercase">
                {item.tier}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Connect button */}
        <FarcasterConnect onConnect={onConnect} isConnecting={isConnecting} />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
