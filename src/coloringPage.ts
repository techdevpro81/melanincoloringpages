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

/** Converts an SVG string into a safe, valid base64 data URL */
function svgToDataUrl(svg: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

/** Calls Gemini and returns a data URL of the raw generated image or vector line art. */
export async function generateRawImage(
  apiKey: string,
  prompt: string
): Promise<string> {
  const cleanKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanKey });

  // 1. Try native Gemini image generation models (if enabled on user's key)
  const candidateModels = [
    IMAGE_MODEL,
    "gemini-3-pro-image-preview",
  ];

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
    } catch (err: any) {
      console.warn(`Native image model ${model} unavailable on key:`, err?.message || err);
    }
  }

  // 2. Try Imagen 3 / 4 diffusion (if pay-as-you-go billing is active on key)
  const imagenModels = ["imagen-3.0-generate-002", "imagen-4.0-generate-001"];
  for (const imgMod of imagenModels) {
    try {
      const imagenRes = await ai.models.generateImages({
        model: imgMod,
        prompt,
        config: { numberOfImages: 1, outputMimeType: "image/png" },
      });
      const b64 = imagenRes.generatedImages?.[0]?.image?.imageBytes;
      if (b64) {
        return `data:image/png;base64,${b64}`;
      }
    } catch (imgErr: any) {
      console.warn(`Imagen model ${imgMod} unavailable on key:`, imgErr?.message || imgErr);
    }
  }

  // 3. Universal Fallback: Gemini Monoline Inker (Available on 100% of Google AI Studio keys)
  const standardFlashModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
  ];

  const vectorSystemInstruction = `You are a master vector graphic artist and illustrator specializing in authentic Black American coloring book art.
Your mission is to generate clean, professional, publication-quality SVG code for a coloring book illustration based on this prompt:
"${prompt}"

STRICT COLORING BOOK DESIGN REQUIREMENTS:
1. Root element must be: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
2. Start with an opaque pure white background rectangle: <rect width="800" height="1000" fill="#ffffff" />
3. Color palette: STRICTLY BLACK AND WHITE. All strokes must be "#000000". All fills must be "#ffffff" (white) or "none". NEVER use colors, gradients, grayscale shading, or half-tones.
4. Line weights & Inking Style:
   - Monoline storybook inking style.
   - Main silhouette & outer framing border: stroke-width="2.5"
   - Inner contours, jawline, clothing collar: stroke-width="1.8"
   - Delicate details (braid chevron plait lines, eyelashes, baby hair S-curves, bead grooves): stroke-width="1.2"
   - Always include stroke-linecap="round" and stroke-linejoin="round"
5. Fillable regions & Strictly Hollow Interiors:
   - Ensure all shapes (face, hair braid segments, beads, clothing, eyes) are enclosed elements with fill="#ffffff" and stroke="#000000".
   - The ONLY solid black element permitted is the tiny pupil of the eye (<circle fill="#000000" ... />) with a white catchlight circle inside it.
   - NEVER fill hair with solid black.
6. Cultural hair anatomy & precision:
   - For cornrows & braids: render clean white scalp parting tracks, and draw each braid with repeating hollow chevron/herringbone segments (<path fill="#ffffff" stroke="#000000" .../>). Add cylindrical beads and stacked tip beads with fill="#ffffff".
   - For hairline: draw 4 to 5 delicate wavy S-curve baby hair strokes ("edges") laid along the forehead.
   - For facial features: large expressive storybook eyes with white catchlight reflections, cute button nose, full lips outlined with a distinct cupids bow (hollow white interior).
7. Output format: Return ONLY the raw SVG code starting with <svg and ending with </svg>. Do not wrap in markdown code blocks.`;

  for (const mod of standardFlashModels) {
    try {
      console.log(`Generating coloring line art via Gemini Flash model: ${mod}...`);
      const response = await ai.models.generateContent({
        model: mod,
        contents: `${vectorSystemInstruction}\n\nUSER PROMPT: ${prompt}`,
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
        return svgToDataUrl(svg);
      }
    } catch (flashErr: any) {
      console.warn(`Flash model ${mod} attempt failed:`, flashErr?.message || flashErr);
    }
  }

  throw new Error(
    "Could not generate line art with this Google Gemini API key. Please check your key in Google AI Studio, or switch to Free Instant AI."
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
