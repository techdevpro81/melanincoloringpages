import type { Artwork } from '../types';

export const CULTURAL_ARTWORKS: Artwork[] = [
  {
    id: 'braids-beads-girl',
    title: 'Braids, Beads & Baby Hair',
    category: 'Crown & Joy',
    difficulty: 'Detailed',
    description: 'Adorably illustrated young Black girl with neat parted cornrows, herringbone box braids, hair cuffs, beads, and wavy laid edges.',
    culturalStory: 'Braiding is an ancient art form of love, bonding, and ancestral identity passed down across generations. This master coloring portrait honors the precision of scalp cornrows, the rhythmic beauty of box braids with beads, and the creativity of laid baby hair edges.',
    width: 600,
    height: 700,
    svgPath: '',
    imageSrc: '/examples/braids-beads-girl.png',
    regions: [
      { id: 'bbg-reg-1', number: 1, name: 'Braids & Beads Artwork', path: 'M 0 0 L 600 0 L 600 700 L 0 700 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'michelle-obama',
    title: 'Michelle Obama: Hope & Leadership',
    category: 'Civil Rights & History',
    difficulty: 'Detailed',
    description: 'First Lady Michelle Obama with campaign buttons, shooting star rays, and decorative tribute scroll banner.',
    culturalStory: "Michelle Obama made history as the first African-American First Lady of the United States. A graduate of Princeton University and Harvard Law School, she championed global girls' education, healthy families, and service to military families with dignity, grace, and unmatched cultural impact.",
    width: 600,
    height: 780,
    svgPath: '',
    imageSrc: '/examples/michelle-obama.png',
    regions: [
      { id: 'mo-reg-1', number: 1, name: 'Tribute Banner', path: 'M 0 0 L 600 0 L 600 780 L 0 780 Z', targetColor: '#b91c1c', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'baby-princess',
    title: 'Little Black Royalty (Baby Princess)',
    category: 'Crown & Joy',
    difficulty: 'Medium',
    description: 'Adorably styled baby princess with sparkling eyes, baroque gemstone tiara, and delicate curls.',
    culturalStory: 'Celebrating the sacred wonder, joy, and natural dignity of Black childhood. Adorned with a royal jeweled crown and baby curls, this illustration uplifts the truth that every Black child is born royalty deserving of infinite love and possibility.',
    width: 500,
    height: 600,
    svgPath: '',
    imageSrc: '/examples/baby-princess.jpg',
    regions: [
      { id: 'bp-reg-1', number: 1, name: 'Gem Tiara', path: 'M 0 0 L 500 0 L 500 600 L 0 600 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'afro-queen-curls',
    title: 'Crown of 3C/4A Defined Natural Curls',
    category: 'Crown & Joy',
    difficulty: 'Detailed',
    description: 'Striking portrait of a Black queen with voluminous spiral curls, filigree teardrop earrings, and goddess drapery.',
    culturalStory: 'A celebration of the sculptural beauty of 3C, 4A, and 4B curl textures. Each individual coil forms a spiral crown of resilience and majesty, complemented by botanical leaf-vein earrings that honor ancestral roots.',
    width: 600,
    height: 600,
    svgPath: '',
    imageSrc: '/examples/afro-queen-curls.jpg',
    regions: [
      { id: 'aq-reg-1', number: 1, name: 'Spiral Curls', path: 'M 0 0 L 600 0 L 600 600 L 0 600 Z', targetColor: '#1a0f0d', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'boy-king-reading',
    title: 'Young King: Throne of Knowledge',
    category: 'Community',
    difficulty: 'Medium',
    description: 'Young Black boy in a crown and sneakers sitting atop a towering throne of books, deeply immersed in reading.',
    culturalStory: "Knowledge is the greatest crown. Depicting a young scholar wearing a gold crown, hoodie, and sneakers seated upon a throne of literature, this piece champions Black literacy, youth mentorship, and the brilliance of the next generation.",
    width: 500,
    height: 650,
    svgPath: '',
    imageSrc: '/examples/boy-king-reading.jpg',
    regions: [
      { id: 'bk-reg-1', number: 1, name: 'Royal Crown', path: 'M 0 0 L 500 0 L 500 650 L 0 650 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'comic-numbers-doodle',
    title: 'Pop Art Comic Numbers & Action Bubbles',
    category: 'Sacred Geometry',
    difficulty: 'Detailed',
    description: 'Dynamic comic book doodle page with patterned numbers (0-9), action speech bubbles (KA-POW!, ZAP!), and starbursts.',
    culturalStory: 'A joyful explosion of pop art, geometric micro-patterns (houndstooth, chevron, polka dots, checkerboard), and superhero energy celebrating creativity, playfulness, and mathematical joy for kids and adults alike.',
    width: 500,
    height: 650,
    svgPath: '',
    imageSrc: '/examples/comic-numbers-doodle.jpg',
    regions: [
      { id: 'cn-reg-1', number: 1, name: 'Action Bubbles', path: 'M 0 0 L 500 0 L 500 650 L 0 650 Z', targetColor: '#dc2626', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'crown-of-radiance',
    title: 'Crown of Radiance',
    category: 'Crown & Joy',
    difficulty: 'Medium',
    description: 'A celebration of natural hair textures, blooming botanical flora, and royal cowrie adornments.',
    culturalStory: 'In 2019, the CROWN Act ("Creating a Respectful and Open World for Natural Hair") was drafted to protect against discrimination based on race-based hairstyles such as afros, locs, twists, and braids. This artwork honors the afro as an ancestral crown—a majestic halo of self-love, sovereignty, and organic beauty.',
    width: 600,
    height: 700,
    svgPath: '',
    regions: [
      // 1: Background Sky / Aura
      {
        id: 'cor-bg',
        number: 1,
        name: 'Celestial Aura',
        path: 'M 0 0 L 600 0 L 600 700 L 0 700 Z',
        targetColor: '#1e1b4b',
        defaultColor: '#ffffff'
      },
      // 2: Radiant Halo Sunburst
      {
        id: 'cor-halo',
        number: 2,
        name: 'Golden Sunburst Halo',
        path: 'M 300 320 m -240, 0 a 240,240 0 1,0 480,0 a 240,240 0 1,0 -480,0',
        targetColor: '#d97706',
        defaultColor: '#ffffff'
      },
      // 3: Inner Radiant Glow
      {
        id: 'cor-inner-halo',
        number: 3,
        name: 'Solar Flare Circle',
        path: 'M 300 320 m -200, 0 a 200,200 0 1,0 400,0 a 200,200 0 1,0 -400,0',
        targetColor: '#fbbf24',
        defaultColor: '#ffffff'
      },
      // 4: Majestic Natural Afro Silhouette
      {
        id: 'cor-afro',
        number: 4,
        name: 'Voluminous Natural Afro',
        path: 'M 160 380 C 100 320 80 220 140 140 C 200 60 400 60 460 140 C 520 220 500 320 440 380 C 470 330 450 260 420 220 C 370 160 230 160 180 220 C 150 260 130 330 160 380 Z',
        targetColor: '#1a0f0d',
        defaultColor: '#ffffff'
      },
      // 5: Queen Silhouette Face & Jawline
      {
        id: 'cor-face',
        number: 5,
        name: 'Radiant Melanin Profile',
        path: 'M 210 320 C 210 260 250 220 300 220 C 350 220 390 260 390 320 C 390 410 340 460 300 460 C 260 460 210 410 210 320 Z',
        targetColor: '#6d3b24',
        defaultColor: '#ffffff'
      },
      // 6: Elegant Slender Neck
      {
        id: 'cor-neck',
        number: 6,
        name: 'Regal Neck',
        path: 'M 265 440 L 260 560 L 340 560 L 335 440 Z',
        targetColor: '#4a2718',
        defaultColor: '#ffffff'
      },
      // 7: Royal Gold Choker Neck Collar
      {
        id: 'cor-choker-1',
        number: 7,
        name: 'Golden Ndebele Collar Tier 1',
        path: 'M 255 480 Q 300 510 345 480 L 343 510 Q 300 540 257 510 Z',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      {
        id: 'cor-choker-2',
        number: 7,
        name: 'Golden Ndebele Collar Tier 2',
        path: 'M 253 520 Q 300 550 347 520 L 345 550 Q 300 580 255 550 Z',
        targetColor: '#d97706',
        defaultColor: '#ffffff'
      },
      // 8: Royal Robe / Shoulders
      {
        id: 'cor-shoulders',
        number: 8,
        name: 'Kente Royal Garment',
        path: 'M 255 560 C 200 570 120 600 80 700 L 520 700 C 480 600 400 570 345 560 Z',
        targetColor: '#b91c1c',
        defaultColor: '#ffffff'
      },
      // 9: Botanical Lotus Flower in Hair (Left)
      {
        id: 'cor-flower-left',
        number: 9,
        name: 'Hibiscus Blossom (Left)',
        path: 'M 160 240 Q 120 220 130 190 Q 160 190 170 220 Q 200 190 220 210 Q 200 240 180 245 Z',
        targetColor: '#f43f5e',
        defaultColor: '#ffffff'
      },
      // 10: Botanical Hibiscus Blossom (Right)
      {
        id: 'cor-flower-right',
        number: 9,
        name: 'Hibiscus Blossom (Right)',
        path: 'M 440 240 Q 480 220 470 190 Q 440 190 430 220 Q 400 190 380 210 Q 400 240 420 245 Z',
        targetColor: '#f43f5e',
        defaultColor: '#ffffff'
      },
      // 11: Lush Botanical Leaves
      {
        id: 'cor-leaves-left',
        number: 10,
        name: 'Verdant Leaves (Left)',
        path: 'M 130 250 Q 90 270 110 300 Q 140 290 145 260 Z',
        targetColor: '#16a34a',
        defaultColor: '#ffffff'
      },
      {
        id: 'cor-leaves-right',
        number: 10,
        name: 'Verdant Leaves (Right)',
        path: 'M 470 250 Q 510 270 490 300 Q 460 290 455 260 Z',
        targetColor: '#16a34a',
        defaultColor: '#ffffff'
      },
      // 12: Butterfly in Afro Crown
      {
        id: 'cor-butterfly',
        number: 11,
        name: 'Monarch of Freedom',
        path: 'M 290 130 Q 260 90 280 70 Q 300 90 300 130 Q 300 90 320 70 Q 340 90 310 130 Z',
        targetColor: '#fb923c',
        defaultColor: '#ffffff'
      },
      // 13: Golden Earrings
      {
        id: 'cor-earring-left',
        number: 12,
        name: 'Bamboo Hoop Earring Left',
        path: 'M 210 350 m -25, 0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      {
        id: 'cor-earring-right',
        number: 12,
        name: 'Bamboo Hoop Earring Right',
        path: 'M 390 350 m -25, 0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      }
    ]
  },
  {
    id: 'harlem-jazz-soul',
    title: 'Harlem Midnight Saxophone',
    category: 'Jazz & Heritage',
    difficulty: 'Detailed',
    description: 'A legendary jazz hornist pouring syncopated melodies into the velvet midnight air of Harlem.',
    culturalStory: 'The Harlem Renaissance of the 1920s and 30s transformed global culture through Black literature, poetry, visual arts, and jazz. From Duke Ellington and Billie Holiday to Charlie Parker and Thelonious Monk, the saxophone became the horn of emancipation, resilience, and supreme musical genius.',
    width: 600,
    height: 700,
    svgPath: '',
    regions: [
      // 1: Background Velvet Indigo
      {
        id: 'hjs-bg',
        number: 1,
        name: 'Midnight Speakeasy Glow',
        path: 'M 0 0 L 600 0 L 600 700 L 0 700 Z',
        targetColor: '#0f172a',
        defaultColor: '#ffffff'
      },
      // 2: Spotlight Beam
      {
        id: 'hjs-spotlight',
        number: 2,
        name: 'Warm Stage Spotlight',
        path: 'M 180 0 L 420 0 L 560 700 L 40 700 Z',
        targetColor: '#78350f',
        defaultColor: '#ffffff'
      },
      // 3: Musician Fedora Hat
      {
        id: 'hjs-fedora',
        number: 3,
        name: 'Sharp Vintage Fedora',
        path: 'M 160 210 Q 250 170 340 210 Q 360 220 330 230 Q 250 200 170 230 Z',
        targetColor: '#1c1917',
        defaultColor: '#ffffff'
      },
      {
        id: 'hjs-fedora-crown',
        number: 3,
        name: 'Fedora Felt Crown',
        path: 'M 200 200 C 200 130 300 130 300 200 Z',
        targetColor: '#292524',
        defaultColor: '#ffffff'
      },
      // 4: Musician Profile & Skin
      {
        id: 'hjs-face',
        number: 4,
        name: 'Maestro Profile',
        path: 'M 230 220 C 230 210 270 210 280 230 C 285 245 290 260 270 270 C 260 275 250 285 245 305 L 220 290 Z',
        targetColor: '#4a2718',
        defaultColor: '#ffffff'
      },
      // 5: Tailored Jazz Suit Jacket
      {
        id: 'hjs-suit',
        number: 5,
        name: 'Zoot Tailored Blazer',
        path: 'M 160 300 L 260 300 L 290 480 L 120 480 Z',
        targetColor: '#581c87',
        defaultColor: '#ffffff'
      },
      // 6: Crisp Shirt Collar & Tie
      {
        id: 'hjs-tie',
        number: 6,
        name: 'Silk Crimson Tie',
        path: 'M 235 300 L 255 300 L 250 380 L 240 380 Z',
        targetColor: '#dc2626',
        defaultColor: '#ffffff'
      },
      // 7: Golden Saxophone Body Tube
      {
        id: 'hjs-sax-neck',
        number: 7,
        name: 'Saxophone Goose-Neck',
        path: 'M 250 260 Q 280 260 290 290 L 305 290 Q 295 250 245 250 Z',
        targetColor: '#ca8a04',
        defaultColor: '#ffffff'
      },
      {
        id: 'hjs-sax-body',
        number: 7,
        name: 'Polished Brass Tube',
        path: 'M 290 290 L 320 450 L 360 450 L 310 290 Z',
        targetColor: '#eab308',
        defaultColor: '#ffffff'
      },
      // 8: Saxophone Bell & Flare
      {
        id: 'hjs-sax-bell',
        number: 8,
        name: 'Resonant Brass Bell',
        path: 'M 320 450 C 320 540 440 540 440 430 C 440 370 380 370 360 450 Z',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      // 9: Golden Key Mechanisms
      {
        id: 'hjs-sax-keys',
        number: 9,
        name: 'Pearl Inlay Keys',
        path: 'M 330 320 H 350 V 330 H 330 Z M 335 350 H 355 V 360 H 335 Z M 340 380 H 360 V 390 H 340 Z',
        targetColor: '#fef08a',
        defaultColor: '#ffffff'
      },
      // 10: Floating Musical Notes / Melody Stream
      {
        id: 'hjs-melody-stream',
        number: 10,
        name: 'Syncopated Melody Ribbon',
        path: 'M 420 390 Q 520 300 450 180 Q 380 80 500 50',
        targetColor: '#38bdf8',
        defaultColor: '#ffffff'
      },
      {
        id: 'hjs-note-1',
        number: 10,
        name: 'Eighth Note Harmonic',
        path: 'M 480 220 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
        targetColor: '#38bdf8',
        defaultColor: '#ffffff'
      },
      {
        id: 'hjs-note-2',
        number: 10,
        name: 'Quarter Note Pulse',
        path: 'M 420 120 m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0',
        targetColor: '#38bdf8',
        defaultColor: '#ffffff'
      }
    ]
  },
  {
    id: 'afrofuturism-astral',
    title: 'Afrofuturism: The Astral Empress',
    category: 'Afrofuturism',
    difficulty: 'Detailed',
    description: 'A cybernetic cosmic monarch uniting ancient African wisdom with interstellar quantum technology.',
    culturalStory: 'Afrofuturism—pioneered by visionaries like Sun Ra, Octavia Butler, and George Clinton—reclaims the future for the African diaspora. It weaves mythology, technology, and ancestral philosophy to imagine vibrant futures where Black identity, science, and cosmos dance together as one.',
    width: 600,
    height: 700,
    svgPath: '',
    regions: [
      // 1: Deep Cosmos
      {
        id: 'afa-cosmos',
        number: 1,
        name: 'Quantum Deep Space',
        path: 'M 0 0 L 600 0 L 600 700 L 0 700 Z',
        targetColor: '#09090b',
        defaultColor: '#ffffff'
      },
      // 2: Astral Nebula Clouds
      {
        id: 'afa-nebula',
        number: 2,
        name: 'Orion Nebula Dust',
        path: 'M 0 150 Q 200 50 400 120 Q 600 200 600 400 Q 400 350 200 500 Q 0 450 0 150 Z',
        targetColor: '#6b21a8',
        defaultColor: '#ffffff'
      },
      // 3: Interstellar Cyber Pyramids
      {
        id: 'afa-pyramid',
        number: 3,
        name: 'Solar Dyson Pyramid',
        path: 'M 300 80 L 150 320 L 450 320 Z',
        targetColor: '#1e1b4b',
        defaultColor: '#ffffff'
      },
      // 4: Empress Crown Geometric Headdress
      {
        id: 'afa-crown',
        number: 4,
        name: 'Starlight Tiara of Ra',
        path: 'M 220 220 L 300 130 L 380 220 L 350 240 L 300 190 L 250 240 Z',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      // 5: Cosmic Braids / Dreadlock Halo
      {
        id: 'afa-braids-left',
        number: 5,
        name: 'Quantum Braids (Left)',
        path: 'M 200 240 C 130 280 120 450 180 560 L 220 540 C 170 430 180 300 230 260 Z',
        targetColor: '#06b6d4',
        defaultColor: '#ffffff'
      },
      {
        id: 'afa-braids-right',
        number: 5,
        name: 'Quantum Braids (Right)',
        path: 'M 400 240 C 470 280 480 450 420 560 L 380 540 C 430 430 420 300 370 260 Z',
        targetColor: '#06b6d4',
        defaultColor: '#ffffff'
      },
      // 6: Melanin Visage
      {
        id: 'afa-face',
        number: 6,
        name: 'Obsidian Empress Visage',
        path: 'M 230 240 C 230 200 370 200 370 240 C 370 330 330 390 300 390 C 270 390 230 330 230 240 Z',
        targetColor: '#2d1810',
        defaultColor: '#ffffff'
      },
      // 7: Third-Eye Ajna Crystal
      {
        id: 'afa-thirdeye',
        number: 7,
        name: 'Cybernetic Monocle / Ajna Eye',
        path: 'M 300 240 m -16, 0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0',
        targetColor: '#ec4899',
        defaultColor: '#ffffff'
      },
      // 8: Neon Cyber Lip Accent
      {
        id: 'afa-lips',
        number: 8,
        name: 'Gold Leaf Cyber Lips',
        path: 'M 280 340 Q 300 330 320 340 Q 300 365 280 340 Z',
        targetColor: '#fbbf24',
        defaultColor: '#ffffff'
      },
      // 9: Quantum Armor Shoulders
      {
        id: 'afa-armor',
        number: 9,
        name: 'Vibranium Exosuit',
        path: 'M 200 450 L 100 650 L 500 650 L 400 450 L 300 500 Z',
        targetColor: '#475569',
        defaultColor: '#ffffff'
      },
      // 10: Neon Circuit Lines
      {
        id: 'afa-circuits',
        number: 10,
        name: 'Ancestral Circuit Conduit',
        path: 'M 300 500 L 300 650 M 240 520 L 200 650 M 360 520 L 400 650',
        targetColor: '#10b981',
        defaultColor: '#ffffff'
      }
    ]
  },
  {
    id: 'hbcu-drum-major',
    title: "The Drum Major's Pride (HBCU Spirit)",
    category: 'Community',
    difficulty: 'Medium',
    description: 'High-stepping rhythm, brass energy, and unmatched precision from the fifth quarter.',
    culturalStory: 'Historically Black Colleges and Universities (HBCUs) gave birth to a legendary marching band culture that fuses military precision, show-stopping dance, and thunderous brass arrangements. The Drum Major is the fearless maestro leading the band into historic stadium showdowns.',
    width: 600,
    height: 700,
    svgPath: '',
    regions: [
      // 1: Stadium Floodlights
      {
        id: 'hbc-stadium',
        number: 1,
        name: 'Stadium Sky & Lights',
        path: 'M 0 0 L 600 0 L 600 700 L 0 700 Z',
        targetColor: '#0f172a',
        defaultColor: '#ffffff'
      },
      // 2: Gold Confetti Stadium Beams
      {
        id: 'hbc-beams',
        number: 2,
        name: 'Halftime Spotlight',
        path: 'M 100 0 L 250 700 L 350 700 L 500 0 Z',
        targetColor: '#d97706',
        defaultColor: '#ffffff'
      },
      // 3: Tall Fur Shako Hat
      {
        id: 'hbc-shako',
        number: 3,
        name: 'Majestic Tall Shako Hat',
        path: 'M 230 200 L 210 70 L 390 70 L 370 200 Z',
        targetColor: '#ffffff',
        defaultColor: '#ffffff'
      },
      // 4: Golden Feather Plume
      {
        id: 'hbc-plume',
        number: 4,
        name: 'Sovereign Crimson Plume',
        path: 'M 290 70 C 270 20 330 20 310 70 Z',
        targetColor: '#dc2626',
        defaultColor: '#ffffff'
      },
      // 5: Shako Gold Eagle Crest & Chin Strap
      {
        id: 'hbc-crest',
        number: 5,
        name: 'Brass Shako Emblem',
        path: 'M 285 130 L 300 115 L 315 130 L 300 145 Z',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      // 6: Drum Major Face
      {
        id: 'hbc-face',
        number: 6,
        name: 'Commanding Expression',
        path: 'M 245 200 C 245 250 355 250 355 200 Z',
        targetColor: '#8c4d2e',
        defaultColor: '#ffffff'
      },
      // 7: Military Tunic Jacket
      {
        id: 'hbc-tunic',
        number: 7,
        name: 'Royal Blue Band Tunic',
        path: 'M 210 260 L 160 480 L 440 480 L 390 260 Z',
        targetColor: '#1d4ed8',
        defaultColor: '#ffffff'
      },
      // 8: Gold Braided Frogging & Epaulets
      {
        id: 'hbc-frogging',
        number: 8,
        name: 'Gold Frogging Braids',
        path: 'M 240 300 H 360 V 315 H 240 Z M 250 340 H 350 V 355 H 250 Z M 260 380 H 340 V 395 H 260 Z',
        targetColor: '#fbbf24',
        defaultColor: '#ffffff'
      },
      // 9: Drum Major Baton / Mace Head
      {
        id: 'hbc-baton-head',
        number: 9,
        name: 'Polished Brass Baton Crown',
        path: 'M 480 200 m -30, 0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      // 10: Baton Shaft & Cords
      {
        id: 'hbc-baton-shaft',
        number: 10,
        name: 'Chromed Baton Shaft',
        path: 'M 475 230 L 400 580 L 415 580 L 490 230 Z',
        targetColor: '#e2e8f0',
        defaultColor: '#ffffff'
      }
    ]
  },
  {
    id: 'sankofa-sacred-bird',
    title: 'Sankofa & Stained Glass Heritage',
    category: 'Sacred Geometry',
    difficulty: 'Easy',
    description: 'The sacred Akan symbol of looking back to gather ancient knowledge to move bravely forward.',
    culturalStory: 'Sankofa is an Adinkra symbol originating from the Akan people of Ghana, widely embraced by African Americans. Depicted as a mythical bird flying forward while turning its neck backward to protect an egg, it teaches that knowing where you come from is essential to reaching where you are going.',
    width: 600,
    height: 700,
    svgPath: '',
    regions: [
      // 1: Stained Glass Frame
      {
        id: 'san-border',
        number: 1,
        name: 'Stained Glass Frame',
        path: 'M 30 30 L 570 30 L 570 670 L 30 670 Z M 50 50 L 50 650 L 550 650 L 550 50 Z',
        targetColor: '#171717',
        defaultColor: '#ffffff'
      },
      // 2: Outer Mosaic Tiles (Top-Left)
      {
        id: 'san-tile-tl',
        number: 2,
        name: 'Mosaic Tile North-West',
        path: 'M 50 50 L 200 50 L 50 200 Z',
        targetColor: '#b91c1c',
        defaultColor: '#ffffff'
      },
      // 3: Outer Mosaic Tiles (Top-Right)
      {
        id: 'san-tile-tr',
        number: 2,
        name: 'Mosaic Tile North-East',
        path: 'M 550 50 L 400 50 L 550 200 Z',
        targetColor: '#b91c1c',
        defaultColor: '#ffffff'
      },
      // 4: Outer Mosaic Tiles (Bottom Corners)
      {
        id: 'san-tile-bl',
        number: 3,
        name: 'Mosaic Tile South-West',
        path: 'M 50 650 L 200 650 L 50 500 Z',
        targetColor: '#15803d',
        defaultColor: '#ffffff'
      },
      {
        id: 'san-tile-br',
        number: 3,
        name: 'Mosaic Tile South-East',
        path: 'M 550 650 L 400 650 L 550 500 Z',
        targetColor: '#15803d',
        defaultColor: '#ffffff'
      },
      // 5: Sacred Sun Circle
      {
        id: 'san-sun',
        number: 4,
        name: 'Solar Disc of Wisdom',
        path: 'M 300 350 m -190, 0 a 190,190 0 1,0 380,0 a 190,190 0 1,0 -380,0',
        targetColor: '#fef08a',
        defaultColor: '#ffffff'
      },
      // 6: Sacred Golden Egg (in beak / back)
      {
        id: 'san-egg',
        number: 5,
        name: 'Precious Egg of Tomorrow',
        path: 'M 220 280 m -30, 0 a 30,40 0 1,0 60,0 a 30,40 0 1,0 -60,0',
        targetColor: '#f59e0b',
        defaultColor: '#ffffff'
      },
      // 7: Sankofa Bird Body & Wings
      {
        id: 'san-body',
        number: 6,
        name: 'Sankofa Majestic Wings',
        path: 'M 320 280 C 420 240 450 380 380 460 C 330 520 260 480 280 420 C 310 400 340 370 320 280 Z',
        targetColor: '#d97706',
        defaultColor: '#ffffff'
      },
      // 8: Turned Neck & Head
      {
        id: 'san-head',
        number: 7,
        name: 'Turned Head Seeking Wisdom',
        path: 'M 280 340 C 270 290 230 250 210 260 C 190 270 210 320 260 360 Z',
        targetColor: '#b45309',
        defaultColor: '#ffffff'
      },
      // 9: Feather Plumage Base
      {
        id: 'san-feathers',
        number: 8,
        name: 'Tail Feather Fan',
        path: 'M 380 460 Q 480 520 440 580 Q 360 560 350 490 Z',
        targetColor: '#78350f',
        defaultColor: '#ffffff'
      }
    ]
  }
];
