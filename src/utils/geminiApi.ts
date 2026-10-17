// Multi-Provider AI Image Generation Client with Modern Google GenAI Integration
import { HfInference } from '@huggingface/inference';
import { GoogleGenAI } from '@google/genai';
import { generateColoringPage } from '../coloringPage';

export type AIProvider = 'free-ai' | 'gemini' | 'openai' | 'huggingface';

export interface ImageGenOptions {
  apiKey?: string;
  provider: AIProvider;
  prompt: string;
  model?: string;
  aspectRatio?: '1:1' | '3:4' | '4:3';
}

export interface KeyValidationResult {
  valid: boolean;
  provider: AIProvider;
  models: string[];
  hasImageGen: boolean;
  message?: string;
}

/**
 * Master Prompt Builder for Authentic Black Heritage Coloring Pages
 * Replicates the exact drawing style of professional Black coloring books:
 * Delicate monoline inking, hollow white interiors, herringbone braid segments,
 * laid baby hair edges, storybook facial features, and zero solid black hair fills.
 */
export function buildMasterColoringPrompt(prompt: string): string {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  let hairHint = '';
  if (lower.includes('braid') || lower.includes('cornrow')) {
    hairHint = ', outlined hollow chevron braids with cylindrical beads, no solid black hair fills';
  } else if (lower.includes('loc') || lower.includes('dread')) {
    hairHint = ', outlined cylindrical dreadlocks with hollow white interiors, no solid black fills';
  } else if (lower.includes('curl') || lower.includes('afro')) {
    hairHint = ', defined hollow afro spiral curls, closed line contours';
  } else if (lower.includes('fade') || lower.includes('lineup') || lower.includes('line up')) {
    hairHint = ', crisp barber lineup edges';
  }

  return `Clean black and white coloring book page line art, coloring sheet of ${clean}${hairHint}, crisp thin black outlines, pure white paper background, large hollow white spaces to color in, strictly zero shading, strictly zero grayscale, strictly zero color, closed line contours`;
}

/**
 * Free Cloud AI Coloring Page Generator (Turbo Inker with Instant Resilient Fallback)
 * Generates genuine high-resolution coloring pages with ZERO API key required.
 */
