import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Key, 
  Sliders, 
  Palette, 
  Download, 
  Wand2, 
  Check, 
  Hash, 
  CircleDot, 
  Printer, 
  RefreshCw, 
  HelpCircle,
  ExternalLink,
  Copy,
  Info,
  CheckCircle
} from 'lucide-react';
import { convertToColoringLineArt, extractContourDots, clarifyAIColoringArt } from '../utils/imageProcessor';
import { getStoredGeminiKey, setStoredGeminiKey } from '../utils/storage';
import { 
  generateAIColoringImage, 
  enhanceColoringPromptWithGemini, 
  testGeminiApiKey, 
  type AIProvider 
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

// 5 Reference Styles directly inspired by user's uploaded examples
interface ReferenceStyle {
  id: string;
  name: string;
  category: string;
  imagePreview: string;
  badge: string;
  description: string;
  promptTemplate: string;
}

const REFERENCE_STYLES: ReferenceStyle[] = [
  {
    id: 'ref-braids-beads',
    name: 'Braids, Beads & Baby Hair',
    category: 'Crown & Joy',
    imagePreview: '/examples/braids-beads-girl.png',
    badge: 'Herringbone Monoline',
    description: 'Clean monoline coloring sheet with neat parted cornrows, hollow chevron-textured box braids, cylindrical hair cuffs, stacked tip beads, and wavy laid baby hair edges.',
    promptTemplate: 'Clean black and white coloring book page line art, delicate uniform monoline inking on pure white paper, storybook coloring illustration of an adorable smiling young Black girl with neat radial parted cornrows and hanging box braids, intricate hollow chevron herringbone braid segments, cylindrical hair beads and cuffs, stacked beads at braid ends, delicate wavy S-curl baby hair edges on forehead, large expressive storybook eyes, cute button nose, full smiling lips, thin crisp black outlines only, hollow white spaces everywhere to color in, strictly zero solid black hair, strictly zero shading, strictly zero grayscale, pure white background, framed single line border'
  },
  {
    id: 'ref-historic-banner',
    name: 'Historic Tribute Banner',
    category: 'Civil Rights & History',
    imagePreview: '/examples/michelle-obama.png',
    badge: 'Leader Tribute',
    description: 'Arched ribbon banner with hollow lettering, campaign buttons with stars, concentric cloud borders, and biography scroll.',
    promptTemplate: 'Black and white coloring page tribute to Michelle Obama, arched banner at top with hollow letters, holding microphone in tailored blazer, shooting stars with speed rays, HOPE buttons, concentric cloud border, clean bold vector line art on pure white paper'
  },
  {
    id: 'ref-baby-princess',
    name: 'Baby Royalty & Tiara',
    category: 'Crown & Joy',
    imagePreview: '/examples/baby-princess.jpg',
    badge: 'Chibi Princess',
    description: 'Large expressive sparkling eyes, intricate baroque jewel crown/tiara with pearls, delicate baby curls (edges), and beaded necklace.',
    promptTemplate: 'Coloring page of an adorable Black baby princess with large expressive sparkling eyes, wearing an ornate baroque gemstone tiara with pearls, baby hair edges, pearl necklace, clean inked line art, high contrast pure white background'
  },
  {
    id: 'ref-defined-curls',
    name: '3C/4A Defined Spiral Curls',
    category: 'Crown & Joy',
    imagePreview: '/examples/afro-queen-curls.jpg',
    badge: 'Natural Hair Glamour',
    description: 'Voluminous halo of defined 3C/4A spiral curls with closed contours, filigree leaf-vein earrings, and elegant goddess neckline.',
    promptTemplate: 'Striking black and white coloring book portrait of a beautiful Black woman with voluminous defined 3C and 4A spiral afro curls, closed line contours, filigree teardrop earrings, goddess draped dress, bold vector comic inks'
  },
  {
    id: 'ref-boy-king',
    name: 'Young King & Book Throne',
    category: 'Community & Literacy',
    imagePreview: '/examples/boy-king-reading.jpg',
    badge: 'Literacy & Joy',
    description: 'Young scholar in crown, hoodie, and sneakers seated atop a towering throne of books, deeply immersed in reading.',
    promptTemplate: 'Storybook coloring sheet of a young Black boy king sitting cross-legged on a tall stack of books reading an open book, wearing a royal crown, hoodie, and sneakers, clean thick coloring book outlines'
  },
  {
    id: 'ref-comic-doodle',
    name: 'Pop Art Comic Patterns',
    category: 'Sacred Geometry',
    imagePreview: '/examples/comic-numbers-doodle.jpg',
    badge: 'Comic Doodle',
    description: 'Patterned bubble numbers with chevrons, polka dots, stripes, action speech bubbles (KA-POW!, ZAP!), and starbursts.',
    promptTemplate: 'Dynamic pop art doodle coloring page with bold numbers filled with micro-patterns (polka dots, stripes, houndstooth), superhero comic action bubbles (KA-POW!, ZAP!, BOOM!), starbursts and lightning bolts, clean line art'
  },
  {
    id: 'ref-toddler-bubbles',
    name: 'Toddler Bubbles in Grass',
    category: 'Youth & Joy',
    imagePreview: '/examples/baby-princess.jpg',
    badge: 'Meadow Bubbles',
    description: 'Black toddler girl with high afro puffs blowing floating soap bubbles in a sunny grassy meadow with daisies and butterflies.',
    promptTemplate: 'Black and white coloring page of an adorable Black toddler girl with high afro puffs and hair ball ties, blowing floating soap bubbles with a wand in the grass, sunny meadow with daisies and fluttering butterflies, clean bold coloring book line art, pure white paper'
  }
];

export const AIGeneratorStudio: React.FC<AIGeneratorStudioProps> = ({
  onLoadCustomArtwork,
  onJumpToColoring,
  onLoadCustomPuzzle,
  onJumpToConnectDots,
  onJumpToPaintByNumbers,
}) => {
  const [apiKey, setApiKey] = useState<string>(getStoredGeminiKey());
  const [activeTab, setActiveTab] = useState<'ai-generate' | 'photo-convert'>('ai-generate');

  // Generator engine & options
  const initialKey = getStoredGeminiKey();
  const [provider, setProvider] = useState<AIProvider>(
    initialKey.startsWith('hf_') ? 'huggingface' : initialKey.startsWith('sk-') ? 'openai' : initialKey.startsWith('AIza') ? 'gemini' : 'free-ai'
  );
  const [hfModel, setHfModel] = useState<string>('black-forest-labs/FLUX.1-schnell');
  const [customHfModel, setCustomHfModel] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<string>('gemini-vector-svg');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3'>('3:4');
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyVerificationMsg, setKeyVerificationMsg] = useState<string | null>(null);
  const [isPolishingPrompt, setIsPolishingPrompt] = useState<boolean>(false);
  const [generatorEngine, setGeneratorEngine] = useState<'procedural' | 'cloud-ai'>('cloud-ai');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(REFERENCE_STYLES[0].id);
  const [prompt, setPrompt] = useState<string>(REFERENCE_STYLES[0].promptTemplate);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiGuideModal, setShowApiGuideModal] = useState<boolean>(false);

  const [copyPromptSuccess, setCopyPromptSuccess] = useState<boolean>(false);

  // Active Generated / Converted Image
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState<string | null>(REFERENCE_STYLES[0].imagePreview);
  const [currentTitle, setCurrentTitle] = useState<string>(REFERENCE_STYLES[0].name);
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);

  // Fine-tuning Line Art Controls
  const [edgeThreshold, setEdgeThreshold] = useState<number>(110);
  const [edgeIntensity, setEdgeIntensity] = useState<number>(2.5);
  const [lineThickness, setLineThickness] = useState<number>(1);
  const [enforcePureBW, setEnforcePureBW] = useState<boolean>(true);
  const [bwThreshold, setBwThreshold] = useState<number>(140);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Process canvas through Sobel edge detection (for photos) or AI Line Art Clarifier (for prompts)
  const renderProcessedLineArt = useCallback((sourceCanvas: HTMLCanvasElement) => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    previewCanvas.width = sourceCanvas.width;
    previewCanvas.height = sourceCanvas.height;
    const pCtx = previewCanvas.getContext('2d')!;

    if (activeTab === 'photo-convert') {
      const lineArtCanvas = convertToColoringLineArt(sourceCanvas, {
        threshold: edgeThreshold,
        edgeIntensity,
        lineThickness,
        detailLevel: 2,
        invert: false,
      });
      pCtx.drawImage(lineArtCanvas, 0, 0);
    } else {
      // AI Prompt Studio & Vector Artwork
      if (enforcePureBW) {
        // Clarifies any AI generation: removes all gray skin shading, airbrush gradients, and noise,
        // yielding pure #000000 contour lines on pure #ffffff white paper for seamless bucket coloring.
        const clarified = clarifyAIColoringArt(sourceCanvas, {
          lineThreshold: bwThreshold,
          thickenLines: lineThickness > 1,
        });
        pCtx.drawImage(clarified, 0, 0);
      } else {
        // Direct render
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        pCtx.drawImage(sourceCanvas, 0, 0);
      }
    }
  }, [activeTab, edgeThreshold, edgeIntensity, lineThickness, enforcePureBW, bwThreshold]);

  // Re-render canvas whenever currentImageDataUrl, tuning controls, or activeTab changes
  useEffect(() => {
    if (!currentImageDataUrl) return;
    const img = new Image();
    if (!currentImageDataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const c = document.createElement('canvas');
      const w = img.naturalWidth || img.width || 600;
      const h = img.naturalHeight || img.height || 700;
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      renderProcessedLineArt(c);
    };
    img.src = currentImageDataUrl;
  }, [currentImageDataUrl, renderProcessedLineArt]);

  // Switch reference style
  const handleSelectReferenceStyle = (style: ReferenceStyle) => {
    setSelectedStyleId(style.id);
    setPrompt(style.promptTemplate);
    setCurrentTitle(style.name);
    setCurrentImageDataUrl(style.imagePreview);
  };

  // Verify API Key
  const handleVerifyKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API Key first.');
      return;
    }
    setIsVerifyingKey(true);
    setKeyVerificationMsg(null);
    try {
      const res = await testGeminiApiKey(apiKey.trim());
      setKeyVerificationMsg(res.message || (res.valid ? 'Key valid and active!' : 'Could not verify key.'));
    } catch (err: any) {
      setKeyVerificationMsg(err.message || 'Key check error');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // AI Polish Prompt with Gemini or cultural rules
  const handlePolishPrompt = async () => {
    setIsPolishingPrompt(true);
    try {
      const polished = await enhanceColoringPromptWithGemini(apiKey.trim(), prompt);
      setPrompt(polished);
    } catch (err: any) {
      console.warn('AI Polish notice:', err);
    } finally {
      setIsPolishingPrompt(false);
    }
  };

  // Generate with Cloud AI (Free Cloud FLUX, Gemini, OpenAI DALL-E, or Hugging Face)
  const handleGenerateWithCloudAI = async (overrideProvider?: AIProvider) => {
    const activeProv = overrideProvider || provider;
    const cleanKey = apiKey.trim();

    // Provider-specific validation so switching LLMs always uses the right engine
    if (activeProv === 'gemini') {
      if (!cleanKey) {
        setShowApiGuideModal(true);
        setErrorMessage('Please enter your Google Gemini API key (starts with AIza) in the key field above, or switch to Free Cloud AI (FLUX) which requires no key!');
        return;
      }
      if (cleanKey.startsWith('hf_')) {
        setErrorMessage('Key Mismatch: You selected Google Gemini, but your current API key starts with "hf_" (Hugging Face). Please enter a Google key (starts with AIza) or switch provider to Hugging Face!');
        return;
      }
    } else if (activeProv === 'huggingface') {
      if (!cleanKey) {
        setShowApiGuideModal(true);
        setErrorMessage('Please enter your Hugging Face user token (starts with hf_) in the key field above, or switch to Free Cloud AI!');
        return;
      }
      if (!cleanKey.startsWith('hf_')) {
        setErrorMessage('Key Mismatch: You selected Hugging Face, but your current key does not start with "hf_". Please enter a valid Hugging Face token or switch provider.');
        return;
      }
    } else if (activeProv === 'openai') {
      if (!cleanKey) {
        setShowApiGuideModal(true);
        setErrorMessage('Please enter your OpenAI API key (starts with sk-) in the key field above, or switch to Free Cloud AI!');
        return;
      }
      if (!cleanKey.startsWith('sk-')) {
        setErrorMessage('Key Mismatch: You selected OpenAI, but your current key does not start with "sk-". Please enter an OpenAI key or switch provider.');
        return;
      }
    }

    const effectiveProvider: AIProvider = activeProv;

    const chosenModel = effectiveProvider === 'huggingface'
      ? (customHfModel.trim() || hfModel)
      : effectiveProvider === 'openai'
      ? 'dall-e-3'
      : effectiveProvider === 'free-ai'
      ? 'flux'
      : geminiModel;

    const providerLabel = effectiveProvider === 'free-ai'
      ? 'Free Cloud AI (FLUX Line Art Engine)'
      : effectiveProvider === 'huggingface'
      ? `Hugging Face (${chosenModel.split('/')[1] || 'FLUX'})`
      : effectiveProvider === 'openai'
      ? 'OpenAI DALL-E 3'
      : chosenModel === 'gemini-vector-svg'
      ? 'Gemini Vector Inker (Pure SVG)'
      : `Google Gemini (${chosenModel})`;

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage(`Synthesizing artwork with ${providerLabel}...`);

    try {
      const dataUrl = await generateAIColoringImage({
        apiKey: cleanKey,
        provider: effectiveProvider,
        prompt: prompt,
        model: chosenModel,
        aspectRatio,
      });

      setCurrentImageDataUrl(dataUrl);
      setCurrentTitle(`Generated: ${prompt.slice(0, 28)}...`);

      // Add to history
      const newItem: GenerationHistoryItem = {
        id: `ai-${Date.now()}`,
        title: prompt.slice(0, 30),
        dataUrl,
        prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistoryItems(prev => [newItem, ...prev.slice(0, 7)]);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#dc2626', '#16a34a', '#38bdf8']
      });
    } catch (err: any) {
      console.warn('Cloud generation failed:', err);
      setErrorMessage(`Generation Notice: ${err.message || 'The AI service encountered an error'}`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  // Generate with built-in procedural generator (100% offline / free)
  const handleGenerateProcedural = () => {
    setIsGenerating(true);
    setStatusMessage('Tracing procedural cultural vector contours...');
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const lowerPrompt = prompt.toLowerCase();
        let theme: CulturalTheme = 'afro-crown';
        if (
          lowerPrompt.includes('bubble') || 
          lowerPrompt.includes('toddler') || 
          lowerPrompt.includes('grass') || 
          lowerPrompt.includes('girl') ||
          selectedStyleId === 'ref-toddler-bubbles'
        ) {
          theme = 'toddler-bubbles-grass' as CulturalTheme;
        } else if (
          selectedStyleId === 'ref-historic-banner' || 
          selectedStyleId === 'ref-comic-doodle' || 
          lowerPrompt.includes('banner') || 
          lowerPrompt.includes('geometry')
        ) {
          theme = 'sankofa-geometry';
        } else if (
          selectedStyleId === 'ref-baby-princess' || 
          selectedStyleId === 'ref-defined-curls' || 
          lowerPrompt.includes('curls') || 
          lowerPrompt.includes('crown')
        ) {
          theme = 'afro-crown';
        } else {
          theme = 'harlem-jazz';
        }

        const result = generateProceduralHeritageArt(theme, 600, 700);
        setCurrentImageDataUrl(result.dataUrl);
        setCurrentTitle(result.title);
        renderProcessedLineArt(result.canvas);

        const newItem: GenerationHistoryItem = {
          id: `proc-${Date.now()}`,
          title: result.title,
          dataUrl: result.dataUrl,
          prompt: result.description,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistoryItems(prev => [newItem, ...prev.slice(0, 7)]);
      } catch (err: any) {
        setErrorMessage(err.message || 'Procedural generation error');
      } finally {
        setIsGenerating(false);
        setStatusMessage('');
      }
    }, 350);
  };

  const handleSliderChange = (thresh: number, inten: number, thick: number) => {
    setEdgeThreshold(thresh);
    setBwThreshold(thresh);
    setEdgeIntensity(inten);
    setLineThickness(thick);

    if (currentImageDataUrl) {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        renderProcessedLineArt(c);
      };
      img.src = currentImageDataUrl;
    }
  };

  const handleTogglePureBW = (enabled: boolean) => {
    setEnforcePureBW(enabled);
    if (currentImageDataUrl) {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        renderProcessedLineArt(c);
      };
      img.src = currentImageDataUrl;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setCurrentImageDataUrl(src);
      setCurrentTitle('Uploaded Artwork');

      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const maxDim = 700;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        renderProcessedLineArt(c);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Launchpad: 1. Send to Coloring Studio
  const handleSendToColoringStudio = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const customArt: Artwork = {
      id: `gen-art-${Date.now()}`,
      title: currentTitle,
      category: 'Community',
      difficulty: 'Detailed',
      description: 'Custom generated artwork in authentic Black American coloring book style.',
      culturalStory: prompt,
      width: canvas.width,
      height: canvas.height,
      svgPath: '',
      imageSrc: canvas.toDataURL('image/png'),
      regions: [
        {
          id: 'gen-reg-1',
          number: 1,
          name: 'Artwork Canvas',
          path: `M 0 0 L ${canvas.width} 0 L ${canvas.width} ${canvas.height} L 0 ${canvas.height} Z`,
          targetColor: '#d97706',
          defaultColor: '#ffffff'
        }
      ]
    };

    onLoadCustomArtwork(customArt);
    onJumpToColoring();
  };

  // Launchpad: 2. Connect the Dots
  const handleConvertToConnectDots = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const dots = extractContourDots(canvas, 32);
    const customPuzzle: ConnectDotsPuzzle = {
      id: `puzzle-${Date.now()}`,
      title: `${currentTitle} (Connect the Dots)`,
      category: 'Community Creation',
      difficulty: 'Medium',
      culturalStory: prompt,
      totalDots: dots.length,
      dots,
      solutionSvgPath: `M ${dots.map(d => `${d.x} ${d.y}`).join(' L ')} Z`,
    };

    if (onLoadCustomPuzzle) {
      onLoadCustomPuzzle(customPuzzle);
    }
    if (onJumpToConnectDots) {
      onJumpToConnectDots();
    }
  };

  // Launchpad: 3. Print 8.5x11 Sheet
  const handlePrintSheet = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const imgDataUrl = canvas.toDataURL('image/png');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentTitle} - Melanin Canvas Printable</title>
          <style>
            @page { size: letter portrait; margin: 0.5in; }
            body { font-family: system-ui, sans-serif; text-align: center; margin: 0; padding: 20px; }
            h1 { font-size: 20px; margin-bottom: 4px; text-transform: uppercase; }
            p { font-size: 12px; color: #555; margin-bottom: 14px; }
            img { max-width: 100%; max-height: 8.5in; border: 2px solid #333; border-radius: 8px; }
            .foot { margin-top: 15px; font-size: 11px; color: #888; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${currentTitle}</h1>
          <p>Melanin Canvas • Black Heritage Art Studio</p>
          <img src="${imgDataUrl}" />
          <div class="foot">COLOR AT HOME WITH CRAYONS OR COLORED PENCILS</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 p-6 rounded-3xl border border-amber-900/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Wand2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white font-display m-0">
                Heritage Coloring Image Generator
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                AI + Vector Engine
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Generate crisp black-and-white coloring sheets matching professional publishing standards: bold silhouettes, delicate curl details, and hollow fillable regions.
            </p>
          </div>
        </div>

        {/* API Key Controls & Help Button */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="bg-stone-950/90 p-2.5 rounded-2xl border border-stone-800 flex items-center gap-2 flex-1 lg:flex-initial">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="password"
              placeholder="Paste Hugging Face (hf_...), OpenAI, or Google Key"
              value={apiKey}
              onChange={(e) => {
                const val = e.target.value;
                setApiKey(val);
                setStoredGeminiKey(val);
                setErrorMessage(null);
                if (val.trim().startsWith('hf_')) {
                  setProvider('huggingface');
                } else if (val.trim().startsWith('sk-')) {
                  setProvider('openai');
                } else if (val.trim().startsWith('AIza')) {
                  setProvider('gemini');
                }
              }}
              onBlur={() => {
                if (apiKey.trim()) {
                  setStoredGeminiKey(apiKey.trim());
                }
              }}
              className="bg-stone-900 text-stone-200 border border-stone-700 rounded-lg px-2.5 py-1 text-xs w-52 sm:w-64 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            {apiKey.trim() ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleVerifyKey}
                  disabled={isVerifyingKey}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
                  title="Verify API key connectivity and discover active models"
                >
                  {isVerifyingKey ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{isVerifyingKey ? 'Checking...' : 'Verify'}</span>
                </button>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Saved
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowApiGuideModal(true)}
                className="text-[10px] text-amber-400 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Need a key?
              </button>
            )}
          </div>

          <button
            onClick={() => setShowApiGuideModal(true)}
            className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-750 text-amber-400 border border-stone-700 transition cursor-pointer"
            title="Which API keys work?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic API Key Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs shadow-md">
        {provider === 'free-ai' ? (
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span><strong>✨ Free Cloud AI Active:</strong> Powered by FLUX Coloring Book Engine. No API key needed, unlimited creative prompts!</span>
          </div>
        ) : apiKey.trim().startsWith('hf_') ? (
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span><strong>🤗 Hugging Face Token Active:</strong> Serverless Diffusion enabled ({hfModel.split('/')[1] || 'FLUX.1-schnell'}). Open-source line art ready!</span>
          </div>
        ) : apiKey.trim().startsWith('sk-') ? (
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span><strong>OpenAI Key Active:</strong> Direct connection to <em>DALL-E 3</em> diffusion engine (commercial coloring book quality).</span>
          </div>
        ) : apiKey.trim().startsWith('AIza') ? (
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>
              <strong>✨ Google AI Studio Key Active:</strong> Equipped with Gemini Vector SVG Inker (100% Free on all keys) &amp; Imagen 3.0 Diffusion!
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Instant Generation Ready:</strong> Using <strong>Free Cloud AI (FLUX)</strong> to synthesize coloring book art directly without any setup!
            </span>
          </div>
        )}
        <button
          onClick={() => setShowApiGuideModal(true)}
          className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer shrink-0 ml-auto"
        >
          Model Guide
        </button>
      </div>

      {/* Key Verification Result Banner */}
      {keyVerificationMsg && (
        <div className="px-4 py-2.5 rounded-2xl bg-stone-900 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{keyVerificationMsg}</span>
          </div>
          <button
            onClick={() => setKeyVerificationMsg(null)}
            className="text-stone-400 hover:text-white text-xs px-2 py-0.5 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error & Solution Banner */}
      {errorMessage && (
        <div className="bg-amber-950/70 border border-amber-800/80 text-amber-200 px-5 py-4 rounded-3xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex-1">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Generation Assistant</span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">{errorMessage}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                setErrorMessage(null);
                setProvider('free-ai');
                handleGenerateWithCloudAI('free-ai');
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with Free Cloud AI</span>
            </button>
            <button
              onClick={() => {
                setErrorMessage(null);
                setGeneratorEngine('procedural');
                handleGenerateProcedural();
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Draw in Heritage Studio</span>
            </button>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-stone-400 hover:text-white px-2 py-1 text-xs font-bold"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Showcase: Reference Coloring Page Output Gallery */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Reference Style Architectures
            </h3>
            <p className="text-xs text-stone-400">
              Select any of the 6 reference styles below to load its exact composition rules into the generator:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {REFERENCE_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleSelectReferenceStyle(style)}
                className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-400 shadow-lg scale-102'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:scale-101'
                }`}
              >
                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-2 p-1.5 border border-stone-700/60 flex items-center justify-center">
                  <img src={style.imagePreview} alt={style.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-[11px] font-bold text-white line-clamp-1">{style.name}</div>
                <div className="text-[9px] text-amber-400/90 font-semibold uppercase mt-0.5">{style.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generator Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generator Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl">
            {/* Top Switcher: Text-to-Image vs Photo Converter */}
            <div className="flex items-center gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-800 mb-4">
              <button
                onClick={() => setActiveTab('ai-generate')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ai-generate'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompt Generator</span>
              </button>

              <button
                onClick={() => setActiveTab('photo-convert')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'photo-convert'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Photo Converter</span>
              </button>
            </div>

            {activeTab === 'ai-generate' ? (
              <>
                {/* Engine Selector */}
                <div className="mb-4">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                    1. Generation Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGeneratorEngine('cloud-ai')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                        generatorEngine === 'cloud-ai'
                          ? 'bg-stone-800 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>AI Cloud Model</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase font-mono">Gemini / DALL-E</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">Creates new images from text</div>
                    </button>

                    <button
                      onClick={() => setGeneratorEngine('procedural')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                        generatorEngine === 'procedural'
                          ? 'bg-stone-800 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Procedural Studio</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase font-mono">Free / Offline</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">Works without an API key</div>
                    </button>
                  </div>
                </div>

                {/* Provider selection if cloud AI */}
                {generatorEngine === 'cloud-ai' && (
                  <div className="mb-4">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                      2. AI Model Provider
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => setProvider('free-ai')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          provider === 'free-ai'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400 shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Free Cloud AI
                        </span>
                        <span className="text-[9px] text-emerald-400 font-normal">FLUX • No Key</span>
                      </button>
                      <button
                        onClick={() => setProvider('gemini')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          provider === 'gemini'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400 shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-[11px]">Google Gemini</span>
                        <span className="text-[9px] text-stone-500 font-normal">Vector &amp; Imagen</span>
                      </button>
                      <button
                        onClick={() => setProvider('huggingface')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          provider === 'huggingface'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400 shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-[11px]">🤗 Hugging Face</span>
                        <span className="text-[9px] text-stone-500 font-normal">FLUX &amp; SDXL</span>
                      </button>
                      <button
                        onClick={() => setProvider('openai')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          provider === 'openai'
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 ring-1 ring-sky-400 shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-[11px]">OpenAI</span>
                        <span className="text-[9px] text-stone-500 font-normal">DALL-E 3</span>
                      </button>
                    </div>

                    {/* Free Cloud AI Callout */}
                    {provider === 'free-ai' && (
                      <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-200/90 leading-relaxed">
                          <strong>No API Key Required:</strong> High-performance FLUX diffusion synthesizes crisp black-and-white coloring pages with clean outlines and pure white backgrounds. Just enter your prompt and click Generate!
                        </div>
                      </div>
                    )}

                    {/* Google Gemini Model Selector */}
                    {provider === 'gemini' && (
                      <div className="mt-3 p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Select Gemini Engine:
                          </span>
                          <span className="text-[9px] text-stone-400">Google AI Studio</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {[
                            { 
                              id: 'gemini-vector-svg', 
                              name: 'Gemini Vector Inker', 
                              badge: '100% Free SVG', 
                              desc: 'Enclosed contours & pure white fillable regions (works on all keys)' 
                            },
                            { 
                              id: 'imagen-3.0-generate-002', 
                              name: 'Imagen 3.0 Diffusion', 
                              badge: 'Raster Inking', 
                              desc: 'High contrast black & white line art diffusion (requires billing enabled)' 
                            },
                            { 
                              id: 'gemini-2.5-flash', 
                              name: 'Gemini 2.5 Flash Inker', 
                              badge: 'Fast Vector', 
                              desc: 'Ultra-fast vector contour extraction & outline styling' 
                            },
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => setGeminiModel(m.id)}
                              className={`px-3 py-2 rounded-xl text-left transition cursor-pointer flex flex-col gap-0.5 ${
                                geminiModel === m.id
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 ring-1 ring-amber-400 shadow-sm'
                                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-stone-200">{m.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono font-semibold">
                                  {m.badge}
                                </span>
                              </div>
                              <span className="text-[9px] text-stone-400 leading-tight">{m.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hugging Face Model Selector */}
                    {provider === 'huggingface' && (
                      <div className="mt-3 p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Select Hugging Face Model:
                          </span>
                          <span className="text-[9px] text-stone-400">Serverless Inference</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'black-forest-labs/FLUX.1-schnell', label: 'FLUX.1 Schnell (Fast & Sharp)' },
                            { id: 'stabilityai/stable-diffusion-xl-base-1.0', label: 'SDXL Base 1.0 (Crisp Inks)' },
                            { id: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1 Dev (Ultra Detail)' },
                            { id: 'ByteDance/SDXL-Lightning', label: 'SDXL Lightning (4-Step)' },
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setHfModel(m.id);
                                setCustomHfModel('');
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold text-left transition cursor-pointer ${
                                hfModel === m.id && !customHfModel
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-stone-500 shrink-0">Custom Model:</span>
                          <input
                            type="text"
                            placeholder="e.g. prompthero/openjourney"
                            value={customHfModel}
                            onChange={(e) => setCustomHfModel(e.target.value)}
                            className="flex-1 bg-stone-900 text-stone-300 border border-stone-800 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Aspect Ratio Selector */}
                    <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Aspect Ratio:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { id: '3:4', label: '3:4 Portrait (Coloring Book)' },
                          { id: '1:1', label: '1:1 Square' },
                          { id: '4:3', label: '4:3 Landscape' },
                        ].map((ar) => (
                          <button
                            key={ar.id}
                            onClick={() => setAspectRatio(ar.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              aspectRatio === ar.id
                                ? 'bg-amber-500 text-stone-950 shadow-sm'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            {ar.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt Text Box */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Prompt Description
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePolishPrompt}
                        disabled={isPolishingPrompt}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold cursor-pointer flex items-center gap-1 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded-md shadow-sm"
                        title="AI enhances your prompt with authentic cultural coloring book contour rules"
                      >
                        {isPolishingPrompt ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                        ) : (
                          <Wand2 className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{isPolishingPrompt ? 'Polishing...' : '✨ AI Polish Prompt'}</span>
                      </button>
                      <button
                        onClick={() => {
                          const fullPrompt = `${prompt.trim()}, clean black and white coloring book page, bold crisp black outer contour silhouette, delicate inner contour lines, pure white hollow fillable areas, no grayscale, no shading, commercial publishing vector standard`;
                          navigator.clipboard.writeText(fullPrompt);
                          setCopyPromptSuccess(true);
                          setTimeout(() => setCopyPromptSuccess(false), 5000);
                        }}
                        className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1 bg-sky-950/50 border border-sky-800/60 px-2 py-0.5 rounded-md"
                        title="Copy prompt for Bing Image Creator (100% Free DALL-E 3)"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copyPromptSuccess ? 'Copied Prompt!' : 'Copy for Free Bing DALL-E 3'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(prev => `${prev.trim()}, thick black outer silhouette, clean interior contour lines, no shading, no grayscale, hollow fillable white regions, professional coloring book illustration`);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        + Rules
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-stone-950 text-stone-200 border border-stone-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Describe your coloring page..."
                  />
                  {copyPromptSuccess && (
                    <div className="mt-1.5 p-2 rounded-xl bg-sky-950/80 border border-sky-800 text-[11px] text-sky-200 leading-tight flex items-start gap-1.5 animate-fadeIn">
                      <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        Prompt copied! Open <a href="https://www.bing.com/create" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-amber-300">bing.com/create</a> (free DALL-E 3) to generate 4 ultra-high-res images, then drag your favorite into the <strong>Photo Converter</strong> tab above!
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      if (generatorEngine === 'cloud-ai') {
                        handleGenerateWithCloudAI();
                      } else {
                        handleGenerateProcedural();
                      }
                    }}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{statusMessage || 'Drawing Line Art...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Coloring Page</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerateProcedural}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 text-amber-300 border border-amber-900/60 text-xs font-bold transition cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Draw with Heritage Studio (No Key Needed)</span>
                  </button>
                </div>
              </>
            ) : (
              /* Photo Convert Tab */
              <div>
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Upload Any Picture to Extract Line Art
                </label>
                <label className="border-2 border-dashed border-stone-700 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-stone-950/60 mb-4">
                  <Upload className="w-8 h-8 text-amber-400" />
                  <span className="text-xs font-semibold text-stone-200">
                    Click to upload photo
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Converts photo to clean coloring contours in real time
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Line Art Tuning & Pure B&W Clarifier */}
            <div className="mt-5 pt-4 border-t border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Sliders className="w-3.5 h-3.5" /> Line Art Tuning & Clarifier
                </span>
                {activeTab === 'ai-generate' && (
                  <button
                    onClick={() => handleTogglePureBW(!enforcePureBW)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                      enforcePureBW
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                    }`}
                    title="Toggle Pure B&W Coloring Book Mode"
                  >
                    <CheckCircle className={`w-3 h-3 ${enforcePureBW ? 'text-amber-400' : 'text-stone-500'}`} />
                    {enforcePureBW ? 'Zero Shading (Pure B&W)' : 'Raw AI Output'}
                  </button>
                )}
              </div>

              <div className="space-y-3 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
                {activeTab === 'ai-generate' && enforcePureBW && (
                  <div className="text-[11px] text-amber-200/80 bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 leading-relaxed">
                    ✨ <strong>Pure Coloring Book Clarifier Active:</strong> All gray skin tones, ambient shadows, and airbrush gradients are converted to 100% pure white paper (#ffffff), leaving bold solid black contour outlines (#000000) ready for the paint bucket!
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span>{activeTab === 'photo-convert' ? 'Edge Detection Threshold' : 'Ink Contour Darkness'}</span>
                  <span className="font-mono text-amber-400 text-xs">{edgeThreshold}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="190"
                  value={edgeThreshold}
                  onChange={(e) => handleSliderChange(Number(e.target.value), edgeIntensity, lineThickness)}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span>Outline Thickness</span>
                  <span className="font-mono text-amber-400 text-xs">{lineThickness}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={lineThickness}
                  onChange={(e) => handleSliderChange(edgeThreshold, edgeIntensity, Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Recent Generations History */}
            {historyItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Recent Generations ({historyItems.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {historyItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentImageDataUrl(item.dataUrl);
                        setCurrentTitle(item.title);
                        const img = new Image();
                        img.onload = () => {
                          const c = document.createElement('canvas');
                          c.width = img.width;
                          c.height = img.height;
                          const ctx = c.getContext('2d')!;
                          ctx.drawImage(img, 0, 0);
                          renderProcessedLineArt(c);
                        };
                        img.src = item.dataUrl;
                      }}
                      className="w-12 h-12 rounded-xl border border-stone-800 hover:border-amber-400 overflow-hidden shrink-0 bg-white shadow-sm transition hover:scale-105 cursor-pointer"
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

        {/* Right Column: Live Generated Artwork Canvas & 1-Click Game Launchers */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
            {/* Header info */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white font-display m-0">
                  {currentTitle}
                </h3>
                <span className="text-xs text-stone-400">
                  Crisp Vector Inked Coloring Page
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Ready to Color &amp; Play
              </span>
            </div>

            {/* Generated Line Art Canvas Stage */}
            <div className="relative p-4 sm:p-6 bg-stone-950 rounded-2xl border-2 border-stone-800/90 shadow-2xl flex items-center justify-center min-h-[380px] w-full overflow-hidden">
              <canvas
                ref={previewCanvasRef}
                className="max-h-[460px] max-w-full rounded-xl shadow-2xl bg-white border border-stone-300 object-contain"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center z-10 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin" />
                  <div className="text-sm font-bold text-amber-300 font-display">
                    {statusMessage || 'Drawing coloring lines...'}
                  </div>
                  <div className="text-xs text-stone-400 max-w-xs">
                    Applying thick exterior silhouettes and clean fillable cavities.
                  </div>
                </div>
              )}
            </div>

            {/* 1-Click Game Mode Launchpad */}
            <div className="w-full mt-6 pt-4 border-t border-stone-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-display">
                Launch Artwork Into:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Send to Coloring Studio */}
                <button
                  onClick={handleSendToColoringStudio}
                  className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  <span>Coloring Studio</span>
                </button>

                {/* 2. Send to Paint by Numbers */}
                <button
                  onClick={() => {
                    handleSendToColoringStudio();
                    if (onJumpToPaintByNumbers) onJumpToPaintByNumbers();
                  }}
                  className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  <Hash className="w-4 h-4 text-amber-400" />
                  <span>Paint by Numbers</span>
                </button>

                {/* 3. Connect the Dots */}
                <button
                  onClick={handleConvertToConnectDots}
                  className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  <CircleDot className="w-4 h-4 text-emerald-400" />
                  <span>Connect Dots</span>
                </button>

                {/* 4. Print 8.5x11 Sheet */}
                <button
                  onClick={handlePrintSheet}
                  className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Print (PDF)</span>
                </button>
              </div>

              {/* Direct PNG / SVG Download */}
              <div className="flex items-center justify-between text-xs text-stone-400 pt-1 flex-wrap gap-2">
                <span>Save line art file directly:</span>
                <div className="flex items-center gap-3">
                  {currentImageDataUrl?.startsWith('data:image/svg+xml') && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `${currentTitle.toLowerCase().replace(/\s+/g, '-')}-vector.svg`;
                        link.href = currentImageDataUrl;
                        link.click();
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Scalable SVG
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const canvas = previewCanvasRef.current;
                      if (!canvas) return;
                      const link = document.createElement('a');
                      link.download = `${currentTitle.toLowerCase().replace(/\s+/g, '-')}-coloring-sheet.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download High-Res PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Guide Modal */}
      {showApiGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-left shadow-2xl relative">
            <h3 className="text-xl font-bold text-white font-display mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" /> Which API Keys Can Generate These Images?
            </h3>
            <p className="text-xs text-stone-300 mb-4">
              To generate brand-new, customized coloring pages matching the style of your examples, you can use any of the following API keys:
            </p>

            <div className="space-y-3 mb-6">
              {/* Hugging Face (FLUX & SDXL) */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-amber-500/70 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    🤗 1. Hugging Face Inference API (Directly Supported!)
                  </span>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Hugging Face Tokens <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  • <strong>How it works:</strong> Paste your Hugging Face User Access Token (starts with <code>hf_</code>). The app connects to top open-source diffusion models like <strong>FLUX.1 Schnell</strong> (fastest &amp; highest quality) and <strong>SDXL Base 1.0</strong> via serverless inference to generate pristine commercial-quality line art!
                </p>
              </div>

              {/* OpenAI DALL-E 3 */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-sky-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    2. OpenAI DALL-E 3
                  </span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    OpenAI Keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  • Keys starting with <code>sk-</code> connect directly to OpenAI&apos;s <em>DALL-E 3</em> diffusion engine for commercial coloring book outlines.
                </p>
              </div>

              {/* Bing Image Creator (Free DALL-E 3) */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-amber-900/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    3. Bing Image Creator (100% Free DALL-E 3)
                  </span>
                  <a
                    href="https://www.bing.com/create"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Open Bing Create <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  • Zero credit card, zero API keys! Click the <strong>&ldquo;Copy for Free Bing DALL-E 3&rdquo;</strong> button in our prompt box, generate 4 free images on Bing/Copilot, and drag your favorite into the <strong>Photo Converter</strong> tab above!
                </p>
              </div>

              {/* Google Gemini / AI Studio */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-amber-500/60 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    ✨ 4. Google AI Studio (Gemini GenAI Suite)
                  </span>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Google AI Studio Keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  • <strong>Nano Banana 2.1 &amp; Gemini 3 Pro:</strong> State-of-the-art diffusion generating razor-sharp vector-inked outlines.<br/>
                  • <strong>100% Free Gemini 3.8 Flash Vector Inker:</strong> Creates infinite-resolution scalable SVGs that work on all Google AI Studio keys without needing image quota!
                </p>
              </div>

              {/* Built-in Procedural Studio */}
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-emerald-900/40">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  5. Built-in Procedural Heritage Studio (Zero Keys Needed!)
                </span>
                <p className="text-[11px] text-stone-300">
                  Switch the engine to <strong>Procedural Studio</strong> to instantly draw hand-crafted illustrations including the <em>Toddler Blowing Bubbles in the Grass</em>, <em>Queen with Spiral Afro Curls</em>, and <em>Young Boy King</em> with 100% crisp vector precision.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApiGuideModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
            >
              Got it, Let&apos;s Create!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
