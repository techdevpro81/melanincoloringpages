import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Palette, 
  Printer, 
  Download, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Hash, 
  CircleDot,
  AlertCircle
} from 'lucide-react';
import { convertToColoringLineArt, extractContourDots, clarifyAIColoringArt } from '../utils/imageProcessor';
import { getStoredGeminiKey, setStoredGeminiKey } from '../utils/storage';
import { generateColoringPage } from '../coloringPage';
import { 
  generateFreeColoringImage, 
  enhanceColoringPromptWithGemini, 
  testGeminiApiKey 
} from '../utils/geminiApi';
import { generateProceduralHeritageArt, type CulturalTheme } from '../utils/proceduralArtGenerator';
import type { Artwork, ConnectDotsPuzzle } from '../types';
import confetti from 'canvas-confetti';

interface AIGeneratorStudioProps {
  onLoadCustomArtwork: (artwork: Artwork) => void;
  onJumpToColoring: () => void;
  onLoadCustomPuzzle?: (puzzle: ConnectDotsPuzzle) => void;
  onJumpToConnectDots?: () => void;
  onJumpToPaintByNumbers?: () => void;
}

interface GenerationHistoryItem {
  id: string;
  title: string;
  dataUrl: string;
  prompt: string;
  timestamp: string;
}

interface CulturalPreset {
  id: string;
  name: string;
  badge: string;
  imagePreview: string;
  prompt: string;
  themePhrase: string;
}

const CULTURAL_PRESETS: CulturalPreset[] = [
  {
    id: 'braids-beads',
    name: 'Braids, Beads & Baby Hair',
    badge: 'Herringbone Monoline',
    imagePreview: '/examples/braids-beads-girl.png',
    themePhrase: 'Braids, stacked beads and wavy laid baby hair edges',
    prompt: 'Clean black and white coloring book page line art, delicate uniform monoline inking on pure white paper, storybook coloring illustration of an adorable smiling young Black girl with neat radial parted cornrows and hanging box braids, intricate hollow chevron herringbone braid segments, cylindrical hair beads and cuffs, stacked beads at braid ends, delicate wavy S-curl baby hair edges on forehead, large expressive storybook eyes, cute button nose, full smiling lips, thin crisp black outlines only, hollow white spaces everywhere to color in, strictly zero solid black hair, strictly zero shading, strictly zero grayscale, pure white background'
  },
  {
    id: 'afro-curls',
    name: '3C/4A Spiral Curls',
    badge: 'Halo of Curls',
    imagePreview: '/examples/afro-queen-curls.jpg',
    themePhrase: 'Voluminous defined 3C/4A spiral curls with closed contours',
    prompt: 'Striking black and white coloring book portrait of a beautiful Black woman with voluminous defined 3C and 4A spiral afro curls, closed line contours, hollow white curls, filigree teardrop earrings, goddess draped dress, bold vector comic inks on pure white paper'
  },
  {
    id: 'boy-king',
    name: 'Young King & Book Throne',
    badge: 'Youth & Literacy',
    imagePreview: '/examples/boy-king-reading.jpg',
    themePhrase: 'Young scholar on book throne with royal crown',
    prompt: 'Storybook coloring sheet of a young Black boy king sitting cross-legged on a tall stack of books reading an open book, wearing a royal crown, hoodie, and sneakers, clean thick coloring book outlines on pure white paper'
  },
  {
    id: 'baby-princess',
    name: 'Baby Royalty & Tiara',
    badge: 'Tiara & Pearls',
    imagePreview: '/examples/baby-princess.jpg',
    themePhrase: 'Baroque pearl tiara and delicate baby curls',
    prompt: 'Coloring page of an adorable Black baby princess with large expressive sparkling eyes, wearing an ornate baroque gemstone tiara with pearls, baby hair edges, pearl necklace, clean inked line art, high contrast pure white background'
  },
  {
    id: 'historic-banner',
    name: 'Historic Tribute Banner',
    badge: 'Leader Tribute',
    imagePreview: '/examples/michelle-obama.png',
    themePhrase: 'Historic civil rights ribbon banner with hollow lettering',
    prompt: 'Black and white coloring page tribute to Michelle Obama, arched banner at top with hollow letters, holding microphone in tailored blazer, shooting stars with speed rays, HOPE buttons, concentric cloud border, clean bold vector line art on pure white paper'
  }
];

