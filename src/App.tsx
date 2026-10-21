import { useState } from 'react';
import type { AppMode, Artwork, ConnectDotsPuzzle } from './types';
import { CULTURAL_ARTWORKS } from './data/artworks';
import { Header } from './components/Header';
import { ColoringStudio } from './components/ColoringStudio';
import { PaintByNumbers } from './components/PaintByNumbers';
import { ConnectTheDots } from './components/ConnectTheDots';
import { CulturalStoryModal } from './components/CulturalStoryCard';
import { GalleryModal } from './components/GalleryModal';
import { AIGeneratorStudio } from './components/AIGeneratorStudio';

export function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('coloring');
  const [selectedArtworkId, setSelectedArtworkId] = useState<string>(CULTURAL_ARTWORKS[0].id);

  // Modals state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryDefaultTab, setGalleryDefaultTab] = useState<'gallery' | 'print'>('gallery');
  const [storyModalData, setStoryModalData] = useState<{
    isOpen: boolean;
    title: string;
    category?: string;
    story: string;
  }>({
    isOpen: false,
    title: '',
    category: '',
    story: '',
  });

  // Handle open story modal
  const handleOpenStory = (artwork: Artwork | { title: string; culturalStory: string; category?: string }) => {
    setStoryModalData({
      isOpen: true,
      title: artwork.title,
      category: 'category' in artwork ? artwork.category : 'Cultural Heritage',
      story: artwork.culturalStory,
    });
  };

  const handleOpenGeneralStory = (title: string, story: string) => {
    setStoryModalData({
      isOpen: true,
      title,
      category: 'Black Heritage & History',
      story,
    });
  };

  const [customPuzzle, setCustomPuzzle] = useState<ConnectDotsPuzzle | null>(null);

  // Jump from Connect-the-Dots or Paint-by-Numbers to Coloring Studio
  const handleJumpToColoring = (artworkId?: string) => {
    if (artworkId) {
      setSelectedArtworkId(artworkId);
    }
    setCurrentMode('coloring');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation & Audio Bar */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenGallery={() => {
          setGalleryDefaultTab('gallery');
          setIsGalleryOpen(true);
        }}
        onOpenPrintModal={() => {
          setGalleryDefaultTab('print');
          setIsGalleryOpen(true);
        }}
        onOpenStoryModal={() => {
          const currentArt = CULTURAL_ARTWORKS.find(a => a.id === selectedArtworkId) || CULTURAL_ARTWORKS[0];
          handleOpenStory(currentArt);
        }}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentMode === 'coloring' && (
          <ColoringStudio
            initialArtworkId={selectedArtworkId}
            onOpenStory={handleOpenStory}
            onOpenHeritageLibrary={() => setCurrentMode('ai-studio')}
          />
        )}

        {currentMode === 'paint-by-number' && (
          <PaintByNumbers
            initialArtworkId={selectedArtworkId}
            onOpenStory={handleOpenStory}
            onJumpToColoring={handleJumpToColoring}
            onOpenHeritageLibrary={() => setCurrentMode('ai-studio')}
          />
        )}

        {currentMode === 'connect-dots' && (
          <ConnectTheDots
            onOpenStory={handleOpenGeneralStory}
            onJumpToColoring={handleJumpToColoring}
            customPuzzle={customPuzzle}
          />
        )}

        {currentMode === 'ai-studio' && (
          <AIGeneratorStudio
            onLoadCustomArtwork={(art) => {
              if (!CULTURAL_ARTWORKS.some(a => a.id === art.id)) {
                CULTURAL_ARTWORKS.unshift(art);
              }
              setSelectedArtworkId(art.id);
            }}
            onJumpToColoring={() => setCurrentMode('coloring')}
            onJumpToPaintByNumbers={() => setCurrentMode('paint-by-number')}
            onLoadCustomPuzzle={(puzzle) => setCustomPuzzle(puzzle)}
            onJumpToConnectDots={() => setCurrentMode('connect-dots')}
          />
        )}
      </main>

      {/* Cultural Heritage Story Modal */}
      <CulturalStoryModal
        isOpen={storyModalData.isOpen}
        onClose={() => setStoryModalData(prev => ({ ...prev, isOpen: false }))}
        title={storyModalData.title}
        category={storyModalData.category}
        story={storyModalData.story}
      />

      {/* Saved Gallery & Printables Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        defaultTab={galleryDefaultTab}
        onOpenHeritageLibrary={() => setCurrentMode('ai-studio')}
      />

      {/* Footer Branding & Heritage Tribute */}
      <footer className="border-t border-stone-800/80 bg-stone-900/60 py-6 px-4 mt-12 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-stone-300">Melanin Canvas</span>
            <span>• Celebrating Black American Culture, Joy &amp; History</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Harmonic Audio Synthesizer</span>
            <span>•</span>
            <span>Interactive Digital Art Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
