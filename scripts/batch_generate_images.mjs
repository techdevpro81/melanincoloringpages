#!/usr/bin/env node

/**
 * Melanin Canvas - Batch Image Generator
 * 
 * Generates coloring book illustrations for the 800 curated community prompts
 * using Google Gemini / Imagen models.
 * 
 * Supports all Google AI Studio API key formats:
 *   - Modern Project Keys (start with AQ...)
 *   - Traditional Keys     (start with AIzaSy...)
 * 
 * Usage:
 *   node scripts/batch_generate_images.mjs --category=celebrity --limit=5
 *   node scripts/batch_generate_images.mjs --category=all --limit=100
 *   node scripts/batch_generate_images.mjs --dry-run
 *   node scripts/batch_generate_images.mjs --key=AQ... --category=cosmic --limit=10
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Parse command line arguments
const args = process.argv.slice(2);
function getArg(name, defaultValue = null) {
  const prefix = `--${name}=`;
  const match = args.find(a => a.startsWith(prefix));
  if (match) return match.substring(prefix.length);
  if (args.includes(`--${name}`)) return true;
  return defaultValue;
}

const targetCategory = (getArg('category', 'all') || 'all').toLowerCase();
const limitPerCategory = parseInt(getArg('limit', '100'), 10);
const startIndex = parseInt(getArg('start', '0'), 10);
const delayMs = parseInt(getArg('delay', '2500'), 10);
const isDryRun = Boolean(getArg('dry-run', false));
const apiKey = (getArg('key') || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

const outputBaseDir = path.resolve(ROOT_DIR, getArg('output-dir', 'public/gallery'));

console.log('====================================================');
console.log('🎨 Melanin Canvas - Batch Coloring Image Generator');
console.log('====================================================');
console.log(`• Target Category : ${targetCategory}`);
console.log(`• Limit per Cat   : ${limitPerCategory}`);
console.log(`• Start Offset    : ${startIndex}`);
console.log(`• Inter-call Delay: ${delayMs}ms`);
console.log(`• Dry Run Mode    : ${isDryRun ? 'YES (Simulated)' : 'NO (Live API Generation)'}`);
console.log(`• Output Directory: ${outputBaseDir}`);
console.log(`• API Key Status  : ${apiKey ? `Configured (${apiKey.slice(0, 4)}...${apiKey.slice(-4)})` : 'Missing'}`);
if (apiKey) {
  const keyType = apiKey.startsWith('AQ') ? 'Modern Google AI Studio Project Key (AQ...)' :
                  apiKey.startsWith('AIza') ? 'Traditional Google API Key (AIza...)' : 'Custom Google Key';
  console.log(`• Key Format      : ${keyType}`);
}
console.log('----------------------------------------------------');

if (!isDryRun && !apiKey) {
  console.error('\n❌ ERROR: Google Gemini API Key required for live generation.');
  console.error('Pass your key via parameter:');
  console.error('  node scripts/batch_generate_images.mjs --key="AQ..."');
  console.error('Or set environment variable:');
  console.error('  $env:GEMINI_API_KEY="AQ..."  (PowerShell)');
  console.error('  set GEMINI_API_KEY=AQ...     (CMD)\n');
  console.error('ℹ️ Both modern project keys (AQ...) and legacy keys (AIzaSy...) are supported.');
  console.error('You can also test prompt queues without API calls using:');
  console.error('  node scripts/batch_generate_images.mjs --dry-run\n');
  process.exit(1);
}

// 2. Load prompt dataset
const promptsJsonPath = path.resolve(ROOT_DIR, 'src/data/communityPrompts.json');
if (!fs.existsSync(promptsJsonPath)) {
  console.error(`❌ Could not locate prompt dataset at: ${promptsJsonPath}`);
  process.exit(1);
}

const allPrompts = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf8'));

// Filter items
const filteredPrompts = allPrompts.filter(item => {
  if (targetCategory === 'all') return true;
  return item.category.toLowerCase() === targetCategory;
});

// Group by category and slice
const grouped = {};
for (const item of filteredPrompts) {
  if (!grouped[item.category]) grouped[item.category] = [];
  grouped[item.category].push(item);
}

const queue = [];
for (const [, list] of Object.entries(grouped)) {
  const sliced = list.slice(startIndex, startIndex + limitPerCategory);
  queue.push(...sliced);
}

console.log(`\n📋 Queue prepared: ${queue.length} items across ${Object.keys(grouped).length} categories.\n`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates an image using Google GenAI SDK, REST endpoints, or Vector Flash fallback.
 * Returns { buffer, ext, mode }
 */
