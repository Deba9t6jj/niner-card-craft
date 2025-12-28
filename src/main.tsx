import { sdk } from '@farcaster/miniapp-sdk';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Render the app first
createRoot(document.getElementById("root")!).render(<App />);

// Call sdk.actions.ready() after DOM is ready to hide the splash screen
// Using setTimeout to ensure React has mounted
setTimeout(() => {
  sdk.actions.ready().catch(console.error);
}, 0);