const QUICK_STYLE_CHIPS = [
  { label: '+ Laid Baby Hair', text: ', wavy laid S-curl baby hair edges on forehead and temples' },
  { label: '+ Stacked Hair Beads', text: ', cylindrical wooden and glass hair beads stacked at braid ends' },
  { label: '+ Herringbone Braids', text: ', intricate hollow chevron herringbone braid segments' },
  { label: '+ Defined 4A Curls', text: ', voluminous defined hollow 4A spiral curl loops' },
  { label: '+ Baroque Tiara', text: ', ornate baroque gemstone tiara crown with pearls' },
  { label: '+ Gold Hair Cuffs', text: ', etched hollow gold cuffs on locs and braids' },
  { label: '+ Daisy Flower Crown', text: ', ring of delicate daisy wildflowers in hair' },
  { label: '+ Pure White Paper', text: ', crisp thin black outlines, pure white paper background, strictly no shading' },
];

export const AIGeneratorStudio: React.FC<AIGeneratorStudioProps> = ({
  onLoadCustomArtwork,
  onJumpToColoring,
  onLoadCustomPuzzle,
  onJumpToConnectDots,
  onJumpToPaintByNumbers,
}) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<'prompt' | 'photo'>('prompt');

  // Engine selection: 'free-ai' | 'gemini' | 'procedural'
  const [engine, setEngine] = useState<'free-ai' | 'gemini' | 'procedural'>('free-ai');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(getStoredGeminiKey());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Prompt & Style State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CULTURAL_PRESETS[0].id);
  const [prompt, setPrompt] = useState<string>(CULTURAL_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | '4:3'>('3:4');
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Generation Status & Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Canvas State & Tuning
  const [activeImageDataUrl, setActiveImageDataUrl] = useState<string>(CULTURAL_PRESETS[0].imagePreview);
  const [activeTitle, setActiveTitle] = useState<string>(CULTURAL_PRESETS[0].name);
  const [lineThicken, setLineThicken] = useState<boolean>(false);
  const [lineThreshold, setLineThreshold] = useState<number>(145);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Photo Inker Tuning State
  const [photoThreshold, setPhotoThreshold] = useState<number>(115);
  const [photoThickness, setPhotoThickness] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save Gemini Key to storage whenever changed
  const handleKeyChange = (val: string) => {
    setGeminiApiKey(val);
    setStoredGeminiKey(val);
    setKeyNotice(null);
  };

  // Verify Gemini Key
  const handleVerifyGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      setKeyNotice('Please enter an API Key first.');
      return;
    }
    setIsVerifyingKey(true);
    setKeyNotice(null);
    try {
      const res = await testGeminiApiKey(geminiApiKey.trim());
      setKeyNotice(res.valid ? 'Key verified active!' : res.message || 'Key check failed');
    } catch (err: any) {
      setKeyNotice(err?.message || 'Key verification error');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Re-render Canvas with Pure Line Art Processing
  const renderCanvas = useCallback((sourceImg: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = sourceImg.naturalWidth || sourceImg.width || 800;
    const h = sourceImg.naturalHeight || sourceImg.height || 1000;
    canvas.width = w;
    canvas.height = h;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, w, h);
    tCtx.drawImage(sourceImg, 0, 0, w, h);

    const cCtx = canvas.getContext('2d')!;

    if (activeTab === 'photo') {
      const processed = convertToColoringLineArt(tempCanvas, {
        threshold: photoThreshold,
        edgeIntensity: 2.5,
        lineThickness: photoThickness,
        detailLevel: 2,
        invert: false,
      });
      cCtx.drawImage(processed, 0, 0);
    } else {
      // Clarify AI generation into pure B&W monoline ink on white paper
      const clarified = clarifyAIColoringArt(tempCanvas, {
        lineThreshold,
        thickenLines: lineThicken,
      });
      cCtx.drawImage(clarified, 0, 0);
    }
  }, [activeTab, photoThreshold, photoThickness, lineThreshold, lineThicken]);

  useEffect(() => {
    if (!activeImageDataUrl) return;
    const img = new Image();
    if (!activeImageDataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => renderCanvas(img);
    img.src = activeImageDataUrl;
  }, [activeImageDataUrl, renderCanvas]);

  // Select Preset Card
  const handleSelectPreset = (preset: CulturalPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setActiveTitle(preset.name);
    setActiveImageDataUrl(preset.imagePreview);
  };

  // Append Quick Style Chip to Prompt
  const handleAddChip = (chipText: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim();
      return trimmed.endsWith('.') || trimmed.endsWith(',')
        ? `${trimmed} ${chipText.replace(/^,\s*/, '')}`
        : `${trimmed}${chipText}`;
    });
  };

  // AI Polish Prompt
  const handlePolishPrompt = async () => {
    setIsPolishing(true);
    try {
      const polished = await enhanceColoringPromptWithGemini(geminiApiKey.trim(), prompt);
      setPrompt(polished);
    } catch (e: any) {
      console.warn('Polish notice:', e);
    } finally {
      setIsPolishing(false);
    }
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorNotice(null);
    setGenerationStep(1);
    setStatusText('1/3: Anchoring authentic Black heritage contour rules...');

    try {
      let finalDataUrl = '';

      if (engine === 'gemini') {
        const cleanKey = geminiApiKey.trim();
        if (!cleanKey) {
          throw new Error('Please enter your Google Gemini API key (starts with AIza) in the key field above, or switch to Free Instant AI!');
        }

        setGenerationStep(2);
        setStatusText('2/3: Calling generateColoringPage() with Google Gemini...');
        const currentTheme = CULTURAL_PRESETS.find(p => p.id === selectedPresetId)?.themePhrase || 'Black Heritage Art';
        
        finalDataUrl = await generateColoringPage(cleanKey, prompt, currentTheme);

      } else if (engine === 'free-ai') {
        setGenerationStep(2);
        setStatusText('2/3: Generating high-resolution monoline art with Free Cloud FLUX...');
        
        finalDataUrl = await generateFreeColoringImage(prompt, aspectRatio);

      } else {
        // Procedural Heritage Vector Engine (Offline)
        setGenerationStep(2);
        setStatusText('2/3: Tracing mathematical cultural vector contours...');
        await new Promise(r => setTimeout(r, 400));
        
        let theme: CulturalTheme = 'afro-crown';
        const pLower = prompt.toLowerCase();
        if (pLower.includes('bubble') || pLower.includes('toddler')) theme = 'toddler-bubbles-grass' as CulturalTheme;
        else if (pLower.includes('banner') || pLower.includes('history')) theme = 'sankofa-geometry';
        else if (pLower.includes('jazz')) theme = 'harlem-jazz';

        const result = generateProceduralHeritageArt(theme, 800, 1000);
        finalDataUrl = result.dataUrl;
      }

      setGenerationStep(3);
      setStatusText('3/3: Inking pure black outlines & removing grayscale shading...');
      await new Promise(r => setTimeout(r, 200));

      setActiveImageDataUrl(finalDataUrl);
      const generatedTitle = `Coloring Page: ${prompt.slice(0, 24)}...`;
      setActiveTitle(generatedTitle);

      // Add to history
      const newHistoryItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        title: prompt.slice(0, 26),
        dataUrl: finalDataUrl,
        prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 7)]);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#dc2626', '#16a34a', '#38bdf8']
      });

    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorNotice(err?.message || 'Generation failed. Please try again or switch engine.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
      setStatusText('');
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setActiveImageDataUrl(dataUrl);
        setActiveTitle(`Photo: ${file.name.slice(0, 20)}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Convert Current Canvas to Custom Artwork for Coloring Studio
  const getCanvasDataUrl = (): string => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }
    return activeImageDataUrl;
  };

  const handleSendToColoringStudio = () => {
    const currentUrl = getCanvasDataUrl();
    const customArtwork: Artwork = {
      id: `custom-art-${Date.now()}`,
      title: activeTitle,
      category: 'Crown & Joy',
      difficulty: 'Medium',
      description: prompt.slice(0, 100),
      culturalStory: 'Custom generated Black heritage coloring artwork ready for digital painting and expression.',
      width: 800,
      height: 1000,
      svgPath: '',
      regions: [],
      imageSrc: currentUrl,
      thumbnailSvg: currentUrl
    };

    onLoadCustomArtwork(customArtwork);
    onJumpToColoring();
  };

  // Send to Paint by Numbers
  const handleSendToPaintByNumbers = () => {
    const currentUrl = getCanvasDataUrl();
    const customArtwork: Artwork = {
      id: `custom-pbn-${Date.now()}`,
      title: activeTitle,
      category: 'Crown & Joy',
      difficulty: 'Easy',
      description: prompt.slice(0, 100),
      culturalStory: 'Numbered cultural coloring page with authentic melanin and textile palettes.',
      width: 800,
      height: 1000,
      svgPath: '',
      regions: [],
      imageSrc: currentUrl,
      thumbnailSvg: currentUrl
    };

    onLoadCustomArtwork(customArtwork);
    if (onJumpToPaintByNumbers) {
      onJumpToPaintByNumbers();
    } else {
      onJumpToColoring();
    }
  };

  // Send to Connect the Dots
  const handleSendToConnectDots = () => {
    if (!canvasRef.current) return;
    try {
      const dots = extractContourDots(canvasRef.current, 45);
      const puzzle: ConnectDotsPuzzle = {
        id: `puzzle-${Date.now()}`,
        title: `Dots: ${activeTitle}`,
        category: 'Crown & Joy',
        culturalStory: 'Connect the numbered dots to reveal this authentic heritage coloring illustration!',
        totalDots: dots.length,
        dots,
        solutionSvgPath: '',
        difficulty: dots.length > 50 ? 'Medium' : 'Easy'
      };

      if (onLoadCustomPuzzle) {
        onLoadCustomPuzzle(puzzle);
      }
      if (onJumpToConnectDots) {
        onJumpToConnectDots();
      }
    } catch (err) {
      console.warn('Connect dots extraction notice:', err);
    }
  };

  // Print High-Res Sheet
  const handlePrint = () => {
    const currentUrl = getCanvasDataUrl();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeTitle} - Melanin Canvas Coloring Sheet</title>
          <style>
            @page { size: letter portrait; margin: 0.5in; }
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; }
            img { max-width: 100%; max-height: 9.5in; object-fit: contain; }
            .footer { font-size: 10px; color: #555; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <img src="${currentUrl}" />
          <div class="footer">Melanin Canvas • Black Heritage Art & Coloring Studio</div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download High-Res PNG
  const handleDownload = () => {
    const currentUrl = getCanvasDataUrl();
    const link = document.createElement('a');
    link.download = `melanin-canvas-${Date.now()}.png`;
    link.href = currentUrl;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-stone-100 tracking-tight">
              Melanin Canvas <span className="text-amber-400">AI Studio</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Pure Monoline Inker
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Generate authentic Black heritage coloring sheets with hollow chevron braids, baby hair edges, and zero black fills.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-stone-900 border border-stone-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'prompt'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>AI Prompt Creator</span>
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Photo to Coloring Page</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Creator Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {activeTab === 'prompt' ? (
            <>
              {/* 1. Engine Selector */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Select AI Engine</span>
                  </label>
                  <span className="text-[10px] text-stone-400">100% Coloring-Book Ready</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEngine('free-ai')}
                    className={`p-3 rounded-xl text-left transition cursor-pointer border flex flex-col gap-1 ${
                      engine === 'free-ai'
                        ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-400 text-stone-100'
                        : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">⚡ Free Instant AI</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-semibold">
                        No Key
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 leading-tight">
                      FLUX engine tuned for authentic Black heritage coloring outlines.
                    </span>
                  </button>

                  <button
                    onClick={() => setEngine('gemini')}
                    className={`p-3 rounded-xl text-left transition cursor-pointer border flex flex-col gap-1 ${
                      engine === 'gemini'
                        ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-400 text-stone-100'
                        : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">✨ Google Gemini</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-semibold">
                        Pure Inks
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 leading-tight">
                      Executes generateColoringPage() with canvas thresholding.
                    </span>
                  </button>
                </div>

                {/* Gemini API Key Box (only when Google Gemini is selected) */}
                {engine === 'gemini' && (
                  <div className="mt-1 p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                        Google AI Studio Key (AIza...)
                      </span>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Get Free Key</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={geminiApiKey}
                          onChange={(e) => handleKeyChange(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-stone-900 text-stone-200 text-xs rounded-lg px-3 py-2 border border-stone-700 focus:border-amber-500 focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        onClick={handleVerifyGeminiKey}
                        disabled={isVerifyingKey}
                        className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-600 transition cursor-pointer shrink-0"
                      >
                        {isVerifyingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                      </button>
                    </div>

                    {keyNotice && (
                      <span className={`text-[10px] ${keyNotice.includes('active') ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {keyNotice}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Cultural Style Preset Cards */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Cultural Style Inspiration
                  </label>
                  <span className="text-[10px] text-stone-400">Click to apply template</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CULTURAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-xl text-left transition cursor-pointer border flex flex-col gap-1.5 ${
                        selectedPresetId === preset.id
                          ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-400'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-stone-850 flex items-center justify-center border border-stone-800/80">
                        <img 
                          src={preset.imagePreview} 
                          alt={preset.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-stone-200 truncate">{preset.name}</span>
                        <span className="text-[9px] text-amber-400/90 font-medium truncate">{preset.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Prompt Box & Quick Chips */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Prompt Description
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePolishPrompt}
                      disabled={isPolishing}
                      className="text-[10px] text-amber-300 font-semibold cursor-pointer flex items-center gap-1 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-md hover:bg-amber-900/60"
                      title="Enhance prompt with cultural contour standards"
                    >
                      {isPolishing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      <span>{isPolishing ? 'Polishing...' : '✨ Polish'}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prompt);
                        setCopiedPrompt(true);
                        setTimeout(() => setCopiedPrompt(false), 3000);
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="Describe the coloring page you want to create..."
                />

                {/* Quick Style Chips */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Quick Cultural Add-ons:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_STYLE_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddChip(chip.text)}
                        className="px-2 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-[10px] font-medium text-stone-300 border border-stone-800 hover:border-amber-500/50 transition cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Aspect Ratio:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: '3:4', label: '3:4 Portrait (Book)' },
                      { id: '1:1', label: '1:1 Square' },
                      { id: '4:3', label: '4:3 Landscape' },
                    ].map(ar => (
                      <button
                        key={ar.id}
                        onClick={() => setAspectRatio(ar.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          aspectRatio === ar.id
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-950 text-stone-400 border border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Main Action Button */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{statusText || 'Inking Coloring Page...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Coloring Page</span>
                    </>
                  )}
                </button>

                {errorNotice && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-xs text-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorNotice}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* PHOTO TO COLORING PAGE TAB */
            <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-stone-200">Upload Any Photo</h3>
                <p className="text-xs text-stone-400">
                  Turns family portraits, graduation pictures, and photos into pure black-and-white coloring sheets.
                </p>
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="hidden" 
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 bg-stone-950/60 cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-bold text-stone-200">Click to Upload Photo</span>
                <span className="text-[10px] text-stone-400">Supports JPG, PNG, WEBP</span>
              </div>

              {/* Photo Inking Sliders */}
              <div className="flex flex-col gap-3 pt-3 border-t border-stone-800">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold text-stone-400">
                    <span>Outline Density (Threshold)</span>
                    <span className="text-amber-400">{photoThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={photoThreshold}
                    onChange={(e) => setPhotoThreshold(Number(e.target.value))}
                    className="accent-amber-500 w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold text-stone-400">
                    <span>Line Thickness</span>
                    <span className="text-amber-400">{photoThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={photoThickness}
                    onChange={(e) => setPhotoThickness(Number(e.target.value))}
                    className="accent-amber-500 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Coloring Canvas & Launch Bar */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Canvas Display Card */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl flex flex-col gap-3">
            
            {/* Canvas Header & Polish Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-200 truncate max-w-[260px] sm:max-w-md">
                  {activeTitle}
                </span>
              </div>

              {/* Quick Line Art Touch-ups */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLineThicken(!lineThicken)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                    lineThicken
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                  title="Make line art bolder and thicker"
                >
                  Bolder Lines
                </button>

                <button
                  onClick={() => setLineThreshold(prev => prev === 145 ? 175 : 145)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                    lineThreshold === 175
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                  title="Deep ink contrast"
                >
                  Deep Contrast
                </button>
              </div>
            </div>

            {/* The Actual Coloring Canvas Viewport */}
            <div className="w-full aspect-[3/4] max-h-[580px] rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center p-2 relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain filter drop-shadow-sm select-none"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center animate-fadeIn">
                  <div className="relative">
                    <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-sm font-bold text-stone-100">{statusText}</span>
                  <div className="w-48 h-1.5 rounded-full bg-stone-800 overflow-hidden mt-1">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${generationStep === 1 ? 33 : generationStep === 2 ? 70 : 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Launch Artwork Into (4 Primary Actions) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Launch Artwork Into:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleSendToColoringStudio}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black transition cursor-pointer shadow-md"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Coloring Studio</span>
                </button>

                <button
                  onClick={handleSendToPaintByNumbers}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 border border-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paint by Numbers</span>
                </button>

                <button
                  onClick={handleSendToConnectDots}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connect Dots</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Print (PDF)</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleDownload}
                  className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download High-Res 300 DPI PNG</span>
                </button>

                <span className="text-[10px] text-stone-500">
                  Ready for Crayons, Markers &amp; Digital Paint
                </span>
              </div>
            </div>
          </div>

          {/* History Carousel (Recent Generations) */}
          {history.length > 0 && (
            <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Recent Creations This Session:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveImageDataUrl(item.dataUrl);
                      setActiveTitle(item.title);
                      setPrompt(item.prompt);
                    }}
                    className="w-14 h-16 rounded-lg overflow-hidden border border-stone-800 hover:border-amber-500 shrink-0 bg-white transition cursor-pointer relative group"
                    title={item.title}
                  >
                    <img src={item.dataUrl} alt={item.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
