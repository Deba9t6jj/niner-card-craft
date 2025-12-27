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
    // Base App detection
    const isBaseApp = window.self !== window.top || 
                     window.location.search.includes('mini_app=true') ||
                     navigator.userAgent.includes('Farcaster') ||
                     navigator.userAgent.includes('Base') ||
                     window.location.hostname === 'www.neynar-card-craft.fun';
    
    if (isBaseApp) {
      console.log('🔍 Base/Farcaster Mini App detected');
      
      // Method 1: Send multiple ready signals
      const sendReadySignal = () => {
        // Base App expects this exact format
        const message = {
          type: 'ready',
          data: {
            version: '1.0.0',
            app: 'Niner Score',
            url: window.location.href,
            timestamp: Date.now()
          }
        };
        
        console.log('📤 Sending ready signal:', message);
        window.parent.postMessage(message, '*');
      };
      
      // Send immediately
      sendReadySignal();
      
      // Send multiple times (Base App might miss first)
      const intervals = [100, 500, 1000, 2000, 3000, 5000];
      intervals.forEach(delay => {
        setTimeout(sendReadySignal, delay);
      });
      
      // Listen for Base response
      window.addEventListener('message', (event) => {
        console.log('📩 Received message:', event.data);
        
        if (event.data && event.data.type === 'ready_ack') {
          console.log('✅ Base App acknowledged ready signal');
        }
        
        if (event.data && event.data.type === 'ping') {
          // Respond to ping
          window.parent.postMessage({
            type: 'pong',
            timestamp: Date.now()
          }, '*');
        }
      });
      
      // Add Base App class to body
      document.body.classList.add('base-app');
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      
      // Method 2: Try Base App SDK if available
      if (window.base) {
        console.log('🎯 Base App SDK found');
        window.base.ready();
      }
      
      // Method 3: Try Farcaster Frame API
      if (window.farcaster) {
        console.log('🎯 Farcaster SDK found');
        window.farcaster.ready();
      }
    }
  }, []);
  
  return null;
};
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
