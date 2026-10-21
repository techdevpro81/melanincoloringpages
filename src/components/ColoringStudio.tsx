import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Artwork, ToolType } from '../types';
import { CULTURAL_ARTWORKS } from '../data/artworks';
import { ToolBar } from './ToolBar';
import { ColorPaletteComponent } from './ColorPalette';
import { hexToRgba, floodFill } from '../utils/floodFill';
import { soundManager } from '../utils/audio';
import { saveArtworkToGallery } from '../utils/storage';
import confetti from 'canvas-confetti';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface ColoringStudioProps {
  initialArtworkId?: string;
  onOpenStory: (artwork: Artwork) => void;
  onOpenHeritageLibrary?: () => void;
}

interface DrawingPoint {
  x: number;
  y: number;
  pressure: number;
}

export const ColoringStudio: React.FC<ColoringStudioProps> = ({
  initialArtworkId,
  onOpenStory,
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

  const [currentTool, setCurrentTool] = useState<ToolType>('bucket');
  const [currentColor, setCurrentColor] = useState<string>('#6d3b24');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [brushOpacity, setBrushOpacity] = useState<number>(1.0);
  const [stayInsideLines, setStayInsideLines] = useState<boolean>(true);

  // 3-Tier Decoupled Canvas Refs
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);      // Layer 1: Paper Background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);        // Layer 2: Transparent Paint Layer
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null); // Layer 3: Multiply Line Art Overlay
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Undo / Redo history (pure paint snapshots)
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state & Bézier stroke points buffer
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const pointsRef = useRef<DrawingPoint[]>([]);

  // Initialize canvas stack with chosen artwork
  const setupArtworkCanvas = useCallback(() => {
    const bgCanvas = bgCanvasRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!canvas || !overlay || !bgCanvas) return;

    const width = selectedArtwork.width;
    const height = selectedArtwork.height;

    bgCanvas.width = width;
    bgCanvas.height = height;
    canvas.width = width;
    canvas.height = height;
    overlay.width = width;
    overlay.height = height;

    const bgCtx = bgCanvas.getContext('2d')!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const overlayCtx = overlay.getContext('2d', { willReadFrequently: true })!;

    // Layer 1: Crisp clean paper background
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 0, width, height);

    // Layer 2: Paint canvas starts completely transparent
    ctx.clearRect(0, 0, width, height);

    // If artwork has a direct line art image source
    if (selectedArtwork.imageSrc) {
      const img = new Image();
      if (!selectedArtwork.imageSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        overlayCtx.clearRect(0, 0, width, height);
        overlayCtx.drawImage(img, 0, 0, width, height);

        ctx.clearRect(0, 0, width, height);
        const initialSnapshot = ctx.getImageData(0, 0, width, height);
        setHistory([initialSnapshot]);
        setHistoryIndex(0);
      };
      img.src = selectedArtwork.imageSrc;
      return;
    }

    // Layer 3: Render vector outlines onto overlay canvas ONLY
    overlayCtx.clearRect(0, 0, width, height);
    overlayCtx.strokeStyle = '#18181b';
    overlayCtx.lineWidth = 3.5;
    overlayCtx.lineCap = 'round';
    overlayCtx.lineJoin = 'round';

    selectedArtwork.regions.forEach(region => {
      const path = new Path2D(region.path);
      overlayCtx.stroke(path);
    });

    // Save initial transparent state to paint history
    const initialSnapshot = ctx.getImageData(0, 0, width, height);
    setHistory([initialSnapshot]);
    setHistoryIndex(0);
  }, [selectedArtwork]);

  useEffect(() => {
    setupArtworkCanvas();
  }, [setupArtworkCanvas]);

  // Push new state to undo stack
  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  // Multi-canvas composite builder for saving, export, and color picking
  const getCompositeCanvas = useCallback((): HTMLCanvasElement => {
    const width = selectedArtwork.width;
    const height = selectedArtwork.height;
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = width;
    compositeCanvas.height = height;
    const ctx = compositeCanvas.getContext('2d')!;

    // 1. Layer 1: Paper Background
    if (bgCanvasRef.current) {
      ctx.drawImage(bgCanvasRef.current, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Layer 2: Paint & Layer 3: Multiply Line Art Overlay
    if (stayInsideLines) {
      // Paint layer underneath line art overlay
      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, 0, 0, width, height);
      }
      if (overlayCanvasRef.current) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(overlayCanvasRef.current, 0, 0, width, height);
        ctx.restore();
      }
    } else {
      // Paint on top of lines
      if (overlayCanvasRef.current) {
        ctx.drawImage(overlayCanvasRef.current, 0, 0, width, height);
      }
      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, 0, 0, width, height);
      }
    }

    return compositeCanvas;
  }, [selectedArtwork.width, selectedArtwork.height, stayInsideLines]);

  const getCanvasCoordinates = (
    e: React.MouseEvent | React.TouchEvent | React.PointerEvent
  ): DrawingPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    let pressure = 0.5;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // @ts-expect-error force or pressure property on touch
      pressure = e.touches[0].force || 0.5;
    } else {
      const pe = e as React.PointerEvent;
      clientX = pe.clientX;
      clientY = pe.clientY;
      if (typeof pe.pressure === 'number' && pe.pressure > 0) {
        pressure = pe.pressure;
      }
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);

    return { x, y, pressure };
  };

  // Bucket flood fill or Eyedropper handler
  const handleCanvasClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    if (!coords || !canvasRef.current) return;

    if (currentTool === 'eyedropper') {
      const composite = getCompositeCanvas();
      const ctx = composite.getContext('2d')!;
      const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setCurrentColor(hex);
      setCurrentTool('bucket');
      return;
    }

    if (currentTool === 'bucket') {
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })!;
      const overlayCtx = overlayCanvasRef.current?.getContext('2d', { willReadFrequently: true }) || null;
      const rgba = hexToRgba(currentColor);

      // Flood fill runs on Paint Layer, stopping at boundaries from overlayCtx
      const filled = floodFill(ctx, coords.x, coords.y, rgba, 48, overlayCtx);
      if (filled) {
        soundManager.playFillSound();
        saveSnapshot();
      }
    }
  };

  // Initial dot on stroke start
  const drawInitialPoint = (point: DrawingPoint) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const effectiveWidth = Math.max(1, brushSize * (0.6 + point.pressure * 0.5));
    ctx.save();

    if (currentTool === 'eraser') {
      // Non-destructive eraser: erases paint back to transparency
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, (effectiveWidth * 1.5) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentTool === 'glow') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity * 0.8;
      ctx.shadowColor = currentColor;
      ctx.shadowBlur = brushSize * 1.5;
      ctx.beginPath();
      ctx.arc(point.x, point.y, effectiveWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity * 0.35;
      ctx.beginPath();
      ctx.arc(point.x, point.y, (effectiveWidth * 1.4) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentTool === 'crayon') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity * 0.8;
      for (let i = 0; i < 5; i++) {
        const jx = (Math.random() - 0.5) * effectiveWidth;
        const jy = (Math.random() - 0.5) * effectiveWidth;
        ctx.beginPath();
        ctx.arc(point.x + jx, point.y + jy, effectiveWidth * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (currentTool === 'glitter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity;
      const count = Math.max(3, Math.floor(brushSize / 4));
      for (let i = 0; i < count; i++) {
        const sx = point.x + (Math.random() - 0.5) * brushSize * 1.8;
        const sy = point.y + (Math.random() - 0.5) * brushSize * 1.8;
        const r = Math.random() * 3 + 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Smooth Brush
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity;
      ctx.beginPath();
      ctx.arc(point.x, point.y, effectiveWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    soundManager.playStrokeSound();
  };

  // Quadratic Bézier curve segment with stylus pressure sensitivity
  const drawBezierSegment = (
    start: { x: number; y: number },
    control: DrawingPoint,
    end: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const effectiveWidth = Math.max(1, brushSize * (0.6 + control.pressure * 0.5));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'eraser') {
      // Non-destructive eraser: erases paint back to transparency without touching line art or paper
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = effectiveWidth * 1.5;
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      ctx.stroke();
    } else if (currentTool === 'glow') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = effectiveWidth;
      ctx.globalAlpha = brushOpacity * 0.7;
      ctx.shadowColor = currentColor;
      ctx.shadowBlur = brushSize * 1.5;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      ctx.stroke();
    } else if (currentTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = effectiveWidth * 1.4;
      ctx.globalAlpha = brushOpacity * 0.35;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      ctx.stroke();
    } else if (currentTool === 'crayon') {
      // Interpolate along the Bézier curve for rich wax crayon texture
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity * 0.8;
      const steps = 6;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const bx = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        const by = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        for (let i = 0; i < 3; i++) {
          const jx = (Math.random() - 0.5) * effectiveWidth * 0.8;
          const jy = (Math.random() - 0.5) * effectiveWidth * 0.8;
          ctx.beginPath();
          ctx.arc(bx + jx, by + jy, effectiveWidth * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (currentTool === 'glitter') {
      // Sparkling gold / color bursts along the Bézier curve
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.globalAlpha = brushOpacity;
      const count = Math.max(2, Math.floor(brushSize / 6));
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        const bx = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        const by = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        const sx = bx + (Math.random() - 0.5) * brushSize * 1.5;
        const sy = by + (Math.random() - 0.5) * brushSize * 1.5;
        const r = Math.random() * 3.5 + 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Standard smooth brush with quadratic Bézier smoothing
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = effectiveWidth;
      ctx.globalAlpha = brushOpacity;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      ctx.stroke();
    }

    ctx.restore();
    soundManager.playStrokeSound();
  };

  // Freehand drawing handlers with Bézier smoothing
  const startDrawing = (
    e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (currentTool === 'bucket' || currentTool === 'eyedropper') return;

    // Pan with Alt or middle click
    if ('button' in e && (e.button === 1 || e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: (e as React.MouseEvent).clientX - pan.x, y: (e as React.MouseEvent).clientY - pan.y });
      return;
    }

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    pointsRef.current = [coords];
    drawInitialPoint(coords);
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (isPanning && 'clientX' in e) {
      setPan({ x: (e as React.MouseEvent).clientX - panStart.x, y: (e as React.MouseEvent).clientY - panStart.y });
      return;
    }

    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const points = pointsRef.current;
    points.push(coords);

    if (points.length >= 3) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      // Midpoints between p0-p1 and p1-p2
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      drawBezierSegment(mid1, p1, mid2);
    }
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      const points = pointsRef.current;
      if (points.length === 2) {
        const p0 = points[0];
        const p1 = points[1];
        const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        drawBezierSegment(p0, p0, mid);
        drawBezierSegment(mid, p1, p1);
      } else if (points.length >= 3) {
        const pPenultimate = points[points.length - 2];
        const pLast = points[points.length - 1];
        const midLast = { x: (pPenultimate.x + pLast.x) / 2, y: (pPenultimate.y + pLast.y) / 2 };
        drawBezierSegment(midLast, pLast, pLast);
      }

      setIsDrawing(false);
      pointsRef.current = [];
      saveSnapshot();
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all your coloring on this artwork?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([snapshot]);
      setHistoryIndex(0);
    }
  };

  const handleSave = () => {
    const composite = getCompositeCanvas();
    const previewUrl = composite.toDataURL('image/png');
    saveArtworkToGallery({
      id: `${selectedArtwork.id}-${Date.now()}`,
      title: selectedArtwork.title,
      mode: 'coloring',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      previewUrl,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#dc2626', '#16a34a', '#fbbf24']
    });
    alert('✨ Artwork saved to your Cultural Gallery!');
  };

  const handleExport = () => {
    const composite = getCompositeCanvas();
    const link = document.createElement('a');
    link.download = `${selectedArtwork.title.toLowerCase().replace(/\s+/g, '-')}-melanin-canvas.png`;
    link.href = composite.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Artwork Selector Header Card */}
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
                {selectedArtwork.category}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              {selectedArtwork.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cultural story card modal trigger */}
          <button
            onClick={() => onOpenStory(selectedArtwork)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Cultural Story</span>
          </button>

          {/* Quick Artwork switcher dropdown */}
          <select
            value={selectedArtwork.id}
            onChange={(e) => {
              const art = CULTURAL_ARTWORKS.find(a => a.id === e.target.value);
              if (art) setSelectedArtwork(art);
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

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Toolbar & Settings */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <ToolBar
            currentTool={currentTool}
            onSelectTool={setCurrentTool}
            brushSize={brushSize}
            onChangeBrushSize={setBrushSize}
            brushOpacity={brushOpacity}
            onChangeBrushOpacity={setBrushOpacity}
            currentColor={currentColor}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoom={zoom}
            onZoomIn={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
            onZoomOut={() => setZoom(prev => Math.max(0.6, prev - 0.2))}
            onResetZoom={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
            onClear={handleClear}
            onSave={handleSave}
            onExport={handleExport}
            stayInsideLines={stayInsideLines}
            onToggleStayInsideLines={() => setStayInsideLines(prev => !prev)}
          />

          <ColorPaletteComponent
            currentColor={currentColor}
            onSelectColor={setCurrentColor}
          />

          {/* Pro-Tips Panel */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 text-xs text-stone-400">
            <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5 font-display uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Studio Tips
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use <strong>Bucket Fill</strong> to color entire sections instantly.</li>
              <li>Toggle <strong>Stay In Lines</strong> so strokes glide cleanly underneath crisp black outlines.</li>
              <li>Switch to <strong>Afro Glow</strong> or <strong>Glitter Stamp</strong> for radiant cultural highlights.</li>
              <li>The <strong>Eraser</strong> is non-destructive and only removes your paint.</li>
            </ul>
          </div>
        </div>

        {/* Center Canvas Studio */}
        <div
          ref={containerRef}
          className="lg:col-span-8 flex flex-col items-center justify-center bg-stone-950 p-4 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl relative min-h-[560px] overflow-hidden"
        >
          {/* Interactive Canvas Stage */}
          <div
            className="relative shadow-2xl rounded-2xl overflow-hidden transition-transform duration-100 ease-out cursor-crosshair border-2 border-stone-800/80 bg-white select-none touch-none"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
              width: `${selectedArtwork.width}px`,
              height: `${selectedArtwork.height}px`,
              maxWidth: '100%',
              aspectRatio: `${selectedArtwork.width} / ${selectedArtwork.height}`,
            }}
            onClick={handleCanvasClick}
            onPointerDown={startDrawing}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          >
            {/* Layer 1: Base Paper Background Canvas */}
            <canvas
              ref={bgCanvasRef}
              className="absolute inset-0 w-full h-full block pointer-events-none"
              style={{ zIndex: 1 }}
            />

            {/* Layer 2: Transparent Paint Canvas (Strokes, fills, markers, crayons, glow) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
              style={{ zIndex: stayInsideLines ? 2 : 4 }}
            />

            {/* Layer 3: Pristine Line Art Overlay Canvas (Multiply blend mode) */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full block pointer-events-none"
              style={{
                zIndex: stayInsideLines ? 3 : 2,
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
