import { GoogleGenAI, Modality } from "@google/genai";

// Verify this against the image model your project already uses.
// Image-capable model names change over time; it must be one that can return images.
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Wraps the user's request in strict coloring-page rules.
 * The user's subject goes FIRST and is repeated, so presets never override it.
 */
export function buildColoringPrompt(
  userSubject: string,
  presetTheme?: string
): string {
  const subject = userSubject.trim();
  const theme = presetTheme ? ` Cultural theme to honor: ${presetTheme}.` : "";

  return [
    `Create a children's COLORING PAGE of exactly this subject: "${subject}".`,
    `Draw ONLY what the subject describes. Do not substitute a different scene.${theme}`,
    ``,
    `STYLE RULES (mandatory):`,
    `- Clean black outlines on a pure white background.`,
    `- Line art only: NO shading, NO gray fill, NO gradients, NO textures, NO color, NO crosshatching.`,
    `- Uniform, medium-thick lines with fully closed shapes.`,
    `- Large open white areas that are easy to color in.`,
    `- Simple, uncluttered composition; subject centered; plain white background (no scenery shading).`,
    `- Looks like a printed coloring book page.`,
    ``,
    `REPRESENTATION RULES:`,
    `- If people are shown, depict Black people with dignity and joy: accurate features, `,
    `  natural hair textures and styles (afros, coils, twists, locs, braids, headwraps) as fitting the subject.`,
    `- Avoid caricature or stereotype. Show everyday life, achievement, culture and community.`,
    ``,
    `Output a single image. No text, no captions, no watermark, no signature.`,
  ].join("\n");
}

/** Calls Gemini and returns a data URL of the raw generated image. */
export async function generateRawImage(
  apiKey: string,
  prompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // 1. Try native Gemini image generation models
  const candidateModels = [
    IMAGE_MODEL,
    "gemini-3.1-flash-image-preview",
    "gemini-2.0-flash-exp",
  ];
  let lastErrorText = "";

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
      const text = parts.map((p) => p.text).filter(Boolean).join(" ");
      if (text) lastErrorText = text;
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
      lastErrorText = err?.message || String(err);
    }
  }

  // 2. Fallback to Imagen 3 if available on the key
  try {
    const imagenRes = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: { numberOfImages: 1, outputMimeType: "image/png" },
    });
    const b64 = imagenRes.generatedImages?.[0]?.image?.imageBytes;
    if (b64) {
      return `data:image/png;base64,${b64}`;
    }
  } catch (imgErr: any) {
    console.warn("Imagen 3 fallback attempt failed:", imgErr?.message || imgErr);
  }

  throw new Error(
    `No image returned from Gemini. Model response / error: ${lastErrorText || "(empty response)"}`
  );
}

/**
 * Forces any image into pure black lines on white.
 * This removes the gray shading the model sometimes adds.
 * threshold: lower = thinner/fewer lines, higher = bolder/more lines.
 */
export function toPureLineArt(
  dataUrl: string,
  threshold = 190,
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
        const v = gray < threshold ? 0 : 255;
        d[i] = d[i + 1] = d[i + 2] = v;
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
  const prompt = buildColoringPrompt(userSubject, presetTheme);
  const raw = await generateRawImage(apiKey, prompt);
  return toPureLineArt(raw);
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
