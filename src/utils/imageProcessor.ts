import type { DotPoint } from '../types';

export interface ImageProcessingOptions {
  threshold: number; // 0 - 255
  edgeIntensity: number; // 1 - 5
  lineThickness: number; // 1 - 3
  detailLevel: number; // 1 - 5
  invert: boolean;
}

// Convert an image element or canvas into a crisp black-and-white coloring page line art
export function convertToColoringLineArt(
  sourceCanvas: HTMLCanvasElement,
  options: ImageProcessingOptions = {
    threshold: 110,
    edgeIntensity: 2.5,
    lineThickness: 1,
    detailLevel: 2,
    invert: false,
  }
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = resultCanvas.getContext('2d')!;

  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  // Step 1: Grayscale + Blur Buffer (with Alpha composited over white paper)
  const gray = new Float32Array(width * height);
  for (let i = 0; i < srcData.length; i += 4) {
    const a = srcData[i + 3] / 255;
    if (a === 0) {
      gray[i / 4] = 255; // Pure white background for transparent pixels
    } else {
      const rawLum = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
      gray[i / 4] = rawLum * a + 255 * (1 - a);
    }
  }

  // Fast 3x3 Box blur for noise reduction
  const blurred = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += gray[(y + dy) * width + (x + dx)];
        }
      }
      blurred[y * width + x] = sum / 9;
    }
  }

  // Step 2: Sobel Edge Detection
  const edges = new Float32Array(width * height);
  const kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const val = blurred[(y + dy) * width + (x + dx)];
          gx += val * kx[k];
          gy += val * ky[k];
          k++;
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy) * options.edgeIntensity;
      edges[y * width + x] = mag;
    }
  }

  // Step 3: Threshold to create crisp Black outlines on White paper
  const outputImg = resultCtx.createImageData(width, height);
  const outData = outputImg.data;

  for (let i = 0; i < edges.length; i++) {
    const isEdge = edges[i] > options.threshold;
    const pixelIdx = i * 4;

    if (isEdge) {
      // Crisp Black line
      outData[pixelIdx] = 20;
      outData[pixelIdx + 1] = 20;
      outData[pixelIdx + 2] = 20;
      outData[pixelIdx + 3] = 255;
    } else {
      // Clean white background for coloring
      outData[pixelIdx] = 255;
      outData[pixelIdx + 1] = 255;
      outData[pixelIdx + 2] = 255;
      outData[pixelIdx + 3] = 255;
    }
  }

  resultCtx.putImageData(outputImg, 0, 0);

  // Thicken lines if requested
  if (options.lineThickness > 1) {
    const thickCanvas = document.createElement('canvas');
    thickCanvas.width = width;
    thickCanvas.height = height;
    const thickCtx = thickCanvas.getContext('2d')!;
    thickCtx.drawImage(resultCanvas, 0, 0);
    thickCtx.lineWidth = options.lineThickness;
    thickCtx.drawImage(resultCanvas, -1, 0);
    thickCtx.drawImage(resultCanvas, 1, 0);
    thickCtx.drawImage(resultCanvas, 0, -1);
    thickCtx.drawImage(resultCanvas, 0, 1);
    return thickCanvas;
  }

  return resultCanvas;
}

// Generate connect-the-dots points from prominent edge contours
export function extractContourDots(
  canvas: HTMLCanvasElement,
  maxDots: number = 36
): DotPoint[] {
  const ctx = canvas.getContext('2d')!;
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample dark pixels
  const darkPixels: { x: number; y: number }[] = [];
  const step = Math.max(8, Math.floor(Math.min(width, height) / 40));

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const idx = (y * width + x) * 4;
      if (data[idx] < 80 && data[idx + 3] > 180) {
        darkPixels.push({ x, y });
      }
    }
  }

  if (darkPixels.length === 0) {
    // Fallback circular dots
    const fallback: DotPoint[] = [];
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.35;
    for (let i = 0; i < maxDots; i++) {
      const angle = (i / maxDots) * Math.PI * 2;
      fallback.push({
        id: i + 1,
        x: Math.round(cx + Math.cos(angle) * r),
        y: Math.round(cy + Math.sin(angle) * r),
      });
    }
    return fallback;
  }

  // Sort dark pixels to trace a logical perimeter around center
  const cx = width / 2;
  const cy = height / 2;
  darkPixels.sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });

  // Select evenly distributed points
  const points: DotPoint[] = [];
  const stride = Math.max(1, Math.floor(darkPixels.length / maxDots));
  for (let i = 0; i < darkPixels.length && points.length < maxDots; i += stride) {
    points.push({
      id: points.length + 1,
      x: darkPixels[i].x,
      y: darkPixels[i].y,
    });
  }

  return points;
}

/**
 * Clarify AI Coloring Art
 * Eliminates all grayscale skin shading, airbrush gradients, and shadows from AI-generated
 * images, yielding crisp solid black (#000000) contour lines on pure white (#ffffff) paper.
 * Essential for digital bucket fills and true coloring page aesthetics.
 */
export function clarifyAIColoringArt(
  sourceCanvas: HTMLCanvasElement,
  options: {
    lineThreshold?: number; // 0 - 255 (default ~145)
    thickenLines?: boolean;
    removeSpeckles?: boolean;
  } = {}
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = resultCanvas.getContext('2d')!;

  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  const outputImg = resultCtx.createImageData(width, height);
  const outData = outputImg.data;

  const threshold = options.lineThreshold ?? 145;

  for (let i = 0; i < srcData.length; i += 4) {
    const a = srcData[i + 3];
    if (a < 40) {
      // Fully transparent becomes pure white paper
      outData[i] = 255;
      outData[i + 1] = 255;
      outData[i + 2] = 255;
      outData[i + 3] = 255;
      continue;
    }

    // Perceptual luminance calculation
    const lum = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];

    if (lum < threshold) {
      // Inky black line
      outData[i] = 0;
      outData[i + 1] = 0;
      outData[i + 2] = 0;
      outData[i + 3] = 255;
    } else {
      // 100% pure white paper - removes skin shading, pencil smudges & background gray
      outData[i] = 255;
      outData[i + 1] = 255;
      outData[i + 2] = 255;
      outData[i + 3] = 255;
    }
  }

  resultCtx.putImageData(outputImg, 0, 0);

  if (options.thickenLines) {
    const thickCanvas = document.createElement('canvas');
    thickCanvas.width = width;
    thickCanvas.height = height;
    const tCtx = thickCanvas.getContext('2d')!;
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, width, height);
    tCtx.drawImage(resultCanvas, -1, 0);
    tCtx.drawImage(resultCanvas, 1, 0);
    tCtx.drawImage(resultCanvas, 0, -1);
    tCtx.drawImage(resultCanvas, 0, 1);
    tCtx.drawImage(resultCanvas, 0, 0);
    return thickCanvas;
  }

  return resultCanvas;
}
