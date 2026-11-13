import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign legacy GLTF extension notice from Three.js GLTFLoader
const origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('KHR_materials_pbrSpecularGlossiness')
  ) {
    return;
  }
  origWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
