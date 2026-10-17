import React, { useState } from 'react';
import type { ConnectDotsPuzzle, DotPoint } from '../types';
import { CONNECT_THE_DOTS_PUZZLES } from '../data/connectTheDotsData';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  Palette, 
  Info, 
  CheckCircle2, 
  Play 
} from 'lucide-react';

interface ConnectTheDotsProps {
  onOpenStory: (puzzleTitle: string, story: string) => void;
  onJumpToColoring: (artworkId?: string) => void;
  customPuzzle?: ConnectDotsPuzzle | null;
}

export const ConnectTheDots: React.FC<ConnectTheDotsProps> = ({
  onOpenStory,
  onJumpToColoring,
  customPuzzle,
}) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<ConnectDotsPuzzle>(() => {
    return customPuzzle || CONNECT_THE_DOTS_PUZZLES[0];
  });
  const [connectedDots, setConnectedDots] = useState<number[]>([1]); // Starts with dot 1
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState<boolean>(false);

  // Sync if custom puzzle is provided from generator
  const [prevCustomPuzzle, setPrevCustomPuzzle] = useState(customPuzzle);
  if (customPuzzle !== prevCustomPuzzle) {
    setPrevCustomPuzzle(customPuzzle);
    if (customPuzzle) {
      setSelectedPuzzle(customPuzzle);
      setConnectedDots([1]);
      setIsCompleted(false);
    }
  }

  const nextDotId = connectedDots.length + 1;

  // Handle dot click
  const handleDotClick = (dot: DotPoint) => {
    if (isCompleted) return;

    if (dot.id === nextDotId) {
      // Correct sequential dot!
      soundManager.playDotConnect(dot.id);
      const updated = [...connectedDots, dot.id];
      setConnectedDots(updated);
      setShowHint(false);

      // Check if finished
      if (updated.length === selectedPuzzle.totalDots) {
        handlePuzzleCompletion();
      }
    } else if (dot.id > nextDotId) {
      // Clicked too far ahead
      soundManager.playErrorNudge();
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  const handlePuzzleCompletion = () => {
    setIsCompleted(true);
    soundManager.playVictoryFanfare();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#dc2626', '#16a34a', '#38bdf8', '#fbbf24']
    });
  };

  const handleHint = () => {
    setShowHint(true);
    soundManager.playDotConnect(nextDotId);
    setTimeout(() => setShowHint(false), 3000);
  };

  const handleReset = () => {
    setConnectedDots([1]);
    setIsCompleted(false);
    setShowHint(false);
    setIsAutoConnecting(false);
  };

  // Auto connect assist
  const handleAutoConnect = () => {
    if (isCompleted || isAutoConnecting) return;
    setIsAutoConnecting(true);

    let cur = connectedDots.length + 1;
    const interval = setInterval(() => {
      if (cur <= selectedPuzzle.totalDots) {
        soundManager.playDotConnect(cur);
        setConnectedDots(prev => [...prev, cur]);
        cur++;
      } else {
        clearInterval(interval);
        setIsAutoConnecting(false);
        handlePuzzleCompletion();
      }
    }, 240);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Puzzle Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 p-4 rounded-3xl border border-amber-900/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display m-0">
                {selectedPuzzle.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-amber-500/20">
                Connect the Dots
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Tap the dots in numerical order (1 to {selectedPuzzle.totalDots}) to bring this Black cultural symbol to life.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Story info */}
          <button
            onClick={() => onOpenStory(selectedPuzzle.title, selectedPuzzle.culturalStory)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Story</span>
          </button>

          {/* Puzzle selector */}
          <select
            value={selectedPuzzle.id}
            onChange={(e) => {
              const puzzle = CONNECT_THE_DOTS_PUZZLES.find(p => p.id === e.target.value);
              if (puzzle) {
                setSelectedPuzzle(puzzle);
                setConnectedDots([1]);
                setIsCompleted(false);
              }
            }}
            className="bg-stone-800 text-stone-200 border border-stone-700 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {CONNECT_THE_DOTS_PUZZLES.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.totalDots} dots)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Info & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Dot Tracker Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Connection Progress
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {connectedDots.length} / {selectedPuzzle.totalDots}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-stone-950 overflow-hidden p-0.5 border border-stone-800 mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(connectedDots.length / selectedPuzzle.totalDots) * 100}%` }}
              />
            </div>

            <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-stone-400">Current Target:</span>{' '}
                <strong className="text-amber-400 text-sm font-mono font-bold">
                  {isCompleted ? 'Finished!' : `Dot #${nextDotId}`}
                </strong>
              </div>
              {!isCompleted && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons: Hint, Auto-Assist, Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCompleted ? (
              <>
                <button
                  onClick={handleHint}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Highlight Dot #{nextDotId}</span>
                </button>

                <button
                  onClick={handleAutoConnect}
                  disabled={isAutoConnecting}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Auto connect assist"
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Auto</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onJumpToColoring(selectedPuzzle.colorArtworkId)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span>Color This Artwork Now!</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition cursor-pointer"
              title="Reset puzzle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Cultural Reflection note */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 text-xs text-stone-400">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 font-display uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cultural Story
            </h4>
            <p className="line-clamp-3 text-stone-300">
              {selectedPuzzle.culturalStory}
            </p>
          </div>
        </div>

        {/* Center Interactive SVG Dots Stage */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-stone-950 p-4 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl relative min-h-[580px] overflow-hidden">
          <div
            className="relative shadow-2xl rounded-2xl overflow-hidden bg-white max-w-full select-none"
            style={{ width: '600px', height: '600px', aspectRatio: '1 / 1' }}
          >
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full"
            >
              {/* Background watermark of the solution if completed */}
              {isCompleted && (
                <path
                  d={selectedPuzzle.solutionSvgPath}
                  fill="#fef3c7"
                  stroke="#18181b"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="animate-fadeIn"
                />
              )}

              {/* Connected Lines so far */}
              {connectedDots.length > 1 && (
                <polyline
                  points={connectedDots
                    .map(id => {
                      const dot = selectedPuzzle.dots.find(d => d.id === id);
                      return dot ? `${dot.x},${dot.y}` : '';
                    })
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Render all numbered dots */}
              {selectedPuzzle.dots.map(dot => {
                const isConnected = connectedDots.includes(dot.id);
                const isTarget = dot.id === nextDotId;
                const isHintActive = showHint && isTarget;

                return (
                  <g
                    key={dot.id}
                    onClick={() => handleDotClick(dot)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing beacon radar around target dot */}
                    {isTarget && (
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r="18"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Hint glow */}
                    {isHintActive && (
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r="24"
                        fill="#fef08a"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    )}

                    {/* Dot circle */}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isTarget ? 7 : 5}
                      fill={isConnected ? '#16a34a' : isTarget ? '#f59e0b' : '#18181b'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Number label */}
                    <text
                      x={dot.x + 9}
                      y={dot.y - 7}
                      fontSize={isTarget ? 13 : 11}
                      fontWeight="bold"
                      fill={isTarget ? '#d97706' : isConnected ? '#15803d' : '#292524'}
                      fontFamily="system-ui, sans-serif"
                      className="select-none pointer-events-none"
                    >
                      {dot.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
