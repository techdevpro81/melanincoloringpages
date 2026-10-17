// ElevenLabs Text-to-Speech Integration Service for Cultural Storytelling

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
}

export interface ElevenLabsOptions {
  text: string;
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

export const POPULAR_ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'Premade',
    description: 'Warm, calm, and soothing storytelling voice'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'Premade',
    description: 'Expressive, narrative, and engaging delivery'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'Premade',
    description: 'Deep, resonant, traditional storyteller'
  },
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'Premade',
    description: 'Rich, smooth, and dignified orator'
  },
  {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    category: 'Premade',
    description: 'Crisp, articulate, authoritative tone'
  }
];

/**
 * Synthesize high-fidelity cultural narration audio via ElevenLabs
 */
export async function generateElevenLabsStorySpeech(options: ElevenLabsOptions): Promise<string> {
  const { text, apiKey, voiceId, modelId = 'eleven_multilingual_v2' } = options;
  const cleanKey = apiKey.trim();
  const cleanVoiceId = voiceId.trim();

  if (!cleanKey) {
    throw new Error('Please enter your ElevenLabs API Key to generate narration.');
  }

  if (!cleanVoiceId) {
    throw new Error('Please specify an ElevenLabs Voice ID.');
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${cleanVoiceId}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': cleanKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const detailMsg = errorJson?.detail?.message || errorJson?.detail || errorJson?.message;
    throw new Error(detailMsg || `ElevenLabs API error (${response.status}): ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Fetch available voices (including custom cloned voices) from user's ElevenLabs account
 */
export async function fetchElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return [];

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': cleanKey,
      }
    });

    if (!res.ok) {
      console.warn(`Failed to fetch ElevenLabs voices: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data && Array.isArray(data.voices)) {
      return data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
        description: v.labels?.description || v.labels?.accent || v.category || '',
        preview_url: v.preview_url,
      }));
    }
    return [];
  } catch (err) {
    console.warn('Error fetching ElevenLabs voice list:', err);
    return [];
  }
}
