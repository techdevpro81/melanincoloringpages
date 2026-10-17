import type { SavedArtwork, ColorPalette } from '../types';

const GALLERY_STORAGE_KEY = 'melanin_canvas_saved_artworks';
const GEMINI_API_KEY_STORAGE = 'melanin_canvas_gemini_api_key';
const CUSTOM_PALETTES_STORAGE_KEY = 'melanin_canvas_custom_palettes';

export function getCustomPalettes(): ColorPalette[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PALETTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load custom palettes:', err);
    return [];
  }
}

export function saveCustomPalette(palette: ColorPalette): void {
  try {
    const current = getCustomPalettes();
    const updated = [palette, ...current.filter(p => p.id !== palette.id)].slice(0, 50);
    localStorage.setItem(CUSTOM_PALETTES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom palette:', err);
  }
}

export function deleteCustomPalette(id: string): void {
  try {
    const current = getCustomPalettes();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(CUSTOM_PALETTES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom palette:', err);
  }
}

export function getSavedArtworks(): SavedArtwork[] {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load gallery artworks:', err);
    return [];
  }
}

export function saveArtworkToGallery(artwork: SavedArtwork): void {
  try {
    const current = getSavedArtworks();
    const updated = [artwork, ...current.filter(a => a.id !== artwork.id)].slice(0, 30);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save artwork:', err);
  }
}

export function deleteSavedArtwork(id: string): void {
  try {
    const current = getSavedArtworks();
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete artwork:', err);
  }
}

export function getStoredGeminiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
}

export function setStoredGeminiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  }
}

const ELEVENLABS_API_KEY_STORAGE = 'melanin_canvas_elevenlabs_api_key';
const ELEVENLABS_VOICE_ID_STORAGE = 'melanin_canvas_elevenlabs_voice_id';

export function getStoredElevenLabsKey(): string {
  const envKey = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY || '';
  return localStorage.getItem(ELEVENLABS_API_KEY_STORAGE) || envKey;
}

export function setStoredElevenLabsKey(key: string): void {
  if (key) {
    localStorage.setItem(ELEVENLABS_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(ELEVENLABS_API_KEY_STORAGE);
  }
}

export function getStoredElevenLabsVoiceId(): string {
  const envVoiceId = (import.meta as any).env?.VITE_ELEVENLABS_VOICE_ID || '';
  return localStorage.getItem(ELEVENLABS_VOICE_ID_STORAGE) || envVoiceId;
}

export function setStoredElevenLabsVoiceId(voiceId: string): void {
  if (voiceId) {
    localStorage.setItem(ELEVENLABS_VOICE_ID_STORAGE, voiceId.trim());
  } else {
    localStorage.removeItem(ELEVENLABS_VOICE_ID_STORAGE);
  }
}

const ELEVENLABS_VOICES_CACHE = 'melanin_canvas_elevenlabs_voices_cache';

export function getStoredElevenLabsVoices(): any[] {
  try {
    const raw = localStorage.getItem(ELEVENLABS_VOICES_CACHE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setStoredElevenLabsVoices(voices: any[]): void {
  try {
    localStorage.setItem(ELEVENLABS_VOICES_CACHE, JSON.stringify(voices));
  } catch {
    // Ignore storage error
  }
}


