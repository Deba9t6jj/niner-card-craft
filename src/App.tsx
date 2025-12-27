import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from "next-themes";
import { config } from '@/lib/wagmi';
import { MiniAppProvider } from '@/contexts/MiniAppContext';
import Index from "./pages/Index";
import Layout from "./pages/Layout";
import Cards from "./pages/Cards";
import Leaderboard from "./pages/Leaderboard";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import { useEffect } from "react";

const queryClient = new QueryClient();

const BaseAppInitializer = () => {
  useEffect(() => {
    const isBaseApp = window.self !== window.top || 
                     window.location.search.includes('mini_app=true') ||
                     navigator.userAgent.includes('Farcaster') ||
                     navigator.userAgent.includes('Base');
    
    if (isBaseApp) {
      console.log('Base/Farcaster Mini App detected');
      
      const sendReadySignal = () => {
        window.parent.postMessage({
          type: 'ready',
          version: '1.0.0',
          app: 'Niner Score',
          timestamp: Date.now()
        }, '*');
      };
      
      sendReadySignal();
      setTimeout(sendReadySignal, 1000);
      setTimeout(sendReadySignal, 3000);
      
      window.addEventListener('message', (event) => {
        if (event.data.type === 'base_ready') {
          console.log('Base App confirmed ready');
        }
      });
    }
  }, []);
  
  return null;
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <MiniAppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BaseAppInitializer />
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
          </MiniAppProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
