// High-performance Canvas 4-way flood fill algorithm
export function hexToRgba(hex: string): [number, number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
    255
  ];
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorRgba: [number, number, number, number],
  tolerance: number = 42,
  boundaryCtx?: CanvasRenderingContext2D | null
): boolean {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample boundary line art overlay if provided
  const boundaryData = boundaryCtx
    ? boundaryCtx.getImageData(0, 0, width, height).data
    : null;

  const startIndex = (startY * width + startX) * 4;

  // Don't fill if clicking directly on a black line in the overlay
  if (boundaryData) {
    const bR = boundaryData[startIndex];
    const bG = boundaryData[startIndex + 1];
    const bB = boundaryData[startIndex + 2];
    const bA = boundaryData[startIndex + 3];
    if (bA > 140 && (bR + bG + bB) / 3 < 75) {
      return false;
    }
  }

  const targetR = data[startIndex];
  const targetG = data[startIndex + 1];
  const targetB = data[startIndex + 2];
  const targetA = data[startIndex + 3];

  const [fillR, fillG, fillB, fillA] = fillColorRgba;

  // Don't fill if color is already the same
  if (
    Math.abs(targetR - fillR) < 5 &&
    Math.abs(targetG - fillG) < 5 &&
    Math.abs(targetB - fillB) < 5 &&
    Math.abs(targetA - fillA) < 5
  ) {
    return false;
  }

  // Don't fill pure black outline lines in the paint layer
  if (targetR < 35 && targetG < 35 && targetB < 35 && targetA > 180) {
    return false;
  }

  const colorMatch = (idx: number): boolean => {
    // 1. Check if line art overlay has an outline boundary here
    if (boundaryData) {
      const bR = boundaryData[idx];
      const bG = boundaryData[idx + 1];
      const bB = boundaryData[idx + 2];
      const bA = boundaryData[idx + 3];
      if (bA > 140 && (bR + bG + bB) / 3 < 75) {
        return false;
      }
    }

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    // 2. Check if paint layer itself has an outline boundary
    if (r < 40 && g < 40 && b < 40 && a > 160) {
      return false;
    }

    // 3. If target was unpainted / transparent
    if (targetA === 0) {
      return a === 0 || a < 25;
    }

    const diff = Math.max(
      Math.abs(r - targetR),
      Math.abs(g - targetG),
      Math.abs(b - targetB)
    );
    return diff <= tolerance;
  };

  const visited = new Uint8Array(width * height);
  const queue: number[] = [startX, startY];
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const curY = queue.pop()!;
    const curX = queue.pop()!;

    const curIdx = (curY * width + curX) * 4;
    data[curIdx] = fillR;
    data[curIdx + 1] = fillG;
    data[curIdx + 2] = fillB;
    data[curIdx + 3] = fillA;

    // 4 neighbors
    const neighbors = [
      [curX + 1, curY],
      [curX - 1, curY],
      [curX, curY + 1],
      [curX, curY - 1]
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const [nx, ny] = neighbors[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (colorMatch(nIdx)) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}
