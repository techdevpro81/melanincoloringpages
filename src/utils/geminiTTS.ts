import { GoogleGenAI } from '@google/genai';

export interface TTSOptions {
  text: string;
  apiKey?: string;
  voiceName?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: string;
}

export const CULTURAL_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    description: 'Warm, soulful storyteller with rich resonance & comforting presence',
    gender: 'Female / Warm'
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    description: 'Lyrical Griot cadence, expressive folklore elder & poetic delivery',
    gender: 'Female / Lyrical'
  },
  {
    id: 'Charon',
    name: 'Charon',
    description: 'Deep ancestral baritone, grounded, dignified & authoritative',
    gender: 'Male / Deep Baritone'
  },
  {
    id: 'Puck',
    name: 'Puck',
    description: 'Energetic, vibrant, celebratory youth story guide',
    gender: 'Male / Expressive'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    description: 'Rich, husky, cinematic narrator tone',
    gender: 'Male / Cinematic'
  }
];

/**
 * Generate high-fidelity storytelling narration using Gemini 3.8 Flash TTS
 */
export async function generateGeminiStorySpeech(options: TTSOptions): Promise<string> {
  const { text, apiKey, voiceName = 'Kore' } = options;
  const cleanKey = apiKey?.trim();

  if (!cleanKey) {
    throw new Error('No API key provided. Falling back to built-in device speech synthesis.');
  }

  // 1. Try with GoogleGenAI SDK
  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore'
            }
          }
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'audio/wav';
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  } catch (sdkErr: any) {
    console.warn('SDK TTS attempt notice:', sdkErr?.message || sdkErr);
  }

  // 2. Direct REST fallback to ensure robust compatibility
  try {
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${cleanKey}`;
    const restRes = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore'
              }
            }
          }
        }
      })
    });

    if (!restRes.ok) {
      const errJson = await restRes.json().catch(() => null);
      throw new Error(errJson?.error?.message || `TTS REST Error (${restRes.status})`);
    }

    const data = await restRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'audio/wav';
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('Gemini TTS returned no audio data in candidate response.');
  } catch (err: any) {
    console.warn('Gemini 3.8 Flash TTS REST call failed:', err);
    throw new Error(err.message || 'Gemini TTS generation error');
  }
}

/**
 * Built-in browser speech synthesis fallback (works offline with zero keys)
 */
export function playWebSpeechNarration(
  text: string,
  onEnd: () => void,
  onBoundary?: (charIndex: number) => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;   // Gentle, measured storytelling cadence
  utterance.pitch = 0.98;  // Warm and grounded

  // Attempt to select a high quality natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Google'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    onEnd();
  };

  utterance.onerror = () => {
    onEnd();
  };

  if (onBoundary) {
    utterance.onboundary = (e) => {
      onBoundary(e.charIndex);
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopWebSpeechNarration(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
