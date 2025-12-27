import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from "next-themes";
import { config } from '@/lib/wagmi';
import Index from "./pages/Index";
import Layout from "./pages/Layout";
import Cards from "./pages/Cards";
import Leaderboard from "./pages/Leaderboard";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initializeSdk = async () => {
      try {
        // Signal to Base/Farcaster that the app is ready to display
        await sdk.actions.ready();
        console.log("✅ Base Mini App SDK ready!");
        
        // Optional: Get context about the Mini App environment
        const context = await sdk.context;
        if (context) {
          console.log("📱 Running inside Base Mini App");
          console.log("User FID:", context.user?.fid);
        }
      } catch (error) {
        // App still works outside of Mini App context
        console.log("ℹ️ Running outside Mini App context (web browser)");
      }
    };

    initializeSdk();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="cards" element={<Cards />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="profile/:username" element={<Profile />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
