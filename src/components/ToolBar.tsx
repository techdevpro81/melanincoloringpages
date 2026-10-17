import React from 'react';
import type { ToolType } from '../types';
import { 
  PaintBucket, 
  Paintbrush, 
  PenTool, 
  Sparkles, 
  Eraser, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Trash2, 
  Save, 
  Download, 
  ShieldCheck, 
  SunMedium, 
  Wand2 
} from 'lucide-react';

interface ToolBarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  brushOpacity: number;
  onChangeBrushOpacity: (opacity: number) => void;
  currentColor: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  stayInsideLines: boolean;
  onToggleStayInsideLines: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onChangeBrushSize,
  brushOpacity,
  onChangeBrushOpacity,
  currentColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onClear,
  onSave,
  onExport,
  stayInsideLines,
  onToggleStayInsideLines,
}) => {
  const tools: { type: ToolType; label: string; icon: React.ReactNode; tip: string }[] = [
    { type: 'bucket', label: 'Bucket Fill', icon: <PaintBucket className="w-5 h-5" />, tip: 'Tap any region to fill seamlessly' },
    { type: 'brush', label: 'Soft Brush', icon: <Paintbrush className="w-5 h-5" />, tip: 'Smooth acrylic coloring brush' },
    { type: 'crayon', label: 'Wax Crayon', icon: <PenTool className="w-5 h-5" />, tip: 'Textured wax coloring crayon' },
    { type: 'marker', label: 'Highlighter', icon: <SunMedium className="w-5 h-5" />, tip: 'Translucent ink marker' },
    { type: 'glow', label: 'Afro Glow', icon: <Wand2 className="w-5 h-5 text-amber-300" />, tip: 'Radiant afrofuturistic neon aura' },
    { type: 'glitter', label: 'Glitter Stamp', icon: <Sparkles className="w-5 h-5 text-amber-400" />, tip: 'Gold & bronze sparkle glitter' },
    { type: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5" />, tip: 'Erase strokes back to white' },
  ];

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Primary Tool Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 justify-start">
        {tools.map(tool => {
          const isActive = currentTool === tool.type;
          return (
            <button
              key={tool.type}
              onClick={() => onSelectTool(tool.type)}
              title={`${tool.label} — ${tool.tip}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/30 scale-104 ring-2 ring-amber-400'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              {tool.icon}
              <span className="hidden md:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Brush Settings: Size & Opacity & Tip Preview */}
      {currentTool !== 'bucket' && (
        <div className="flex flex-wrap items-center gap-4 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Size</span>
            <input
              type="range"
              min="2"
              max="60"
              value={brushSize}
              onChange={(e) => onChangeBrushSize(Number(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-stone-300 w-6 text-right">{brushSize}px</span>
          </div>

          {/* Brush Opacity */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Opacity</span>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round(brushOpacity * 100)}
              onChange={(e) => onChangeBrushOpacity(Number(e.target.value) / 100)}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-stone-300 w-8 text-right">
              {Math.round(brushOpacity * 100)}%
            </span>
          </div>

          {/* Live Brush Tip Visual Preview */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Tip</span>
            <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center overflow-hidden">
              <span
                className="rounded-full shadow-sm"
                style={{
                  width: `${Math.min(26, Math.max(3, brushSize * 0.6))}px`,
                  height: `${Math.min(26, Math.max(3, brushSize * 0.6))}px`,
                  backgroundColor: currentColor,
                  opacity: brushOpacity,
                  filter: currentTool === 'glow' ? 'drop-shadow(0 0 4px #f59e0b)' : 'none',
                }}
              />
            </div>
          </div>

          {/* Stay Inside The Lines Toggle */}
          <button
            onClick={onToggleStayInsideLines}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ml-auto ${
              stayInsideLines
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-300'
            }`}
            title="When active, coloring strokes automatically stay underneath the crisp black line art"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stay In Lines</span>
          </button>
        </div>
      )}

      {/* Canvas Utility Actions: Undo, Redo, Zoom, Clear, Save, Export */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-800">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-xl border border-stone-800 transition cursor-pointer flex items-center gap-1 text-xs ${
              canUndo ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-stone-900/50 text-stone-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-xl border border-stone-800 transition cursor-pointer flex items-center gap-1 text-xs ${
              canRedo ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-stone-900/50 text-stone-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-xl border border-stone-800">
          <button
            onClick={onZoomOut}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-stone-300 px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={onZoomIn}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onResetZoom}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition cursor-pointer ml-1"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clear & Save & Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-rose-950/50 hover:text-rose-300 border border-stone-700 text-stone-400 transition cursor-pointer flex items-center gap-1 text-xs"
            title="Clear and reset coloring"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={onSave}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
            title="Save progress to My Gallery"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save</span>
          </button>

          <button
            onClick={onExport}
            className="p-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1 text-xs"
            title="Download high-resolution artwork"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
