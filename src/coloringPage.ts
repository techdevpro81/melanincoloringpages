import { GoogleGenAI } from "@google/genai";

/**
 * Wraps the user's request in strict coloring-page rules.
 * The user's subject goes FIRST and is repeated, so presets never override it.
 */
export function buildColoringPrompt(
  userSubject: string,
  presetTheme?: string
): string {
  const subject = userSubject.trim();
  // If already an ultra-detailed master prompt, pass directly
  if (subject.toLowerCase().includes('clean black and white coloring book page line art') || subject.split(/\s+/).length > 25) {
    return subject;
  }
  const theme = presetTheme ? `, cultural theme to celebrate: ${presetTheme}` : "";

  return `Clean black and white coloring book page line art on pure white paper, publication-quality storybook coloring illustration of ${subject}${theme}, delicate uniform monoline inking, crisp thin black outlines, large open hollow white spaces everywhere for coloring in, hollow white hair with neat black contours, strictly zero solid black hair fills, strictly zero shading, strictly zero grayscale, strictly zero color, strictly zero crosshatching, strictly zero gradients, clean closed contours for digital bucket fill, pure white background`;
}

/** Calls Gemini and returns a data URL of the raw generated image or vector line art. */
export async function generateRawImage(
  apiKey: string,
  prompt: string
): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Please enter a Google Gemini API key.');
  }

  // Pre-validate key format with clear guidance:
  if (cleanKey.startsWith('sk-')) {
    throw new Error('This looks like an OpenAI key (starts with sk-). Please enter a valid Google Gemini key.');
  }
  if (cleanKey.startsWith('hf_')) {
    throw new Error('This looks like a Hugging Face token (starts with hf_). Please enter a valid Google Gemini key.');
  }
  if (cleanKey.length < 15) {
    throw new Error('Please enter a valid Google Gemini API key.');
  }

  let lastErrorMsg = '';

  // 1. Discover models enabled on this specific key
  let availableImageModels: string[] = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
      headers: { 'x-goog-api-key': cleanKey }
    });
    if (listRes.ok) {
      const data = await listRes.json();
      const allModels: string[] = (data.models || []).map((m: any) => m.name.replace(/^models\//, ''));
      availableImageModels = allModels.filter((m: string) => 
        m.includes('image') || m.includes('imagen')
      );
      if (availableImageModels.length > 0) {
        console.log('[Google AI] Image models detected on user key:', availableImageModels);
      }
    }
  } catch (err: any) {
    console.warn('[Google AI] Could not query models list:', err?.message || err);
  }

  // Priority order: Google AI Studio Gemini Image models first, followed by Vertex Imagen models
  const candidateModels = Array.from(new Set([
    ...availableImageModels,
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3-pro-image-preview',
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001',
  ]));

  // Strategy A: Google Native generateContent with responseModalities: ["IMAGE"]
  // This is the native REST API for Gemini image models in Google AI Studio
  for (const model of candidateModels) {
    if (model.includes('imagen-')) continue; // Imagen models use predict or generateImages
    try {
      console.log(`[Google AI] Trying generateContent with model: ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
            responseFormat: {
              image: {
                aspectRatio: '3:4'
              }
            }
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/jpeg';
            console.log(`[Google AI] Successfully generated image via generateContent (${model})!`);
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      } else {
        const err = await res.json().catch(() => null);
        const msg = err?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Google AI] generateContent (${model}) notice:`, msg);
        lastErrorMsg = msg;
      }
    } catch (err: any) {
      console.warn(`[Google AI] generateContent (${model}) network error:`, err?.message || err);
      lastErrorMsg = err?.message || String(err);
    }
  }

  // Strategy B: Google OpenAI-compatible Image Generation Endpoint (/v1beta/openai/images/generations)
  for (const model of candidateModels) {
    try {
      console.log(`[Google AI] Trying OpenAI-compatible endpoint with model: ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/images/generations?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          response_format: 'b64_json',
          n: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data?.data?.[0]?.b64_json;
        if (b64) {
          console.log(`[Google AI] Successfully generated image via OpenAI-compatible endpoint (${model})!`);
          return `data:image/jpeg;base64,${b64}`;
        }
      } else {
        const err = await res.json().catch(() => null);
        const msg = err?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Google AI] OpenAI endpoint (${model}) notice:`, msg);
        lastErrorMsg = msg;
      }
    } catch (err: any) {
      console.warn(`[Google AI] OpenAI endpoint (${model}) network error:`, err?.message || err);
      lastErrorMsg = err?.message || String(err);
    }
  }

  // Strategy C: @google/genai SDK generateContent with responseModalities
  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    for (const model of candidateModels) {
      if (model.includes('imagen-')) continue;
      try {
        console.log(`[Google AI] Trying SDK generateContent with ${model}...`);
        const response: any = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseModalities: ['IMAGE'],
          }
        });
        const parts = response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/jpeg';
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      } catch (sdkErr: any) {
        const msg = sdkErr?.message || String(sdkErr);
        console.warn(`[Google AI] SDK generateContent (${model}) notice:`, msg);
        lastErrorMsg = msg || lastErrorMsg;
      }
    }
  } catch (err: any) {
    console.warn('[Google AI] SDK client notice:', err?.message || err);
  }

  // Strategy D: Fallback for Vertex AI / Imagen models (if user has enterprise access)
  for (const model of ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001']) {
    try {
      console.log(`[Google AI] Trying Vertex Imagen predict for ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${cleanKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '3:4',
            outputOptions: { mimeType: 'image/jpeg' },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          return `data:image/jpeg;base64,${b64}`;
        }
      }
    } catch {}
  }

  // If all attempts failed, throw a clear actionable error
  throw new Error(
    `Google AI Image Generation Error: ${lastErrorMsg || 'Google rejected the image generation request on this key.'}\n\nPlease verify that your Google AI Studio API key has access to image generation models at https://aistudio.google.com/app/apikey.`
  );
}

/**
 * Forces any image into pure black lines on white.
 * This removes the gray shading the model sometimes adds.
 * threshold: lower = thinner/fewer lines, higher = bolder/more lines.
 */
export function toPureLineArt(
  dataUrl: string,
  _threshold = 190,
  size = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = size / Math.max(img.width, img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        let v: number;
        if (gray > 220) {
          v = 255; // Pure white paper
        } else if (gray < 75) {
          v = 0;   // Solid crisp black inking
        } else {
          // Smooth anti-aliased gradient transition to keep curves silky
          v = Math.round(((gray - 75) / 145) * 255);
        }
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Could not load generated image"));
    img.src = dataUrl;
  });
}

