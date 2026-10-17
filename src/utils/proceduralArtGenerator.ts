export type CulturalTheme = 'afro-crown' | 'harlem-jazz' | 'afrofuturism' | 'hbcu-pride' | 'sankofa-geometry' | 'toddler-bubbles-grass';

export interface GeneratedArtworkMeta {
  title: string;
  theme: CulturalTheme;
  description: string;
  canvas: HTMLCanvasElement;
  dataUrl: string;
}

export function generateProceduralHeritageArt(
  theme: CulturalTheme = 'afro-crown',
  width: number = 600,
  height: number = 700
): GeneratedArtworkMeta {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Clean crisp white paper base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Common styling for crisp coloring book line art
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let title = 'Procedural Heritage Creation';
  let description = 'Custom generated Black American cultural artwork';

  if (theme === 'afro-crown') {
    title = 'Radiant Crown & Tropical Flora';
    description = 'A celebration of natural hair texture, geometric bamboo earrings, and blooming hibiscus flowers.';

    const cx = width / 2;
    const cy = height * 0.45;

    // Background Sunburst Radiance
    const rayCount = 18;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * 180;
      const y1 = cy + Math.sin(angle) * 180;
      const x2 = cx + Math.cos(angle) * 320;
      const y2 = cy + Math.sin(angle) * 320;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Outer Halo Circle
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.stroke();

    // Afro Crown Outer Clouds / Curls
    ctx.beginPath();
    const curlCount = 14;
    const baseRadius = 170;
    for (let i = 0; i <= curlCount; i++) {
      const angle = (i / curlCount) * Math.PI + Math.PI; // Top arc
      const r = baseRadius + (i % 2 === 0 ? 35 : 15);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else {
        const prevAngle = ((i - 0.5) / curlCount) * Math.PI + Math.PI;
        const cpx = cx + Math.cos(prevAngle) * (r + 25);
        const cpy = cy + Math.sin(prevAngle) * (r + 25);
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
    }
    ctx.stroke();

    // Inner Afro Texture spirals
    for (let i = 0; i < 18; i++) {
      const sx = cx + (Math.random() - 0.5) * 220;
      const sy = cy - 40 - Math.random() * 120;
      ctx.beginPath();
      ctx.arc(sx, sy, 12 + Math.random() * 8, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    // Elegant Face Profile
    ctx.beginPath();
    ctx.ellipse(cx, cy + 30, 75, 105, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Slender Neck & Shoulders
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy + 120);
    ctx.lineTo(cx - 30, cy + 220);
    ctx.lineTo(cx - 180, cy + 280);
    ctx.moveTo(cx + 35, cy + 120);
    ctx.lineTo(cx + 30, cy + 220);
    ctx.lineTo(cx + 180, cy + 280);
    ctx.stroke();

    // Large Bamboo Hoop Earrings
    ctx.beginPath();
    ctx.arc(cx - 75, cy + 90, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 75, cy + 90, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Hibiscus Blossom in Hair
    const fx = cx + 110;
    const fy = cy - 70;
    for (let p = 0; p < 5; p++) {
      const pAngle = (p / 5) * Math.PI * 2;
      const px = fx + Math.cos(pAngle) * 35;
      const py = fy + Math.sin(pAngle) * 35;
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else if (theme === 'harlem-jazz') {
    title = 'Harlem Syncopated Jazz';
    description = 'Brass melodies, flying eighth notes, and vintage Apollo speakeasy energy.';

    const cx = width / 2;
    const cy = height * 0.5;

    // Saxophone Neck & Mouthpiece
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy - 160);
    ctx.quadraticCurveTo(cx - 20, cy - 180, cx, cy - 120);
    ctx.lineTo(cx + 15, cy - 110);
    ctx.quadraticCurveTo(cx - 10, cy - 165, cx - 80, cy - 145);
    ctx.closePath();
    ctx.stroke();

    // Main Saxophone Tube Body
    ctx.beginPath();
    ctx.moveTo(cx, cy - 120);
    ctx.lineTo(cx + 40, cy + 120);
    ctx.quadraticCurveTo(cx + 50, cy + 220, cx + 140, cy + 180);
    ctx.quadraticCurveTo(cx + 200, cy + 140, cx + 180, cy + 60);
    ctx.lineTo(cx + 140, cy + 70);
    ctx.quadraticCurveTo(cx + 150, cy + 120, cx + 120, cy + 140);
    ctx.quadraticCurveTo(cx + 60, cy + 170, cx + 55, cy + 110);
    ctx.lineTo(cx + 15, cy - 110);
    ctx.stroke();

    // Huge Flaring Brass Bell
    ctx.beginPath();
    ctx.ellipse(cx + 160, cy + 65, 45, 60, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    // Key Buttons along Sax body
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.arc(cx + 30 + k * 2, cy - 70 + k * 30, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Melodic Ribbon Waves & Notes
    ctx.beginPath();
    ctx.moveTo(cx + 180, cy + 40);
    ctx.bezierCurveTo(width - 50, cy - 100, cx, 80, width - 80, 50);
    ctx.stroke();

    // Floating Eighth and Quarter Notes
    const notes = [
      { x: cx + 180, y: 120 },
      { x: cx + 100, y: 90 },
      { x: width - 120, y: 180 },
      { x: cx - 120, y: cy - 40 },
    ];
    notes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(n.x + 12, n.y);
      ctx.lineTo(n.x + 12, n.y - 45);
      ctx.lineTo(n.x + 28, n.y - 35);
      ctx.stroke();
    });

  } else if (theme === 'sankofa-geometry') {
    title = 'Sankofa Sacred Geometry';
    description = 'West African Adinkra wisdom nested in royal geometric Kente patterns.';

    const cx = width / 2;
    const cy = height * 0.5;

    // Outer Ornate Square Frame
    const pad = 40;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    ctx.strokeRect(pad + 15, pad + 15, width - pad * 2 - 30, height - pad * 2 - 30);

    // Corner Kente Diamond Patterns
    const corners = [
      [pad + 50, pad + 50],
      [width - pad - 50, pad + 50],
      [pad + 50, height - pad - 50],
      [width - pad - 50, height - pad - 50]
    ];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x, y - 25);
      ctx.lineTo(x + 25, y);
      ctx.lineTo(x, y + 25);
      ctx.lineTo(x - 25, y);
      ctx.closePath();
      ctx.stroke();
    });

    // Central Sacred Sun Disc
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred Sankofa Bird in Center (Turned Head with Egg)
    ctx.beginPath();
    // Heart-shaped body
    ctx.moveTo(cx, cy + 100);
    ctx.bezierCurveTo(cx + 90, cy + 40, cx + 110, cy - 60, cx, cy - 20);
    ctx.bezierCurveTo(cx - 110, cy - 60, cx - 90, cy + 40, cx, cy + 100);
    ctx.stroke();

    // Turned Beak with Golden Egg
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 50, 16, 0, Math.PI * 2);
    ctx.stroke();

  } else if (theme === 'toddler-bubbles-grass') {
    title = 'Toddler Blowing Bubbles in the Grass';
    description = 'An adorable Black toddler girl with afro puffs blowing floating soap bubbles in a sunny grassy meadow.';

    const cx = width * 0.42;
    const cy = height * 0.52;

    // 1. Gentle Rolling Grass Hills in Background
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.bezierCurveTo(width * 0.35, height * 0.65, width * 0.7, height * 0.78, width, height * 0.7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.bezierCurveTo(width * 0.4, height * 0.85, width * 0.75, height * 0.78, width, height * 0.84);
    ctx.stroke();

    // Grass blades tufts
    const grassX = [50, 110, 180, 260, 340, 420, 500, 560];
    grassX.forEach((gx, idx) => {
      const gy = height * 0.78 + (idx % 3) * 20;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx - 8, gy - 24, gx - 14, gy - 32);
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx, gy - 28, gx + 2, gy - 36);
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx + 8, gy - 22, gx + 15, gy - 28);
      ctx.stroke();
    });

    // Meadow Daisies
    const daisyPos = [[70, height * 0.88], [220, height * 0.9], [490, height * 0.86], [540, height * 0.76]];
    daisyPos.forEach(([dx, dy]) => {
      // Center circle
      ctx.beginPath();
      ctx.arc(dx, dy, 7, 0, Math.PI * 2);
      ctx.stroke();
      // Petals
      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(dx + Math.cos(pa) * 14, dy + Math.sin(pa) * 14, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // 2. Black Toddler Girl
    // High Afro Puffs (Left and Right)
    // Left Afro Puff
    ctx.beginPath();
    ctx.arc(cx - 55, cy - 85, 38, 0, Math.PI * 2);
    ctx.stroke();
    // Curl loops on left puff
    for (let c = 0; c < 7; c++) {
      const ca = (c / 7) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx - 55 + Math.cos(ca) * 24, cy - 85 + Math.sin(ca) * 24, 8, 0, Math.PI * 1.6);
      ctx.stroke();
    }
    // Left Puff Ball Hair Tie
    ctx.beginPath();
    ctx.arc(cx - 38, cy - 58, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Right Afro Puff
    ctx.beginPath();
    ctx.arc(cx + 55, cy - 85, 38, 0, Math.PI * 2);
    ctx.stroke();
    // Curl loops on right puff
    for (let c = 0; c < 7; c++) {
      const ca = (c / 7) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + 55 + Math.cos(ca) * 24, cy - 85 + Math.sin(ca) * 24, 8, 0, Math.PI * 1.6);
      ctx.stroke();
    }
    // Right Puff Ball Hair Tie
    ctx.beginPath();
    ctx.arc(cx + 38, cy - 58, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Cute Round Toddler Head
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 52, 0, Math.PI * 2);
    ctx.stroke();

    // Baby Hair Edges (delicate scalloped forehead curls)
    ctx.beginPath();
    ctx.arc(cx - 28, cy - 65, 8, 0, Math.PI);
    ctx.moveTo(cx - 10, cy - 70);
    ctx.arc(cx - 4, cy - 70, 7, 0, Math.PI);
    ctx.moveTo(cx + 12, cy - 68);
    ctx.arc(cx + 20, cy - 68, 8, 0, Math.PI);
    ctx.stroke();

    // Toddler Face Features
    // Big Sparkling Eyes
    // Left Eye
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy - 35, 10, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Left pupil & highlight
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 36, 5, 0, Math.PI * 2);
    ctx.stroke();
    // Eyelashes
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy - 44);
    ctx.lineTo(cx - 30, cy - 49);
    ctx.moveTo(cx - 18, cy - 48);
    ctx.lineTo(cx - 18, cy - 54);
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.ellipse(cx + 18, cy - 35, 10, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Right pupil & highlight
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 36, 5, 0, Math.PI * 2);
    ctx.stroke();
    // Eyelashes
    ctx.beginPath();
    ctx.moveTo(cx + 26, cy - 44);
    ctx.lineTo(cx + 30, cy - 49);
    ctx.moveTo(cx + 18, cy - 48);
    ctx.lineTo(cx + 18, cy - 54);
    ctx.stroke();

    // Cute Button Nose
    ctx.beginPath();
    ctx.arc(cx, cy - 22, 4, 0, Math.PI);
    ctx.stroke();

    // Joyful Open Smile
    ctx.beginPath();
    ctx.arc(cx, cy - 12, 14, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 28, cy - 18, 5, 0, Math.PI * 2); // Cheek dimple
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 28, cy - 18, 5, 0, Math.PI * 2); // Cheek dimple
    ctx.stroke();

    // Cute Ruffled Summer Dress & Collar
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 18);
    ctx.quadraticCurveTo(cx, cy + 30, cx + 24, cy + 18);
    ctx.stroke();

    // Dress Silhouette
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 18);
    ctx.lineTo(cx - 65, cy + 120);
    ctx.quadraticCurveTo(cx, cy + 135, cx + 65, cy + 120);
    ctx.lineTo(cx + 24, cy + 18);
    ctx.stroke();

    // Ruffles on hem
    ctx.beginPath();
    for (let r = 0; r < 8; r++) {
      const rx = cx - 65 + r * 16.25;
      ctx.arc(rx + 8, cy + 122, 8, 0, Math.PI);
    }
    ctx.stroke();

    // Cute Shoes / Little Feet sitting on grass
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy + 138, 18, 10, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 30, cy + 138, 18, 10, 0.2, 0, Math.PI * 2);
    ctx.stroke();

    // Right Arm holding bubble wand up towards sky
    ctx.beginPath();
    ctx.moveTo(cx + 24, cy + 30);
    ctx.quadraticCurveTo(cx + 60, cy + 20, cx + 80, cy - 15);
    ctx.stroke();
    // Little hand
    ctx.beginPath();
    ctx.arc(cx + 80, cy - 18, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Bubble Wand (Stick + Circle Loop)
    ctx.beginPath();
    ctx.moveTo(cx + 78, cy - 10);
    ctx.lineTo(cx + 105, cy - 65);
    ctx.stroke();
    // Wand ring loop
    ctx.beginPath();
    ctx.arc(cx + 112, cy - 78, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 112, cy - 78, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Left Arm resting happily
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 30);
    ctx.quadraticCurveTo(cx - 45, cy + 50, cx - 40, cy + 75);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 40, cy + 78, 8, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Floating Soap Bubbles Floating Upwards
    const bubbles = [
      { x: cx + 145, y: cy - 110, r: 28 },
      { x: cx + 185, y: cy - 170, r: 42 },
      { x: cx + 110, y: cy - 200, r: 24 },
      { x: cx + 220, y: cy - 250, r: 50 },
      { x: cx + 60, y: cy - 240, r: 34 },
      { x: cx + 160, y: cy - 300, r: 45 },
      { x: cx - 40, y: cy - 220, r: 26 },
      { x: cx + 20, y: cy - 160, r: 18 },
      { x: cx + 250, y: cy - 140, r: 22 },
    ];

    bubbles.forEach(b => {
      // Main bubble circle
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();

      // Crescent shine highlight inside bubble
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.45, 1.1 * Math.PI, 1.7 * Math.PI);
      ctx.stroke();

      // Tiny secondary bottom reflection dot
      ctx.beginPath();
      ctx.arc(b.x + b.r * 0.4, b.y + b.r * 0.4, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Fluttering Butterfly in top corner
    const bfx = width * 0.18;
    const bfy = height * 0.22;
    ctx.beginPath();
    ctx.ellipse(bfx, bfy, 3, 10, 0, 0, Math.PI * 2); // Body
    ctx.stroke();
    // Upper wings
    ctx.beginPath();
    ctx.arc(bfx - 12, bfy - 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bfx + 12, bfy - 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    // Lower wings
    ctx.beginPath();
    ctx.arc(bfx - 8, bfy + 10, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bfx + 8, bfy + 10, 8, 0, Math.PI * 2);
    ctx.stroke();
    // Antennae
    ctx.beginPath();
    ctx.moveTo(bfx - 2, bfy - 10);
    ctx.quadraticCurveTo(bfx - 8, bfy - 18, bfx - 12, bfy - 16);
    ctx.moveTo(bfx + 2, bfy - 10);
    ctx.quadraticCurveTo(bfx + 8, bfy - 18, bfx + 12, bfy - 16);
    ctx.stroke();
  } else {
    // Afrofuturism / Default
    title = 'Afrofuturist Astral Crown';
    description = 'Cosmic geometry, braided cybernetic crowns, and nebular rings.';

    const cx = width / 2;
    const cy = height * 0.45;

    // Geometric Star Pyramids
    ctx.beginPath();
    ctx.moveTo(cx, 80);
    ctx.lineTo(cx - 160, cy + 160);
    ctx.lineTo(cx + 160, cy + 160);
    ctx.closePath();
    ctx.stroke();

    // Concentric Orbit Rings
    ctx.beginPath();
    ctx.ellipse(cx, cy, 220, 70, -Math.PI / 8, 0, Math.PI * 2);
    ctx.stroke();

    // Central Radiant Visage
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Crown Tiara
    for (let t = 0; t < 7; t++) {
      const angle = (t / 6) * Math.PI + Math.PI;
      const x = cx + Math.cos(angle) * 110;
      const y = cy + Math.sin(angle) * 110;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
      ctx.lineTo(x, y);
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const dataUrl = canvas.toDataURL('image/png');

  return {
    title,
    theme,
    description,
    canvas,
    dataUrl,
  };
}
