import { sdk } from '@farcaster/miniapp-sdk';
import React, { useEffect } from 'react';
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

const queryClient = new QueryClient();

// Check if we're in Base App context
const isInBaseApp = () => {
  if (typeof window === 'undefined') return false;
  
  // Check multiple ways Base App might signal
  const isIframe = window.self !== window.top;
  const hasBaseParam = window.location.search.includes('mini_app') || 
                      window.location.search.includes('base') ||
                      window.location.search.includes('farcaster');
  const parentIsBase = window.parent && 
                      (window.parent.location.hostname.includes('base.org') ||
                       window.parent.location.hostname.includes('farcaster.xyz'));
  
  return isIframe || hasBaseParam || parentIsBase;
};

const App = () => {
  useEffect(() => {
    console.log('🔍 Checking Base App context...');
    console.log('Is iframe?', window.self !== window.top);
    console.log('URL params:', window.location.search);
    console.log('Parent:', window.parent?.location?.hostname);
    
    if (isInBaseApp()) {
      console.log('✅ IN BASE APP CONTEXT - Calling ready()');
      
      // Multiple attempts to call ready()
      const callReady = () => {
        try {
          if (window.sdk && window.sdk.actions) {
            window.sdk.actions.ready()
              .then(() => console.log('🎉 Base SDK ready() successful!'))
              .catch(e => console.log('Base SDK ready() error:', e));
          } else if (sdk && sdk.actions) {
            sdk.actions.ready()
              .then(() => console.log('🎉 Base SDK ready() successful!'))
              .catch(e => console.log('Base SDK ready() error:', e));
          }
        } catch (error) {
          console.log('Error calling ready():', error);
        }
      };
      
      // Call immediately
      callReady();
      
      // Call multiple times with delays
      setTimeout(callReady, 100);
      setTimeout(callReady, 500);
      setTimeout(callReady, 1000);
      setTimeout(callReady, 2000);
      
      // Also try window.postMessage method
      if (window.parent && window.parent !== window) {
        window.parent.postMessage('mini_app_ready', '*');
        window.parent.postMessage({ type: 'ready', app: 'niner-card-craft' }, '*');
      }
    } else {
      console.log('🌐 Running as normal web app (not in Base context)');
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <MiniAppProvider>
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
          </MiniAppProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
