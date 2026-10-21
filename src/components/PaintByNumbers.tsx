import React, { useState, useMemo, useEffect } from 'react';
import type { Artwork, ArtworkRegion } from '../types';
import { CULTURAL_ARTWORKS } from '../data/artworks';
import { ColorPaletteComponent } from './ColorPalette';
import { soundManager } from '../utils/audio';
import { saveArtworkToGallery } from '../utils/storage';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  HelpCircle, 
  Trophy, 
  Share2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface PaintByNumbersProps {
  initialArtworkId?: string;
  onOpenStory: (artwork: Artwork) => void;
  onJumpToColoring: (artworkId: string) => void;
  onOpenHeritageLibrary?: () => void;
}

export const PaintByNumbers: React.FC<PaintByNumbersProps> = ({
  initialArtworkId,
  onOpenStory,
  onJumpToColoring,
  onOpenHeritageLibrary,
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>(() => {
    return CULTURAL_ARTWORKS.find(a => a.id === initialArtworkId) || CULTURAL_ARTWORKS[0];
  });

  useEffect(() => {
    if (initialArtworkId) {
      const art = CULTURAL_ARTWORKS.find(a => a.id === initialArtworkId);
      if (art) {
        setSelectedArtwork(art);
      }
    }
  }, [initialArtworkId]);

  // Map of region id -> current filled color
  const [filledRegions, setFilledRegions] = useState<{ [regionId: string]: string }>({});
  const [activeNumber, setActiveNumber] = useState<number>(1);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [hintedRegionId, setHintedRegionId] = useState<string | null>(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  // Group stats by number
  const numberStats = useMemo(() => {
    const stats: { [num: number]: { count: number; completed: number; color: string; name?: string } } = {};

    selectedArtwork.regions.forEach(region => {
      const num = region.number;
      if (!stats[num]) {
        stats[num] = {
          count: 0,
          completed: 0,
          color: region.targetColor,
          name: region.name,
        };
      }
      stats[num].count += 1;
      if (filledRegions[region.id]) {
        stats[num].completed += 1;
      }
    });

    return stats;
  }, [selectedArtwork, filledRegions]);

  const totalRegions = selectedArtwork.regions.length;
  const totalCompleted = Object.keys(filledRegions).length;
  const isAllCompleted = totalRegions > 0 && totalCompleted === totalRegions;

  // Handle region tap
  const handleRegionClick = (region: ArtworkRegion) => {
    // If already filled with correct target color
    if (filledRegions[region.id]) return;

    if (region.number === activeNumber) {
      // Correct number tap!
      const updated = { ...filledRegions, [region.id]: region.targetColor };
      setFilledRegions(updated);
      setHintedRegionId(null);
      soundManager.playFillSound();

      // Check if this number is now completed
      const numStat = numberStats[region.number];
      if (numStat && numStat.completed + 1 >= numStat.count) {
        // Find next incomplete number
        const numbers = Object.keys(numberStats).map(Number).sort((a, b) => a - b);
        const nextNum = numbers.find(n => n !== region.number && (n === region.number ? false : (numberStats[n].completed < numberStats[n].count)));
        if (nextNum) {
          setActiveNumber(nextNum);
        }
      }

      // Check if whole artwork is finished!
      if (Object.keys(updated).length === totalRegions) {
        handleVictory();
      }
    } else {
      // Friendly nudge if user clicked wrong region
      soundManager.playErrorNudge();
      setActiveNumber(region.number);
    }
  };

  const handleVictory = () => {
    soundManager.playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#dc2626', '#16a34a', '#38bdf8', '#fbbf24', '#ffffff']
    });
    setIsCompletedModalOpen(true);
  };

  // Hint feature: finds first uncompleted region of active number and pulses it
  const handleHint = () => {
    const uncompleted = selectedArtwork.regions.find(
      r => r.number === activeNumber && !filledRegions[r.id]
    );
    if (uncompleted) {
      setHintedRegionId(uncompleted.id);
      soundManager.playDotConnect(activeNumber);
      setTimeout(() => setHintedRegionId(null), 3500);
    } else {
      // Find any uncompleted number
      const anyUncompleted = selectedArtwork.regions.find(r => !filledRegions[r.id]);
      if (anyUncompleted) {
        setActiveNumber(anyUncompleted.number);
        setHintedRegionId(anyUncompleted.id);
        setTimeout(() => setHintedRegionId(null), 3500);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this Paint by Numbers puzzle?')) {
      setFilledRegions({});
      setActiveNumber(1);
      setHintedRegionId(null);
    }
  };

  const handleSaveToGallery = () => {
    const svgEl = document.getElementById('paint-by-number-svg');
    if (!svgEl) return;

    const xml = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = selectedArtwork.width;
      canvas.height = selectedArtwork.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const previewUrl = canvas.toDataURL('image/png');

      saveArtworkToGallery({
        id: `pbn-${selectedArtwork.id}-${Date.now()}`,
        title: `${selectedArtwork.title} (Paint by Numbers)`,
        mode: 'paint-by-number',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        previewUrl,
      });

      alert('✨ Masterpiece saved to your Cultural Gallery!');
    };
    img.src = blobURL;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Artwork Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 p-4 rounded-3xl border border-amber-900/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display m-0">
                {selectedArtwork.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-amber-500/20">
                Paint by Numbers
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Tap the numbered regions matching your chosen color badge to unveil the masterpiece.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cultural story card */}
          <button
            onClick={() => onOpenStory(selectedArtwork)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Story</span>
          </button>

          {/* Quick Artwork switcher */}
          <select
            value={selectedArtwork.id}
            onChange={(e) => {
              const art = CULTURAL_ARTWORKS.find(a => a.id === e.target.value);
              if (art) {
                setSelectedArtwork(art);
                setFilledRegions({});
                setActiveNumber(1);
              }
            }}
            className="bg-stone-800 text-stone-200 border border-stone-700 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {CULTURAL_ARTWORKS.map(a => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.category})
              </option>
            ))}
          </select>

          {onOpenHeritageLibrary && (
            <button
              onClick={onOpenHeritageLibrary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md transition cursor-pointer shrink-0"
              title="Open catalog of 100 pages per topic across all 8 community domains"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Browse 800 Heritage Pages</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Paint By Numbers Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Controls & Number Badges */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Progress bar card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {Math.round((totalCompleted / Math.max(1, totalRegions)) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-stone-950 overflow-hidden p-0.5 border border-stone-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-red-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${(totalCompleted / Math.max(1, totalRegions)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
              <span>{totalCompleted} of {totalRegions} regions painted</span>
              {isAllCompleted && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete!
                </span>
              )}
            </div>
          </div>

          {/* Dedicated Numbered Color Chips */}
          <ColorPaletteComponent
            currentColor={numberStats[activeNumber]?.color || '#ffffff'}
            onSelectColor={() => {}}
            paintByNumberMode={true}
            activeNumber={activeNumber}
            onSelectNumber={(num) => setActiveNumber(num)}
            numberStats={numberStats}
          />

          {/* Action Tools: Hint, Toggle Numbers, Reset, Save */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleHint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-md cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Hint (#{activeNumber})</span>
            </button>

            <button
              onClick={() => setShowNumbers(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition cursor-pointer"
              title="Show or hide number tags"
            >
              {showNumbers ? <EyeOff className="w-4 h-4 text-stone-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
              <span>{showNumbers ? 'Hide #' : 'Show #'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition cursor-pointer"
              title="Reset progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Interactive SVG Canvas Stage */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-stone-950 p-4 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl relative min-h-[580px] overflow-hidden">
          <div
            className="relative shadow-2xl rounded-2xl overflow-hidden bg-white max-w-full"
            style={{
              width: `${selectedArtwork.width}px`,
              aspectRatio: `${selectedArtwork.width} / ${selectedArtwork.height}`,
            }}
          >
            <svg
              id="paint-by-number-svg"
              viewBox={`0 0 ${selectedArtwork.width} ${selectedArtwork.height}`}
              className="w-full h-full select-none cursor-pointer"
            >
              {/* Layer 1: Base Illustrated Coloring Page Image */}
              {selectedArtwork.imageSrc && (
                <image
                  href={selectedArtwork.imageSrc}
                  x="0"
                  y="0"
                  width={selectedArtwork.width}
                  height={selectedArtwork.height}
                  preserveAspectRatio="xMidYMid meet"
                  className="pointer-events-none"
                />
              )}

              {/* Layer 2: Segmented Coloring Regions */}
              {selectedArtwork.regions.map(region => {
                const isFilled = !!filledRegions[region.id];
                const isMatchingActive = region.number === activeNumber && !isFilled;
                const isHinted = hintedRegionId === region.id;

                if (selectedArtwork.imageSrc) {
                  // Illustrated Coloring Mode
                  const fillColor = isFilled
                    ? filledRegions[region.id]
                    : isMatchingActive
                    ? 'rgba(245, 158, 11, 0.22)'
                    : isHinted
                    ? 'rgba(251, 191, 36, 0.38)'
                    : 'transparent';

                  return (
                    <g key={region.id} onClick={() => handleRegionClick(region)}>
                      <path
                        d={region.path}
                        fill={fillColor}
                        stroke={isMatchingActive ? '#f59e0b' : isHinted ? '#d97706' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={isMatchingActive ? 3.5 : 1.5}
                        strokeDasharray={isMatchingActive ? '8,4' : undefined}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        style={{
                          mixBlendMode: isFilled ? 'multiply' : 'normal',
                          opacity: isFilled ? 0.78 : 1.0,
                          transition: 'all 0.25s ease'
                        }}
                        className={isMatchingActive ? 'animate-pulse cursor-pointer' : 'cursor-pointer'}
                      />
                    </g>
                  );
                }

                // Legacy Pure Vector Mode (fallback if no imageSrc)
                const fillColor = isFilled
                  ? filledRegions[region.id]
                  : '#ffffff';

                return (
                  <g key={region.id} onClick={() => handleRegionClick(region)}>
                    <path
                      d={region.path}
                      fill={fillColor}
                      stroke="#18181b"
                      strokeWidth={isMatchingActive ? 3.5 : 2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className={`transition-all duration-200 ${
                        isMatchingActive
                          ? 'animate-pulse fill-amber-50 stroke-amber-500 cursor-pointer'
                          : isHinted
                          ? 'fill-amber-200 stroke-amber-600 ring-4 ring-amber-400'
                          : 'hover:fill-stone-100 cursor-pointer'
                      }`}
                    />
                  </g>
                );
              })}

              {/* Layer 3: Multiply Ink Overlay to guarantee line art always stays crisp on top of paint */}
              {selectedArtwork.imageSrc && (
                <image
                  href={selectedArtwork.imageSrc}
                  x="0"
                  y="0"
                  width={selectedArtwork.width}
                  height={selectedArtwork.height}
                  preserveAspectRatio="xMidYMid meet"
                  className="pointer-events-none"
                  style={{ mixBlendMode: 'multiply' }}
                />
              )}

              {/* Render Number badges in centers of uncompleted regions */}
              {showNumbers &&
                !isAllCompleted &&
                selectedArtwork.regions.map((region, idx) => {
                  if (filledRegions[region.id]) return null;
                  const isMatchingActive = region.number === activeNumber;

                  // Derive an approximate centroid from region path coordinates
                  const numbersInPath = region.path.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
                  let cx = 300;
                  let cy = 350;
                  if (numbersInPath.length >= 2) {
                    let sumX = 0;
                    let sumY = 0;
                    let count = 0;
                    for (let i = 0; i < numbersInPath.length; i += 2) {
                      sumX += numbersInPath[i];
                      sumY += numbersInPath[i + 1] || numbersInPath[i];
                      count++;
                    }
                    cx = Math.round(sumX / Math.max(1, count));
                    cy = Math.round(sumY / Math.max(1, count));
                  }

                  return (
                    <g key={`num-${region.id}-${idx}`} pointerEvents="none">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isMatchingActive ? 12 : 9}
                        fill={isMatchingActive ? '#f59e0b' : '#ffffff'}
                        stroke="#18181b"
                        strokeWidth={1.5}
                        className={isMatchingActive ? 'animate-bounce' : ''}
                      />
                      <text
                        x={cx}
                        y={cy + (isMatchingActive ? 4 : 3)}
                        textAnchor="middle"
                        fontSize={isMatchingActive ? 12 : 10}
                        fontWeight="bold"
                        fill="#18181b"
                        fontFamily="system-ui, sans-serif"
                      >
                        {region.number}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        </div>
      </div>

      {/* 100% Completion Victory Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-2">
              Masterpiece Completed!
            </h3>
            <p className="text-sm text-stone-300 mb-6">
              You painted all {totalRegions} regions of{' '}
              <strong className="text-amber-300">{selectedArtwork.title}</strong>! Your artistic patience honors this cultural heritage beautifully.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSaveToGallery}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Save to Gallery</span>
              </button>

              <button
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  onJumpToColoring(selectedArtwork.id);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-sm font-semibold cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Open in Coloring Studio</span>
              </button>
            </div>

            <button
              onClick={() => setIsCompletedModalOpen(false)}
              className="mt-4 text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              Continue Admiring Artwork
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
