import React from 'react';
import type { AppMode } from '../types';
import { 
  Palette, 
  Hash, 
  CircleDot, 
  FolderHeart, 
  Volume2, 
  VolumeX, 
  Music, 
  Printer, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenGallery: () => void;
  onOpenPrintModal: () => void;
  onOpenStoryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenGallery,
  onOpenPrintModal,
  onOpenStoryModal,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());
  const [isAmbientPlaying, setIsAmbientPlaying] = React.useState(soundManager.getIsAmbientPlaying());

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbient = () => {
    const playing = soundManager.toggleAmbientMusic();
    setIsAmbientPlaying(playing);
  };

  const navItems: { mode: AppMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { mode: 'coloring', label: 'Coloring Studio', icon: <Palette className="w-4 h-4" /> },
    { mode: 'paint-by-number', label: 'Paint by Numbers', icon: <Hash className="w-4 h-4" /> },
    { mode: 'connect-dots', label: 'Connect the Dots', icon: <CircleDot className="w-4 h-4" /> },
    { mode: 'ai-studio', label: '800 Heritage Pages', icon: <Sparkles className="w-4 h-4" />, badge: '800' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-amber-900/30 px-4 py-3 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Layers className="w-6 h-6 text-stone-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-1.5 m-0">
                <span>MELANIN</span>
                <span className="gold-gradient-text">CANVAS</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Black Heritage Art
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Interactive Digital Coloring, Connect-the-Dots &amp; Cultural Artistry
            </p>
          </div>
        </div>

        {/* Central Mode Switcher Navigation */}
        <nav className="flex items-center bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => onSelectMode(item.mode)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md shadow-amber-600/30 scale-102'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls (Music, Sound, Gallery, Story, Print) */}
        <div className="flex items-center gap-2">
          {/* Ambient Soul Music Synth Toggle */}
          <button
            onClick={handleToggleAmbient}
            title={isAmbientPlaying ? 'Pause Ambient Soul Chords' : 'Play Ambient Soul Chords'}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isAmbientPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-medium">
              {isAmbientPlaying ? 'Neo-Soul On' : 'Soul Lofi'}
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Cultural Heritage Story Info */}
          <button
            onClick={onOpenStoryModal}
            title="Read Cultural Heritage Story"
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Printable Coloring Sheets */}
          <button
            onClick={onOpenPrintModal}
            title="Download Printable Coloring Sheet (PDF/PNG)"
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Print</span>
          </button>

          {/* My Saved Gallery */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-750 hover:from-amber-950/40 hover:to-stone-800 border border-amber-600/40 text-amber-300 text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <FolderHeart className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">My Gallery</span>
          </button>
        </div>
      </div>
    </header>
  );
};
