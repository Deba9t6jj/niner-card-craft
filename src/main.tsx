import { sdk } from '@farcaster/miniapp-sdk';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Call ready immediately before React renders
sdk.actions.ready().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
