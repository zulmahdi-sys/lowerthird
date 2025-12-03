
import React, { useState, useEffect } from 'react';
import { LowerThirdConfig, ThemeType, Position, AnimationType } from '../types';
import { generateLowerThirdContent } from '../services/geminiService';

interface ControlPanelProps {
  config: LowerThirdConfig;
  setConfig: React.Dispatch<React.SetStateAction<LowerThirdConfig>>;
  toggleBroadcastMode: () => void;
  isBroadcastMode: boolean;
}

const AVAILABLE_FONTS = [
  'Inter',
  'Playfair Display',
  'Roboto',
  'Oswald'
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, toggleBroadcastMode, isBroadcastMode }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [broadcastUrl, setBroadcastUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate the URL based on current location
    const url = new URL(window.location.href);
    url.searchParams.set('broadcast', 'true');
    setBroadcastUrl(url.toString());
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(broadcastUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConfig(prev => ({ ...prev, [name]: checked }));
  };

  const handleToggleVisible = () => {
    setConfig(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const handleAIGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateLowerThirdContent(topic);
      
      // Update the ACTIVE slot with AI content
      setConfig(prev => {
        const updatedSlots = prev.contentSlots.map(slot => 
          slot.id === prev.activeSlotId 
            ? { ...slot, headline: result.headline, subheadline: result.subheadline }
            : slot
        );
        
        return {
          ...prev,
          contentSlots: updatedSlots,
          headline: result.headline,
          subheadline: result.subheadline,
          isVisible: true // Auto show on generate
        };
      });
    } catch (e) {
      alert("Failed to generate content. Please check API Key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle switching between slots (making one active)
  const handleSlotSelect = (id: number) => {
    const selectedSlot = config.contentSlots.find(s => s.id === id);
    if (selectedSlot) {
      setConfig(prev => ({
        ...prev,
        activeSlotId: id,
        headline: selectedSlot.headline,
        subheadline: selectedSlot.subheadline
      }));
    }
  };

  // Handle editing a specific slot text
  const handleSlotEdit = (id: number, field: 'headline' | 'subheadline', value: string) => {
    setConfig(prev => {
      const updatedSlots = prev.contentSlots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      );
      
      // If editing the active slot, update the live display immediately
      if (id === prev.activeSlotId) {
        return {
          ...prev,
          contentSlots: updatedSlots,
          [field]: value
        };
      }
      
      return {
        ...prev,
        contentSlots: updatedSlots
      };
    });
  };

  if (isBroadcastMode) return null;

  return (
    <div className="w-full md:w-96 bg-gray-900 border-l border-gray-800 h-full flex flex-col overflow-y-auto shadow-2xl z-50">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-500">◆</span> StreamOverlay AI
          </h2>
          <p className="text-xs text-gray-500 mt-1">OBS / vMix Integration Tool</p>
        </div>

        {/* Master Control */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Master Control</label>
          <button
            onClick={handleToggleVisible}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg ${
              config.isVisible 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            {config.isVisible ? 'HIDE OVERLAY' : 'SHOW OVERLAY'}
          </button>
        </div>

        {/* OBS / vMix Integration Link */}
        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
           <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
             <span>🔗 OBS / vMix Browser URL</span>
           </label>
           <p className="text-[10px] text-gray-500">Copy this URL into your streaming software's Browser Source.</p>
           <div className="flex gap-2">
             <input
              type="text"
              readOnly
              value={broadcastUrl}
              className="flex-1 bg-gray-900 text-gray-400 text-xs px-2 py-2 rounded border border-gray-700 focus:outline-none select-all"
             />
             <button 
              onClick={handleCopyUrl}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs font-bold transition-colors w-16"
             >
               {copied ? 'OK' : 'COPY'}
             </button>
           </div>
        </div>

        {/* AI Generator */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
           <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
             <span>✨ AI Content Generator</span>
           </label>
           <p className="text-[10px] text-gray-500">Generates text for the currently selected slot.</p>
           <div className="flex gap-2">
             <input
              type="text"
              placeholder="Topic (e.g. Tech News, Speedrun)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-gray-950 text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none"
             />
             <button 
              onClick={handleAIGenerate}
              disabled={isGenerating || !topic}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
               {isGenerating ? '...' : 'Gen'}
             </button>
           </div>
        </div>

        {/* Content Editor List */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase">Content Slots (10)</label>
          
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {config.contentSlots.map((slot) => {
              const isActive = slot.id === config.activeSlotId;
              return (
                <div 
                  key={slot.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-indigo-900/20 border-indigo-500 shadow-md' 
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="pt-2">
                       <input 
                         type="radio" 
                         name="activeSlot" 
                         checked={isActive}
                         onChange={() => handleSlotSelect(slot.id)}
                         className="h-4 w-4 text-indigo-600 bg-gray-800 border-gray-600 focus:ring-indigo-500 cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder={`Headline ${slot.id}`}
                        value={slot.headline}
                        onChange={(e) => handleSlotEdit(slot.id, 'headline', e.target.value)}
                        className={`w-full text-sm px-2 py-1 rounded border focus:outline-none ${
                          isActive 
                            ? 'bg-gray-900 text-white border-indigo-500/50' 
                            : 'bg-gray-950 text-gray-300 border-gray-700 focus:border-gray-500'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Sub-Headline"
                        value={slot.subheadline}
                        onChange={(e) => handleSlotEdit(slot.id, 'subheadline', e.target.value)}
                        className={`w-full text-xs px-2 py-1 rounded border focus:outline-none ${
                          isActive 
                            ? 'bg-gray-900 text-white border-indigo-500/50' 
                            : 'bg-gray-950 text-gray-400 border-gray-700 focus:border-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extras: Ticker & Widgets */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase">Extras & Widgets</label>
          
          <div className="space-y-2">
             <label className="text-xs text-gray-500">Running Text (Ticker)</label>
             <textarea
               name="tickerText"
               value={config.tickerText}
               onChange={handleInputChange}
               rows={2}
               placeholder="Enter text to scroll at the bottom..."
               className="w-full bg-gray-950 text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none"
             />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                config.showLiveBadge 
                  ? 'bg-red-900/20 border-red-500/50' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}>
              <input 
                type="checkbox" 
                name="showLiveBadge"
                checked={config.showLiveBadge}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded bg-gray-950 border-gray-600 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900" 
              />
              <span className={`text-xs font-bold ${config.showLiveBadge ? 'text-red-400' : 'text-gray-400'}`}>
                LIVE BADGE
              </span>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                config.showClock 
                  ? 'bg-indigo-900/20 border-indigo-500/50' 
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}>
              <input 
                type="checkbox" 
                name="showClock"
                checked={config.showClock}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded bg-gray-950 border-gray-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900" 
              />
              <span className={`text-xs font-bold ${config.showClock ? 'text-indigo-400' : 'text-gray-400'}`}>
                CLOCK
              </span>
            </label>
          </div>
        </div>

        {/* Style & Theme */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase">Style & Theme</label>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
               <label className="text-xs text-gray-500">Theme</label>
               <select
                name="theme"
                value={config.theme}
                onChange={handleInputChange}
                className="w-full bg-gray-950 text-white text-sm px-2 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none"
              >
                {Object.values(ThemeType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-500">Font</label>
               <select
                name="fontFamily"
                value={config.fontFamily}
                onChange={handleInputChange}
                className="w-full bg-gray-950 text-white text-sm px-2 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none"
              >
                {AVAILABLE_FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Animation</label>
            <select
            name="animationType"
            value={config.animationType}
            onChange={handleInputChange}
            className="w-full bg-gray-950 text-white text-sm px-2 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none"
            >
              {Object.values(AnimationType).map(anim => (
                <option key={anim} value={anim}>{anim}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Position</label>
            <select
            name="position"
            value={config.position}
            onChange={handleInputChange}
            className="w-full bg-gray-950 text-white text-sm px-2 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none"
            >
            <option value={Position.BOTTOM_LEFT}>Left</option>
            <option value={Position.BOTTOM_CENTER}>Center</option>
            <option value={Position.BOTTOM_RIGHT}>Right</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Primary Color</label>
              <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-lg border border-gray-700">
                <input
                  type="color"
                  name="primaryColor"
                  value={config.primaryColor}
                  onChange={handleInputChange}
                  className="h-6 w-6 rounded cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs text-gray-400 font-mono">{config.primaryColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Secondary Color</label>
              <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-lg border border-gray-700">
                <input
                  type="color"
                  name="secondaryColor"
                  value={config.secondaryColor}
                  onChange={handleInputChange}
                  className="h-6 w-6 rounded cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs text-gray-400 font-mono">{config.secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* OBS Integration */}
        <div className="pt-4 mt-auto border-t border-gray-800">
           <button
             onClick={toggleBroadcastMode}
             className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest py-2 hover:bg-gray-800 rounded transition-colors"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
             </svg>
             Launch Broadcast View
           </button>
        </div>

      </div>
    </div>
  );
};
