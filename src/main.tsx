import { sdk } from '@farcaster/miniapp-sdk';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize the Mini App SDK
async function initMiniApp() {
  try {
    // Call ready to hide splash screen - must be called for the app to work
    await sdk.actions.ready();
    console.log('Farcaster Mini App SDK ready');
  } catch (error) {
    // Not running in a Farcaster client, that's okay
    console.log('Not in Farcaster Mini App context:', error);
  }
}

// Render the app
createRoot(document.getElementById("root")!).render(<App />);

// Initialize SDK after render
initMiniApp();
