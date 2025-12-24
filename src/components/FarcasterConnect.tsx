import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface FarcasterConnectProps {
  onConnect: () => void;
  isConnecting?: boolean;
}

export const FarcasterConnect = ({ onConnect, isConnecting = false }: FarcasterConnectProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Farcaster Logo */}
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px hsl(263 70% 58% / 0.3)",
            "0 0 40px hsl(263 70% 58% / 0.5)",
            "0 0 20px hsl(263 70% 58% / 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-farcaster flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10 text-foreground"
        >
          <path d="M18.24 3H5.76C4.79 3 4 3.79 4 4.76v14.48c0 .97.79 1.76 1.76 1.76h12.48c.97 0 1.76-.79 1.76-1.76V4.76c0-.97-.79-1.76-1.76-1.76zM8 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-5H8c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1z"/>
        </svg>
      </motion.div>

      <div className="text-center">
        <h3 className="font-display font-bold text-xl text-foreground mb-2">
          Connect Farcaster
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Sign in with your Farcaster account to generate your unique Niner Score
        </p>
      </div>

      <Button
        variant="hero"
        onClick={onConnect}
        disabled={isConnecting}
        className="relative overflow-hidden group"
      >
        {isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-5 h-5" />
          </motion.div>
        ) : (
          <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        {isConnecting ? "Connecting..." : "Connect with Warpcast"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Powered by Neynar • Secure & Private
      </p>
    </motion.div>
  );
};

export default FarcasterConnect;
