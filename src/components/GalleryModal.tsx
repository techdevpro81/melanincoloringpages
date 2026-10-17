import React, { useState } from 'react';
import type { SavedArtwork } from '../types';
import { getSavedArtworks, deleteSavedArtwork } from '../utils/storage';
import { CULTURAL_ARTWORKS } from '../data/artworks';
import { X, Download, Trash2, Printer, FolderHeart, Sparkles, Image as ImageIcon } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'gallery' | 'print';
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'gallery',
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'print'>(defaultTab);
  const [artworks, setArtworks] = useState<SavedArtwork[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<SavedArtwork | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setArtworks(getSavedArtworks());
      setActiveTab(defaultTab);
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this artwork from your gallery?')) {
      deleteSavedArtwork(id);
      setArtworks(getSavedArtworks());
      if (selectedPreview?.id === id) {
        setSelectedPreview(null);
      }
    }
  };

  const handlePrintArtwork = (svgId: string) => {
    const art = CULTURAL_ARTWORKS.find(a => a.id === svgId);
    if (!art) return;

    // Create printable window with SVG outline
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgPaths = art.regions
      .map(r => `<path d="${r.path}" fill="none" stroke="#000000" stroke-width="2.5" />`)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${art.title} - Melanin Canvas Coloring Sheet</title>
          <style>
            @page { size: letter portrait; margin: 0.5in; }
            body { font-family: system-ui, sans-serif; text-align: center; margin: 0; padding: 20px; }
            h1 { font-size: 22px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
            p { font-size: 13px; color: #555; margin-top: 0; margin-bottom: 16px; }
            svg { width: 100%; max-height: 8.5in; border: 2px solid #333; border-radius: 8px; }
            .footer { margin-top: 15px; font-size: 11px; color: #888; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${art.title}</h1>
          <p>${art.description}</p>
          <svg viewBox="0 0 ${art.width} ${art.height}">
            ${svgPaths}
          </svg>
          <div class="footer">MELANIN CANVAS • BLACK HERITAGE ART STUDIO • COLOR AT HOME</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-left">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <FolderHeart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display m-0">
                Cultural Gallery &amp; Printables
              </h3>
              <p className="text-xs text-stone-400">
                Manage your saved masterpieces and print out black &amp; white sheets for real-world coloring.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Saved Artworks ({artworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'print'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Printable Coloring Sheets</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'gallery' ? (
            artworks.length === 0 ? (
              <div className="text-center py-16 text-stone-500 text-sm">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                <p>No saved artworks yet.</p>
                <p className="text-xs text-stone-600 mt-1">
                  Color a page in the Coloring Studio or finish a Paint by Numbers to save it here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {artworks.map((art) => (
                  <div
                    key={art.id}
                    className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex flex-col group hover:border-amber-500/50 transition-all shadow-md"
                  >
                    <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 relative flex items-center justify-center p-2">
                      <img
                        src={art.previewUrl}
                        alt={art.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-bold text-white font-display truncate">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center justify-between mt-1">
                        <span className="capitalize">{art.mode}</span>
                        <span>{art.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-800">
                      <a
                        href={art.previewUrl}
                        download={`${art.title.toLowerCase().replace(/\s+/g, '-')}.png`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/50 hover:text-rose-400 text-stone-400 transition cursor-pointer"
                        title="Delete from gallery"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Printable Sheets Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CULTURAL_ARTWORKS.map((art) => (
                <div
                  key={art.id}
                  className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition shadow-md"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {art.category}
                    </span>
                    <h4 className="text-base font-bold text-white font-display mt-2 mb-1">
                      {art.title}
                    </h4>
                    <p className="text-xs text-stone-400 line-clamp-2">
                      {art.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePrintArtwork(art.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print 8.5x11 Sheet</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