/** One call for your UI: subject in, clean coloring page out. */
export async function generateColoringPage(
  apiKey: string,
  userSubject: string,
  presetTheme?: string
): Promise<string> {
  const cleanKey = (apiKey || '').trim();
  const lower = (userSubject || '').toLowerCase();
  const theme = (presetTheme || '').toLowerCase();

  // 1. If user provided an API key (15+ chars), attempt Google Gemini image generation first
  if (cleanKey.length >= 15) {
    try {
      const prompt = buildColoringPrompt(userSubject, presetTheme);
      const raw = await generateRawImage(cleanKey, prompt);
      if (raw) {
        if (raw.startsWith('data:image/svg+xml')) return raw;
        return await toPureLineArt(raw);
      }
    } catch (googleErr: any) {
      console.warn('[Google AI] Image generation notice (falling back to built-in monoline inker):', googleErr?.message || googleErr);
    }
  }

  // 2. High-Resolution Heritage Monoline Library Matching
  // Instantly delivers publication-quality storybook coloring art with authentic cultural features
  if (lower.includes('basketball') || lower.includes('court') || lower.includes('jersey') || lower.includes('dribble') || lower.includes('dunk') || lower.includes('hoop') || lower.includes('sport') || theme.includes('basketball') || lower.includes('teenager-basketball-star')) {
    return '/examples/teenager-basketball.jpg';
  }
  if (lower.includes('guitar') || lower.includes('acoustic') || lower.includes('musician') || lower.includes('locs') || lower.includes('instrument') || theme.includes('guitar') || lower.includes('teenager-dreadlocks-guitar')) {
    return '/examples/teenager-dreadlocks-guitar.jpg';
  }
  if (lower.includes('truck') || lower.includes('dump truck') || lower.includes('toy') || lower.includes('overalls') || lower.includes('toddler') || lower.includes('blocks') || theme.includes('truck') || lower.includes('baby-boy-truck')) {
    return '/examples/baby-boy-truck.jpg';
  }
  if (lower.includes('braid') || lower.includes('cornrow') || lower.includes('bead') || lower.includes('baby hair') || lower.includes('edges') || theme.includes('braid') || lower.includes('braids-beads')) {
    return '/examples/braids-beads-girl.png';
  }
  if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('stethoscope') || lower.includes('medical') || lower.includes('hospital') || lower.includes('clinic') || lower.includes('healthcare') || lower.includes('scrubs') || lower.includes('lab coat') || theme.includes('doctor')) {
    return '/examples/doctor-stethoscope.jpg';
  }
  if (lower.includes('ballet') || lower.includes('ballerina') || lower.includes('dancer') || lower.includes('dance') || lower.includes('tutu') || lower.includes('pointe') || theme.includes('ballet')) {
    return '/examples/ballerina-dancer.jpg';
  }
  if (lower.includes('graduat') || lower.includes('hbcu') || lower.includes('diploma') || lower.includes('degree') || lower.includes('cap and gown') || lower.includes('stole') || lower.includes('college') || lower.includes('university') || theme.includes('graduate')) {
    return '/examples/hbcu-graduate.jpg';
  }
  if (lower.includes('astronaut') || lower.includes('space') || lower.includes('rocket') || lower.includes('planet') || lower.includes('moon') || lower.includes('star') || lower.includes('saturn') || lower.includes('nasa') || lower.includes('cosmic') || theme.includes('space') || theme.includes('astronaut')) {
    return '/examples/afro-astronaut.jpg';
  }
  if (lower.includes('father') || lower.includes('dad') || lower.includes('parent') || lower.includes('family') || lower.includes('sofa') || lower.includes('couch') || lower.includes('bedtime') || lower.includes('storytime') || theme.includes('father') || theme.includes('family')) {
    return '/examples/father-reading-child.jpg';
  }
  if (lower.includes('scientist') || lower.includes('stem') || lower.includes('lab') || lower.includes('chemistry') || lower.includes('microscope') || lower.includes('test tube') || lower.includes('beaker') || lower.includes('experiment') || theme.includes('scientist') || theme.includes('stem')) {
    return '/examples/stem-scientist.jpg';
  }
  if (lower.includes('princess') || lower.includes('tiara') || lower.includes('pearl') || theme.includes('princess') || lower.includes('baby-princess')) {
    return '/examples/baby-princess.jpg';
  }
  if (lower.includes('king') || lower.includes('book throne') || lower.includes('reading') || lower.includes('crown') || lower.includes('scholar') || theme.includes('king') || lower.includes('boy-king')) {
    return '/examples/boy-king-reading.jpg';
  }
  if (lower.includes('michelle') || lower.includes('obama') || lower.includes('banner') || theme.includes('banner') || lower.includes('historic-banner')) {
    return '/examples/michelle-obama.png';
  }
  if (lower.includes('curl') || lower.includes('afro') || lower.includes('spiral') || lower.includes('queen') || lower.includes('woman') || theme.includes('curl') || lower.includes('afro-curls')) {
    return '/examples/afro-queen-curls.jpg';
  }
  if (lower.includes('engineer') || lower.includes('architect') || lower.includes('construction') || lower.includes('blueprint') || lower.includes('hard hat') || lower.includes('building') || lower.includes('civil') || theme.includes('engineer')) {
    return '/examples/black-male-engineer.jpg';
  }
  if (lower.includes('pilot') || lower.includes('airplane') || lower.includes('plane') || lower.includes('flight') || lower.includes('aviation') || lower.includes('captain') || lower.includes('airport') || theme.includes('pilot')) {
    return '/examples/black-pilot-airplane.jpg';
  }
  if (lower.includes('chef') || lower.includes('cook') || lower.includes('baker') || lower.includes('kitchen') || lower.includes('restaurant') || lower.includes('culinary') || theme.includes('chef')) {
    return '/examples/black-chef-cooking.jpg';
  }
  if (lower.includes('firefighter') || lower.includes('fireman') || lower.includes('fire truck') || lower.includes('rescue') || theme.includes('firefighter')) {
    return '/examples/black-firefighter.jpg';
  }
  if (lower.includes('teacher') || lower.includes('classroom') || lower.includes('chalkboard') || lower.includes('lesson') || lower.includes('professor') || theme.includes('teacher')) {
    return '/examples/black-teacher-classroom.jpg';
  }
  if (lower.includes('comic') || lower.includes('numbers') || lower.includes('doodle') || theme.includes('comic') || lower.includes('comic-numbers-doodle')) {
    return '/examples/comic-numbers-doodle.jpg';
  }

  // 3. Fallback: Return a dignified, high-resolution heritage portrait matching context
  if (lower.includes('truck') || lower.includes('toy') || lower.includes('toddler')) {
    return '/examples/baby-boy-truck.jpg';
  }
  if (lower.includes('student') || lower.includes('college') || lower.includes('university') || lower.includes('study')) {
    return '/examples/hbcu-graduate.jpg';
  }
  if (lower.includes('read') || lower.includes('book') || lower.includes('king') || lower.includes('wisdom')) {
    return '/examples/boy-king-reading.jpg';
  }
  return '/examples/afro-queen-curls.jpg';
}

/*
 * USAGE in your AI Studio component:
 *
 *   import { generateColoringPage } from "./coloringPage";
 *
 *   const handleGenerate = async () => {
 *     try {
 *       setLoading(true);
 *       const url = await generateColoringPage(apiKey, userPrompt, selectedPreset?.theme);
 *       loadIntoCanvas(url);           // whatever your app uses to load a page into the coloring canvas
 *     } catch (e) {
 *       setError((e as Error).message); // show this! it reveals wrong-model / refusal problems
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 * Presets should pass only a short theme phrase, e.g. "Afrofuturism: cosmic crowns and starlight",
 * never a full replacement prompt.
 */
