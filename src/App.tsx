import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk"; // এখানে পরিবর্তন
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
    const initializeSDK = async () => {
      try {
        console.log("Base MiniApp loaded - Initializing SDK...");
        await sdk.actions.ready();
        console.log("✅ SDK ready! Mini app is now visible in Base");
      } catch (error) {
        console.error("❌ Failed to initialize Base MiniApp SDK:", error);
      }
    };
    
    initializeSDK();
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
