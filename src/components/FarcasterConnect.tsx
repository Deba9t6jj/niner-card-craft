import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FarcasterConnectProps {
  onConnect: (fid: number) => void;
  isConnecting?: boolean;
}

// Generate a random nonce for security
const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const FarcasterConnect = ({ onConnect, isConnecting = false }: FarcasterConnectProps) => {
  const [authState, setAuthState] = useState<'idle' | 'pending' | 'polling' | 'success' | 'error'>('idle');
  const [channelToken, setChannelToken] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Start the Sign In with Farcaster flow
  const startAuth = async () => {
    setAuthState('pending');
    setErrorMessage(null);

    try {
      // Call our edge function to create a sign-in channel
      const { data, error } = await supabase.functions.invoke('farcaster-auth', {
        body: { 
          action: 'create_signin_channel',
          nonce: generateNonce(),
        },
      });

      if (error) throw new Error(error.message);

      if (data?.channelToken && data?.url) {
        setChannelToken(data.channelToken);
        setAuthUrl(data.url);
        setAuthState('polling');
        
        // Open Warpcast in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('Invalid response from auth server');
      }
    } catch (err) {
      console.error('Auth start error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start authentication');
      setAuthState('error');
    }
  };

  // Poll for authentication completion
  useEffect(() => {
    if (authState !== 'polling' || !channelToken) return;

    let pollCount = 0;
    const maxPolls = 60; // 2 minutes max (2s intervals)

    const pollInterval = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(pollInterval);
        setAuthState('error');
        setErrorMessage('Authentication timed out. Please try again.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('farcaster-auth', {
          body: { 
            action: 'check_signin_status',
            channelToken,
          },
        });

        if (error) {
          console.error('Poll error:', error);
          return;
        }

        if (data?.state === 'completed' && data?.fid) {
          clearInterval(pollInterval);
          setAuthState('success');
          
          toast({
            title: "Connected!",
            description: "Successfully authenticated with Farcaster",
          });
          
          // Give a moment for the UI to update before calling onConnect
          setTimeout(() => onConnect(data.fid), 500);
        } else if (data?.state === 'error') {
          clearInterval(pollInterval);
          setAuthState('error');
          setErrorMessage(data.message || 'Authentication failed');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [authState, channelToken, onConnect, toast]);

  const resetAuth = () => {
    setAuthState('idle');
    setChannelToken(null);
    setAuthUrl(null);
    setErrorMessage(null);
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
          {authState === 'idle' && "Sign in with Warpcast to securely view your Niner Score"}
          {authState === 'pending' && "Starting authentication..."}
          {authState === 'polling' && "Waiting for you to approve in Warpcast..."}
          {authState === 'success' && "Connected! Loading your data..."}
          {authState === 'error' && (errorMessage || "Something went wrong")}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {authState === 'idle' && (
          <Button
            onClick={startAuth}
            variant="hero"
            disabled={isConnecting}
            className="relative overflow-hidden group w-full"
          >
            <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Sign in with Farcaster
          </Button>
        )}

        {authState === 'pending' && (
          <Button disabled variant="hero" className="w-full">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Starting...
          </Button>
        )}

        {authState === 'polling' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <Button disabled variant="outline" className="w-full">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Waiting for approval...
            </Button>
            
            {authUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(authUrl, '_blank')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Warpcast again
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAuth}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        )}

        {authState === 'success' && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Connected!</span>
          </div>
        )}

        {authState === 'error' && (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
            <Button onClick={resetAuth} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Secure authentication via Warpcast
      </p>
    </motion.div>
  );
};

export default FarcasterConnect;
