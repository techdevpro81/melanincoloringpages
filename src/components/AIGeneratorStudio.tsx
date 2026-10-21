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
  AlertCircle,
  BookOpen,
  Search,
  Check
} from 'lucide-react';
import { convertToColoringLineArt, extractContourDots } from '../utils/imageProcessor';
import { getStoredGeminiKey, setStoredGeminiKey } from '../utils/storage';
import { generateColoringPage } from '../coloringPage';
import { 
  enhanceColoringPromptWithGemini, 
  testGeminiApiKey 
} from '../utils/geminiApi';
import { COMMUNITY_PROMPTS } from '../data/communityPrompts';
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
    id: 'scientist-astrophysicist',
    name: 'Dr. Maya Astrophysicist',
    badge: 'Cosmos & STEM',
    imagePreview: '/examples/scientist-astrophysicist.jpg',
    themePhrase: 'Black woman astrophysicist at observatory telescope with star charts',
    prompt: 'Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of a brilliant smiling Black woman astrophysicist with natural curly afro bun and glasses, adjusting a large observatory telescope, surrounded by celestial star charts and planetary globes, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero crosshatching, strictly zero gradients, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'cosmic-queen',
    name: 'Majestic Cosmic Queen',
    badge: 'Afrofuturism & Stars',
    imagePreview: '/examples/cosmic-queen.jpg',
    themePhrase: 'Majestic Black cosmic queen with towering braided nebula crown and celestial robes',
    prompt: 'Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of a majestic Black cosmic queen with elaborate braided crown hair reaching into star constellations, floating in space with orbiting crescent moons, geometric sacred patterns, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero crosshatching, strictly zero gradients, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'robotics-engineer',
    name: 'Robotics Engineer',
    badge: 'Robotics & Future',
    imagePreview: '/examples/robotics-engineer.jpg',
    themePhrase: 'Black male robotics engineer assembling advanced humanoid android',
    prompt: 'Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of an intelligent smiling Black male robotics engineer with short fade haircut wearing safety glasses and workshop apron, working on an advanced friendly humanoid robot with exposed gears, wires, and circuit tools, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero crosshatching, strictly zero gradients, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'healthcare-pediatrician',
    name: 'Pediatric Care & Love',
    badge: 'Healing & Care',
    imagePreview: '/examples/healthcare-pediatrician.jpg',
    themePhrase: 'Smiling Black woman pediatrician gently examining young child with teddy bear',
    prompt: 'Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of a caring smiling Black woman pediatrician wearing scrubs, white coat, and stethoscope, gently listening to the heartbeat of a happy little Black girl sitting on an examination table holding a teddy bear, cheerful clinic room, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero crosshatching, strictly zero gradients, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'teenager-basketball-star',
    name: 'Teen Basketball Star',
    badge: 'Court & Energy',
    imagePreview: '/examples/teenager-basketball.jpg',
    themePhrase: 'Athletic Black male teenager playing basketball on neighborhood court',
    prompt: 'Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of an athletic, handsome smiling Black male teenager with neat twist braids and sharp lineup, wearing a numbered basketball jersey and shorts, joyfully dribbling a basketball on a neighborhood court, complete with basketball hoop, backboard, and net in background, crisp uniform monoline black inking on pure white background, large hollow white spaces easy to color in, strictly zero shading, strictly zero grayscale, strictly zero color, no solid black hair fills, clean closed contours like a printed coloring book'
  },
  {
    id: 'teenager-dreadlocks-guitar',
    name: 'Teenager & Guitar',
    badge: 'Soul & Melanin',
    imagePreview: '/examples/teenager-dreadlocks-guitar.jpg',
    themePhrase: 'Black male teenager with dreadlocks playing acoustic guitar',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a handsome smiling Black male teenager with detailed cylindrical dreadlocks locs with hollow beads, wearing a hoodie and denim jacket, sitting on a wooden stool and happily playing an acoustic guitar, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair locs with distinct outlines, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero gradients, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'baby-boy-truck',
    name: 'Baby Boy & Toy Truck',
    badge: 'Playtime & Joy',
    imagePreview: '/examples/baby-boy-truck.jpg',
    themePhrase: 'Baby boy playing with toy dump truck and alphabet blocks',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of an adorable smiling chubby-cheeked young Black baby boy with cute natural curly afro hair, wearing denim overalls over a t-shirt, sitting on the floor playing with a chunky toy dump truck, big expressive cartoon eyes with white catchlight highlights, cute button nose, full lips, thin crisp black outlines, large open hollow white spaces for coloring, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, clean closed contours, publication-grade coloring book page'
  },
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
  },
  {
    id: 'doctor-stethoscope',
    name: 'Doctor & Healthcare Hero',
    badge: 'Medicine & Care',
    imagePreview: '/examples/doctor-stethoscope.jpg',
    themePhrase: 'Black female doctor with stethoscope in lab coat',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a smiling beautiful Black female doctor wearing a white lab coat with a stethoscope around her neck and medical clipboard in hand, hospital hallway in background, hair in neat braided bun, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'ballerina-dancer',
    name: 'Graceful Ballerina',
    badge: 'Ballet & Grace',
    imagePreview: '/examples/ballerina-dancer.jpg',
    themePhrase: 'Graceful Black ballerina in ruffled tutu and pointe shoes',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a graceful smiling young Black girl ballerina wearing a ruffled tutu dress and ballet pointe shoes, dancing in an elegant arabesque pose on a wooden stage with theater curtains in background, natural curly hair tied up in a high puff bun with ribbon, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, pure white background'
  },
  {
    id: 'hbcu-graduate',
    name: 'HBCU Proud Graduate',
    badge: 'Excellence & Pride',
    imagePreview: '/examples/hbcu-graduate.jpg',
    themePhrase: 'Proud graduate in cap and gown with kente sash stole',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a proud smiling Black young man university graduate wearing academic graduation cap with tassel and graduation gown with kente cloth sash stole, holding a rolled diploma tied with ribbon, university campus bell tower in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'afro-astronaut',
    name: 'Cosmic Astronaut',
    badge: 'Stars & Wonder',
    imagePreview: '/examples/afro-astronaut.jpg',
    themePhrase: 'Black astronaut floating in space among planets and stars',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a smiling cool young Black male astronaut in space suit holding helmet under his arm, floating in outer space with crescent moon, Saturn with rings, cute rocket ship and stars in background, neat curly fade hair, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'father-reading-child',
    name: 'Father & Child Storytime',
    badge: 'Family & Love',
    imagePreview: '/examples/father-reading-child.jpg',
    themePhrase: 'Loving Black father reading book with child on couch',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a loving handsome smiling Black father with short beard and fade haircut sitting on a cozy living room sofa with his smiling child with cute afro puffs, reading a big picture book together, cozy lamp and houseplants in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'stem-scientist',
    name: 'STEM Lab Scientist',
    badge: 'STEM & Discovery',
    imagePreview: '/examples/stem-scientist.jpg',
    themePhrase: 'Young Black girl scientist in laboratory with test tubes and microscope',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of an intelligent smiling young Black girl scientist wearing safety goggles, lab coat, with afro puffs tied with ribbons, standing at a science laboratory workbench with bubbling test tubes, beakers, microscope, and planetary model in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'black-male-engineer',
    name: 'Civil Engineer & Blueprints',
    badge: 'STEM & Building',
    imagePreview: '/examples/black-male-engineer.jpg',
    themePhrase: 'Handsome Black male engineer in hard hat holding blueprints at construction site',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a smiling handsome Black male engineer wearing a hard hat and safety vest, holding rolled architectural blueprints and a tablet, active construction site with crane and steel beams in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, clean closed contours for digital bucket fill, pure white background'
  },
  {
    id: 'black-pilot-airplane',
    name: 'Commercial Airline Pilot',
    badge: 'Aviation & Sky',
    imagePreview: '/examples/black-pilot-airplane.jpg',
    themePhrase: 'Black airline captain in uniform standing in front of airplane',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a proud smiling handsome Black male pilot in commercial airline captain uniform with peaked captain hat and aviator wings badge, standing in front of an airplane jet with airport runway in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'black-chef-cooking',
    name: 'Culinary Master Chef',
    badge: 'Culinary Arts',
    imagePreview: '/examples/black-chef-cooking.jpg',
    themePhrase: 'Black male chef wearing tall toque cooking at kitchen stove',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a cheerful smiling handsome Black male culinary chef wearing tall white chef hat toque and apron, holding a wooden spoon over a steaming soup pot on a commercial kitchen stove with hanging copper pans in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'black-firefighter',
    name: 'Hero Firefighter',
    badge: 'Courage & Service',
    imagePreview: '/examples/black-firefighter.jpg',
    themePhrase: 'Brave Black firefighter in gear with fire engine truck',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of a brave smiling handsome Black male firefighter in bunker gear coat and helmet with protective visor, holding a fire hose nozzle with fire truck engine in background, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  },
  {
    id: 'black-teacher-classroom',
    name: 'Inspirational Teacher',
    badge: 'Education & Mentorship',
    imagePreview: '/examples/black-teacher-classroom.jpg',
    themePhrase: 'Inspiring Black male teacher pointing at chalkboard in classroom',
    prompt: 'Clean black and white coloring book page line art on pure white paper, storybook coloring illustration of an inspiring smiling handsome Black male teacher wearing spectacles and button-up shirt, pointing with chalk to a chalkboard with world map and math formulas in school classroom with wooden desks, delicate uniform monoline black inking, crisp thin black outlines, large hollow open white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, pure white background'
  }
];

