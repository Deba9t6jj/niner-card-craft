import { sdk } from '@farcaster/miniapp-sdk';
import React, { useEffect, useState } from 'react';

// Extend Window interface for Base App
declare global {
  interface Window {
    sendToBaseApp?: () => void;
  }
}
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
import { useCallback } from "react";

const queryClient = new QueryClient();

// Global Base App initialization - RUNS BEFORE REACT
(function() {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 NINER SCORE - Base App Initialization Started');
  
  const isInIframe = window.self !== window.top;
  const hasBaseParam = window.location.search.includes('mini_app') || 
                      window.location.search.includes('base') ||
                      window.location.search.includes('farcaster');
  
  if (isInIframe || hasBaseParam) {
    console.log('✅ CONFIRMED: Running inside Base App/Farcaster');
    
    // Mark body for styling
    document.body.classList.add('base-app-active');
    
    // Send ready signal IMMEDIATELY
    const sendReadyNow = () => {
      try {
        if (window.parent && window.parent !== window) {
          // Send 10 different signal formats
          const signals = [
            'READY_FROM_NINER_SCORE',
            'ready',
            'mini_app_ready',
            JSON.stringify({type: 'ready', app: 'niner-score', version: '1.0.0'}),
            JSON.stringify({status: 'ready', source: 'niner-score-mini-app'}),
            JSON.stringify({event: 'app_ready', payload: {app: 'Niner Score'}}),
            JSON.stringify({action: 'ready', timestamp: Date.now()}),
            JSON.stringify({miniAppReady: true}),
            JSON.stringify({readyState: 'complete'}),
            JSON.stringify({appStatus: 'ready'})
          ];
          
          signals.forEach(signal => {
            try {
              window.parent.postMessage(signal, '*');
              console.log('📤 Sent to Base:', signal.length > 50 ? signal.substring(0, 50) + '...' : signal);
            } catch(e) {}
          });
        }
      } catch(error) {
        console.log('Error sending ready:', error);
      }
    };
    
    // Send immediately
    sendReadyNow();
    
    // Send multiple times
    [50, 100, 200, 300, 500, 800, 1200, 2000, 3000, 5000].forEach(delay => {
      setTimeout(sendReadyNow, delay);
    });
    
    // Send on page load
    window.addEventListener('load', () => {
      setTimeout(sendReadyNow, 100);
    });
    
    // Send on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(sendReadyNow, 50);
    });
    
    // Listen for Base response
    window.addEventListener('message', (event) => {
      if (event.data && (
          event.data === 'ack' ||
          event.data === 'acknowledged' ||
          event.data?.type === 'ready_ack' ||
          event.data?.status === 'received' ||
          event.data?.acknowledged === true
      )) {
        console.log('🎉 Base App ACKNOWLEDGED our ready signal!');
        document.body.classList.add('base-app-connected');
      }
    });
    
    // Expose function for React
    window.sendToBaseApp = sendReadyNow;
  }
})();

const BaseAppInitializer = () => {
  const [baseConnected, setBaseConnected] = useState(false);
  
  const sendReadySignal = useCallback(() => {
    if (window.self !== window.top && window.parent) {
      // Send DIRECT signal that Base App expects
      const baseSignal = {
        type: 'mini_app_ready',
        app: 'Niner Score',
        version: '1.0.0',
        url: window.location.href,
        timestamp: Date.now(),
        ready: true
      };
      
      console.log('🎯 Sending Base App signal:', baseSignal);
      
      try {
        window.parent.postMessage(baseSignal, '*');
        window.parent.postMessage('BASE_APP_READY', '*');
        
        // Also try the EXACT format Base might expect
        window.parent.postMessage({
          event: 'mini_app_init',
          data: { app: 'niner-score', status: 'ready' }
        }, '*');
      } catch(error) {
        console.log('Send error:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    console.log('🔧 BaseAppInitializer mounted');
    
    const isBaseApp = window.self !== window.top;
    
    if (isBaseApp) {
      console.log('⚡ INSIDE BASE APP - Initializing...');
      
      // Send signal from React component too
      sendReadySignal();
      
      // Send multiple times from React
      [100, 300, 600, 1000, 1500, 2500].forEach(delay => {
        setTimeout(sendReadySignal, delay);
      });
      
      // Listen for Base response
      const handleMessage = (event) => {
        console.log('📨 Message from parent:', event.data);
        
        // Check for ANY acknowledgment
        if (
          event.data === 'ready_received' ||
          event.data === 'ack' ||
          (event.data && (
            event.data.type === 'ack' ||
            event.data.acknowledged === true ||
            event.data.status === 'connected'
          ))
        ) {
          console.log('✅ BASE APP CONNECTED SUCCESSFULLY!');
          setBaseConnected(true);
          document.title = '✅ ' + document.title;
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [sendReadySignal]);
  
  // Show connection status in UI (optional)
  if (baseConnected) {
    console.log('🏁 Base App connection ESTABLISHED');
  }
  
  return null;
};

const App = () => {
  // Base Mini App SDK ready signal
  useEffect(() => {
    sdk.actions.ready();
  }, []);

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