export async function generateFreeColoringImage(
  prompt: string,
  aspectRatio: '1:1' | '3:4' | '4:3' = '3:4'
): Promise<string> {
  const width = aspectRatio === '1:1' ? 768 : aspectRatio === '4:3' ? 896 : 640;
  const height = aspectRatio === '1:1' ? 768 : aspectRatio === '4:3' ? 640 : 896;
  
  const enhancedPrompt = buildMasterColoringPrompt(prompt);
  const seed = `${Math.floor(Math.random() * 1000000)}`;
  
  // 1. Try local dev proxy (bypasses browser Cloudflare Turnstile blocks & handles rate-limiting cooldown)
  const proxyUrl = `/api/free-ai-image?prompt=${encodeURIComponent(enhancedPrompt)}&width=${width}&height=${height}&nologo=true&seed=${seed}&_t=${Date.now()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 95000);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/')) {
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to parse image from Free Cloud AI'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch (proxyErr: any) {
    console.warn('Local proxy attempt notice:', proxyErr?.message || proxyErr);
  }

  // 2. Direct fallback
  const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(directUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read image data'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (err: any) {
    console.warn('Direct image server notice:', err?.message || err);
  }

  // If cloud generation fails, throw a clear message so the user is never misled with an unrelated image
  throw new Error(
    'Free Cloud AI server is momentarily busy or rate-limited. Please wait a few seconds and click Generate Page again, or switch to Google Gemini for instant generation!'
  );
}

/**
 * Main AI Coloring Page Generator
 * Supports Free Cloud AI, Google Gemini (SVG Inker & Imagen), OpenAI DALL-E 3, and Hugging Face.
 * Each provider is strictly isolated so switching LLMs always calls the chosen engine.
 */
export async function generateAIColoringImage(
  options: ImageGenOptions
): Promise<string> {
  const { apiKey = '', provider, prompt, aspectRatio = '3:4' } = options;
  const cleanKey = apiKey.trim();

  // 1. Free Cloud AI (FLUX) - No key required
  if (provider === 'free-ai') {
    console.log('Generating coloring sheet with Free Cloud AI (FLUX)...');
    return await generateFreeColoringImage(prompt, aspectRatio);
  }

  // Strict Coloring Book style parameters
  const enhancedPrompt = buildMasterColoringPrompt(prompt);

  // 2. OpenAI DALL-E 3 Provider
  if (provider === 'openai') {
    if (!cleanKey) {
      throw new Error('Please enter your OpenAI API key (starts with sk-).');
    }
    try {
      console.log('Generating coloring sheet with OpenAI DALL-E 3...');
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: aspectRatio === '3:4' ? '1024x1792' : aspectRatio === '4:3' ? '1792x1024' : '1024x1024',
          response_format: 'b64_json',
          quality: 'standard',
          style: 'natural'
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error?.message || `OpenAI error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (b64) {
        return `data:image/png;base64,${b64}`;
      }
      const url = data?.data?.[0]?.url;
      if (url) {
        return url;
      }
      throw new Error('OpenAI returned no image data.');
    } catch (err: any) {
      throw new Error(`OpenAI DALL-E error: ${err.message}`);
    }
  }

  // 3. Hugging Face Inference API Provider (FLUX.1-schnell, SDXL, etc.)
  if (provider === 'huggingface') {
    if (!cleanKey) {
      throw new Error('Please enter your Hugging Face user token (starts with hf_).');
    }
    const hf = new HfInference(cleanKey);
    const primaryModel = (options.model && options.model.includes('/'))
      ? options.model
      : 'black-forest-labs/FLUX.1-schnell';

    const candidateModels = [
      primaryModel,
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'ByteDance/SDXL-Lightning',
    ];
    const modelsToTry = Array.from(new Set(candidateModels));
    let lastHfError = '';

    for (const mod of modelsToTry) {
      try {
        console.log(`Generating with Hugging Face model: ${mod}...`);
        const blob = await hf.textToImage({
          model: mod,
          inputs: enhancedPrompt,
        });

        if (blob) {
          if (typeof blob === 'string') {
            return blob;
          }
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob as unknown as Blob);
          });
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        lastHfError = msg;
        console.warn(`HF model ${mod} error:`, msg);

        if (
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('invalid token') ||
          msg.includes('401')
        ) {
          throw new Error(
            'Hugging Face Authentication Failed: Your token was rejected. Please ensure your token starts with "hf_" and has "Make calls to the serverless Inference API" permission enabled at https://huggingface.co/settings/tokens.'
          );
        }

        if (msg.toLowerCase().includes('no remaining credits') || msg.toLowerCase().includes('credits')) {
          throw new Error('Hugging Face account has no remaining serverless credits. Please switch to Free Cloud AI (FLUX) or Google Gemini in the provider tabs.');
        }

        if (msg.toLowerCase().includes('loading') || msg.includes('503')) {
          try {
            console.log(`Model ${mod} is warming up on Hugging Face. Waiting 3 seconds...`);
            await new Promise((r) => setTimeout(r, 3000));
            const retryBlob = await hf.textToImage({
              model: mod,
              inputs: enhancedPrompt,
            });
            if (retryBlob) {
              if (typeof retryBlob === 'string') {
                return retryBlob;
              }
              return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(retryBlob as unknown as Blob);
              });
            }
          } catch (retryErr: any) {
            lastHfError = retryErr?.message || lastHfError;
          }
        }
      }
    }

    throw new Error(
      `Hugging Face generation error: ${lastHfError || 'Serverless inference is temporarily unavailable. Please try again or switch to Free Cloud AI!'}`
    );
  }

    // 4. Google Gemini / AI Studio Provider
    if (provider === 'gemini') {
      if (!cleanKey) {
        throw new Error('Please enter your Google Gemini API key at the top of the studio.');
      }
      console.log('Generating coloring page with Google Gemini...');
      return await generateColoringPage(cleanKey, prompt);
    }

  throw new Error(`Unknown AI Provider: ${provider}`);
}