const QUICK_STYLE_CHIPS = [
  { label: '+ Basketball & Court', text: ', wearing numbered jersey and shorts, joyfully dribbling basketball with hoop and court in background' },
  { label: '+ Dreadlocks & Guitar', text: ', detailed hollow dreadlocks with beads, playing acoustic guitar' },
  { label: '+ Toy Truck & Blocks', text: ', playing happily with chunky toy dump truck and alphabet blocks A B C' },
  { label: '+ Laid Baby Hair', text: ', wavy laid S-curl baby hair edges on forehead and temples' },
  { label: '+ Stacked Hair Beads', text: ', cylindrical wooden and glass hair beads stacked at braid ends' },
  { label: '+ Herringbone Braids', text: ', intricate hollow chevron herringbone braid segments' },
  { label: '+ Defined 4A Curls', text: ', voluminous defined hollow 4A spiral curl loops' },
  { label: '+ Baroque Tiara', text: ', ornate baroque gemstone tiara crown with pearls' },
  { label: '+ Gold Hair Cuffs', text: ', etched hollow gold cuffs on locs and braids' },
  { label: '+ Pure White Paper', text: ', crisp thin black outlines, pure white paper background, strictly no shading' },
];

// Hand-verified: each image visually depicts the exact topic title it is mapped to.
// Do NOT add approximate matches here — topics without a true match go to the AI generator.
const DEDICATED_HERITAGE_IMAGES: Record<string, string> = {
  // Celebrities & Trailblazers
  'celebrity-001': '/examples/miles-davis.jpg',                 // Miles Davis Playing Trumpet
  'celebrity-002': '/examples/ella-fitzgerald-jazz.jpg',        // Ella Fitzgerald at the Savoy Ballroom
  'celebrity-041': '/examples/mlk-speech.jpg',                  // Martin Luther King Jr. I Have a Dream
  'celebrity-044': '/examples/harriet-tubman-lantern.jpg',      // Harriet Tubman Freedom Lantern
  // Scientists & STEM
  'scientists-001': '/examples/mae-jemison-shuttle.jpg',        // Dr. Mae Jemison aboard Space Shuttle
  'scientists-003': '/examples/nasa-mathematician.jpg',         // Katherine Johnson Calculating Orbital Trajectory
  'scientists-005': '/examples/scientist-astrophysicist.jpg',   // Dr. Beth Brown Observing X-Ray Galaxies
  'scientists-021': '/examples/carver-laboratory.jpg',          // George Washington Carver Laboratory
  // Engineers & Tech Innovators
  'engineers-011': '/examples/robotics-engineer.jpg',           // Humanoid Bipedal Robot Programmer
  'engineers-033': '/examples/clean-energy-engineer.jpg',       // Clean Energy & Wind Turbine Engineer
  // Healthcare & Doctors
  'healthcare-001': '/examples/healthcare-pediatrician.jpg',    // Caring Pediatrician with Young Patient
  'healthcare-008': '/examples/pediatric-surgeon.jpg',          // Dr. Charles Pediatric Surgeon
  // Children & Youth
  'children-001': '/examples/girl-cardboard-rocket.jpg',        // Maya Space Explorer in Cardboard Rocket
  'children-023': '/examples/ballerina-dancer.jpg',             // Young Ballerina First Plié at Barre
  // Teenagers & Passions
  'teenagers-017': '/examples/teenager-dreadlocks-guitar.jpg',  // Acoustic Guitar Singer-Songwriter
  'teenagers-021': '/examples/teenager-basketball.jpg',         // Basketball Point Guard Crossover Dribble
  'teenagers-029': '/examples/teen-skateboarder.jpg',           // Marcus Skatepark Kickflip
  'teenagers-032': '/examples/hbcu-graduate.jpg',               // High School / College Graduation Cap Toss
  // Adults & Everyday Champions
  'adults-003': '/examples/black-chef-cooking.jpg',             // Master Chef Plating Gourmet Soul Food
  'adults-004': '/examples/black-pilot-airplane.jpg',           // Commercial Airline Captain in Cockpit
  'adults-014': '/examples/father-reading-child.jpg',           // Father Reading Bedtime Story
  'adults-024': '/examples/urban-architect.jpg',                // Elena Modern Eco-Architect
  'adults-031': '/examples/harlem-jazz-saxophone.jpg',          // Jazz Saxophonist at Legendary Club
  'adults-075': '/examples/black-firefighter.jpg',              // Firefighter Rescue Captain in Gear
  'adults-076': '/examples/black-male-engineer.jpg',            // Civil Engineer Construction Safety Walk
  // Cosmic & Afrofuturism
  'cosmic-001': '/examples/cosmic-queen.jpg',                   // Afrofuturistic Cosmic Queen of Nebulae
  'cosmic-002': '/examples/afro-astronaut.jpg',                // Afro Astronaut Floating in Deep Space
};

