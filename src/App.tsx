import React, { useEffect, useState } from 'react';
import { init, actions } from '@farcaster/frame-sdk';
import './App.css';

function App() {
  const [isInFrame, setIsInFrame] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Initialize Frame SDK
  useEffect(() => {
    const initializeFrame = async () => {
      try {
        await init();
        setIsInFrame(true);
        console.log('✅ Frame SDK initialized');

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