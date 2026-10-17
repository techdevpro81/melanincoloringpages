import React, { useState } from 'react';
import type { ColorPalette, ColorSwatchDetail } from '../types';
import {
  CULTURAL_ALCHEMIST_INSPIRATIONS,
  generateCulturalPaletteWithAI,
  generateProceduralCulturalPalette,
} from '../utils/paletteAlchemist';
import { getStoredGeminiKey, saveCustomPalette } from '../utils/storage';
import {
  Sparkles,
  Wand2,
  X,
  Copy,
  Check,
  BookOpen,
  Shuffle,
  BookmarkCheck,
  Palette,
  KeyRound,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaletteAlchemistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPalette: (palette: ColorPalette) => void;
  onPaletteSaved?: (palette: ColorPalette) => void;
}

export const PaletteAlchemistModal: React.FC<PaletteAlchemistModalProps> = ({
  isOpen,
  onClose,
  onSelectPalette,
  onPaletteSaved,
}) => {
  const [themeInput, setThemeInput] = useState<string>('Yoruba River Goddess Oshun, honey, gold, amber, sweet water');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePalette, setActivePalette] = useState<ColorPalette>(() =>
    generateProceduralCulturalPalette('Yoruba River Goddess Oshun')
  );
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatchDetail | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const apiKey = getStoredGeminiKey();
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  const handleGenerate = async (targetTheme?: string) => {
    const themeToUse = (targetTheme || themeInput).trim();
    if (!themeToUse) return;

    setIsGenerating(true);
    setIsSaved(false);
    setSelectedSwatch(null);

    try {
      const palette = await generateCulturalPaletteWithAI(themeToUse, apiKey);
      setActivePalette(palette);
      if (palette.colorDetails && palette.colorDetails.length > 0) {
        setSelectedSwatch(palette.colorDetails[0]);
      }
    } catch (err) {
      console.error('Alchemist generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShuffleInspiration = () => {
    const random = CULTURAL_ALCHEMIST_INSPIRATIONS[Math.floor(Math.random() * CULTURAL_ALCHEMIST_INSPIRATIONS.length)];
    setThemeInput(random.theme);
    handleGenerate(random.theme);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleSavePalette = () => {
    saveCustomPalette(activePalette);
    setIsSaved(true);
    if (onPaletteSaved) {
      onPaletteSaved(activePalette);
    }
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: activePalette.colors.slice(0, 4)
    });
  };

  const handleUseInStudio = () => {
    // Automatically save and activate
    saveCustomPalette(activePalette);
    if (onPaletteSaved) {
      onPaletteSaved(activePalette);
    }
    onSelectPalette(activePalette);
    onClose();
  };

  const handleExportCSS = () => {
    const cssVars = activePalette.colors
      .map((hex, i) => `  --color-${i + 1}: ${hex}; /* ${activePalette.colorDetails?.[i]?.name || ''} */`)
      .join('\n');
    const snippet = `/* Melanin Canvas - ${activePalette.name} */\n:root {\n${cssVars}\n}`;
    navigator.clipboard.writeText(snippet);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-800 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display m-0 flex items-center gap-2">
                  AI Cultural Palette Alchemist
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {hasApiKey ? 'Gemini 3.8 Flash' : 'Procedural Harmony'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Transmute any Black heritage theme, folklore story, or vibe into publication-grade color palettes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title="Close Alchemist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          {/* Theme Input Bar & Quick Inspiration Chips */}
          <div className="flex flex-col gap-3 bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Enter Cultural Theme or Inspiration
              </span>
              {!hasApiKey && (
                <span className="text-[11px] text-amber-400/80 font-normal flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Add Gemini key in AI Studio for LLM creativity
                </span>
              )}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Ethiopian highlands coffee blossom, Yoruba Oshun honey, 1920s Harlem velvet..."
                className="flex-1 bg-stone-900 border border-stone-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !themeInput.trim()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Alchemizing...' : 'Brew Palette'}</span>
                </button>

                <button
                  onClick={handleShuffleInspiration}
                  disabled={isGenerating}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 transition cursor-pointer"
                  title="Random Cultural Inspiration"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 font-medium">Quick Cultural Inspirations:</span>
              <div className="flex flex-wrap gap-1.5">
                {CULTURAL_ALCHEMIST_INSPIRATIONS.slice(0, 6).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setThemeInput(item.theme);
                      handleGenerate(item.theme);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 text-xs transition cursor-pointer"
                    title={item.hint}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Generated Palette Display */}
          <div className="flex flex-col gap-4 bg-gradient-to-b from-stone-950 to-stone-900 p-5 rounded-2xl border border-stone-800 shadow-xl">
            {/* Title & Lore Card */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-amber-300 font-display m-0 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  {activePalette.name}
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
                  {activePalette.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSavePalette}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-200'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaved ? 'Saved to Library' : 'Save Palette'}</span>
                </button>

                <button
                  onClick={handleExportCSS}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
                  title="Copy as CSS variables"
                >
                  {copyCodeSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copyCodeSuccess ? 'Copied CSS!' : 'Copy CSS'}</span>
                </button>
              </div>
            </div>

            {/* Seamless Harmony Ribbon Preview */}
            <div className="h-6 rounded-xl overflow-hidden flex shadow-inner border border-stone-700/60">
              {activePalette.colors.map((c, i) => (
                <div
                  key={i}
                  className="h-full flex-1 transition-all hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: c }}
                  title={`${activePalette.colorDetails?.[i]?.name || c}: ${c}`}
                  onClick={() => handleCopyHex(c)}
                />
              ))}
            </div>

            {/* Interactive Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {activePalette.colors.map((hex, idx) => {
                const detail = activePalette.colorDetails?.[idx];
                const name = detail?.name || `Shade ${idx + 1}`;
                const meaning = detail?.culturalMeaning || 'Cultural expression tone';
                const isSelected = selectedSwatch?.hex === hex;

                return (
                  <div
                    key={`${hex}-${idx}`}
                    onClick={() => setSelectedSwatch(detail || { hex, name, culturalMeaning: meaning })}
                    className={`flex flex-col p-2.5 rounded-2xl bg-stone-900 border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102 shadow-lg shadow-amber-500/10'
                        : 'border-stone-800 hover:border-stone-700 hover:scale-101'
                    }`}
                  >
                    {/* Color Preview Block */}
                    <div
                      className="w-full h-16 rounded-xl shadow-md flex items-end justify-end p-1.5 transition-transform group-hover:scale-102 relative"
                      style={{ backgroundColor: hex }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyHex(hex);
                        }}
                        className="p-1 rounded-lg bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition"
                        title="Copy Hex Code"
                      >
                        {copiedHex === hex ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Swatch Details */}
                    <div className="mt-2 flex flex-col">
                      <span className="text-xs font-bold text-stone-100 truncate group-hover:text-amber-300 transition">
                        {name}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400 uppercase">
                        {hex}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Focused Cultural Meaning Card */}
            {selectedSwatch && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-fade-in">
                <span
                  className="w-8 h-8 rounded-xl shrink-0 shadow-md border border-white/20"
                  style={{ backgroundColor: selectedSwatch.hex }}
                />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <span>{selectedSwatch.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-stone-300">
                      {selectedSwatch.hex}
                    </span>
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                    {selectedSwatch.culturalMeaning}
                  </p>
                </div>
              </div>
            )}

            {/* Cultural Story / Narrative Lore Section */}
            {activePalette.culturalStory && (
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-900 border border-stone-700 text-amber-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                    Cultural Lore & Significance
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {activePalette.culturalStory}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 text-center sm:text-left">
            <span>Ready to paint? Activate this custom palette in your coloring studio.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleUseInStudio}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use in Studio Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