export const AIGeneratorStudio: React.FC<AIGeneratorStudioProps> = ({
  onLoadCustomArtwork,
  onJumpToColoring,
  onLoadCustomPuzzle,
  onJumpToConnectDots,
  onJumpToPaintByNumbers,
}) => {
  // Navigation & Mode (default to 800 Heritage Topics library)
  const [activeTab, setActiveTab] = useState<'prompt' | 'photo' | 'library'>('library');
  const [libraryCategory, setLibraryCategory] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Images produced by `npm run generate-artworks` (public/gallery/manifest.json), keyed by topic id
  const [generatedGallery, setGeneratedGallery] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch('/gallery/manifest.json', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : {}))
      .then((manifest: Record<string, { imagePath?: string }>) => {
        const map: Record<string, string> = {};
        for (const [id, entry] of Object.entries(manifest || {})) {
          if (entry?.imagePath) map[id] = entry.imagePath;
        }
        setGeneratedGallery(map);
      })
      .catch(() => setGeneratedGallery({}));
  }, []);

  // Returns ONLY an image that truly matches this topic, or undefined (never a look-alike substitute)
  const getTopicImage = (topicId: string): string | undefined =>
    generatedGallery[topicId] || DEDICATED_HERITAGE_IMAGES[topicId];
  const verifiedImageCount = COMMUNITY_PROMPTS.filter(p => getTopicImage(p.id)).length;


  // Engine selection: 'heritage' (Path 2, out of the box) | 'gemini' (Google Cloud with billing)
  const [engine, setEngine] = useState<'heritage' | 'gemini'>('heritage');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(getStoredGeminiKey());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Prompt & Style State
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | '4:3'>('3:4');
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Generation Status & Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Canvas State & Tuning (Starts clean with NO canned image loaded)
  const [activeImageDataUrl, setActiveImageDataUrl] = useState<string>('');
  const [activeTitle, setActiveTitle] = useState<string>('Ready to Generate');
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
      // Photo-to-Line-Art mode: Sobel edge detection is strictly for real uploaded photographs
      const processed = convertToColoringLineArt(tempCanvas, {
        threshold: photoThreshold,
        edgeIntensity: 2.5,
        lineThickness: photoThickness,
        detailLevel: 2,
        invert: false,
      });
      cCtx.drawImage(processed, 0, 0);
    } else {
      // For all AI-generated artwork (vector SVG or high-resolution line art):
      // Draw directly onto the canvas to preserve publication-quality line art
      cCtx.drawImage(tempCanvas, 0, 0);

      // Only if the user explicitly enabled Deep Contrast or Bolder Lines:
      if (lineThreshold === 175 || lineThicken) {
        const imgData = cCtx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const thresh = lineThreshold === 175 ? 200 : 160;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (lum > thresh) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          } else {
            d[i] = 0;
            d[i + 1] = 0;
            d[i + 2] = 0;
          }
        }
        cCtx.putImageData(imgData, 0, 0);
      }
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

  // Select Preset Card (Populates the prompt template for the user)
  const handleSelectPreset = (preset: CulturalPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setActiveTitle(preset.name);
    // Note: Do NOT set activeImageDataUrl here!
    // The user clicked this preset card to populate the prompt template.
    // The canvas must only show an image when the AI generator generates it!
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

  // Main Generation Handler (Executes the user's prompt directly)
  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setErrorNotice('Please type a description in the prompt box first!');
      return;
    }

    setIsGenerating(true);
    setErrorNotice(null);
    setGenerationStep(1);
    setStatusText('1/3: Anchoring coloring book contour rules...');

    try {
      let finalDataUrl = '';

      setGenerationStep(2);
      setStatusText('2/3: Inking publication-quality Black heritage line art...');
      
      const cleanKey = engine === 'gemini' ? geminiApiKey.trim() : '';
      finalDataUrl = await generateColoringPage(cleanKey, cleanPrompt, selectedPresetId || undefined);

      setGenerationStep(3);
      setStatusText('3/3: Inking pure black outlines & removing grayscale shading...');
      await new Promise(r => setTimeout(r, 200));

      setActiveImageDataUrl(finalDataUrl);
      const generatedTitle = `Coloring Page: ${cleanPrompt.slice(0, 24)}...`;
      setActiveTitle(generatedTitle);

      // Add to history
      const newHistoryItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        title: cleanPrompt.slice(0, 26),
        dataUrl: finalDataUrl,
        prompt: cleanPrompt,
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
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'library'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>800 Community Topics</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
              800
            </span>
          </button>
        </div>
      </div>

      {/* 800 Community Topics Library View */}
      {activeTab === 'library' ? (
        <div className="flex flex-col gap-6 animate-fadeIn pb-12">
          {/* Top Filter and Search Bar */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-stone-100 flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <span>Black Community Heritage Topics (800 Artworks)</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  100 calibrated coloring prompts each across 8 core community domains. Click any item to load into the AI studio or copy the prompt!
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search 800 topics..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {[
                { id: 'all', label: 'All 800 Topics', icon: '🎨' },
                { id: 'celebrity', label: 'Celebrity (100)', icon: '🌟' },
                { id: 'scientists', label: 'Scientists (100)', icon: '🔬' },
                { id: 'engineers', label: 'Engineers (100)', icon: '⚙️' },
                { id: 'healthcare', label: 'Healthcare (100)', icon: '🩺' },
                { id: 'children', label: 'Children (100)', icon: '🎈' },
                { id: 'teenagers', label: 'Teenagers (100)', icon: '🛹' },
                { id: 'adults', label: 'Adults (100)', icon: '👔' },
                { id: 'cosmic', label: 'Cosmic (100)', icon: '🚀' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLibraryCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    libraryCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle: All 800 vs Inked Master Sheets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Catalog Filter:</span>
                <button
                  onClick={() => setShowOnlyVerified(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    !showOnlyVerified
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  All 800 Topics (AI Generator)
                </button>
                <button
                  onClick={() => setShowOnlyVerified(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                    showOnlyVerified
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ready to Color ({verifiedImageCount})</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-400">
                {showOnlyVerified
                  ? 'Showing verified unique publication-quality illustrations with zero duplicates'
                  : 'Click any topic to generate custom art or color with matching theme'}
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {COMMUNITY_PROMPTS
              .filter(item => {
                if (showOnlyVerified && !getTopicImage(item.id)) return false;
                const matchCat = libraryCategory === 'all' || item.category === libraryCategory;
                const q = librarySearch.toLowerCase().trim();
                const matchSearch = !q ||
                  item.title.toLowerCase().includes(q) ||
                  item.subject.toLowerCase().includes(q) ||
                  item.tags.some(t => t.toLowerCase().includes(q));
                return matchCat && matchSearch;
              })
              .map(item => {
                const dedicatedImage = getTopicImage(item.id);
                const hasDedicatedImage = Boolean(dedicatedImage);

                return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 shadow-md transition group text-left ${
                    hasDedicatedImage
                      ? 'bg-stone-900/90 border-amber-500/40 hover:border-amber-400'
                      : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Visual Coloring Page Image Preview OR Styled Monoline Blueprint */}
                    {hasDedicatedImage ? (
                      <div 
                        onClick={() => {
                          const artwork: Artwork = {
                            id: `comm-${item.id}`,
                            title: item.title,
                            category: (item.category.charAt(0).toUpperCase() + item.category.slice(1)) as any,
                            difficulty: item.difficulty as any,
                            description: item.subject,
                            culturalStory: item.prompt,
                            width: 768,
                            height: 1024,
                            svgPath: '',
                            imageSrc: dedicatedImage,
                            regions: [
                              { id: `cr-${item.id}-1`, number: 1, name: `${item.title} Contour`, path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
                            ]
                          };
                          onLoadCustomArtwork(artwork);
                          onJumpToColoring();
                        }}
                        className="w-full aspect-[4/5] bg-white rounded-xl overflow-hidden mb-3 relative flex items-center justify-center p-2 border border-amber-500/30 group-hover:border-amber-400 transition cursor-pointer group/thumb shadow-inner"
                        title="Click to color this verified illustration"
                      >
                        <img
                          src={dedicatedImage}
                          alt={item.title}
                          className="w-full h-full object-contain filter contrast-125"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-black uppercase tracking-wider shadow">
                          Master Sheet
                        </div>
                        <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shadow-lg flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5" />
                            <span>Click to Color</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Monoline Topic Blueprint Box (Honest Representation) */
                      <div
                        onClick={() => {
                          setPrompt(item.prompt);
                          setActiveTitle(item.title);
                          setActiveTab('prompt');
                        }}
                        className="w-full aspect-[4/5] bg-stone-950 rounded-xl mb-3 p-3.5 border border-dashed border-stone-800 group-hover:border-amber-500/40 transition cursor-pointer flex flex-col justify-between relative group/bp"
                        title="Click to generate this custom artwork in AI Inker"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">
                            {item.category === 'celebrity' ? '🌟' :
                             item.category === 'scientists' ? '🔬' :
                             item.category === 'engineers' ? '⚙️' :
                             item.category === 'healthcare' ? '🩺' :
                             item.category === 'children' ? '🎈' :
                             item.category === 'teenagers' ? '🛹' :
                             item.category === 'adults' ? '👔' : '🚀'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800 font-semibold">
                            AI Ready
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 text-center py-2">
                          <span className="text-[11px] font-bold text-stone-300 line-clamp-2">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-stone-500 leading-tight line-clamp-3">
                            {item.subject}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-800/60 flex items-center justify-center">
                          <span className="text-[10px] text-amber-400 group-hover/bp:underline font-bold flex items-center gap-1">
                            <Wand2 className="w-3 h-3" />
                            <span>Generate in AI Studio</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-semibold text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                        {item.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.subject}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-stone-800/80">
                    <button
                      onClick={() => {
                        const imageSrc = getTopicImage(item.id);
                        if (!imageSrc) {
                          // No true match exists yet: generate this exact topic instead of showing a wrong picture
                          setPrompt(item.prompt);
                          setActiveTitle(item.title);
                          setActiveTab('prompt');
                          return;
                        }
                        const artwork: Artwork = {
                          id: `comm-${item.id}`,
                          title: item.title,
                          category: (item.category.charAt(0).toUpperCase() + item.category.slice(1)) as any,
                          difficulty: item.difficulty as any,
                          description: item.subject,
                          culturalStory: item.prompt,
                          width: 768,
                          height: 1024,
                          svgPath: '',
                          imageSrc,
                          regions: [
                            { id: `cr-${item.id}-1`, number: 1, name: `${item.title} Contour`, path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
                          ]
                        };
                        onLoadCustomArtwork(artwork);
                        onJumpToColoring();
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-md"
                      title="Color this page in Coloring Studio"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>{hasDedicatedImage ? 'Color Now' : 'Generate This Page'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const imageSrc = getTopicImage(item.id);
                        if (!imageSrc) {
                          setPrompt(item.prompt);
                          setActiveTitle(item.title);
                          setActiveTab('prompt');
                          return;
                        }
                        const artwork: Artwork = {
                          id: `comm-${item.id}`,
                          title: item.title,
                          category: (item.category.charAt(0).toUpperCase() + item.category.slice(1)) as any,
                          difficulty: item.difficulty as any,
                          description: item.subject,
                          culturalStory: item.prompt,
                          width: 768,
                          height: 1024,
                          svgPath: '',
                          imageSrc,
                          regions: [
                            { id: `cr-${item.id}-1`, number: 1, name: `${item.title} Contour`, path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
                          ]
                        };
                        onLoadCustomArtwork(artwork);
                        if (onJumpToPaintByNumbers) {
                          onJumpToPaintByNumbers();
                        } else {
                          onJumpToColoring();
                        }
                      }}
                      className="p-1.5 px-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 border border-stone-800 text-xs font-bold transition cursor-pointer"
                      title="Paint by Numbers mode"
                    >
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => {
                        setPrompt(item.prompt);
                        setActiveTitle(item.title);
                        setActiveTab('prompt');
                      }}
                      className="p-1.5 px-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs transition cursor-pointer"
                      title="Open in AI Prompt Studio"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.prompt);
                        setCopiedPromptId(item.id);
                        setTimeout(() => setCopiedPromptId(null), 2500);
                      }}
                      className="p-1.5 px-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs transition cursor-pointer"
                      title="Copy full coloring prompt"
                    >
                      {copiedPromptId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Main Grid: Controls on Left, Live Canvas on Right */
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
                    onClick={() => setEngine('heritage')}
                    className={`p-3 rounded-xl text-left transition cursor-pointer border flex flex-col gap-1 ${
                      engine === 'heritage'
                        ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-400 text-stone-100'
                        : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">🎨 Heritage Inker</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-semibold">
                        Path 2 (Free)
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 leading-tight">
                      Publication-grade Black heritage storybook art. 100% Free, no paid Google account needed!
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
                      <span className="text-xs font-bold text-stone-200">✨ Google Cloud</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-semibold">
                        Paid Key
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 leading-tight">
                      For Google Cloud accounts with paid billing enabled for image models.
                    </span>
                  </button>
                </div>

                {/* Gemini API Key Box (only when Google Cloud is selected) */}
                {engine === 'gemini' && (
                  <div className="mt-1 p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                        Google Cloud / AI Studio API Key (Optional)
                      </span>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Google AI Studio</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={geminiApiKey}
                          onChange={(e) => handleKeyChange(e.target.value)}
                          placeholder="Paste key (starts with AQ... or AIza...)"
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
                  id="prompt-description-input"
                  rows={4}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setSelectedPresetId(null);
                  }}
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="Type any prompt to generate (e.g. 'black male teenager with dreadlocks playing the guitar', 'baby boy with toy truck', 'astronaut exploring a pyramid', 'puppy in the garden')..."
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
                  id="generate-coloring-page-btn"
                  data-testid="generate-btn"
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
                  <div className="p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-xs text-red-200 flex flex-col gap-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 whitespace-pre-wrap leading-relaxed font-medium">
                        {errorNotice}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-red-900/60">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-300 hover:underline text-xs flex items-center gap-1 font-semibold"
                      >
                        <span>Check API Key in Google AI Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
              {activeImageDataUrl ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain filter drop-shadow-sm select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-stone-500 gap-3 border-2 border-dashed border-stone-300 rounded-xl w-full h-full bg-stone-50/50">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-1">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">Canvas Ready for Generation</h3>
                  <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                    Type any idea into the prompt box (or click an inspiration card) and click <span className="font-semibold text-amber-700">"Generate Coloring Page"</span> to generate brand-new line art!
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center animate-fadeIn z-10">
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
                  disabled={!activeImageDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black transition cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Coloring Studio</span>
                </button>

                <button
                  onClick={handleSendToPaintByNumbers}
                  disabled={!activeImageDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 border border-stone-800 text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paint by Numbers</span>
                </button>

                <button
                  onClick={handleSendToConnectDots}
                  disabled={!activeImageDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connect Dots</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!activeImageDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Print (PDF)</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleDownload}
                  disabled={!activeImageDataUrl}
                  className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
      )}
    </div>
  );
};
