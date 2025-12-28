<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { init, actions } from '@farcaster/frame-sdk';
import './App.css';
=======
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
import { useEffect, useCallback, useState } from "react";
>>>>>>> e2090492a8b1134ea762d0f140d6cb54e5ca3461

function App() {
  const [isInFrame, setIsInFrame] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

<<<<<<< HEAD
  // Initialize Frame SDK
  useEffect(() => {
    const initializeFrame = async () => {
      try {
        await init();
        setIsInFrame(true);
        console.log('✅ Frame SDK initialized');
=======
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
>>>>>>> e2090492a8b1134ea762d0f140d6cb54e5ca3461

        // Get user address
        const address = await actions.getAddress();
        if (address) {
          setUserAddress(address);
          console.log('👤 User address:', address);
        }

        // Get user context
        const context = await actions.getContext();
        console.log('📱 Frame context:', context);

      } catch (error) {
        console.log('⚠️ Not in Farcaster frame, running as normal web app');
        setIsInFrame(false);
      }
    };

    initializeFrame();
  }, []);

  // Function to handle frame actions
  const handleFrameAction = async (actionType: string) => {
    if (!isInFrame) return;

    try {
      switch (actionType) {
        case 'mint':
          // Mint NFT card
          await actions.mint({
            contractAddress: '0xYourContractAddress',
            tokenId: '1',
            chainId: 8453, // Base chain ID
          });
          break;
        
        case 'transaction':
          // Send transaction
          await actions.transaction({
            to: '0xRecipientAddress',
            value: '0.01',
            chainId: 8453,
          });
          break;

        case 'openUrl':
          await actions.openUrl({
            url: 'https://www.neynar-card-craft.fun/create',
            openInNewTab: true,
          });
          break;
      }
    } catch (error) {
      console.error('Frame action error:', error);
    }
  };

  // Function to get user data
  const fetchUserData = async () => {
    if (userAddress && isInFrame) {
      try {
        // You can fetch user data from your backend
        const response = await fetch(`/api/user/${userAddress}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchUserData();
    }
  }, [userAddress]);

  return (
    <div className="App">
      {/* Frame Indicator Banner */}
      {isInFrame && (
        <div className="frame-indicator">
          <div className="frame-badge">
            <span>⚡</span> Base Mini App Mode
          </div>
          {userAddress && (
            <div className="user-wallet">
              Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </div>
          )}
        </div>
      )}

      {/* Your Existing Website Header */}
      <header className="App-header">
        <h1>Neynar Card Craft</h1>
        <p>Create beautiful cards and share them on Farcaster</p>
        
        {isInFrame && (
          <div className="frame-actions">
            <button 
              className="frame-btn"
              onClick={() => handleFrameAction('mint')}
            >
              🎴 Mint Card as NFT
            </button>
            <button 
              className="frame-btn"
              onClick={() => handleFrameAction('openUrl')}
            >
              🔗 Open Full App
            </button>
          </div>
        )}
      </header>

      {/* Your Main Content Area */}
      <main className="App-main">
        <section className="card-creator">
          <h2>Create Your Card</h2>
          <div className="creator-container">
            {/* Add your existing card creation UI here */}
            <div className="card-preview">
              {/* Card preview content */}
            </div>
            <div className="card-controls">
              {/* Card customization controls */}
            </div>
          </div>
        </section>

        {/* Frame-specific features */}
        {isInFrame && (
          <section className="frame-features">
            <h3>🎯 Mini App Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>Direct Minting</h4>
                <p>Mint your card as NFT directly from the frame</p>
              </div>
              <div className="feature-card">
                <h4>Wallet Connected</h4>
                <p>Your wallet is automatically connected</p>
              </div>
              <div className="feature-card">
                <h4>One-Click Share</h4>
                <p>Share to Farcaster with one click</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="App-footer">
        <p>Built with ❤️ for Base & Farcaster</p>
        {isInFrame ? (
          <p className="footer-note">Running as Base Mini App</p>
        ) : (
          <p className="footer-note">
            Visit <a href="https://basedapps.com">basedapps.com</a> to use as Mini App
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;