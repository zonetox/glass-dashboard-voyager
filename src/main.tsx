import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGA, initPixel } from './lib/tracking'

// Initialize tracking in production
if (import.meta.env.PROD) {
  initGA();
  initPixel();
}

createRoot(document.getElementById("root")!).render(<App />);