async function generateSingleImage(promptText, cleanKey) {
  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const errorLog = [];

  // Strategy 1: Google GenAI SDK Imagen generateImages
  const imagenModels = ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001'];
  for (const model of imagenModels) {
    try {
      const response = await ai.models.generateImages({
        model: model,
        prompt: promptText,
        config: {
          numberOfImages: 1,
          aspectRatio: '3:4',
          outputMimeType: 'image/jpeg',
        }
      });

      const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
      if (b64) {
        return { buffer: Buffer.from(b64, 'base64'), ext: 'jpg', mode: `Imagen (${model})` };
      }
    } catch (err) {
      const msg = err?.message || String(err);
      errorLog.push(`${model}: ${msg}`);
    }
  }

  // Strategy 2: Google REST generateContent with responseModalities: ["IMAGE"]
  const imageModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image'];
  for (const model of imageModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            responseFormat: { image: { aspectRatio: '3:4' } }
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            return { buffer: Buffer.from(part.inlineData.data, 'base64'), ext: 'jpg', mode: `Gemini (${model})` };
          }
        }
      } else {
        const errJson = await res.json().catch(() => null);
        errorLog.push(`${model}: HTTP ${res.status} - ${errJson?.error?.message || res.statusText}`);
      }
    } catch (err) {
      errorLog.push(`${model}: ${err?.message || String(err)}`);
    }
  }

  // Strategy 3: Universal Flash Vector Inker Fallback
  // Works on 100% of keys (Free Tier and Paid) by generating crisp black-and-white SVG coloring art
  const vectorModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
  const systemInstruction = `You are a master vector graphic artist specializing in high-contrast coloring book line art.
Create clean, publication-quality SVG code for a coloring book page of: "${promptText}".
Requirements:
1. Root: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 1024" width="768" height="1024">
2. Background: <rect width="768" height="1024" fill="#ffffff" />
3. Strokes: strictly "#000000" with stroke-width 1.5 to 3. All fills must be "#ffffff" (or "none") for hollow coloring spaces. Strictly zero solid black hair fills, zero grayscale, zero colors.
4. Output: return ONLY the raw <svg>...</svg> element.`;

  for (const model of vectorModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: `${systemInstruction}\n\nUSER PROMPT: ${promptText}`,
        config: {
          temperature: 0.35,
          maxOutputTokens: 8192,
        }
      });

      const text = response.text || '';
      const match = text.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) {
        let svg = match[0].trim();
        if (!svg.includes('xmlns=')) {
          svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        return { buffer: Buffer.from(svg, 'utf8'), ext: 'svg', mode: `Gemini Vector Inker (${model})` };
      }
    } catch (err) {
      errorLog.push(`${model} (vector): ${err?.message || String(err)}`);
    }
  }

  const detailedSummary = errorLog.slice(0, 3).join(' | ');
  throw new Error(`Google API rejected request across all models. Details: ${detailedSummary}`);
}

// 3. Execution loop
async function run() {
  const manifestPath = path.join(outputBaseDir, 'manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_) {}
  }

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const catDir = path.join(outputBaseDir, item.category);
    fs.mkdirSync(catDir, { recursive: true });

    const progressLabel = `[${i + 1}/${queue.length}] (${item.category}) ${item.title}`;

    // Check existing
    const existingJpg = path.join(catDir, `${item.id}.jpg`);
    const existingSvg = path.join(catDir, `${item.id}.svg`);
    if ((fs.existsSync(existingJpg) || fs.existsSync(existingSvg)) && !getArg('overwrite')) {
      console.log(`⏩ ${progressLabel} -> Already exists. Skipping.`);
      skipCount++;
      continue;
    }

    if (isDryRun) {
      console.log(`🔍 [DRY-RUN] ${progressLabel}`);
      console.log(`   Prompt: ${item.prompt.slice(0, 85)}...`);
      console.log(`   Target: ${existingJpg}\n`);
      successCount++;
      continue;
    }

    console.log(`🚀 ${progressLabel}...`);
    let attempts = 0;
    let saved = false;

    while (attempts < 3 && !saved) {
      attempts++;
      try {
        const result = await generateSingleImage(item.prompt, apiKey);
        const outFilename = `${item.id}.${result.ext}`;
        const outPath = path.join(catDir, outFilename);

        fs.writeFileSync(outPath, result.buffer);
        manifest[item.id] = {
          id: item.id,
          category: item.category,
          title: item.title,
          subject: item.subject,
          imagePath: `/gallery/${item.category}/${outFilename}`,
          engine: result.mode,
          generatedAt: new Date().toISOString()
        };
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`   ✅ Saved via ${result.mode}: ${outPath}`);
        successCount++;
        saved = true;
      } catch (err) {
        console.warn(`   ⚠️ Attempt ${attempts} notice: ${err.message}`);
        if (attempts < 3) {
          const backoff = delayMs * Math.pow(2, attempts - 1);
          console.log(`   ⏳ Backing off for ${backoff}ms...`);
          await sleep(backoff);
        } else {
          console.error(`   ❌ Failed after 3 attempts.`);
          failCount++;
        }
      }
    }

    if (i < queue.length - 1 && !isDryRun) {
      await sleep(delayMs);
    }
  }

  console.log('\n====================================================');
  console.log('🎉 Batch Processing Complete!');
  console.log(`• Successfully processed: ${successCount}`);
  console.log(`• Skipped (existing)    : ${skipCount}`);
  console.log(`• Failed                : ${failCount}`);
  console.log(`• Manifest Location     : ${manifestPath}`);
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('Fatal batch generator error:', err);
  process.exit(1);
});
