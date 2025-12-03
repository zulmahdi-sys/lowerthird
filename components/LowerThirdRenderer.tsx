
import React, { useState, useEffect } from 'react';
import { LowerThirdConfig, ThemeType, AnimationType } from '../types';

interface LowerThirdRendererProps {
  config: LowerThirdConfig;
}

// Sub-component for Clock to handle interval internally
const ClockWidget: React.FC<{ fontFamily: string; color: string }> = ({ fontFamily, color }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-lg font-bold shadow-xl border-l-4 flex flex-col items-end"
      style={{ fontFamily, borderColor: color }}
    >
      <span className="leading-none">{time.toLocaleTimeString()}</span>
      <span className="text-xs opacity-70 uppercase tracking-wider font-medium mt-1">{time.toLocaleDateString()}</span>
    </div>
  );
};

// Sub-component for Live Badge
const LiveBadge: React.FC = () => (
  <div className="flex items-center bg-red-600 text-white text-sm font-black px-3 py-1.5 rounded-md gap-2 shadow-lg animate-pulse uppercase tracking-widest">
    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse-dot"></div>
    LIVE
  </div>
);

export const LowerThirdRenderer: React.FC<LowerThirdRendererProps> = ({ config }) => {
  const { 
    headline, subheadline, theme, primaryColor, secondaryColor, 
    isVisible, previewMode, fontFamily, animationType, tickerText, showLiveBadge, showClock 
  } = config;

  // Calculate effective visibility: Shown if "Live" OR in "Preview Mode"
  const show = isVisible || previewMode;

  // Calculate dynamic animation styles based on selected type
  const getAnimationStyles = (): React.CSSProperties => {
    const duration = '0.8s';
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const transition = `all ${duration} ${ease}`;
    const baseStyle = { transition };

    switch (animationType) {
      case AnimationType.FADE:
        return { ...baseStyle, opacity: show ? 1 : 0 };
      case AnimationType.TYPEWRITER:
        return {
          ...baseStyle,
          clipPath: show ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          opacity: 1,
        };
      case AnimationType.SLIDE:
      default:
        return {
          ...baseStyle,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(2rem)',
        };
    }
  };

  const animationStyle = getAnimationStyles();

  const renderContent = () => {
    switch (theme) {
      case ThemeType.NEWS:
        return (
          <div className="flex flex-col items-start" style={animationStyle}>
            <div className="px-6 py-2 shadow-lg" style={{ backgroundColor: primaryColor }}>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily }}>
                {headline}
              </h1>
            </div>
            <div className="px-4 py-1 shadow-md -mt-1 ml-4" style={{ backgroundColor: secondaryColor }}>
              <h2 className="text-lg font-medium text-black uppercase tracking-wide" style={{ fontFamily }}>
                {subheadline}
              </h2>
            </div>
          </div>
        );

      case ThemeType.GAMING:
        return (
          <div className="relative group" style={animationStyle}>
            <div className="relative overflow-hidden">
                {/* Slanted Background */}
                <div 
                  className="absolute inset-0 transform -skew-x-12 scale-110 translate-x-4"
                  style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderLeft: `6px solid ${primaryColor}` }}
                ></div>
                
                <div className="relative px-8 py-4 flex flex-col z-10">
                  <h1 className="text-3xl font-black italic text-white tracking-tighter" style={{ textShadow: `2px 2px 0px ${primaryColor}`, fontFamily }}>
                    {headline}
                  </h1>
                  <h2 className="text-xl font-bold text-gray-300 uppercase tracking-widest text-sm mt-1" style={{ fontFamily }}>
                    {subheadline}
                  </h2>
                </div>
            </div>
          </div>
        );

      case ThemeType.MINIMAL:
        return (
          <div className="flex flex-col items-start" style={animationStyle}>
             <div className="backdrop-blur-md bg-white/10 border-l-4 border-white px-6 py-4 rounded-r-xl shadow-2xl">
              <h1 className="text-2xl font-light text-white" style={{ fontFamily }}>
                {headline}
              </h1>
              <h2 className="text-sm font-semibold uppercase tracking-widest mt-1" style={{ color: primaryColor, fontFamily }}>
                {subheadline}
              </h2>
            </div>
          </div>
        );

      case ThemeType.MODERN:
      default:
        return (
          <div className="flex flex-col items-start" style={animationStyle}>
            <div className="flex items-center">
              <div className="h-16 w-2" style={{ backgroundColor: primaryColor }}></div>
              <div className="bg-white px-6 py-3 shadow-xl rounded-r-lg">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight" style={{ fontFamily }}>
                  {headline}
                </h1>
                <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: secondaryColor, fontFamily }}>
                  {subheadline}
                </h2>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* 
        Top Right Widgets (Independent of Lower Third Visibility) 
        These stay visible even if the name graphic is hidden, as long as the checkbox is checked.
      */}
      <div className="fixed top-8 right-8 flex flex-col items-end gap-3 z-50 pointer-events-none">
        {showLiveBadge && <LiveBadge />}
        {showClock && <ClockWidget fontFamily={fontFamily} color={primaryColor} />}
      </div>

      {/* Main Lower Third Graphic */}
      <div className="pointer-events-none select-none">
        {renderContent()}
      </div>

      {/* Full Width Ticker at the absolute bottom of the screen */}
      {show && tickerText && (
         <div 
           className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md text-white overflow-hidden py-2 border-t-2 z-50"
           style={{ borderColor: primaryColor }}
         >
           <div className="whitespace-nowrap animate-ticker inline-block min-w-full pl-[100%]">
             <span className="text-lg font-medium tracking-wide" style={{ fontFamily }}>
               {tickerText}
             </span>
           </div>
         </div>
      )}
    </>
  );
};
