import React, { useState } from 'react';
import { CULTURAL_PALETTES } from '../data/palettes';
import type { ColorPalette } from '../types';
import { getCustomPalettes, deleteCustomPalette } from '../utils/storage';
import { PaletteAlchemistModal } from './PaletteAlchemistModal';
import { Sparkles, Pipette, Wand2, Trash2, Info } from 'lucide-react';

interface ColorPaletteProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  // Paint by number optional props
  paintByNumberMode?: boolean;
  activeNumber?: number;
  onSelectNumber?: (num: number) => void;
  numberStats?: { [num: number]: { count: number; completed: number; color: string; name?: string } };
}

export const ColorPaletteComponent: React.FC<ColorPaletteProps> = ({
  currentColor,
  onSelectColor,
  paintByNumberMode = false,
  activeNumber,
  onSelectNumber,
  numberStats,
}) => {
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => getCustomPalettes());
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    const custom = getCustomPalettes();
    return custom.length > 0 ? custom[0].id : CULTURAL_PALETTES[0].id;
  });
  const [recentColors, setRecentColors] = useState<string[]>([
    '#6d3b24', '#d97706', '#dc2626', '#16a34a', '#06b6d4', '#f59e0b'
  ]);
  const [isAlchemistOpen, setIsAlchemistOpen] = useState<boolean>(false);
  const [hoveredSwatchIndex, setHoveredSwatchIndex] = useState<number | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);

  // Sync custom palettes from storage
  const reloadCustomPalettes = () => {
    setCustomPalettes(getCustomPalettes());
  };

  const allPalettes = [...CULTURAL_PALETTES, ...customPalettes];
  const activePalette = allPalettes.find(p => p.id === selectedPaletteId) || allPalettes[0];

  const handleColorClick = (color: string) => {
    onSelectColor(color);
    if (!recentColors.includes(color)) {
      setRecentColors(prev => [color, ...prev.slice(0, 7)]);
    }
  };

  const handleDeleteCustomPalette = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this custom alchemized palette?')) {
      deleteCustomPalette(id);
      const remaining = getCustomPalettes();
      setCustomPalettes(remaining);
      if (selectedPaletteId === id) {
        setSelectedPaletteId(remaining.length > 0 ? remaining[0].id : CULTURAL_PALETTES[0].id);
      }
    }
  };

  // If Paint By Number mode is active, render the dedicated numbered chips strip!
  if (paintByNumberMode && numberStats) {
    const numbers = Object.keys(numberStats).map(Number).sort((a, b) => a - b);

    return (
      <div className="bg-stone-900/90 border border-amber-900/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-display">
              Numbered Color Palette
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            Select a number badge to guide your painting
          </span>
        </div>

        {/* Numbered color tiles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {numbers.map(num => {
            const stat = numberStats[num];
            const isCompleted = stat.count > 0 && stat.completed >= stat.count;
            const isSelected = activeNumber === num;

            return (
              <button
                key={num}
                onClick={() => {
                  if (onSelectNumber) onSelectNumber(num);
                  onSelectColor(stat.color);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'ring-2 ring-amber-400 scale-108 shadow-lg shadow-amber-500/20 bg-stone-800 border-amber-400'
                    : isCompleted
                    ? 'bg-stone-950/60 border-emerald-900/40 opacity-70 hover:opacity-100'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:scale-102'
                }`}
                title={`${stat.name || 'Color ' + num}: ${stat.completed}/${stat.count} painted`}
              >
                {/* Color preview chip */}
                <span
                  className="w-5 h-5 rounded-full border border-stone-700/80 shadow-sm flex items-center justify-center text-[10px] font-black text-white"
                  style={{ backgroundColor: stat.color }}
                >
                  {isCompleted ? '✓' : ''}
                </span>

                {/* Number badge */}
                <div className="text-left">
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1">
                    <span>#{num}</span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Done</span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {stat.completed}/{stat.count}
                  </div>
                </div>

                {/* Completion progress micro bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-stone-950">
                  <div
                    className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${stat.count > 0 ? (stat.completed / stat.count) * 100 : 0}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Classic Coloring Studio Palette Component with AI Alchemist
  const activeHoverDetail = hoveredSwatchIndex !== null && activePalette.colorDetails
    ? activePalette.colorDetails[hoveredSwatchIndex]
    : null;

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Top Action Row: AI Alchemist button & Custom Hex Picker */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          {/* AI Cultural Palette Alchemist Trigger */}
          <button
            onClick={() => setIsAlchemistOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm hover:shadow-amber-500/20 cursor-pointer"
            title="Alchemize dynamic AI color palettes from any theme"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Alchemist</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </button>
        </div>

        {/* Custom Color Eyedropper / Native Hex Picker */}
        <label
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 text-xs font-medium cursor-pointer transition shrink-0"
          title="Pick any custom color"
        >
          <Pipette className="w-3.5 h-3.5 text-amber-400" />
          <span>Custom Hex</span>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorClick(e.target.value)}
            className="w-0 h-0 opacity-0 absolute"
          />
        </label>
      </div>

      {/* Palette category tabs (Built-in + Alchemized) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-2.5 scrollbar-thin">
        {allPalettes.map(palette => {
          const isSelected = palette.id === selectedPaletteId;
          const isCustom = palette.isCustom;

          return (
            <div
              key={palette.id}
              className="relative flex items-center group shrink-0"
            >
              <button
                onClick={() => {
                  setSelectedPaletteId(palette.id);
                  if (palette.colors.length > 0) {
                    onSelectColor(palette.colors[0]);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {isCustom && <Sparkles className="w-3 h-3 text-amber-400" />}
                <span>{palette.name}</span>
              </button>

              {isCustom && (
                <button
                  onClick={(e) => handleDeleteCustomPalette(e, palette.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-400 transition cursor-pointer"
                  title="Delete custom palette"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Palette Description & Cultural Story Toggle */}
      <div className="flex flex-col gap-1 mb-2.5">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="italic line-clamp-1">{activePalette.description}</span>
          {activePalette.culturalStory && (
            <button
              onClick={() => setShowStory(prev => !prev)}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline shrink-0 cursor-pointer ml-2"
            >
              {showStory ? 'Hide Lore' : 'Cultural Lore'}
            </button>
          )}
        </div>

        {showStory && activePalette.culturalStory && (
          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-300 leading-relaxed mt-1 animate-fade-in">
            <div className="flex items-center gap-1 text-amber-400 font-bold mb-0.5">
              <Info className="w-3 h-3" /> Cultural Story
            </div>
            {activePalette.culturalStory}
          </div>
        )}
      </div>

      {/* Swatches Grid */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {activePalette.colors.map((color, idx) => {
          const isSelected = currentColor.toLowerCase() === color.toLowerCase();
          const detail = activePalette.colorDetails?.[idx];
          const tooltip = detail ? `${detail.name} (${color}) - ${detail.culturalMeaning}` : color;

          return (
            <button
              key={`${color}-${idx}`}
              onClick={() => handleColorClick(color)}
              onMouseEnter={() => setHoveredSwatchIndex(idx)}
              onMouseLeave={() => setHoveredSwatchIndex(null)}
              className={`w-9 h-9 rounded-xl transition-all cursor-pointer relative shadow-md group ${
                isSelected
                  ? 'scale-115 ring-3 ring-amber-400 ring-offset-2 ring-offset-stone-900 shadow-amber-500/30'
                  : 'hover:scale-110 hover:shadow-lg'
              }`}
              style={{ backgroundColor: color }}
              title={tooltip}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-black/40" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Swatch Detail Card on Hover */}
      {activeHoverDetail ? (
        <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-stone-300 flex items-center justify-between gap-2 mb-2 animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm border border-white/20"
              style={{ backgroundColor: activeHoverDetail.hex }}
            />
            <span className="font-bold text-amber-300 truncate">{activeHoverDetail.name}</span>
            <span className="text-stone-400 font-mono text-[10px]">{activeHoverDetail.hex}</span>
          </div>
          {activeHoverDetail.culturalMeaning && (
            <span className="text-stone-300 text-[10px] truncate max-w-[50%] hidden sm:inline">
              {activeHoverDetail.culturalMeaning}
            </span>
          )}
        </div>
      ) : (
        <div className="h-2" />
      )}

      {/* Recent Colors bar */}
      {recentColors.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" /> Recent
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {recentColors.map((color, idx) => (
              <button
                key={`recent-${color}-${idx}`}
                onClick={() => onSelectColor(color)}
                className="w-5 h-5 rounded-lg border border-stone-700/60 transition hover:scale-115 cursor-pointer shrink-0"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Palette Alchemist Modal */}
      <PaletteAlchemistModal
        isOpen={isAlchemistOpen}
        onClose={() => setIsAlchemistOpen(false)}
        onSelectPalette={(palette) => {
          reloadCustomPalettes();
          setSelectedPaletteId(palette.id);
          if (palette.colors.length > 0) {
            onSelectColor(palette.colors[0]);
          }
        }}
        onPaletteSaved={() => {
          reloadCustomPalettes();
        }}
      />
    </div>
  );
};