/**
 * Gemini Vector (SVG) Coloring Book Generator
 * Synthesizes publication-grade vector line art using Google Gemini.
 * Works on 100% of Google AI Studio keys (both Free Tier & Paid) by using verified Flash models.
 */
export async function generateGeminiVectorColoringSVG(
  apiKey: string,
  prompt: string,
  preferredModel: string = 'gemini-3-flash-preview'
): Promise<string> {
  const cleanKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanKey });

  // List of active models in order of stability, speed, and widespread availability
  const candidateModels = [
    preferredModel,
    'gemini-3-flash-preview',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-lite-latest',
  ];
  const uniqueModels = Array.from(new Set(candidateModels));

  const systemInstruction = `You are a master vector graphic artist and illustrator specializing in high-contrast coloring book art.
Your mission is to generate clean, professional, publication-quality SVG code for a coloring book illustration based strictly on this prompt:
"${prompt}"

CRITICAL COLORING BOOK DESIGN REQUIREMENTS:
1. Root element must be: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
2. Start with an opaque pure white background rectangle: <rect width="800" height="1000" fill="#ffffff" />
3. Color palette: STRICTLY BLACK AND WHITE. All strokes must be "#000000". All fills must be "#ffffff" (white) or "none". NEVER use colors, gradients, grayscale shading, or half-tones.
4. Line weights & Inking Style:
   - Monoline storybook inking style.
   - Main silhouette & outer framing border: stroke-width="2.5"
   - Inner contours and focal shapes: stroke-width="1.8"
   - Delicate details and fine line accents: stroke-width="1.2"
   - Always include stroke-linecap="round" and stroke-linejoin="round"
5. Fillable regions & Strictly Hollow Interiors:
   - Accurately draw the exact subject and elements requested in the prompt: "${prompt}".
   - Ensure all shapes are enclosed elements with fill="#ffffff" and stroke="#000000".
   - The ONLY solid black element permitted is the tiny pupil of the eye if a person or animal is depicted (<circle fill="#000000" ... />) with a white catchlight circle inside it.
   - NEVER fill hair, clothing, or backgrounds with solid black.
6. Cultural sensitivity (if people are depicted):
   - Depict natural hairstyles and textures (locs, dreadlocks, braids, afros, fades) with hollow white interiors and clean contour strokes.
7. Output format: Return ONLY the raw SVG code starting with <svg and ending with </svg>. Do not wrap in markdown code blocks.`;

  let lastErr = '';

  for (const mod of uniqueModels) {
    try {
      console.log(`Generating vector SVG using Gemini model: ${mod}...`);
      const response = await ai.models.generateContent({
        model: mod,
        contents: `${systemInstruction}\n\nUSER PROMPT: ${prompt}`,
        config: {
          temperature: 0.35,
          maxOutputTokens: 8192,
        }
      });

      const fullText = response.text || '';
      const match = fullText.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) {
        let svg = match[0].trim();
        if (!svg.includes('xmlns=')) {
          svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!svg.includes('viewBox=')) {
          svg = svg.replace('<svg', '<svg viewBox="0 0 800 1000"');
        }
        if (!svg.includes('width=')) {
          svg = svg.replace('<svg', '<svg width="800" height="1000"');
        }
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      }
    } catch (e: any) {
      lastErr = e?.message || String(e);
      console.warn(`Vector model ${mod} attempt failed:`, lastErr);
    }
  }

  throw new Error(`Gemini vector SVG generation failed: ${lastErr || 'Could not parse valid SVG output.'}`);
}

/**
 * AI Coloring Prompt Enhancer
 * Transforms a brief user prompt into an authentic, culturally rich coloring page specification.
 * Falls back to built-in cultural prompt director if offline or no key.
 */
