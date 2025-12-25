import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/components/WalletProvider";
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Simple solution for Base Mini App - SDK ছাড়াই
    const initializeForBase = async () => {
      console.log("🚀 Niner Score Mini App loading for Base...");
      
      // Method 1: Check if we're in Base app (iframe)
      if (window.parent !== window) {
        console.log("📱 Running inside Base app iframe");
        
        // Send ready signal to Base
        setTimeout(() => {
          try {
            window.parent.postMessage({
              type: 'farcaster:ready',
              ready: true,
              version: '1.0.0'
            }, '*');
            console.log("✅ Ready signal sent to Base app");
          } catch (e) {
            console.log("⚠️ Could not send ready signal, continuing anyway");
          }
        }, 500);
      }
      
      // Method 2: Try to use SDK if available
      if (typeof window !== 'undefined' && window.sdk) {
        try {
          await window.sdk.actions.ready();
          console.log("✅ SDK ready() called successfully");
        } catch (sdkError) {
          console.log("ℹ️ SDK not available, using fallback");
        }
      }
    };
    
    initializeForBase();
  }, []);

  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WalletProvider>
  );
};

export default App;
