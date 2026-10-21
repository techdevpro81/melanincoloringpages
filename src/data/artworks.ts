import type { Artwork } from '../types';

export const CULTURAL_ARTWORKS: Artwork[] = [
  {
    id: 'miles-davis-trumpet',
    title: 'Miles Davis Playing Trumpet',
    category: 'Celebrity',
    difficulty: 'Detailed',
    description: 'Legendary jazz innovator Miles Davis playing his trumpet with intense soul on stage under stage spotlights, wearing a tailored suit.',
    culturalStory: 'Miles Davis was a visionary trumpeter, bandleader, and cultural icon whose sound revolutionized American music from bebop to fusion.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/miles-davis.jpg',
    regions: [
      { id: 'md-suit', number: 1, name: 'Tailored Stage Suit', path: 'M 200 200 L 550 200 L 550 900 L 200 900 Z', targetColor: '#1e3a8a', defaultColor: '#ffffff' },
      { id: 'md-trumpet', number: 2, name: 'Golden Brass Trumpet', path: 'M 400 200 L 750 200 L 750 400 L 400 400 Z', targetColor: '#eab308', defaultColor: '#ffffff' },
      { id: 'md-stage', number: 3, name: 'Wood Concert Stage', path: 'M 0 700 L 768 700 L 768 1024 L 0 1024 Z', targetColor: '#78350f', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'scientist-astrophysicist',
    title: 'Dr. Maya the Astrophysicist',
    category: 'Scientists',
    difficulty: 'Detailed',
    description: 'Brilliant smiling Black woman astrophysicist with natural afro bun and glasses adjusting a large observatory telescope surrounded by celestial star charts and planetary globes.',
    culturalStory: 'Celebrating Black women in astrophysics, astronomy, and cosmic exploration. Honoring the legacy of pioneers who map the universe, study exoplanets, and inspire the next generation of stargazers.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/scientist-astrophysicist.jpg',
    regions: [
      { id: 'sa-skin', number: 1, name: 'Warm Melanin Skin Tone', path: 'M 380 320 C 370 420 400 480 480 480 C 560 480 580 410 570 330 C 530 330 430 320 380 320 Z M 340 540 L 410 580 L 370 650 L 320 600 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'sa-hair', number: 2, name: 'Natural Afro Bun & Curls', path: 'M 370 270 C 350 180 440 100 550 100 C 660 100 700 180 670 270 C 650 320 600 330 570 320 C 540 300 440 300 370 270 Z', targetColor: '#292524', defaultColor: '#ffffff' },
      { id: 'sa-telescope', number: 3, name: 'Observatory Telescope Tube', path: 'M 15 240 L 190 180 L 360 420 L 160 520 Z', targetColor: '#2563eb', defaultColor: '#ffffff' },
      { id: 'sa-tripod', number: 4, name: 'Heavy Brass Tripod Mount', path: 'M 150 530 L 350 530 L 400 1024 L 80 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'sa-coat', number: 5, name: 'White Physician Lab Coat', path: 'M 370 480 L 490 480 L 670 540 L 720 1024 L 380 1024 Z', targetColor: '#f1f5f9', defaultColor: '#ffffff' },
      { id: 'sa-charts', number: 6, name: 'Constellation Star Charts', path: 'M 0 0 L 768 0 L 768 250 L 360 250 L 360 150 L 0 150 Z', targetColor: '#0ea5e9', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'cosmic-queen',
    title: 'Majestic Cosmic Queen of the Nebulae',
    category: 'Cosmic',
    difficulty: 'Detailed',
    description: 'Majestic Black cosmic queen with towering braided crown hair reaching into star constellations, floating in space with orbiting crescent moons, sacred geometry, and celestial robes.',
    culturalStory: 'Afrofuturism fuses ancestral heritage, African cosmology, and infinite starlight. This regal portrait celebrates the divine feminine, cosmic sovereignty, and the eternal beauty of Black hair reaching across galaxies.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/cosmic-queen.jpg',
    regions: [
      { id: 'cq-skin', number: 1, name: 'Radiant Queen Melanin', path: 'M 340 300 C 340 400 384 440 428 400 C 440 350 430 300 340 300 Z M 210 560 L 290 600 L 250 630 Z M 500 540 L 580 580 L 540 620 Z', targetColor: '#713f12', defaultColor: '#ffffff' },
      { id: 'cq-crown', number: 2, name: 'Towering Braided Nebula Crown', path: 'M 220 280 C 180 100 320 30 384 30 C 460 30 580 100 550 280 C 480 290 440 260 384 260 C 320 260 260 290 220 280 Z', targetColor: '#7c3aed', defaultColor: '#ffffff' },
      { id: 'cq-gown', number: 3, name: 'Celestial Star-Woven Gown', path: 'M 320 420 L 450 420 L 650 850 L 120 850 Z', targetColor: '#ec4899', defaultColor: '#ffffff' },
      { id: 'cq-staff', number: 4, name: 'Golden Lunar Crescent Staff', path: 'M 540 380 L 640 380 L 520 820 L 500 820 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'cq-stars', number: 5, name: 'Orbiting Starlight & Nebulae', path: 'M 0 0 L 240 0 L 240 450 L 0 450 Z M 540 0 L 768 0 L 768 450 L 540 450 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' },
      { id: 'cq-mandalas', number: 6, name: 'Sacred Geometric Mandalas', path: 'M 0 850 L 768 850 L 768 1024 L 0 1024 Z', targetColor: '#10b981', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'robotics-engineer',
    title: 'Marcus the Robotics Engineer',
    category: 'Engineers',
    difficulty: 'Detailed',
    description: 'Intelligent smiling Black male robotics engineer with safety glasses working on an advanced friendly humanoid robot with exposed circuits, gears, and workshop tools.',
    culturalStory: 'Engineering is a cornerstone of innovation, community progress, and technological sovereignty. Depicting a master robotics builder crafting friendly automation for tomorrow.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/robotics-engineer.jpg',
    regions: [
      { id: 're-skin', number: 1, name: 'Engineer Face & Hands', path: 'M 520 130 C 520 280 620 320 710 260 C 720 160 650 120 520 130 Z M 480 480 L 640 550 L 580 600 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 're-hair', number: 2, name: 'Crisp Lineup Fade', path: 'M 520 180 C 520 120 600 110 710 130 C 710 160 620 160 520 180 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 're-apron', number: 3, name: 'Workshop Canvas Apron', path: 'M 490 320 L 750 320 L 750 750 L 480 750 Z', targetColor: '#059669', defaultColor: '#ffffff' },
      { id: 're-android', number: 4, name: 'Friendly Bipedal Android Chassis', path: 'M 150 200 L 450 200 L 450 780 L 150 780 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 're-bench', number: 5, name: 'Electronics Toolbench & Hardware', path: 'M 0 750 L 768 750 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 're-laptop', number: 6, name: 'Laptop & Blueprint Schematics', path: 'M 520 680 L 768 680 L 768 950 L 520 950 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'healthcare-pediatrician',
    title: 'Dr. Nia Pediatric Care & Compassion',
    category: 'Healthcare',
    difficulty: 'Detailed',
    description: 'Caring smiling Black woman pediatrician wearing scrubs and stethoscope gently listening to the heartbeat of a happy little girl holding a teddy bear in a cheerful clinic.',
    culturalStory: 'Honoring Black healers, physicians, and nurses who bring warmth, empathy, and life-saving care to families and children every single day.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/healthcare-pediatrician.jpg',
    regions: [
      { id: 'hp-skin', number: 1, name: 'Doctor & Child Melanin Tones', path: 'M 290 270 C 290 380 400 400 480 340 C 470 270 380 250 290 270 Z M 610 330 C 610 440 700 440 730 360 C 710 320 640 310 610 330 Z', targetColor: '#7c2d12', defaultColor: '#ffffff' },
      { id: 'hp-hair', number: 2, name: 'Doctor Locs & Child Braids', path: 'M 200 230 C 200 130 360 130 490 210 C 480 320 440 330 360 300 C 240 320 200 280 200 230 Z M 600 300 C 600 250 760 250 760 380 C 730 440 680 430 600 300 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'hp-coat', number: 3, name: 'Doctor Scrubs & White Coat', path: 'M 120 400 L 520 400 L 480 950 L 60 950 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'hp-steth', number: 4, name: 'Cardiac Stethoscope', path: 'M 300 320 L 440 320 L 440 550 L 300 550 Z', targetColor: '#eab308', defaultColor: '#ffffff' },
      { id: 'hp-child-dress', number: 5, name: 'Young Girl Floral Dress', path: 'M 560 460 L 760 460 L 760 780 L 560 780 Z', targetColor: '#f43f5e', defaultColor: '#ffffff' },
      { id: 'hp-teddy', number: 6, name: 'Golden Cuddle Teddy Bear', path: 'M 600 480 L 750 480 L 750 640 L 600 640 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'hp-clinic', number: 7, name: 'Cheerful Pediatric Clinic Wall', path: 'M 0 0 L 768 0 L 768 250 L 0 250 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'teenager-basketball-star',
    title: 'Teen Basketball Star on the Court',
    category: 'Teenagers',
    difficulty: 'Detailed',
    description: 'Publication-quality storybook coloring illustration of an athletic, handsome smiling Black male teenager joyfully dribbling a basketball on a neighborhood court with hoop and net.',
    culturalStory: 'Basketball has long been a bedrock of community, brotherhood, and athletic brilliance in Black neighborhoods across America. From asphalt street courts to championship arenas, the game celebrates discipline, rhythm, joy, and unity.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/teenager-basketball.jpg',
    regions: [
      { id: 'tbs-reg-1', number: 1, name: 'Teenager Basketball Artwork', path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'teenager-dreadlocks-guitar',
    title: 'Teenager with Dreadlocks Playing Guitar',
    category: 'Teenagers',
    difficulty: 'Detailed',
    description: 'Publication-quality storybook coloring illustration of a cool smiling Black male teenager with neat cylindrical dreadlocks playing an acoustic guitar.',
    culturalStory: 'Music has always been the heartbeat of Black culture, storytelling, and soul. Depicting a creative young Black musician with neat dreadlocks and acoustic guitar, this artwork honors the rich heritage of Black musicianship, from acoustic blues to modern soul.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/teenager-dreadlocks-guitar.jpg',
    regions: [
      { id: 'tdg-reg-1', number: 1, name: 'Teenager & Guitar Artwork', path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'baby-boy-truck',
    title: 'Baby Boy Playing with Toy Truck',
    category: 'Children',
    difficulty: 'Easy',
    description: 'Charming storybook coloring page of a smiling chubby-cheeked Black baby boy in overalls playing with his favorite toy dump truck and building blocks.',
    culturalStory: 'Celebrating the innocent joy and wonder of Black boyhood. Filled with playful curiosity, rolled-up denim overalls, and natural soft curls, this illustration honors the beauty of imagination and childhood joy.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/baby-boy-truck.jpg',
    regions: [
      { id: 'bbt-reg-1', number: 1, name: 'Baby Boy & Toy Truck', path: 'M 0 0 L 768 0 L 768 1024 L 0 1024 Z', targetColor: '#3b82f6', defaultColor: '#ffffff' }
    ]
  },
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
    id: 'ballerina-grace',
    title: 'Young Black Ballerina on Stage',
    category: 'Children',
    difficulty: 'Detailed',
    description: 'Smiling young Black girl ballerina with curly afro bun and hair bow, wearing a ruffled tutu with bows and satin pointe shoes, holding an arabesque on a theater stage with draped curtains and a chandelier.',
    culturalStory: 'Celebrating trailblazing Black ballerinas like Janet Collins, Raven Wilkinson, and Misty Copeland who shattered barriers in classical ballet. Honoring strength, grace, discipline, and the sovereign beauty of Black dancers on world stages.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/ballerina-dancer.jpg',
    regions: [
      { id: 'bg-skin', number: 1, name: 'Ballerina Melanin Skin Tone', path: 'M 400 200 C 400 320 530 320 530 200 Z M 200 340 L 400 400 L 380 430 Z M 540 180 L 680 160 L 650 200 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'bg-hair', number: 2, name: 'High Curls Bun & Hair Tiara Bow', path: 'M 360 140 C 360 40 500 40 500 140 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'bg-tutu', number: 3, name: 'Tiered Ruffled Ballet Tutu & Bodice', path: 'M 260 380 L 620 380 L 620 660 L 260 660 Z', targetColor: '#f43f5e', defaultColor: '#ffffff' },
      { id: 'bg-shoes', number: 4, name: 'Satin Pointe Slippers & Ribbons', path: 'M 380 800 L 480 800 L 480 940 L 380 940 Z M 60 350 L 190 350 L 190 430 L 60 430 Z', targetColor: '#fb7185', defaultColor: '#ffffff' },
      { id: 'bg-stage', number: 5, name: 'Velvet Curtains & Theater Chandelier', path: 'M 0 0 L 768 0 L 768 750 L 650 750 L 650 250 L 120 250 L 120 750 L 0 750 Z', targetColor: '#4f46e5', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'harlem-jazz-soul',
    title: 'Harlem Midnight Saxophone',
    category: 'Jazz & Heritage',
    difficulty: 'Detailed',
    description: 'Legendary jazz saxophone master pouring syncopated melodies into the velvet midnight air with microphone, jazz drum kit, and sheet music.',
    culturalStory: 'The Harlem Renaissance transformed global culture through Black literature, poetry, visual arts, and jazz. From Duke Ellington and Billie Holiday to Charlie Parker and John Coltrane, the saxophone became the horn of emancipation, resilience, and supreme musical genius.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/harlem-jazz-saxophone.jpg',
    regions: [
      { id: 'hjs-skin', number: 1, name: 'Jazz Maestro Melanin Complexion', path: 'M 350 170 C 350 280 470 280 470 170 Z M 280 400 L 370 440 L 340 480 Z M 480 400 L 540 440 L 520 480 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'hjs-suit', number: 2, name: 'Sharp Patterned Suit & Vintage Fedora', path: 'M 340 100 L 530 100 L 530 200 L 340 200 Z M 320 270 L 580 270 L 550 630 L 320 630 Z', targetColor: '#581c87', defaultColor: '#ffffff' },
      { id: 'hjs-sax', number: 3, name: 'Golden Alto Saxophone', path: 'M 210 440 L 370 260 L 410 480 L 260 640 Z', targetColor: '#eab308', defaultColor: '#ffffff' },
      { id: 'hjs-drums', number: 4, name: 'Drum Set & Sheet Music Stand', path: 'M 30 520 L 260 520 L 260 840 L 30 840 Z M 520 500 L 730 500 L 730 940 L 520 940 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'hjs-stage', number: 5, name: 'Stage Spotlights & Club Glow', path: 'M 0 0 L 768 0 L 768 350 L 0 350 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'afro-astronaut',
    title: 'Cosmic Afro Astronaut & Moon',
    category: 'Cosmic',
    difficulty: 'Detailed',
    description: 'Young Black astronaut floating in space among planets, Saturn rings, cute rocket ship, crescent moon, and distant stars.',
    culturalStory: 'Afrofuturism reclaims the cosmos for the African diaspora. Honoring pioneers like Mae Jemison, Ronald McNair, and Guion Bluford, this illustration inspires boundless exploration across the stars.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/afro-astronaut.jpg',
    regions: [
      { id: 'aa-skin', number: 1, name: 'Astronaut Melanin Face', path: 'M 340 230 C 340 370 480 370 480 230 Z', targetColor: '#7c2d12', defaultColor: '#ffffff' },
      { id: 'aa-suit', number: 2, name: 'Spacesuit & NASA Mission Badges', path: 'M 220 370 L 600 370 L 600 950 L 220 950 Z', targetColor: '#e2e8f0', defaultColor: '#ffffff' },
      { id: 'aa-helmet', number: 3, name: 'Astronaut Helmet Visor', path: 'M 260 480 L 430 480 L 430 650 L 260 650 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' },
      { id: 'aa-saturn', number: 4, name: 'Rocket Ship & Distant Saturn', path: 'M 540 100 L 750 100 L 750 400 L 540 400 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'aa-cosmos', number: 5, name: 'Crescent Moon & Starfield', path: 'M 0 0 L 768 0 L 768 300 L 0 300 Z', targetColor: '#3b82f6', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'hbcu-graduate',
    title: 'HBCU Proud Graduate & Kente Sash',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Proud smiling young Black university graduate wearing academic cap with tassel and gown with kente cloth sash stole, holding a rolled diploma.',
    culturalStory: 'Historically Black Colleges and Universities (HBCUs) have produced generations of leaders, scientists, civil rights icons, artists, and scholars. This piece honors academic excellence, community pride, and ancestral achievement.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/hbcu-graduate.jpg',
    regions: [
      { id: 'hg-skin', number: 1, name: 'Graduate Melanin Visage & Hands', path: 'M 350 220 C 350 360 490 360 490 220 Z M 220 620 L 310 620 L 310 700 L 220 700 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'hg-cap', number: 2, name: 'Academic Cap & Golden Tassel', path: 'M 250 100 L 590 100 L 590 220 L 250 220 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'hg-kente', number: 3, name: 'Traditional Kente Cloth Sash Stole', path: 'M 330 360 L 510 360 L 540 850 L 300 850 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'hg-gown', number: 4, name: 'Midnight Graduation Robe & Diploma', path: 'M 200 360 L 640 360 L 640 980 L 200 980 Z', targetColor: '#1e3a8a', defaultColor: '#ffffff' },
      { id: 'hg-campus', number: 5, name: 'Historic Campus Bell Tower', path: 'M 0 0 L 768 0 L 768 350 L 0 350 Z', targetColor: '#059669', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'adinkra-ancestral-gateway',
    title: 'Adinkra Sacred Ancestral Gateway',
    category: 'Sacred Geometry',
    difficulty: 'Detailed',
    description: 'Ornate ancestral gateway carved with Akan Adinkra symbols (Gye Nyame and the Sankofa bird), patterned columns, and an open door to a village path, framed by palm trees, plumeria flowers, and potted plants.',
    culturalStory: 'Adinkra symbols originated with the Akan people of West Africa, each encapsulating philosophical proverbs, ancestral values, and sacred geometric codes of character, perseverance, and spiritual reverence.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/adinkra-sacred-gateway.jpg',
    regions: [
      { id: 'asg-arch', number: 1, name: 'Golden Portal Archway', path: 'M 100 80 L 668 80 L 668 950 L 100 950 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'asg-symbols', number: 2, name: 'Sacred Adinkra Glyphs & Symbols', path: 'M 180 200 L 588 200 L 588 750 L 180 750 Z', targetColor: '#dc2626', defaultColor: '#ffffff' },
      { id: 'asg-starlight', number: 3, name: 'Starlit Ancestral Gateway Core', path: 'M 260 300 L 508 300 L 508 650 L 260 650 Z', targetColor: '#2563eb', defaultColor: '#ffffff' },
      { id: 'asg-pedestal', number: 4, name: 'Mosaic Stone Sanctuary Pedestal', path: 'M 0 850 L 768 850 L 768 1024 L 0 1024 Z', targetColor: '#059669', defaultColor: '#ffffff' },
      { id: 'asg-sky', number: 5, name: 'Cosmic Sky Backdrop', path: 'M 0 0 L 768 0 L 768 300 L 0 300 Z', targetColor: '#7c3aed', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'black-male-engineer',
    title: 'Marcus the Civil Engineer',
    category: 'Engineers',
    difficulty: 'Detailed',
    description: 'Handsome Black male civil engineer in hard hat and safety vest reviewing rolled blueprints on an active building construction site.',
    culturalStory: 'From Benjamin Banneker to modern infrastructure architects, Black engineers have shaped the skyline and technological foundation of our world.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/black-male-engineer.jpg',
    regions: [
      { id: 'bme-skin', number: 1, name: 'Engineer Melanin Visage', path: 'M 350 180 C 350 320 480 320 480 180 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'bme-vest', number: 2, name: 'Safety Hard Hat & High-Vis Vest', path: 'M 280 90 L 550 90 L 550 200 L 280 200 Z M 220 320 L 610 320 L 610 850 L 220 850 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'bme-prints', number: 3, name: 'Architectural Blueprints & Tablet', path: 'M 250 500 L 580 500 L 580 750 L 250 750 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' },
      { id: 'bme-site', number: 4, name: 'Construction Crane & Steel Beams', path: 'M 0 0 L 768 0 L 768 350 L 0 350 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'stem-scientist',
    title: 'Young Chemist in the STEM Lab',
    category: 'Scientists',
    difficulty: 'Detailed',
    description: 'Intelligent smiling young Black girl scientist wearing safety goggles and lab coat at workbench with bubbling beakers and microscope.',
    culturalStory: 'Celebrating the brilliant legacy of Black innovators in chemistry, physics, and medicine. Inspiring the next generation of Nobel laureates and inventors.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/stem-scientist.jpg',
    regions: [
      { id: 'ss-skin', number: 1, name: 'Young Chemist Face & Curls', path: 'M 340 180 C 340 320 480 320 480 180 Z M 260 100 L 560 100 L 560 220 L 260 220 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'ss-coat', number: 2, name: 'Protective Goggles & White Lab Coat', path: 'M 220 320 L 600 320 L 600 850 L 220 850 Z', targetColor: '#f1f5f9', defaultColor: '#ffffff' },
      { id: 'ss-beakers', number: 3, name: 'Bubbling Chemistry Flasks & Solutions', path: 'M 100 550 L 350 550 L 350 750 L 100 750 Z', targetColor: '#10b981', defaultColor: '#ffffff' },
      { id: 'ss-scope', number: 4, name: 'Laboratory Precision Microscope', path: 'M 480 480 L 720 480 L 720 850 L 480 850 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'ss-chalk', number: 5, name: 'Science Blackboard Formulas', path: 'M 0 0 L 768 0 L 768 300 L 0 300 Z', targetColor: '#f43f5e', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'doctor-stethoscope',
    title: 'Dr. Jada Hospital Physician',
    category: 'Healthcare',
    difficulty: 'Detailed',
    description: 'Confident smiling Black woman physician with neat braided updo wearing stethoscope and lab coat in a modern hospital hallway.',
    culturalStory: 'Honoring Black healthcare leaders, surgeons, and nurses dedicated to health equity, compassionate care, and healing communities.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/doctor-stethoscope.jpg',
    regions: [
      { id: 'ds-skin', number: 1, name: 'Doctor Melanin Complexion', path: 'M 350 180 C 350 330 480 330 480 180 Z', targetColor: '#7c2d12', defaultColor: '#ffffff' },
      { id: 'ds-hair', number: 2, name: 'Braided Updo Bun', path: 'M 330 30 C 330 0 500 0 500 150 L 330 150 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'ds-coat', number: 3, name: 'Physician White Coat & Scrubs', path: 'M 180 340 L 640 340 L 640 980 L 180 980 Z', targetColor: '#0ea5e9', defaultColor: '#ffffff' },
      { id: 'ds-steth', number: 4, name: 'Cardiac Stethoscope & Clipboard', path: 'M 320 340 L 480 340 L 480 600 L 320 600 Z M 520 500 L 720 500 L 720 780 L 520 780 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'ds-hall', number: 5, name: 'Hospital Corridor Walls', path: 'M 0 0 L 768 0 L 768 400 L 0 400 Z', targetColor: '#e2e8f0', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'father-reading-child',
    title: 'Father & Daughter Storytime',
    category: 'Children',
    difficulty: 'Detailed',
    description: 'Loving handsome smiling Black father reading a picture book with his smiling daughter with afro puffs on a cozy living room sofa.',
    culturalStory: 'Uplifting the deep love, tenderness, and daily devotion of Black fatherhood and family literacy.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/father-reading-child.jpg',
    regions: [
      { id: 'frc-skin', number: 1, name: 'Father & Child Melanin Tones', path: 'M 220 200 C 220 340 360 340 360 200 Z M 440 280 C 440 400 560 400 560 280 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'frc-hair', number: 2, name: 'Daughter Afro Puffs & Father Fade', path: 'M 400 220 L 600 220 L 600 320 L 400 320 Z M 200 140 L 380 140 L 380 240 L 200 240 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'frc-book', number: 3, name: 'Illustrated Big Storybook', path: 'M 300 500 L 580 500 L 580 720 L 300 720 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'frc-sofa', number: 4, name: 'Cozy Living Room Sofa', path: 'M 80 450 L 700 450 L 700 950 L 80 950 Z', targetColor: '#059669', defaultColor: '#ffffff' },
      { id: 'frc-room', number: 5, name: 'Warm Living Room Lamp & Wall', path: 'M 0 0 L 768 0 L 768 350 L 0 350 Z', targetColor: '#fbbf24', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'black-chef-cooking',
    title: 'Master Chef Marcus',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Passionate Black male culinary master chef wearing tall toque hat and apron stirring a copper soup pot in a gourmet kitchen.',
    culturalStory: 'Black culinary masters have defined American cuisine—from Southern soul food to Michelin-starred fine dining—with soul, innovation, and mastery.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/black-chef-cooking.jpg',
    regions: [
      { id: 'bcc-skin', number: 1, name: 'Chef Melanin Complexion', path: 'M 350 220 C 350 360 480 360 480 220 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'bcc-hat', number: 2, name: 'Tall White Chef Toque Hat', path: 'M 320 40 L 510 40 L 510 230 L 320 230 Z', targetColor: '#f8fafc', defaultColor: '#ffffff' },
      { id: 'bcc-apron', number: 3, name: 'Professional Chef Apron & Shirt', path: 'M 220 360 L 610 360 L 610 850 L 220 850 Z', targetColor: '#dc2626', defaultColor: '#ffffff' },
      { id: 'bcc-pot', number: 4, name: 'Steaming Copper Soup Pot', path: 'M 280 620 L 550 620 L 550 900 L 280 900 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'bcc-kitchen', number: 5, name: 'Kitchen Stovetop & Copper Pans', path: 'M 0 0 L 768 0 L 768 400 L 0 400 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'black-firefighter',
    title: 'Hero Firefighter David',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Courageous smiling Black male firefighter in turnout coat and helmet with protective visor holding a fire hose by a shiny fire engine.',
    culturalStory: 'Honoring the courage and selfless service of Black firefighters who protect neighborhoods and inspire youth.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/black-firefighter.jpg',
    regions: [
      { id: 'bf-skin', number: 1, name: 'Firefighter Melanin Face', path: 'M 350 200 C 350 340 480 340 480 200 Z', targetColor: '#7c2d12', defaultColor: '#ffffff' },
      { id: 'bf-helmet', number: 2, name: 'Protective Firefighter Helmet', path: 'M 280 90 L 550 90 L 550 220 L 280 220 Z', targetColor: '#eab308', defaultColor: '#ffffff' },
      { id: 'bf-coat', number: 3, name: 'Heavy Duty Turnout Bunker Coat', path: 'M 200 340 L 630 340 L 630 900 L 200 900 Z', targetColor: '#b91c1c', defaultColor: '#ffffff' },
      { id: 'bf-hose', number: 4, name: 'High-Pressure Fire Hose Nozzle', path: 'M 350 650 L 600 650 L 600 950 L 350 950 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'bf-truck', number: 5, name: 'Red Engine Fire Truck', path: 'M 0 0 L 768 0 L 768 400 L 0 400 Z', targetColor: '#dc2626', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'black-pilot-airplane',
    title: 'Captain Andre Commercial Pilot',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Proud handsome Black commercial airline captain in uniform with peaked cap and aviator wings standing in front of jet on runway.',
    culturalStory: 'From the Tuskegee Airmen to commercial airline captains, celebrating Black aviators who conquer the skies with excellence.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/black-pilot-airplane.jpg',
    regions: [
      { id: 'bpa-skin', number: 1, name: 'Captain Melanin Complexion', path: 'M 350 200 C 350 340 480 340 480 200 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'bpa-cap', number: 2, name: 'Peaked Captain Hat & Gold Wings', path: 'M 280 90 L 550 90 L 550 220 L 280 220 Z', targetColor: '#1e3a8a', defaultColor: '#ffffff' },
      { id: 'bpa-jacket', number: 3, name: 'Airline Captain Uniform Jacket', path: 'M 200 340 L 620 340 L 620 950 L 200 950 Z', targetColor: '#0f172a', defaultColor: '#ffffff' },
      { id: 'bpa-plane', number: 4, name: 'Commercial Jet Turbine & Wings', path: 'M 0 350 L 768 350 L 768 850 L 0 850 Z', targetColor: '#e2e8f0', defaultColor: '#ffffff' },
      { id: 'bpa-sky', number: 5, name: 'Airport Runway & Horizon', path: 'M 0 0 L 768 0 L 768 300 L 0 300 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'black-teacher-classroom',
    title: 'Mr. Washington Inspiring Teacher',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Warm and inspiring Black male teacher with spectacles and button-up shirt pointing to chalkboard in bright classroom.',
    culturalStory: 'Black educators shape minds, instill self-worth, and empower generations of scholars to dream without limits.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/black-teacher-classroom.jpg',
    regions: [
      { id: 'btc-skin', number: 1, name: 'Teacher Melanin Visage', path: 'M 350 180 C 350 330 480 330 480 180 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'btc-clothes', number: 2, name: 'Button-Up Shirt & Tailored Vest', path: 'M 240 330 L 580 330 L 580 920 L 240 920 Z', targetColor: '#059669', defaultColor: '#ffffff' },
      { id: 'btc-board', number: 3, name: 'Chalkboard World Map & Formulas', path: 'M 0 0 L 768 0 L 768 400 L 0 400 Z', targetColor: '#15803d', defaultColor: '#ffffff' },
      { id: 'btc-desks', number: 4, name: 'Classroom Wooden Desks & Books', path: 'M 0 750 L 768 750 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'clean-energy-engineer',
    title: 'Clean Energy & Wind Turbine Engineer',
    category: 'Engineers',
    difficulty: 'Detailed',
    description: 'Intelligent smiling Black female renewable energy engineer holding digital blueprint tablet before modern wind turbines and solar panel arrays.',
    culturalStory: 'Black engineers are pioneering the clean green revolution—designing sustainable microgrids, solar farms, and wind turbines to power our future.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/clean-energy-engineer.jpg',
    regions: [
      { id: 'cee-skin', number: 1, name: 'Engineer Melanin Complexion', path: 'M 350 280 C 350 430 480 430 480 280 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'cee-helmet', number: 2, name: 'Safety Hard Hat with Recycle Symbol', path: 'M 300 160 L 530 160 L 530 300 L 300 300 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'cee-vest', number: 3, name: 'High-Visibility Safety Vest', path: 'M 180 480 L 620 480 L 620 950 L 180 950 Z', targetColor: '#16a34a', defaultColor: '#ffffff' },
      { id: 'cee-turbines', number: 4, name: 'Towering Clean Wind Turbines', path: 'M 0 50 L 768 50 L 768 500 L 0 500 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' },
      { id: 'cee-solar', number: 5, name: 'Photovoltaic Solar Panel Array', path: 'M 0 500 L 768 500 L 768 800 L 0 800 Z', targetColor: '#1e3a8a', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'pediatric-surgeon',
    title: 'Dr. Charles Pediatric Surgeon',
    category: 'Healthcare',
    difficulty: 'Detailed',
    description: 'Esteemed smiling Black surgeon in medical scrubs and stethoscope standing in surgical operating suite with heart monitors.',
    culturalStory: 'Continuing the proud tradition of Dr. Daniel Hale Williams and Dr. Charles Drew, honoring Black surgical masters who save lives daily.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/pediatric-surgeon.jpg',
    regions: [
      { id: 'ps-skin', number: 1, name: 'Surgeon Melanin Complexion', path: 'M 370 190 C 370 340 500 340 500 190 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'ps-scrubs', number: 2, name: 'Hospital Surgical Scrubs & Cap', path: 'M 300 320 L 610 320 L 610 950 L 300 950 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'ps-light', number: 3, name: 'Surgical Overhead Dome Light', path: 'M 50 20 L 350 20 L 350 240 L 50 240 Z', targetColor: '#e2e8f0', defaultColor: '#ffffff' },
      { id: 'ps-monitors', number: 4, name: 'Vitals & ECG Heart Monitors', path: 'M 0 250 L 260 250 L 260 550 L 0 550 Z', targetColor: '#10b981', defaultColor: '#ffffff' },
      { id: 'ps-cart', number: 5, name: 'Sterile Surgical Tray & Instruments', path: 'M 580 600 L 768 600 L 768 1024 L 580 1024 Z', targetColor: '#94a3b8', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'nasa-mathematician',
    title: 'Katherine Johnson NASA Mathematician',
    category: 'Scientists',
    difficulty: 'Detailed',
    description: 'Brilliant NASA mathematician Katherine Johnson pointing to orbital flight trajectories on chalkboard with Saturn V rocket launch.',
    culturalStory: 'Katherine Johnson calculated the precise flight paths for America’s first human space missions and the Apollo 11 moon landing.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/nasa-mathematician.jpg',
    regions: [
      { id: 'nm-skin', number: 1, name: 'Katherine Melanin Visage', path: 'M 220 280 C 220 380 340 380 340 280 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'nm-suit', number: 2, name: 'Professional NASA Blazer & Skirt', path: 'M 180 400 L 450 400 L 450 950 L 180 950 Z', targetColor: '#be123c', defaultColor: '#ffffff' },
      { id: 'nm-board', number: 3, name: 'Orbital Trajectory Celestial Chalkboard', path: 'M 400 60 L 768 60 L 768 850 L 400 850 Z', targetColor: '#1e293b', defaultColor: '#ffffff' },
      { id: 'nm-rocket', number: 4, name: 'Saturn V Apollo Rocket Launch', path: 'M 0 60 L 300 60 L 300 500 L 0 500 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'ella-fitzgerald-jazz',
    title: 'Ella Fitzgerald First Lady of Song',
    category: 'Celebrity',
    difficulty: 'Detailed',
    description: 'Legendary jazz singer Ella Fitzgerald smiling radiantly into vintage ribbon microphone in evening gown with jazz club stage.',
    culturalStory: 'Winner of 14 Grammy Awards, Ella Fitzgerald blessed the world with the purity of her tone and peerless jazz scat improvisation.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/ella-fitzgerald-jazz.jpg',
    regions: [
      { id: 'ef-skin', number: 1, name: 'Ella Melanin Complexion', path: 'M 380 140 C 380 290 520 290 520 140 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'ef-gown', number: 2, name: 'Vintage 1940s Ballroom Evening Gown', path: 'M 280 320 L 680 320 L 750 980 L 180 980 Z', targetColor: '#7c3aed', defaultColor: '#ffffff' },
      { id: 'ef-mic', number: 3, name: 'Vintage Chrome Ribbon Microphone', path: 'M 540 240 L 650 240 L 650 980 L 540 980 Z', targetColor: '#e2e8f0', defaultColor: '#ffffff' },
      { id: 'ef-stage', number: 4, name: 'Harlem Jazz Club Stage & Bassist', path: 'M 0 0 L 768 0 L 768 450 L 0 450 Z', targetColor: '#d97706', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'girl-cardboard-rocket',
    title: 'Maya Space Explorer in Cardboard Rocket',
    category: 'Children',
    difficulty: 'Easy',
    description: 'Joyful little Black girl with twin afro puffs sitting inside decorated cardboard rocket ship holding toy astronaut.',
    culturalStory: 'Every child’s imagination is a launchpad. Nurturing curiosity, creativity, and boundless joy in young dreamers.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/girl-cardboard-rocket.jpg',
    regions: [
      { id: 'gcr-skin', number: 1, name: 'Maya Warm Melanin Skin', path: 'M 380 260 C 380 430 540 430 540 260 Z', targetColor: '#92400e', defaultColor: '#ffffff' },
      { id: 'gcr-puffs', number: 2, name: 'Twin Afro Puffs & Ribbon Bows', path: 'M 240 140 L 680 140 L 680 340 L 240 340 Z', targetColor: '#292524', defaultColor: '#ffffff' },
      { id: 'gcr-rocket', number: 3, name: 'Cardboard Box Space Rocket', path: 'M 100 80 L 700 80 L 750 900 L 50 900 Z', targetColor: '#ea580c', defaultColor: '#ffffff' },
      { id: 'gcr-rug', number: 4, name: 'Playroom Soft Sunburst Rug', path: 'M 0 820 L 768 820 L 768 1024 L 0 1024 Z', targetColor: '#facc15', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'teen-skateboarder',
    title: 'Marcus Skatepark Kickflip',
    category: 'Teenagers',
    difficulty: 'Detailed',
    description: 'Dynamic smiling Black teenage boy with stylish box braids and hoodie balancing on skateboard at community skatepark.',
    culturalStory: 'Celebrating youth athleticism, street culture, self-expression, and perseverance as youth conquer new skate challenges.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/teen-skateboarder.jpg',
    regions: [
      { id: 'ts-skin', number: 1, name: 'Marcus Melanin Complexion', path: 'M 400 120 C 400 240 500 240 500 120 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'ts-hoodie', number: 2, name: 'Casual Streetwear Skate Hoodie', path: 'M 250 180 L 650 180 L 650 490 L 250 490 Z', targetColor: '#dc2626', defaultColor: '#ffffff' },
      { id: 'ts-pants', number: 3, name: 'Skate Denim Jeans & Vans Sneakers', path: 'M 280 470 L 600 470 L 600 820 L 280 820 Z', targetColor: '#1e3a8a', defaultColor: '#ffffff' },
      { id: 'ts-board', number: 4, name: 'Graphic Skateboard Deck & Trucks', path: 'M 260 760 L 750 760 L 750 880 L 260 880 Z', targetColor: '#16a34a', defaultColor: '#ffffff' },
      { id: 'ts-park', number: 5, name: 'Smooth Concrete Halfpipe Ramps', path: 'M 0 400 L 768 400 L 768 1024 L 0 1024 Z', targetColor: '#64748b', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'urban-architect',
    title: 'Elena Modern Eco-Architect',
    category: 'Adults',
    difficulty: 'Detailed',
    description: 'Talented smiling Black female architect with braided bun drafting blueprints for sustainable community center.',
    culturalStory: 'Honoring Black architects who design welcoming public spaces, sustainable homes, and civic landmarks with vision and purpose.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/urban-architect.jpg',
    regions: [
      { id: 'ua-skin', number: 1, name: 'Architect Melanin Complexion', path: 'M 320 230 C 320 370 420 370 420 230 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'ua-bun', number: 2, name: 'High Braided Crown Bun', path: 'M 280 100 L 440 100 L 440 250 L 280 250 Z', targetColor: '#1c1917', defaultColor: '#ffffff' },
      { id: 'ua-blazer', number: 3, name: 'Tailored Professional Studio Blazer', path: 'M 140 330 L 450 330 L 450 920 L 140 920 Z', targetColor: '#4f46e5', defaultColor: '#ffffff' },
      { id: 'ua-table', number: 4, name: 'Drafting Table & Blueprint Schematics', path: 'M 0 540 L 768 540 L 768 1024 L 0 1024 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'ua-studio', number: 5, name: 'Modern Architecture Studio & Models', path: 'M 0 0 L 768 0 L 768 540 L 0 540 Z', targetColor: '#0284c7', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'mlk-speech',
    title: 'Dr. Martin Luther King Jr. I Have a Dream',
    category: 'Celebrity',
    difficulty: 'Detailed',
    description: 'Dr. Martin Luther King Jr. delivering his historic I Have a Dream speech behind microphones at the Lincoln Memorial with reflecting pool and crowd.',
    culturalStory: 'Delivered on August 28, 1963, Dr. King’s transcendent vision of justice, equality, and brotherhood continues to illuminate humanity’s highest aspirations.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/mlk-speech.jpg',
    regions: [
      { id: 'mlk-skin', number: 1, name: 'Dr. King Melanin Complexion', path: 'M 280 240 C 280 420 440 420 440 240 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'mlk-suit', number: 2, name: 'Civil Rights Movement Suit & Tie', path: 'M 100 400 L 580 400 L 580 950 L 100 950 Z', targetColor: '#1e293b', defaultColor: '#ffffff' },
      { id: 'mlk-podium', number: 3, name: 'Lincoln Memorial Wooden Podium', path: 'M 350 600 L 680 600 L 680 1024 L 350 1024 Z', targetColor: '#92400e', defaultColor: '#ffffff' },
      { id: 'mlk-mics', number: 4, name: 'Press & Broadcast Microphones', path: 'M 550 460 L 780 460 L 780 750 L 550 750 Z', targetColor: '#94a3b8', defaultColor: '#ffffff' },
      { id: 'mlk-monument', number: 5, name: 'Washington Monument & Reflecting Pool', path: 'M 450 100 L 768 100 L 768 450 L 450 450 Z', targetColor: '#38bdf8', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'harriet-tubman-lantern',
    title: 'Harriet Tubman Freedom Lantern',
    category: 'Celebrity',
    difficulty: 'Detailed',
    description: 'Courageous Underground Railroad conductor Harriet Tubman holding brass lantern high leading self-emancipated travelers under the North Star.',
    culturalStory: 'Known as Moses, Harriet Tubman made 13 perilous journeys to rescue over 70 enslaved people, never losing a passenger on the Underground Railroad.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/harriet-tubman-lantern.jpg',
    regions: [
      { id: 'ht-skin', number: 1, name: 'Harriet Melanin Visage', path: 'M 420 270 C 420 370 560 370 560 270 Z', targetColor: '#7c2d12', defaultColor: '#ffffff' },
      { id: 'ht-scarf', number: 2, name: 'Protective Headscarf & Shawl', path: 'M 400 240 L 600 240 L 600 420 L 400 420 Z', targetColor: '#b45309', defaultColor: '#ffffff' },
      { id: 'ht-coat', number: 3, name: 'Underground Railroad Wool Coat', path: 'M 360 380 L 680 380 L 700 850 L 360 850 Z', targetColor: '#166534', defaultColor: '#ffffff' },
      { id: 'ht-lantern', number: 4, name: 'Beacon Brass Freedom Lantern', path: 'M 210 250 L 340 250 L 340 460 L 210 460 Z', targetColor: '#f59e0b', defaultColor: '#ffffff' },
      { id: 'ht-forest', number: 5, name: 'Old Growth Forest & North Star', path: 'M 0 0 L 768 0 L 768 400 L 0 400 Z', targetColor: '#15803d', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'mae-jemison-shuttle',
    title: 'Dr. Mae Jemison aboard Space Shuttle',
    category: 'Scientists',
    difficulty: 'Detailed',
    description: 'Dr. Mae Jemison floating weightlessly in space shuttle cockpit holding science clipboard with Earth curvature through window.',
    culturalStory: 'Dr. Mae Jemison became the first African American woman in space in 1992 aboard Space Shuttle Endeavour, blazing trails in aerospace, medicine, and engineering.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/mae-jemison-shuttle.jpg',
    regions: [
      { id: 'mj-skin', number: 1, name: 'Astronaut Melanin Glow', path: 'M 620 200 C 620 320 740 320 740 200 Z', targetColor: '#854d0e', defaultColor: '#ffffff' },
      { id: 'mj-suit', number: 2, name: 'NASA Royal Blue Astronaut Jumpsuit', path: 'M 500 300 L 800 300 L 750 900 L 250 900 Z', targetColor: '#1d4ed8', defaultColor: '#ffffff' },
      { id: 'mj-earth', number: 3, name: 'Blue Marble Earth Orbit View', path: 'M 80 150 L 480 150 L 480 430 L 80 430 Z', targetColor: '#0284c7', defaultColor: '#ffffff' },
      { id: 'mj-cockpit', number: 4, name: 'Shuttle Flight Deck Avionics', path: 'M 0 0 L 768 0 L 768 300 L 0 300 Z', targetColor: '#475569', defaultColor: '#ffffff' }
    ]
  },
  {
    id: 'carver-laboratory',
    title: 'George Washington Carver Botanical Lab',
    category: 'Scientists',
    difficulty: 'Detailed',
    description: 'Agricultural pioneer George Washington Carver examining peanut plant under brass microscope in Tuskegee laboratory with botanical jars.',
    culturalStory: 'From Tuskegee Institute, Carver revolutionized sustainable agriculture, invented over 300 uses for peanuts, and empowered generations of farmers.',
    width: 768,
    height: 1024,
    svgPath: '',
    imageSrc: '/examples/carver-laboratory.jpg',
    regions: [
      { id: 'gwc-skin', number: 1, name: 'Carver Melanin Complexion', path: 'M 460 180 C 460 300 620 300 620 180 Z', targetColor: '#78350f', defaultColor: '#ffffff' },
      { id: 'gwc-apron', number: 2, name: 'Tuskegee Lab Apron & Tweed Suit', path: 'M 400 280 L 750 280 L 750 800 L 400 800 Z', targetColor: '#d97706', defaultColor: '#ffffff' },
      { id: 'gwc-peanut', number: 3, name: 'Potted Peanut Plant Specimen', path: 'M 600 280 L 820 280 L 820 580 L 600 580 Z', targetColor: '#16a34a', defaultColor: '#ffffff' },
      { id: 'gwc-microscope', number: 4, name: 'Vintage Brass Lab Microscope', path: 'M 280 400 L 440 400 L 440 600 L 280 600 Z', targetColor: '#ca8a04', defaultColor: '#ffffff' },
      { id: 'gwc-bottles', number: 5, name: 'Botanical Apothecary Glassware', path: 'M 0 0 L 768 0 L 768 350 L 0 350 Z', targetColor: '#0284c7', defaultColor: '#ffffff' }
    ]
  }
];
