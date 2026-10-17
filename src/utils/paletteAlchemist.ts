import { GoogleGenAI } from '@google/genai';
import type { ColorPalette, ColorSwatchDetail } from '../types';

export interface InspirationTheme {
  theme: string;
  label: string;
  emoji: string;
  hint: string;
}

export const CULTURAL_ALCHEMIST_INSPIRATIONS: InspirationTheme[] = [
  {
    theme: 'Yoruba River Goddess Oshun, honey, gold, amber, sweet water, cowrie shells',
    label: 'Oshun Honey & Brass',
    emoji: '🍯',
    hint: 'Sacred golden amber, sweet river waters, antique brass & cowrie ivory'
  },
  {
    theme: '1920s Harlem Speakeasy Velvet, jazz trumpet brass, Savoy burgundy, smoky indigo',
    label: 'Harlem Jazz Velvet',
    emoji: '🎷',
    hint: 'Smoked plum, antique brass trumpet, Savoy burgundy & cotton club indigo'
  },
  {
    theme: 'Afrofuturist Wakanda Vibranium, astral plane violet, quantum cyan, solar flare gold',
    label: 'Wakanda Vibranium',
    emoji: '🌌',
    hint: 'Vibranium cyan, quantum magenta, solar gold & astral violet'
  },
  {
    theme: 'Nubian Queen, ancient Kingdom of Kush, royal lapis lazuli, Nile basalt, gold leaf',
    label: 'Nubian Nile Gold',
    emoji: '👑',
    hint: 'Deep lapis lazuli, desert sandstone, royal gold & Nile basalt'
  },
  {
    theme: 'Ghanaian Royal Kente cloth, sacred geometric dyes, Akan gold, liberation red, emerald hope',
    label: 'Kente Imperial Silk',
    emoji: '🧵',
    hint: 'Precious gold, sacred green, imperial crimson & indigo peace'
  },
  {
    theme: 'Gullah Geechee Lowcountry Sea Islands, sweetgrass basket brown, native indigo dye, marsh green',
    label: 'Gullah Sea Indigo',
    emoji: '🌾',
    hint: 'Lowcountry marsh, sweetgrass brown, tidal sand & ancient indigo'
  },
  {
    theme: 'Salvador da Bahia Carnival, Pelourinho colonial pastel facades, samba drums, tropical turquoise',
    label: 'Bahia Sunset Samba',
    emoji: '🎭',
    hint: 'Pelourinho pastel facades, samba scarlet, tropical teal & ocean cobalt'
  },
  {
    theme: 'Ethiopian Highlands, Arabica coffee blossom, Lalibela carved stone clay, sacred brass crosses',
    label: 'Highland Coffee & Clay',
    emoji: '☕',
    hint: 'Roasted coffee bean, volcanic red clay, cross amber & incense smoke'
  },
  {
    theme: 'Radiant Melanin Skin Tones, deep espresso, roasted mahogany, cinnamon bronze, warm honey peach',
    label: 'Radiant Melanin Spectrum',
    emoji: '✨',
    hint: 'Rich espresso, bronze undertones, roasted mahogany & warm caramel glow'
  },
  {
    theme: 'Crown Adornments, cowrie shells, wooden beads, gold hair cuffs, copper wire loc wraps',
    label: 'Crown Beads & Adornments',
    emoji: '💎',
    hint: 'Polished cowrie white, burnished copper, coral beads & gold wire wraps'
  }
];

// Helper to convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper to clean hex
function normalizeHex(hex: string): string {
  let clean = hex.trim().replace(/^#+/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '#8c4d2e';
  }
  return `#${clean.toLowerCase()}`;
}

/**
 * Rich Procedural Cultural Palette Generator
 * Generates culturally authentic, harmonic color palettes even with no API key or when offline.
 */
