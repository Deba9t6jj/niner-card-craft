import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
}

interface MiniAppContextType {
  isMiniApp: boolean;
  farcasterUser: FarcasterUser | null;
  setFarcasterUser: (user: FarcasterUser | null) => void;
  baseAppReady: boolean;
  user: FarcasterUser | null; // Alias for farcasterUser
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export const useMiniApp = () => {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error('useMiniApp must be used within MiniAppProvider');
  }
  return context;
};

interface MiniAppProviderProps {
  children: ReactNode;
}

export const MiniAppProvider: React.FC<MiniAppProviderProps> = ({ children }) => {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [baseAppReady, setBaseAppReady] = useState(false);

  useEffect(() => {
    const detectMiniApp = () => {
      const embedded = window.self !== window.top;
      const hasMiniAppParam = window.location.search.includes('mini_app=true') ||
                             window.location.search.includes('frame=true');
      const isFarcasterUA = navigator.userAgent.includes('Farcaster') ||
                           navigator.userAgent.includes('Warpcast');
      
      const detected = embedded || hasMiniAppParam || isFarcasterUA;
      setIsMiniApp(detected);
      
      if (detected) {
        console.log('Mini App mode activated');
        document.body.classList.add('mini-app');
        
        window.addEventListener('message', (event) => {
          if (event.data.type === 'farcaster_user') {
            console.log('Farcaster user received:', event.data.user);
            setFarcasterUser(event.data.user);
          }
          
          if (event.data.type === 'base_ready') {
            console.log('Base App is ready');
            setBaseAppReady(true);
          }
        });
      }
    };
    
    detectMiniApp();
  }, []);

  return (
    <MiniAppContext.Provider 
      value={{ 
        isMiniApp, 
        farcasterUser, 
        setFarcasterUser,
        baseAppReady,
        user: farcasterUser // Alias for farcasterUser
      }}
    >
      {children}
    </MiniAppContext.Provider>
  );
};
