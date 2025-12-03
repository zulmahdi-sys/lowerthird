
import React, { useState, useEffect } from 'react';
import { LowerThirdRenderer } from './components/LowerThirdRenderer';
import { ControlPanel } from './components/ControlPanel';
import { LowerThirdConfig, ThemeType, Position, AnimationType } from './types';

// Generate 10 empty slots
const initialSlots = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  headline: i === 0 ? 'John Doe' : `Headline ${i + 1}`,
  subheadline: i === 0 ? 'Software Engineer & Streamer' : `Subheadline Description ${i + 1}`
}));

// Default configuration
const DEFAULT_CONFIG: LowerThirdConfig = {
  headline: initialSlots[0].headline,
  subheadline: initialSlots[0].subheadline,
  theme: ThemeType.MODERN,
  fontFamily: 'Inter',
  animationType: AnimationType.SLIDE,
  primaryColor: '#6366f1', // Indigo 500
  secondaryColor: '#f3f4f6', // Gray 100
  position: Position.BOTTOM_LEFT,
  isVisible: true,
  previewMode: false,
  tickerText: 'Welcome to the stream! Don\'t forget to follow and subscribe for more content.',
  showLiveBadge: true,
  showClock: true,
  contentSlots: initialSlots,
  activeSlotId: 1
};

function App() {
  const [config, setConfig] = useState<LowerThirdConfig>(DEFAULT_CONFIG);
  const [isBroadcastMode, setIsBroadcastMode] = useState(false);

  // Check for 'broadcast' query param on load (for OBS/vMix)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('broadcast') === 'true') {
      setIsBroadcastMode(true);
    }
  }, []);

  // Toggle for the "Clean View" / Transparent mode
  const toggleBroadcastMode = () => {
    setIsBroadcastMode(!isBroadcastMode);
  };

  // Keyboard shortcut to toggle visibility (Spacebar) - useful for streamers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if not typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setConfig(prev => ({ ...prev, isVisible: !prev.isVisible }));
      }
      if (e.key === 'Escape' && isBroadcastMode) {
        setIsBroadcastMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBroadcastMode]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isBroadcastMode ? 'bg-transparent' : 'bg-gray-100'}`}>
      
      {/* Global Styles for Animations */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 20s linear infinite;
        }
        @keyframes pulse-dot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s infinite ease-in-out;
        }
      `}</style>

      {/* 
        PREVIEW / OUTPUT AREA 
        This is the area OBS will capture via Browser Source.
        If in Broadcast mode: Background is Transparent (bg-transparent).
        If in Editor mode: Background is a checkerboard pattern.
      */}
      <div className={`flex-1 relative flex flex-col transition-colors duration-300`}>
        
        {/* Checkerboard background for Editor Mode */}
        {!isBroadcastMode && (
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
               }}>
          </div>
        )}

        {/* 
          Main Content Container
          We use absolute positioning logic inside the Renderer to handle "position",
          but the Ticker is usually fixed at the very bottom.
        */}
        <div className={`flex-1 relative w-full flex ${config.position} pb-16 px-12 z-10`}>
           <LowerThirdRenderer config={config} />
        </div>

        {/* Instructions overlay for Editor Mode */}
        {!isBroadcastMode && (
          <div className="absolute top-4 left-4 p-4 text-gray-400 pointer-events-none z-0">
            <h1 className="text-2xl font-black text-gray-300">PREVIEW</h1>
            <p className="text-sm">Configure your lower third on the right.</p>
            <p className="text-xs mt-2 text-indigo-400">
              OBS SETUP: Use the generated URL in the Control Panel as a Browser Source.
            </p>
          </div>
        )}

        {/* Exit Broadcast Mode Button (Only visible in Broadcast Mode on hover) */}
        {isBroadcastMode && (
          <button 
            onClick={toggleBroadcastMode}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white px-4 py-2 rounded text-sm opacity-0 hover:opacity-100 transition-opacity z-50"
          >
            Exit Broadcast Mode (ESC)
          </button>
        )}
      </div>

      {/* 
        CONTROL PANEL 
        Hidden when in Broadcast Mode
      */}
      {!isBroadcastMode && (
        <ControlPanel 
          config={config} 
          setConfig={setConfig} 
          isBroadcastMode={isBroadcastMode}
          toggleBroadcastMode={toggleBroadcastMode}
        />
      )}
    </div>
  );
}

export default App;