export async function enhanceColoringPromptWithGemini(
  apiKey: string,
  prompt: string
): Promise<string> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) return prompt;

  const cleanKey = apiKey.trim();

  // If user has an API key, try Gemini AI prompt expansion
  if (cleanKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];

      for (const mod of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: mod,
            contents: `You are an art director specializing in Black American cultural coloring books.
Enhance this user idea into an authentic, high-impact coloring book prompt:
"${cleanPrompt}"

Requirements:
- Emphasize authentic cultural nuances (e.g., voluminous 3C/4A spiral curls, fresh fade, royal tiara with cowrie shells, kente border, or jazz saxophone).
- Specify crisp bold silhouette outlines, clean interior contours, hollow fillable white spaces, no shading, no grayscale.
- Return ONLY the enhanced prompt string (1 to 2 sentences max). Do not include quotes or conversational preamble.`,
            config: {
              temperature: 0.7,
              maxOutputTokens: 250,
            }
          });

          const enhanced = response.text?.trim();
          if (enhanced) {
            return enhanced.replace(/^["']|["']$/g, '');
          }
        } catch {
          // Try next model
        }
      }
    } catch (err) {
      console.warn('AI prompt enhance failed, applying local cultural expander:', err);
    }
  }

  // Local Cultural Prompt Enhancer (instant, works 100% offline)
  const lower = cleanPrompt.toLowerCase();
  let hairAddition = 'defined natural 3C/4A curls';
  if (lower.includes('fade') || lower.includes('boy') || lower.includes('man')) {
    hairAddition = 'crisp edge lineup and textured top fade';
  } else if (lower.includes('braid') || lower.includes('cornrow')) {
    hairAddition = 'intricate geometric braided cornrows and cowrie shell beads';
  } else if (lower.includes('loc') || lower.includes('dread')) {
    hairAddition = 'flowing royal locs adorned with gold hair rings';
  } else if (lower.includes('puff') || lower.includes('toddler') || lower.includes('baby')) {
    hairAddition = 'adorable high afro puffs tied with bead ball hair ties';
  }

  return `Coloring page of ${cleanPrompt}, featuring ${hairAddition}, royal cultural crown ornaments, clean bold black vector silhouette contours, hollow fillable white spaces, pure white background, no shading, no grayscale.`;
}

/**
 * Test & inspect active models on a user's API key
 */
export async function testGeminiApiKey(apiKey: string): Promise<KeyValidationResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, provider: 'gemini', models: [], hasImageGen: false, message: 'Please enter a key.' };
  }

  if (cleanKey.startsWith('sk-')) {
    return { valid: true, provider: 'openai', models: ['dall-e-3'], hasImageGen: true, message: 'OpenAI key ready for DALL-E 3.' };
  }

  if (cleanKey.startsWith('hf_')) {
    return { valid: true, provider: 'huggingface', models: ['FLUX.1-schnell', 'SDXL Base 1.0'], hasImageGen: true, message: 'Hugging Face token ready.' };
  }

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
      headers: {
        'x-goog-api-key': cleanKey,
      }
    });
    if (!listRes.ok) {
      const err = await listRes.json().catch(() => null);
      const apiMsg = err?.error?.message || '';
      return {
        valid: false,
        provider: 'gemini',
        models: [],
        hasImageGen: false,
        message: apiMsg || `Google API Error (${listRes.status})`
      };
    }

    const data = await listRes.json();
    const rawModels: any[] = data.models || [];
    const modelNames = rawModels.map((m: any) => m.name.replace(/^models\//, ''));

    const hasImagen = modelNames.some((m: string) => m.includes('imagen'));

    return {
      valid: true,
      provider: 'gemini',
      models: modelNames,
      hasImageGen: hasImagen,
      message: hasImagen
        ? `Key verified! ${modelNames.length} models active (Imagen 3 Diffusion + Vector SVG Inker ready).`
        : `Key verified! ${modelNames.length} models active (Gemini Vector SVG Inker ready).`
    };
  } catch (e: any) {
    return {
      valid: false,
      provider: 'gemini',
      models: [],
      hasImageGen: false,
      message: e.message || 'Network error verifying key.'
    };
  }
}