export function generateProceduralCulturalPalette(theme: string): ColorPalette {
  const lower = theme.toLowerCase();

  // 1. Oshun / Gold / River
  if (lower.includes('oshun') || lower.includes('honey') || lower.includes('river goddess')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#f59e0b', name: 'Oshun Amber Gold', culturalMeaning: 'Sacred honey of the river goddess, sweet abundance and fertility' },
      { hex: '#d97706', name: 'Burnished Brass', culturalMeaning: 'Sacred mirrors and bells used in traditional Yoruba river ceremonies' },
      { hex: '#b45309', name: 'Spiced Honey', culturalMeaning: 'Sweet offerings poured onto fresh river waters' },
      { hex: '#78350f', name: 'Sacred Ochre Earth', culturalMeaning: 'Fertile riverbank clay sustaining flourishing life' },
      { hex: '#fde68a', name: 'Canary Sun Ray', culturalMeaning: 'Golden morning light filtering through sacred canopies' },
      { hex: '#fbbf24', name: 'Cowrie Shimmer', culturalMeaning: 'Divination shells and royal wealth of West African queens' },
      { hex: '#0284c7', name: 'Sweetwater Azure', culturalMeaning: 'Cool freshwater springs where Oshun dances' },
      { hex: '#0f766e', name: 'River Lotus Emerald', culturalMeaning: 'Lush medicinal aquatic botanicals along the Oshun River' },
      { hex: '#fffbeb', name: 'Mother of Pearl Foam', culturalMeaning: 'Frothing sacred waters carrying answered prayers' },
      { hex: '#451a03', name: 'Deep Palm Kernel', culturalMeaning: 'Ancient rooted foundation of ancestral lineage' }
    ];
    return {
      id: `custom-oshun-${Date.now()}`,
      name: 'Oshun Honey & River Waters',
      description: 'Luminous honey amber, sacred brass, and shimmering freshwater blues honoring the Yoruba goddess of love, beauty, and fertility.',
      culturalStory: 'In Yoruba spiritual tradition, Oshun is the sovereign mother of sweet waters, passion, and wealth. Her altars overflow with golden honey, polished brass fans, peacock plumes, and cowrie shells, celebrating the radiant joy of life.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 2. Harlem Renaissance / Jazz Velvet
  if (lower.includes('harlem') || lower.includes('jazz') || lower.includes('speakeasy') || lower.includes('velvet')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#581c87', name: 'Midnight Velvet', culturalMeaning: 'Deep royal velvet banquettes of 1920s Harlem speakeasies' },
      { hex: '#701a75', name: 'Smoked Plum', culturalMeaning: 'Moody late-night cabaret lighting over the grand piano' },
      { hex: '#831843', name: 'Savoy Ballroom Burgundy', culturalMeaning: 'Swirling silk dresses at the iconic home of happy feet' },
      { hex: '#991b1b', name: 'Vintage Mahogany', culturalMeaning: 'Hand-carved Apollo Theater proscenium woodwork' },
      { hex: '#ca8a04', name: 'Miles Davis Brass', culturalMeaning: 'Gleaming bell of a custom golden jazz trumpet' },
      { hex: '#854d0e', name: 'Antique Amber Resonator', culturalMeaning: 'Vintage hollow-body jazz archtop guitar' },
      { hex: '#1e293b', name: 'Cotton Club Indigo', culturalMeaning: 'Cool night air on 135th Street after a midnight jam session' },
      { hex: '#334155', name: 'Smoky Slate', culturalMeaning: 'Atmospheric vinyl record grooves and cigar smoke' },
      { hex: '#78716c', name: 'Sepia Sheet Music', culturalMeaning: 'Handwritten Duke Ellington arrangements on vintage paper' },
      { hex: '#f5ebe0', name: 'Aged Ivory Keys', culturalMeaning: 'Vintage Steinway upright piano ivory keys' }
    ];
    return {
      id: `custom-harlem-${Date.now()}`,
      name: 'Harlem Renaissance & Velvet Brass',
      description: 'Intimate cabaret purples, brass trumpet tones, and deep speakeasy velour born from the golden age of Black American artistic brilliance.',
      culturalStory: 'The Harlem Renaissance transformed 1920s New York into the cultural epicenter of the Black world. Between Langston Hughes’ poetry, Louis Armstrong’s cornet solos, and Augusta Savage’s sculptures, these tones echo the smoky glamour and intellectual triumph of the era.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 3. Wakanda / Afrofuturism / Vibranium
  if (lower.includes('wakanda') || lower.includes('vibranium') || lower.includes('afrofutur') || lower.includes('cosmic')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#6366f1', name: 'Vibranium Glow', culturalMeaning: 'Pulsing purple kinetic energy stored in sacred meteorite metal' },
      { hex: '#06b6d4', name: 'Quantum Hyper-Cyan', culturalMeaning: 'Holographic ancestral engineering displays' },
      { hex: '#8b5cf6', name: 'Astral Plane Violet', culturalMeaning: 'Spiritual dreamscape where panther kings converse with ancestors' },
      { hex: '#d946ef', name: 'Heart-Shaped Herb Magenta', culturalMeaning: 'Rare glowing flora imbued with superhuman stamina and grace' },
      { hex: '#ec4899', name: 'Solar Flare Pink', culturalMeaning: 'Sunlit royal palace domes overlooking Birnin Zana' },
      { hex: '#10b981', name: 'Bioluminescent Canopy', culturalMeaning: 'Lush hidden rain forests fortified with invisible shields' },
      { hex: '#eab308', name: 'Dora Milaje Gold', culturalMeaning: 'Hand-forged golden neck rings and spears of the elite guard' },
      { hex: '#3b82f6', name: 'Sub-Saharan Sky Cobalt', culturalMeaning: 'Unpolluted high-altitude African atmosphere' },
      { hex: '#0f172a', name: 'Meteorite Basalt', culturalMeaning: 'Ancient cosmic rock that birthed centuries of innovation' },
      { hex: '#ffffff', name: 'Starlight Supernova', culturalMeaning: 'Infinite wisdom beaming across ancestral galaxies' }
    ];
    return {
      id: `custom-afrofuturism-${Date.now()}`,
      name: 'Wakandan Vibranium & Astral Realms',
      description: 'Cosmic neon purples, glowing cyan kinetic weaves, and Dora Milaje gold reflecting the pinnacle of Afrofuturist innovation.',
      culturalStory: 'Afrofuturism fuses African diaspora mythology, sovereign technology, and cosmic metaphysics. It reimagines past and future where Black creators stand at the vanguard of interstellar discovery while honoring ancestral roots.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 4. Nubian / Nile / Kush / Egypt
  if (lower.includes('nubia') || lower.includes('nile') || lower.includes('kush') || lower.includes('pyramid') || lower.includes('pharaoh')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#1e3a8a', name: 'Royal Lapis Lazuli', culturalMeaning: 'Sacred celestial stone crushed into royal pigments for Kushite monarchs' },
      { hex: '#2563eb', name: 'Nile Flood Blue', culturalMeaning: 'Life-giving annual inundation bringing fertility to the valley' },
      { hex: '#d97706', name: 'Imperial Gold Leaf', culturalMeaning: 'Uncorrupted flesh of the gods that adorned temple pyramids' },
      { hex: '#b45309', name: 'Meroë Sandstone', culturalMeaning: 'Sunbaked red granite pyramids of the royal cemetery of Kush' },
      { hex: '#78350f', name: 'Terracotta Urn', culturalMeaning: 'Ancient wheel-thrown Nubian pottery with geometric patterns' },
      { hex: '#047857', name: 'Papyrus Reed Green', culturalMeaning: 'Marsh reeds along the cataract waters of the Upper Nile' },
      { hex: '#171717', name: 'Basalt Sarcophagus', culturalMeaning: 'Carved volcanic stone standing eternal against desert winds' },
      { hex: '#fef3c7', name: 'Sahara Sunlight', culturalMeaning: 'High midday desert radiance reflecting off temple pylons' },
      { hex: '#dc2626', name: 'Carnelian Amulet', culturalMeaning: 'Protective red stone favored by Nubian warrior queens (Kandakes)' },
      { hex: '#e2e8f0', name: 'Limestone Plaster', culturalMeaning: 'Smooth white finish coating ancient temple courts' }
    ];
    return {
      id: `custom-nubia-${Date.now()}`,
      name: 'Nubian Gold & Nile Lapis',
      description: 'Regal lapis lazuli, desert sandstone, and gleaming gold leaf commemorating the 25th Dynasty Black Pharaohs and Kandake warrior queens.',
      culturalStory: 'The Kingdom of Kush flourished along the Nile for millennia, conquering Egypt to establish the 25th Dynasty. Their queens (Kandakes) led armies into battle, while their goldsmiths forged jewelry that rivaled any civilization in antiquity.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 5. Kente / Ghana / Ashanti
  if (lower.includes('kente') || lower.includes('ghana') || lower.includes('ashanti') || lower.includes('mudcloth')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#e11d48', name: 'Royal Crimson (Kɔkɔɔ)', culturalMeaning: 'Blood, sacrifice, and the passion of ancestors who defended freedom' },
      { hex: '#f59e0b', name: 'Imperial Gold (Sika)', culturalMeaning: 'Royalty, wealth, high status, and spiritual purity' },
      { hex: '#059669', name: 'Sacred Green (Bun)', culturalMeaning: 'Renewal, fertile earth, harvest, and spiritual growth' },
      { hex: '#2563eb', name: 'Sky Indigo (Bruu)', culturalMeaning: "Peace, harmony, love, and the vast expanse of the creator's sky" },
      { hex: '#171717', name: 'Bogolan Black (Tuntum)', culturalMeaning: 'Spiritual maturity, intensified ancestral energy, and passing rites' },
      { hex: '#ffffff', name: 'Purified White (Fitaa)', culturalMeaning: 'Purity, festive joy, spirituality, and contact with gods' },
      { hex: '#9333ea', name: 'Royal Amethyst (Bire)', culturalMeaning: 'Earth goddess feminine power and healing rituals' },
      { hex: '#78350f', name: 'Bark Earth (Dɔteɛ)', culturalMeaning: 'Mother earth, planting cycles, and grounded wisdom' },
      { hex: '#f97316', name: 'Amber Glow (Akɔkɔ)', culturalMeaning: 'Dawn vitality and warming hearth fire' },
      { hex: '#0d9488', name: 'Turquoise Stream', culturalMeaning: 'Cooling waters balancing vibrant ceremonial warmth' }
    ];
    return {
      id: `custom-kente-${Date.now()}`,
      name: 'Ghanaian Royal Kente Cloth',
      description: 'Sacred ceremonial colors of West African handwoven strip-weave textiles, where each dye carries ancient philosophical meaning.',
      culturalStory: 'Originating in Bonwire in the Ashanti Kingdom, Kente was traditionally reserved exclusively for kings and queen mothers. Every single pattern and color combination communicates proverbs about leadership, unity, and spiritual renewal.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 6. Gullah Geechee / Lowcountry / Indigo
  if (lower.includes('gullah') || lower.includes('geechee') || lower.includes('indigo') || lower.includes('sweetgrass') || lower.includes('marsh')) {
    const swatches: ColorSwatchDetail[] = [
      { hex: '#1e3a8a', name: 'Sea Island Indigo', culturalMeaning: 'Sacred blue dye cultivated with West African botanical mastery' },
      { hex: '#3b82f6', name: 'Haint Blue', culturalMeaning: 'Ancestral protective porch ceiling blue deterring restless spirits' },
      { hex: '#15803d', name: 'Lowcountry Saltmarsh', culturalMeaning: 'Spartina cordgrass swaying in coastal South Carolina breezes' },
      { hex: '#84cc16', name: 'Sweetgrass Blade', culturalMeaning: 'Pliable fragrant grass coiled into legendary handcrafted baskets' },
      { hex: '#78350f', name: 'Pine Needle Brown', culturalMeaning: 'Rich forest floor materials bound into traditional basketry' },
      { hex: '#d97706', name: 'Amber Oyster Pearl', culturalMeaning: 'Warm tidal treasures harvested from coastal estuaries' },
      { hex: '#f8fafc', name: 'Coquina Shell White', culturalMeaning: 'Crushed oyster tabby building material of historic quarters' },
      { hex: '#0f172a', name: 'Maritime Night Forest', culturalMeaning: 'Ancient live oaks draped in hanging Spanish moss' },
      { hex: '#64748b', name: 'Spanish Moss Gray', culturalMeaning: 'Ancestral whispers floating in coastal Georgia river mists' },
      { hex: '#e11d48', name: 'Carolina Red Rice', culturalMeaning: 'Gullah heritage culinary staple honoring West African rice cultivation' }
    ];
    return {
      id: `custom-gullah-${Date.now()}`,
      name: 'Gullah Geechee Sea Islands & Haint Blue',
      description: 'Lush Lowcountry saltmarsh greens, sacred indigo vats, sweetgrass browns, and protective Haint Blue of the coastal Sea Islands.',
      culturalStory: 'The Gullah Geechee people preserved more African linguistic, culinary, and artisanal traditions than almost any other diaspora community in North America. Their indigo mastery shaped global trade, while Haint Blue remains a sacred shield against negativity.',
      colors: swatches.map(s => s.hex),
      colorDetails: swatches,
      isCustom: true,
      themePrompt: theme
    };
  }

  // 7. General Dynamic Semantic Generator based on theme keywords & Color Harmony
  // Hash the theme to produce deterministic, cohesive cultural palettes
  let hash = 0;
  for (let i = 0; i < theme.length; i++) {
    hash = (hash << 5) - hash + theme.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Determine base hue
  let baseHue = absHash % 360;
  let saturation = 70 + (absHash % 25); // 70-95%
  let isWarm = false;

  if (lower.includes('gold') || lower.includes('sun') || lower.includes('amber') || lower.includes('honey')) {
    baseHue = 38 + (absHash % 12); // Gold spectrum
    isWarm = true;
  } else if (lower.includes('blue') || lower.includes('ocean') || lower.includes('sea') || lower.includes('water')) {
    baseHue = 205 + (absHash % 25); // Ocean spectrum
  } else if (lower.includes('purple') || lower.includes('violet') || lower.includes('royal')) {
    baseHue = 270 + (absHash % 30); // Royal purple spectrum
  } else if (lower.includes('green') || lower.includes('nature') || lower.includes('jungle') || lower.includes('forest')) {
    baseHue = 145 + (absHash % 30); // Emerald/nature spectrum
  } else if (lower.includes('red') || lower.includes('ruby') || lower.includes('fire') || lower.includes('passion')) {
    baseHue = 350 + (absHash % 15); // Crimson spectrum
    isWarm = true;
  } else if (lower.includes('melanin') || lower.includes('brown') || lower.includes('earth') || lower.includes('bronze')) {
    baseHue = 24 + (absHash % 14); // Warm earth & bronze
    isWarm = true;
  }

  const generatedSwatches: ColorSwatchDetail[] = [];
  const tones = [
    { l: 15, name: 'Deep Sovereign Shadow', desc: 'Rooted ancestral depth and foundational resilience' },
    { l: 28, name: 'Burnished Earth', desc: 'Rich organic warmth of fertile soil and clay' },
    { l: 42, name: 'Vibrant Heritage Tone', desc: 'Saturated cultural heart of the chosen melody' },
    { l: 55, name: 'Radiant Jewel Highlight', desc: 'Luminous dynamic brilliance catching daylight' },
    { l: 70, name: 'Sunlight Shimmer', desc: 'Airy warmth illuminating top contours' },
    { l: 85, name: 'Almond & Shell Pearl', desc: 'Delicate ivory glow for fine reflective accents' },
  ];

  tones.forEach((t) => {
    const hex = hslToHex(baseHue, saturation, t.l);
    generatedSwatches.push({
      hex,
      name: `${t.name}`,
      culturalMeaning: t.desc
    });
  });

  // Add 3 Harmonious Complementary / Accent Tones
  const accentHues = [
    (baseHue + 180) % 360, // Complementary
    (baseHue + 45) % 360,  // Analogous Warm
    (baseHue + 120) % 360, // Triadic Jewel
    (baseHue + 240) % 360  // Triadic Contrast
  ];

  const accentNames = [
    { name: 'Contrasting Jewel Harmony', desc: 'Dynamic energetic balance providing focal contrast' },
    { name: 'Warm Ancestral Ember', desc: 'Gentle warmth echoing twilight fires' },
    { name: 'Cosmic Royal Cyan', desc: 'Expansive vision and elevated consciousness' },
    { name: 'Golden Sunburst', desc: 'Radiance, royalty, and celebration of life' }
  ];

  accentHues.forEach((h, idx) => {
    const hex = hslToHex(h, isWarm ? 85 : 75, 52);
    generatedSwatches.push({
      hex,
      name: accentNames[idx].name,
      culturalMeaning: accentNames[idx].desc
    });
  });

  const formattedTitle = theme
    .split(' ')
    .slice(0, 4)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    id: `custom-${absHash.toString(36)}-${Date.now()}`,
    name: `${formattedTitle} Harmonic Alchemy`,
    description: `A custom-formulated cultural palette capturing the soul, warmth, and balance of "${theme}".`,
    culturalStory: `Formulated through dynamic color alchemy, these tones harmonize deep melanin undertones with luminous cultural accents to celebrate Black heritage, vibrancy, and expressive power.`,
    colors: generatedSwatches.map(s => s.hex),
    colorDetails: generatedSwatches,
    isCustom: true,
    themePrompt: theme
  };
}

/**
 * AI Cultural Palette Alchemist powered by Google Gemini (gemini-3.8-flash)
 * Falls back to rich procedural generation if key is absent or API is unavailable.
 */
export async function generateCulturalPaletteWithAI(
  theme: string,
  apiKey?: string
): Promise<ColorPalette> {
  const cleanKey = apiKey?.trim();

  // If no API key provided, invoke procedural alchemist immediately
  if (!cleanKey) {
    return generateProceduralCulturalPalette(theme);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });

    const prompt = `You are a world-class cultural art director and master colorist specializing in Black American, African, and Afro-diasporic cultural art, fashion, and history.

Generate a harmonious, authentic, publication-grade 8 to 10 color palette inspired by this cultural theme:
"${theme}"

Return ONLY a valid JSON object matching this schema (do NOT include Markdown ticks or backticks or conversational preamble):
{
  "name": "Creative evocative title for the palette (e.g. 'Oshun Sweetwater & Sacred Brass')",
  "description": "A 1-2 sentence poetic summary of the mood and aesthetic",
  "culturalStory": "A 1-2 paragraph description explaining the cultural history, symbolism, spiritual traditions, or diaspora significance of these colors.",
  "swatches": [
    {
      "hex": "#RRGGBB",
      "name": "Culturally grounded color name (e.g. 'Sovereign Ochre', 'Miles Davis Brass', 'Kente Imperial Sika', 'Haint Blue')",
      "culturalMeaning": "Brief sentence explaining what this specific shade symbolizes in Black culture, nature, or spiritual lore."
    }
  ]
}

Guidelines:
- Ensure hex codes are valid 6-character hex strings starting with #.
- Balance deep rich melanin undertones, vibrant cultural jewels, and crisp ivory/accent highlights.
- Make the names culturally authentic, poetic, and inspiring.`;

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];
    let text = '';
    for (const mod of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: mod,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          }
        });
        text = response.text?.trim() || '';
        if (text) break;
      } catch {
        // Continue to next model
      }
    }
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed && Array.isArray(parsed.swatches) && parsed.swatches.length >= 5) {
      const swatches: ColorSwatchDetail[] = parsed.swatches.map((s: any) => ({
        hex: normalizeHex(s.hex || '#d97706'),
        name: s.name || 'Heritage Tone',
        culturalMeaning: s.culturalMeaning || 'Symbol of resilience and cultural expression'
      }));

      return {
        id: `custom-ai-${Date.now()}`,
        name: parsed.name || `${theme} Palette`,
        description: parsed.description || `AI-alchemized cultural palette inspired by "${theme}".`,
        culturalStory: parsed.culturalStory || 'Rooted in Black cultural heritage and expressive art traditions.',
        colors: swatches.map(s => s.hex),
        colorDetails: swatches,
        isCustom: true,
        themePrompt: theme
      };
    }

    throw new Error('AI returned an unexpected palette structure.');
  } catch (err) {
    console.warn('Gemini Palette Alchemist failed, activating procedural alchemist fallback:', err);
    return generateProceduralCulturalPalette(theme);
  }
}
