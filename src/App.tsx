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
import { useEffect, useCallback } from "react";

const queryClient = new QueryClient();

const BaseAppInitializer = () => {
  const sendReadySignal = useCallback(() => {
    // Try ALL possible message formats that Base App might accept
    const messages = [
      { type: 'ready' },
      { type: 'mini_app_ready' },
      { type: 'app_ready', app: 'Niner Score', version: '1.0.0' },
      'ready',
      'mini_app_ready',
      { status: 'ready', app: 'niner-score' },
      { event: 'ready', source: 'mini-app' }
    ];
    
    messages.forEach(msg => {
      try {
        console.log('📤 Sending message to Base:', msg);
        window.parent.postMessage(msg, '*');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    });
  }, []);

  useEffect(() => {
    // Detect if running inside Base App
    const isBaseApp = () => {
      // Check multiple indicators
      const checks = [
        window.self !== window.top, // Embedded in iframe
        window.location.search.includes('mini_app=true'),
        window.location.search.includes('frame=true'),
        window.location.search.includes('base_app=true'),
        document.referrer.includes('base.org'),
        document.referrer.includes('farcaster'),
        window.name.includes('base') || window.name.includes('farcaster')
      ];
      
      return checks.some(check => check === true);
    };

    if (isBaseApp()) {
      console.log('✅ Detected Base/Farcaster environment');
      
      // Add CSS class for styling
      document.body.classList.add('base-app-environment');
      
      // Send ready signal immediately
      sendReadySignal();
      
      // Send multiple times (Base might miss first)
      const retryIntervals = [100, 300, 600, 1000, 2000, 5000];
      retryIntervals.forEach(interval => {
        setTimeout(sendReadySignal, interval);
      });
      
      // Listen for response from Base
      const messageHandler = (event: MessageEvent) => {
        console.log('📩 Received message from parent:', event.data);
        
        if (event.data?.type === 'ready_ack' || 
            event.data === 'ready_ack' ||
            event.data?.status === 'acknowledged') {
          console.log('🎉 Base App acknowledged ready signal!');
          // You can update UI state here if needed
        }
        
        // Handle Farcaster user data if sent
        if (event.data?.type === 'farcaster_user') {
          console.log('👤 Received Farcaster user:', event.data.user);
          // Store in localStorage or context
          localStorage.setItem('farcaster_user', JSON.stringify(event.data.user));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Cleanup
      return () => {
        window.removeEventListener('message', messageHandler);
      };
    } else {
      console.log('🌐 Running in regular browser mode');
    }
  }, [sendReadySignal]);
  
  return null;
};

// Global initialization (runs before React)
if (typeof window !== 'undefined') {
  // Try to send a ready signal even before React loads
  if (window.self !== window.top) {
    setTimeout(() => {
      window.parent.postMessage('ready', '*');
    }, 100);
  }
}

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
