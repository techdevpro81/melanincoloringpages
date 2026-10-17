export type AppMode = 'coloring' | 'paint-by-number' | 'connect-dots' | 'ai-generator' | 'gallery';

export type ToolType = 'bucket' | 'brush' | 'crayon' | 'marker' | 'glow' | 'glitter' | 'eraser' | 'eyedropper';

export interface ColorSwatchDetail {
  hex: string;
  name: string;
  culturalMeaning?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[];
  colorDetails?: ColorSwatchDetail[];
  isCustom?: boolean;
  themePrompt?: string;
  culturalStory?: string;
}

export interface ArtworkRegion {
  id: string;
  path: string; // SVG path data
  number: number; // For paint by number
  defaultColor?: string;
  targetColor: string;
  name?: string;
}

export interface Artwork {
  id: string;
  title: string;
  category: 'Afrofuturism' | 'Crown & Joy' | 'Jazz & Heritage' | 'Civil Rights & History' | 'Sacred Geometry' | 'Community';
  difficulty: 'Easy' | 'Medium' | 'Detailed';
  description: string;
  culturalStory: string;
  width: number;
  height: number;
  svgPath: string; // Master outline SVG path or groups
  regions: ArtworkRegion[];
  thumbnailSvg?: string;
  connectDotsId?: string;
  imageSrc?: string;
}

export interface DotPoint {
  id: number;
  x: number;
  y: number;
}

export interface ConnectDotsPuzzle {
  id: string;
  title: string;
  category: string;
  culturalStory: string;
  totalDots: number;
  dots: DotPoint[];
  solutionSvgPath: string;
  colorArtworkId?: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export interface SavedArtwork {
  id: string;
  title: string;
  mode: AppMode;
  date: string;
  previewUrl: string;
  history?: any;
}
