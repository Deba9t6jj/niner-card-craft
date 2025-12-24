import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Search } from "lucide-react";

interface FarcasterConnectProps {
  onConnect: (username: string) => void;
  isConnecting?: boolean;
}

// Validate Farcaster username format
const isValidUsername = (username: string): boolean => {
  // Farcaster usernames: 1-16 chars, alphanumeric, can include dots and dashes
  // Also allow .eth suffix
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,19}(\.eth)?$/.test(username);
};

export const FarcasterConnect = ({ onConnect, isConnecting = false }: FarcasterConnectProps) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim().toLowerCase();
    
    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError("Username is too long");
      return;
    }
    
    if (!isValidUsername(trimmedUsername)) {
      setError("Invalid username format");
      return;
    }
    
    setError(null);
    onConnect(trimmedUsername);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError(null);
  };

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
          Enter your Farcaster username to generate your unique Niner Score
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter username (e.g. dwr.eth)"
            value={username}
            onChange={handleChange}
            className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${error ? 'border-destructive' : ''}`}
            disabled={isConnecting}
            maxLength={25}
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <Button
          type="submit"
          variant="hero"
          disabled={isConnecting || !username.trim()}
          className="relative overflow-hidden group w-full"
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
          {isConnecting ? "Fetching your data..." : "Get My Niner Score"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Powered by Neynar • Secure & Private
      </p>
    </motion.div>
  );
};

export default FarcasterConnect;
