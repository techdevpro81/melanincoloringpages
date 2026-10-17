import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Play,
  Pause,
  Music,
  Mic,
  RotateCcw,
  AudioWaveform,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
  Check,
  KeyRound
} from 'lucide-react';
import {
  generateElevenLabsStorySpeech,
  fetchElevenLabsVoices,
  POPULAR_ELEVENLABS_VOICES,
  type ElevenLabsVoice
} from '../utils/elevenLabsService';
import {
  generateGeminiStorySpeech,
  playWebSpeechNarration,
  stopWebSpeechNarration,
  CULTURAL_VOICES
} from '../utils/geminiTTS';
import { soundManager } from '../utils/audio';
import {
  getStoredElevenLabsKey,
  setStoredElevenLabsKey,
  getStoredElevenLabsVoiceId,
  setStoredElevenLabsVoiceId,
  getStoredElevenLabsVoices,
  setStoredElevenLabsVoices,
  getStoredGeminiKey
} from '../utils/storage';

export type NarrationProvider = 'elevenlabs' | 'gemini' | 'browser';

interface CulturalStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  story: string;
}

export const CulturalStoryModal: React.FC<CulturalStoryModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  story,
}) => {
  const [provider, setProvider] = useState<NarrationProvider>('elevenlabs');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [enableNeoSoulChords, setEnableNeoSoulChords] = useState<boolean>(true);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // ElevenLabs Configuration State
  const [elevenApiKey, setElevenApiKey] = useState<string>(() => getStoredElevenLabsKey());
  const [elevenVoiceId, setElevenVoiceId] = useState<string>(() => getStoredElevenLabsVoiceId());
  const [showElevenConfig, setShowElevenConfig] = useState<boolean>(() => {
    const key = getStoredElevenLabsKey();
    const voice = getStoredElevenLabsVoiceId();
    return !key || !voice;
  });
  const [showApiKeyText, setShowApiKeyText] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [userVoices, setUserVoices] = useState<ElevenLabsVoice[]>(() => {
    const cached = getStoredElevenLabsVoices() as ElevenLabsVoice[];
    if (cached && cached.length > 0) return cached;
    return POPULAR_ELEVENLABS_VOICES;
  });
  const [isFetchingVoices, setIsFetchingVoices] = useState<boolean>(false);
  const [voiceSearch, setVoiceSearch] = useState<string>('');

  // Gemini & Browser State
  const [selectedGeminiVoice, setSelectedGeminiVoice] = useState<string>('Kore');

  // Audio elements & synthesis tracking
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cachedAudioUrlsRef = useRef<{ [key: string]: string }>({});

  // Stop everything when closing modal or unmounting
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopWebSpeechNarration();
    soundManager.stopStoryBacking();
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopWebSpeechNarration();
      soundManager.stopStoryBacking();
    };
  }, []);

  // Helper to merge fetched voices with popular defaults and persist in cache
  const mergeAndStoreVoices = (fetched: ElevenLabsVoice[]): ElevenLabsVoice[] => {
    const voiceMap = new Map<string, ElevenLabsVoice>();
    fetched.forEach((v) => voiceMap.set(v.voice_id, v));
    POPULAR_ELEVENLABS_VOICES.forEach((v) => {
      if (!voiceMap.has(v.voice_id)) voiceMap.set(v.voice_id, v);
    });
    const combined = Array.from(voiceMap.values());
    setUserVoices(combined);
    setStoredElevenLabsVoices(combined);
    return combined;
  };

  // Immediate voice selection handler that updates state & local storage
  const handleSelectElevenVoice = (voiceId: string) => {
    stopAllAudio();
    setElevenVoiceId(voiceId);
    setStoredElevenLabsVoiceId(voiceId);
    cachedAudioUrlsRef.current = {};
    const found = userVoices.find((v) => v.voice_id === voiceId);
    if (found) {
      setNoticeMessage(`Voice set to: "${found.name}"`);
      setTimeout(() => setNoticeMessage(null), 3500);
    }
  };

  // Fetch ElevenLabs voices on load if API key exists
  useEffect(() => {
    if (elevenApiKey.trim()) {
      fetchElevenLabsVoices(elevenApiKey)
        .then((fetched) => {
          if (fetched.length > 0) {
            mergeAndStoreVoices(fetched);
          }
        })
        .catch(() => {
          // Keep cached voices on error
        });
    }
  }, [elevenApiKey]);

  if (!isOpen) return null;

  const handleSaveElevenCredentials = () => {
    setStoredElevenLabsKey(elevenApiKey);
    setStoredElevenLabsVoiceId(elevenVoiceId);
    setSavedFeedback(true);
    setNoticeMessage(null);
    cachedAudioUrlsRef.current = {}; // clear cached audio for new credentials
    setTimeout(() => {
      setSavedFeedback(false);
      setShowElevenConfig(false);
    }, 1200);
  };

  const handleFetchAccountVoices = async () => {
    if (!elevenApiKey.trim()) {
      setNoticeMessage('Enter your ElevenLabs API Key first to fetch your custom voices.');
      return;
    }
    setIsFetchingVoices(true);
    setNoticeMessage(null);
    try {
      const fetched = await fetchElevenLabsVoices(elevenApiKey);
      if (fetched.length > 0) {
        const combined = mergeAndStoreVoices(fetched);
        setNoticeMessage(`Found ${fetched.length} voices in your ElevenLabs account! Select any voice below.`);
        // If current voiceId is empty or not in user's voices, select the first fetched account voice
        if (!elevenVoiceId.trim() || !combined.some((v) => v.voice_id === elevenVoiceId)) {
          handleSelectElevenVoice(fetched[0].voice_id);
        }
      } else {
        setNoticeMessage('No custom voices found or API key has restricted permissions.');
      }
    } catch {
      setNoticeMessage('Could not fetch voices. Check your API key.');
    } finally {
      setIsFetchingVoices(false);
    }
  };

  const playAudioElement = (src: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    } else {
      audioRef.current.src = src;
    }

    audioRef.current.onended = () => {
      setIsPlaying(false);
      soundManager.stopStoryBacking();
    };

    audioRef.current.onerror = () => {
      setIsPlaying(false);
      soundManager.stopStoryBacking();
    };

    audioRef.current
      .play()
      .then(() => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error('Audio play error:', err);
        setIsLoadingAudio(false);
        setIsPlaying(false);
        soundManager.stopStoryBacking();
      });
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current && (provider === 'elevenlabs' || provider === 'gemini')) {
        audioRef.current.pause();
      } else {
        stopWebSpeechNarration();
      }
      soundManager.stopStoryBacking();
      setIsPlaying(false);
      return;
    }

    // Start playback
    setIsLoadingAudio(true);
    setNoticeMessage(null);

    // 1. Start soulful neo-soul backing chords if enabled
    if (enableNeoSoulChords) {
      soundManager.startStoryBacking(0.04);
    }

    const narrationText = `${title}. ${story}`;

    // ==========================================
    // PROVIDER 1: ELEVENLABS (High-Fidelity)
    // ==========================================
    if (provider === 'elevenlabs') {
      const activeKey = elevenApiKey.trim() || getStoredElevenLabsKey();
      const activeVoiceId = elevenVoiceId.trim() || getStoredElevenLabsVoiceId();

      if (!activeKey || !activeVoiceId) {
        setIsLoadingAudio(false);
        setShowElevenConfig(true);
        setNoticeMessage('Please enter your ElevenLabs API Key and Voice ID below to narrate.');
        soundManager.stopStoryBacking();
        return;
      }

      const cacheKey = `eleven-${activeVoiceId}-${narrationText.slice(0, 40)}`;

      if (cachedAudioUrlsRef.current[cacheKey]) {
        playAudioElement(cachedAudioUrlsRef.current[cacheKey]);
        return;
      }

      try {
        const audioUrl = await generateElevenLabsStorySpeech({
          text: narrationText,
          apiKey: activeKey,
          voiceId: activeVoiceId,
        });

        cachedAudioUrlsRef.current[cacheKey] = audioUrl;
        playAudioElement(audioUrl);
      } catch (err: any) {
        console.warn('ElevenLabs TTS error:', err);
        setIsLoadingAudio(false);
        soundManager.stopStoryBacking();
        setShowElevenConfig(true);
        setNoticeMessage(`ElevenLabs Error: ${err.message || 'Check key and voice ID.'}`);
      }
      return;
    }

    // ==========================================
    // PROVIDER 2: GOOGLE GEMINI 3.8 FLASH TTS
    // ==========================================
    if (provider === 'gemini') {
      const geminiKey = getStoredGeminiKey();
      if (!geminiKey) {
        setIsLoadingAudio(false);
        setNoticeMessage('No Google AI Studio key found. Switch to Device Voice or enter Gemini key in AI Studio.');
        soundManager.stopStoryBacking();
        return;
      }

      const cacheKey = `gemini-${selectedGeminiVoice}-${narrationText.slice(0, 40)}`;
      if (cachedAudioUrlsRef.current[cacheKey]) {
        playAudioElement(cachedAudioUrlsRef.current[cacheKey]);
        return;
      }

      try {
        const audioUrl = await generateGeminiStorySpeech({
          text: narrationText,
          apiKey: geminiKey,
          voiceName: selectedGeminiVoice,
        });

        cachedAudioUrlsRef.current[cacheKey] = audioUrl;
        playAudioElement(audioUrl);
      } catch (err: any) {
        console.warn('Gemini TTS error:', err);
        setIsLoadingAudio(false);
        soundManager.stopStoryBacking();
        setNoticeMessage(`Gemini TTS Error: ${err.message}`);
      }
      return;
    }

    // ==========================================
    // PROVIDER 3: DEVICE BROWSER SPEECH
    // ==========================================
    setIsLoadingAudio(false);
    setIsPlaying(true);
    currentUtteranceRef.current = playWebSpeechNarration(
      narrationText,
      () => {
        setIsPlaying(false);
        soundManager.stopStoryBacking();
      }
    );
  };

  const handleRestart = () => {
    stopAllAudio();
    setTimeout(() => {
      handleTogglePlay();
    }, 150);
  };

  const handleToggleBackingChords = () => {
    const nextState = !enableNeoSoulChords;
    setEnableNeoSoulChords(nextState);
    if (isPlaying) {
      if (nextState) {
        soundManager.startStoryBacking(0.04);
      } else {
        soundManager.stopStoryBacking();
      }
    }
  };

  const isElevenReady = Boolean(elevenApiKey.trim() && elevenVoiceId.trim());

  // Split voices into User/Account/Cloned and Curated Library
  const accountVoices = userVoices.filter(
    (v) =>
      v.category === 'cloned' ||
      v.category === 'generated' ||
      !POPULAR_ELEVENLABS_VOICES.some((p) => p.voice_id === v.voice_id)
  );
  const libraryVoices = userVoices.filter((v) =>
    POPULAR_ELEVENLABS_VOICES.some((p) => p.voice_id === v.voice_id)
  );

  const filteredVoices = userVoices.filter((v) =>
    voiceSearch.trim()
      ? v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
        (v.category && v.category.toLowerCase().includes(voiceSearch.toLowerCase())) ||
        v.voice_id.toLowerCase().includes(voiceSearch.toLowerCase())
      : true
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fade-in text-left">
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/70 border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[94vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition cursor-pointer"
          title="Close story modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {category || 'Cultural Heritage'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <Mic className="w-3 h-3" /> Voice Storytelling
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-1 m-0">
              {title}
            </h3>
          </div>
        </div>

        {/* Pan-African decorative bar */}
        <div className="h-1 w-full rounded-full pan-african-gradient mb-3.5" />

        {/* Voice Storytelling Deck */}
        <div className="bg-stone-950/90 border border-amber-900/40 rounded-2xl p-4 mb-3 flex flex-col gap-3 shadow-inner">
          {/* Engine Selector Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-850 pb-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => {
                  stopAllAudio();
                  setProvider('elevenlabs');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  provider === 'elevenlabs'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>⚡ ElevenLabs</span>
                {isElevenReady && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  stopAllAudio();
                  setProvider('gemini');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>✨ Gemini TTS</span>
              </button>

              <button
                onClick={() => {
                  stopAllAudio();
                  setProvider('browser');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  provider === 'browser'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🔊 Device Voice</span>
              </button>
            </div>

            {/* ElevenLabs Config Drawer Toggle */}
            {provider === 'elevenlabs' && (
              <button
                onClick={() => setShowElevenConfig(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  showElevenConfig
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800'
                }`}
                title="Configure ElevenLabs API Key & Voice ID"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>{showElevenConfig ? 'Hide Settings' : 'Voice ID & Key'}</span>
              </button>
            )}
          </div>

          {/* ElevenLabs Credentials & Voice Configuration Drawer */}
          {provider === 'elevenlabs' && showElevenConfig && (
            <div className="bg-stone-900/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> ElevenLabs Voice Credentials
                </span>
                <span className="text-[10px] text-stone-400">Stored safely in your local browser</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* API Key */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-stone-300 flex items-center justify-between">
                    <span>API Key (xi-api-key)</span>
                    <button
                      type="button"
                      onClick={() => setShowApiKeyText(prev => !prev)}
                      className="text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {showApiKeyText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </label>
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={elevenApiKey}
                    onChange={(e) => setElevenApiKey(e.target.value)}
                    placeholder="sk_..."
                    className="bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                </div>

                {/* Account Voice Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-stone-300 flex items-center justify-between">
                    <span>Select Voice ({userVoices.length} available)</span>
                    <button
                      type="button"
                      onClick={handleFetchAccountVoices}
                      disabled={isFetchingVoices || !elevenApiKey.trim()}
                      className="text-amber-400 hover:text-amber-300 disabled:opacity-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${isFetchingVoices ? 'animate-spin' : ''}`} />
                      {isFetchingVoices ? 'Fetching...' : 'Fetch My Voices'}
                    </button>
                  </label>
                  <select
                    id="eleven-config-voice-dropdown"
                    value={elevenVoiceId}
                    onChange={(e) => handleSelectElevenVoice(e.target.value)}
                    className="bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose an ElevenLabs Voice --</option>
                    {accountVoices.length > 0 && (
                      <optgroup label="🌟 My Account & Cloned Voices">
                        {accountVoices.map((v) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name} {v.category ? `[${v.category}]` : ''} ({v.voice_id.slice(0, 8)}...)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Curated Library Voices">
                      {libraryVoices.map((v) => (
                        <option key={v.voice_id} value={v.voice_id}>
                          {v.name} {v.description ? `• ${v.description}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Direct Voice ID Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-stone-400 bg-stone-950/70 p-2 rounded-lg border border-stone-800">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold text-stone-300 shrink-0">Voice ID:</span>
                  <input
                    type="text"
                    value={elevenVoiceId}
                    onChange={(e) => {
                      setElevenVoiceId(e.target.value);
                      setStoredElevenLabsVoiceId(e.target.value);
                      cachedAudioUrlsRef.current = {};
                    }}
                    placeholder="e.g. 21m00Tcm4TlvDq8ikWAM or custom ID"
                    className="bg-stone-900 border border-stone-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono w-full focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                  Active: <span className="text-amber-300">{userVoices.find((v) => v.voice_id === elevenVoiceId)?.name || 'Custom ID'}</span>
                </span>
              </div>

              {/* Browse and Click All 36+ Voices */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-stone-400 font-medium">
                    Click to Select Voice ({filteredVoices.length} shown):
                  </span>
                  <input
                    type="text"
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    placeholder="Filter by name..."
                    className="bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2 py-0.5 text-[10px] text-stone-200 placeholder-stone-600 focus:outline-none w-32"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto pr-1 p-1.5 bg-stone-950/80 rounded-lg border border-stone-800/80">
                  {filteredVoices.map((v) => {
                    const isSelected = elevenVoiceId === v.voice_id;
                    const isCustom = accountVoices.some((a) => a.voice_id === v.voice_id);
                    return (
                      <button
                        key={v.voice_id}
                        type="button"
                        onClick={() => handleSelectElevenVoice(v.voice_id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium border transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                            : isCustom
                            ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:border-amber-400 hover:bg-amber-900/50'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-stone-100 hover:border-stone-700'
                        }`}
                        title={v.description || v.voice_id}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        <span>{v.name}</span>
                        {isCustom && <span className="text-[8px] opacity-80 uppercase">🌟</span>}
                      </button>
                    );
                  })}
                  {filteredVoices.length === 0 && (
                    <span className="text-[10px] text-stone-500 italic p-1">No voices match "{voiceSearch}"</span>
                  )}
                </div>
              </div>

              {/* Save & Lock Button */}
              <div className="flex justify-end gap-2 pt-1 border-t border-stone-800">
                <button
                  type="button"
                  onClick={handleSaveElevenCredentials}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer"
                >
                  {savedFeedback ? <Check className="w-3.5 h-3.5 text-stone-950" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{savedFeedback ? 'Credentials Saved!' : 'Save & Use Voice'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Audio Transport Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Play/Pause Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                disabled={isLoadingAudio}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
                }`}
              >
                {isLoadingAudio ? (
                  <AudioWaveform className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>
                  {isLoadingAudio
                    ? 'Synthesizing with ElevenLabs...'
                    : isPlaying
                    ? 'Pause Narration'
                    : 'Listen to Story'}
                </span>
              </button>

              {isPlaying && (
                <button
                  onClick={handleRestart}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition cursor-pointer"
                  title="Restart Story"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Audio Waveform Equalizer Animation */}
            <div className="flex items-center gap-1.5 h-6 px-3 rounded-lg bg-stone-900/60 border border-stone-800">
              {[40, 75, 55, 90, 60, 85, 45, 95, 65, 80, 50, 70].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-stone-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                    animationDelay: `${i * 80}ms`
                  }}
                />
              ))}
              <span className="text-[10px] font-mono text-stone-400 ml-1">
                {isPlaying
                  ? provider === 'elevenlabs'
                    ? 'ElevenLabs Voice'
                    : provider === 'gemini'
                    ? 'Gemini 3.8 TTS'
                    : 'Device Voice'
                  : 'Idle'}
              </span>
            </div>
          </div>

          {/* Sub-controls: Voice Selector & Neo-Soul Chords Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-900 text-xs">
            {/* Active Voice Indicator / Gemini Selector */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-amber-400" /> Active Voice:
              </span>

              {provider === 'elevenlabs' ? (
                <div className="flex items-center gap-1.5">
                  <select
                    id="elevenlabs-voice-transport-select"
                    value={elevenVoiceId}
                    onChange={(e) => handleSelectElevenVoice(e.target.value)}
                    className="bg-stone-900 hover:bg-stone-850 text-amber-300 border border-stone-800 hover:border-amber-500/50 rounded-xl px-2.5 py-1 text-xs font-semibold cursor-pointer focus:ring-1 focus:ring-amber-500 focus:outline-none max-w-[210px] truncate"
                  >
                    <option value="">-- Select Voice --</option>
                    {accountVoices.length > 0 && (
                      <optgroup label="🌟 My Account Voices">
                        {accountVoices.map((v) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name} {v.category ? `(${v.category})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Curated Voices">
                      {libraryVoices.map((v) => (
                        <option key={v.voice_id} value={v.voice_id}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowElevenConfig(!showElevenConfig)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      showElevenConfig
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800'
                    }`}
                    title="ElevenLabs Voice Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : provider === 'gemini' ? (
                <select
                  value={selectedGeminiVoice}
                  onChange={(e) => {
                    stopAllAudio();
                    setSelectedGeminiVoice(e.target.value);
                  }}
                  className="bg-stone-900 text-stone-200 border border-stone-800 rounded-xl px-2 py-0.5 text-xs font-medium cursor-pointer focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {CULTURAL_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-stone-300 text-xs">Natural Browser Synthesizer</span>
              )}
            </div>

            {/* Neo-Soul Backing Chords Toggle */}
            <button
              onClick={handleToggleBackingChords}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                enableNeoSoulChords
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}
              title="Toggle procedural Rhodes neo-soul backing chords"
            >
              <Music className={`w-3.5 h-3.5 ${enableNeoSoulChords ? 'text-amber-400' : 'text-stone-600'}`} />
              <span>Neo-Soul Chords: {enableNeoSoulChords ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Feedback / Status Notice */}
          {noticeMessage && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}
        </div>

        {/* Story Body */}
        <div className="text-sm text-stone-200 leading-relaxed space-y-3 overflow-y-auto pr-2 max-h-[260px] scrollbar-thin">
          <p className="whitespace-pre-line font-serif text-base sm:text-[15px] leading-relaxed text-stone-100">
            {story}
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Oral History &amp; Soulful Storytelling
          </span>
          <button
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition cursor-pointer"
          >
            Back to Art
          </button>
        </div>
      </div>
    </div>
  );
};
