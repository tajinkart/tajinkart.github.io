
window.SIX_PIPELINE_CATEGORIES = [
  { id: 'character', title: 'Character Design & Heroes', titleEN: 'Character Design & Heroes', color: '#facc15', pipeKey: 'sketch1' },
  { id: 'creature', title: 'Creatures, Titans & Monsters', titleEN: 'Creatures, Titans & Monsters', color: '#10b981', pipeKey: 'sketch_creature' },
  { id: 'environment', title: 'Environment, Worlds & Architecture', titleEN: 'Environment, Worlds & Architecture', color: '#38bdf8', pipeKey: 'sketch2' },
  { id: 'keyframe', title: 'Cinematic Keyframes & Covers', titleEN: 'Cinematic Keyframes & Covers', color: '#f43f5e', pipeKey: 'sketch3' },
  { id: 'props', title: 'Props, Weapons & Artifacts', titleEN: 'Props, Weapons & Artifacts', color: '#a855f7', pipeKey: 'sketch4' },
  { id: 'comic', title: 'Comics, Manga & Sequential Art', titleEN: 'Comics, Manga & Sequential Art', color: '#fb923c', pipeKey: 'sketch5' }
];
window.DEFAULT_GALLERY_CATEGORIES = window.SIX_PIPELINE_CATEGORIES;
window.galleryCategories = window.SIX_PIPELINE_CATEGORIES;

window.DEFAULT_STUDIO_GENRES = [
  'Dark Fantasy',
  'Cyberpunk',
  'Sci-Fi',
  'Mythic & Ancient',
  'Post-Apocalyptic',
  'Horror & Eldritch',
  'High Fantasy',
  'Steampunk',
  'Mecha & Industrial',
  'Anime & Stylized',
  'Historical & Military'
];
window.studioGenres = window.DEFAULT_STUDIO_GENRES;

window.PIPELINE_TO_CATEGORY_MAP = {
  'sketch1': 'character',
  'sketch_creature': 'creature',
  'sketch2': 'environment',
  'sketch3': 'keyframe',
  'sketch4': 'props',
  'sketch5': 'comic'
};


var DEFAULT_STUDIO_GENRES = [
  'Dark Fantasy',
  'Cyberpunk',
  'Sci-Fi',
  'Mythic & Ancient',
  'Post-Apocalyptic',
  'Horror & Eldritch',
  'High Fantasy',
  'Steampunk',
  'Mecha & Industrial',
  'Anime & Stylized',
  'Historical & Military'
];
/**
 * TAJINKART Master Spec v2.1 Data Store
 * Studio Director & Lead Worldbuilder: Seyed Soroush Taj
 */

// In-memory fallback storage if browser localStorage is blocked or restricted
window._tajinMemoryStorage = window._tajinMemoryStorage || {};

function safeGetStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return (window._tajinMemoryStorage && window._tajinMemoryStorage[key]) || null;
  }
}

function safeSetStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (!window._tajinMemoryStorage) window._tajinMemoryStorage = {};
    window._tajinMemoryStorage[key] = String(value);
    return false;
  }
}
window.safeGetStorage = safeGetStorage;
window.safeSetStorage = safeSetStorage;


const KEYS = {

  ORDERS: 'tajinkart_orders_fa_v2',
  SETTINGS: 'tajinkart_settings_fa_v2',
  ARTWORKS: 'tajinkart_artworks_fa_v2',
  PIPELINES: 'tajinkart_pipelines_fa_v2',
  PRODUCTS: 'tajinkart_products_fa_v2',
  MEMBERS: 'tajinkart_members_fa_v2',
  DELETED_ARTWORKS: 'tajinkart_deleted_artworks_v2'
};
window.KEYS = KEYS;

var currentView = 'showcase';
var currentMember = null;
var comicCurrentPage = 1;
var activeModalItem = {};
var currencyMode = 'USD'; // 'USD' or 'TOMAN'
var activeCaseStudyArt = null;
var activeCaseStudyPhaseIdx = 0;

var currentSelectedPipeKey = 'sketch1';
var currentSelectedStageIdx = 0;
var currentSelectedArtIdx = 0;
var currentSelectedProductIdx = 0;
var selectedMemberIdx = 0;
var currentMemberTierFilter = 'all';

var siteSettings = {
  usdRate: 72000,
  tgToken: '',
  tgChat: '',
  adminPass: 'tajinkart',
  commissionCapacity: '2 of 3 Atelier Slots Reserved'
};
try {
  const _s = safeGetStorage(KEYS.SETTINGS);
  if (_s) {
    const _p = JSON.parse(_s);
    if (_p && typeof _p === 'object') {
      siteSettings = Object.assign(siteSettings, _p);
    }
  }
} catch(e) {}
window.siteSettings = siteSettings;

// Showcase Gallery with multi-phase case study lightbox and atelier deep-linking
// Load artist artworks (filtered and cleaned from legacy mockups)
// Studio fallback concepts
const DEFAULT_STUDIO_ARTWORKS = [
  {
    id: 101,
    tag: 'character',
    category: 'character',
    shortSlug: 'Obsidian Vanguard',
    title: 'The Obsidian Vanguard • Knight Commander',
    desc: 'Heavy dark-fantasy armor exploration with modular Pauldrons, silhouetted thumbnail iterations, and master cinematic lighting render in ProPhoto RGB.',
    pipelineKey: 'sketch1',
    genre: 'Dark Fantasy',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'Extopia Universe • Order of the Black Sun',
    phases: [
      {
        name: 'Master Cinematic Cover & Presentation Sheet',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch1',
        subcategory: 'Hero / Main Concept (Full IP)',
        desc: '300DPI production master with multi-pass atmospheric rim light and material callouts.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  },
  {
    id: 102,
    tag: 'creature',
    category: 'creature',
    shortSlug: 'Abyssal Titan',
    title: 'Abyssal Leviathan • Apex Deep-Sea Titan',
    desc: 'Speculative bioluminescent physiology, predatory locomotion mechanics, jaw articulation diagrams, and human scale comparison sheet.',
    pipelineKey: 'sketch_creature',
    genre: 'Horror & Eldritch',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'Abyssal Trench Fauna • Extopia Marine Depths',
    phases: [
      {
        name: 'Apex Predator Scale & Morphology Master',
        img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch_creature',
        subcategory: 'Predatory Locomotion & Anatomy',
        desc: 'Tactile scale texture maps, predatory dorsal plates, and translucent bioluminescent sacs.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  },
  {
    id: 103,
    tag: 'environment',
    category: 'environment',
    shortSlug: 'Cyber Spire',
    title: 'Neo-Tirann Overpass • Cyber Spire Sector 9',
    desc: 'Volumetric depth haze, modular architectural kitbash set, multi-tier neon billboards, and panoramic establishing matte shot.',
    pipelineKey: 'sketch2',
    genre: 'Cyberpunk',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'Upper Megastructure • Neo-Tirann Metropolitan Grid',
    phases: [
      {
        name: 'Panoramic Establishing Matte Shot',
        img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch2',
        subcategory: 'Wide Panoramic Establishing Shot',
        desc: 'Atmospheric light-bleed render with layered fog passes and architectural callout assets.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  },
  {
    id: 104,
    tag: 'keyframe',
    category: 'keyframe',
    shortSlug: 'Sovereign Battle',
    title: 'Eclipse Sovereign • Narrative Climax Keyframe',
    desc: 'Climactic cinematic splash moment depicting the rupture of the celestial seal. Rendered with extreme dynamic range and focal blur.',
    pipelineKey: 'sketch3',
    genre: 'Dark Fantasy',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'The Fall of the Sunless Throne',
    phases: [
      {
        name: 'Narrative Climax & Battle Moment Sheet',
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch3',
        subcategory: 'Flagship Cinematic Splash Art',
        desc: 'Keyframe composition breakdown with focal hierarchy and cinematic color grading.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  },
  {
    id: 105,
    tag: 'props',
    category: 'props',
    shortSlug: 'Vorpal Greatsword',
    title: 'Runeforged Vorpal Blade • Relic Weapon Set',
    desc: 'Ancient ceremonial weapon forged from meteoric obsidian. Complete with engraved elder runes, crossguard breakdown, and game-ready orthographic views.',
    pipelineKey: 'sketch4',
    genre: 'Mythic & Ancient',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'Artifacts of the First Age',
    phases: [
      {
        name: 'Orthographic Asset & Material Sheet',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch4',
        subcategory: 'Hero Weapon / Centerpiece Relic',
        desc: 'Material specification callouts for bronze, etched steel, leather wraps, and crystal socketing.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  },
  {
    id: 106,
    tag: 'comic',
    category: 'comic',
    shortSlug: 'Extopia Chapter 1',
    title: 'Chronicles of Extopia • Manga Line-Art Episode',
    desc: 'High-contrast inked sequential manga pages with authentic Japanese screentone shading, dynamic speed lines, and sound effect typography.',
    pipelineKey: 'sketch5',
    genre: 'Anime & Stylized',
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=85',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    lore: 'Extopia Comic Chronicles • Vol. 1',
    phases: [
      {
        name: 'Storyboard & Inked Manga Master Sheet',
        img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=85',
        image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=85',
        pipelineKey: 'sketch5',
        subcategory: 'Japanese Screentoned Manga Page',
        desc: 'Clean 600DPI vector ink line-art with modular speech balloon placement guides.',
        socials: { telegram: true },
        socialCaptions: {}
      }
    ]
  }
];

var storedArtworks = [];
try {
  const rawArt = localStorage.getItem(KEYS.ARTWORKS);
  storedArtworks = rawArt ? JSON.parse(rawArt) : [];
  if (!Array.isArray(storedArtworks)) storedArtworks = [];
} catch(e) {
  storedArtworks = [];
}
var showcaseArtworks = storedArtworks.filter(a => a && typeof a === 'object' && Number(a.id) > 8);
if (showcaseArtworks.length === 0) {
  showcaseArtworks = JSON.parse(JSON.stringify(DEFAULT_STUDIO_ARTWORKS));
  try {
    localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  } catch(e) {}
}
window.showcaseArtworks = showcaseArtworks;

// Studio bespoke production pipelines
var PIPELINE_DATA = {
  sketch1: {
    id: 'sketch1',
    topSub: 'Character Design & Heroes',
    badgeSlug: '01 • CHARACTER PIPELINE',
    subcategories: ['Hero / Main Concept (Full IP)', 'Orthographic 3D Model Sheet', 'Age Timeline Progression', 'Party & Faction Bundle', 'Character Redesign & Evolution'],
    note: 'Commercial 300DPI print-ready standard with layered PSD master files, 5-thumbnail exploration, 360° turnaround model sheets, and hero weapon add-ons.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Full IP',
        title: 'Full Character Concept Creation (From Scratch)',
        desc: '10 initial thumbnail silhouettes ➔ 5 curated finalists ➔ form selection and costume detailing ➔ final 300DPI master render with layered PSD.',
        price: '95 - 150',
        usdVal: 95,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • 3D Turnaround',
        title: 'Orthographic 3-View Model Sheet (3D & Animation Ready)',
        desc: 'Precise 3-view turnaround (Front, Profile, Back) with material callout diagrams, costume anatomy, and joint mechanics for 3D sculptors.',
        price: '120 - 180',
        usdVal: 120,
        timeline: '5 to 7 business days',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • Redesign',
        title: 'Character Evolution & Next-Gen Redesign',
        desc: 'Modernizing, upgrading fidelity, and reimagining legacy characters into darker, grittier next-gen game and cinematic standards.',
        price: '85 - 130',
        usdVal: 85,
        timeline: '3 to 5 business days',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch_creature: {
    id: 'sketch_creature',
    topSub: 'Creatures, Titans & Monsters',
    badgeSlug: '02 • CREATURE PIPELINE',
    subcategories: ['Colossal Bosses & Titans', 'Ecosystem Predators & Wildlife', 'Mounts & Companions'],
    note: 'Speculative biology, skeletal articulation, locomotion diagrams for wings/claws, tactile chitin/scales, and complimentary human scale reference.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Speculative Biology',
        title: 'Creature Concept & Biology Design (From Scratch)',
        desc: 'Initial physiological thumbnails, skeletal articulation, human scale comparison, tactile skin/chitin texturing, and natural habitat rendering.',
        price: '100 - 160',
        usdVal: 100,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Locomotion Rig',
        title: 'Locomotion & Joint Anatomy Breakdown Sheet',
        desc: 'Technical diagrams detailing wing-folding mechanics, claw articulation, tail movement, and gait structure for 3D rigging and animators.',
        price: '125 - 170',
        usdVal: 125,
        timeline: '5 to 7 business days',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • Sub-Species',
        title: 'Mutated Sub-Species & Regional Variants',
        desc: 'Developing 3 distinct regional adaptations of a base creature (e.g., Toxic, Frost, and Alpha Leader variants) with custom palettes and textures.',
        price: '90 - 140',
        usdVal: 90,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch2: {
    id: 'sketch2',
    topSub: 'Environment, Worlds & Architecture',
    badgeSlug: '03 • ENVIRONMENT PIPELINE',
    subcategories: ['Cinematic Establishing Shot', 'Modular Level-Design Kit', 'Dungeons & Interior Architecture'],
    note: 'Dark-fantasy architecture, panoramic 16:9/21:9 framing, initial value thumbnails, depth haze layers, and volumetric lighting.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Establishing Shot',
        title: 'Cinematic World Establishing Shot (16:9 / 21:9)',
        desc: '3 compositional value thumbnails ➔ panoramic framing selection ➔ final grand vista matte render with distinct depth and atmospheric haze.',
        price: '105 - 170',
        usdVal: 105,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Modular Kit',
        title: 'Modular Architecture & Asset Kit (Level-Design Ready)',
        desc: 'Geometric architectural callouts, ancient pillars, obelisks, and modular structures designed for direct implementation in Unreal Engine/Unity.',
        price: '120 - 180',
        usdVal: 120,
        timeline: '5 to 7 business days',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • Atmospheric Painting',
        title: 'Atmospheric Cinematic Environment Painting',
        desc: 'Full environmental painting with light scattering, volumetric fog, day/night mood variations, and 300DPI layered master PSD.',
        price: '135 - 210',
        usdVal: 135,
        timeline: '6 to 8 business days',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch3: {
    id: 'sketch3',
    topSub: 'Cinematic Keyframes & Covers',
    badgeSlug: '04 • KEYFRAME PIPELINE',
    subcategories: ['Flagship Game Splash Art', 'Narrative Battle Keyframe', 'Commercial Book & Album Cover'],
    note: 'Central commercial artwork at 300DPI master print polish, bleed/spine bleed margins, and motion comic animation layer separation.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Hero Splash',
        title: 'Flagship Character & Game Splash Art (300DPI Master)',
        desc: 'High-polish promotional artwork with dramatic focal lighting designed for Steam store capsules, marketing posters, and retail covers.',
        price: '150 - 240',
        usdVal: 150,
        timeline: '6 to 9 business days',
        img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Story Keyframe',
        title: 'Narrative Story Moment & Battle Keyframe',
        desc: 'Illustrating pivotal story climaxes, heroic duels, and emotional narrative turning points with high kinetic motion and cinematic lenses.',
        price: '130 - 200',
        usdVal: 130,
        timeline: '5 to 8 business days',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • Commercial Cover',
        title: 'Commercial Book, Graphic Novel & Album Cover',
        desc: 'Custom cover design accounting for spine thickness, trim bleed zones, and harmonious negative space for title typography.',
        price: '120 - 180',
        usdVal: 120,
        timeline: '5 to 7 business days',
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  sketch4: {
    id: 'sketch4',
    topSub: 'Props, Weapons & Artifacts',
    badgeSlug: '05 • PROPS & WEAPONS',
    subcategories: ['Hero Weapons & Ancient Relics', 'Consumables & Loot Sets', 'Dark-Fantasy HUD Icons'],
    note: 'Weapons and mechanical props with alloy callouts, exploratory sketches, and transparent PNG cutouts ready for direct game engine import.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Hero Weapon',
        title: 'Hero Weapon & Ancient Relic Concept Design',
        desc: 'Exploratory silhouette thumbnails ➔ 3D dimensional orthographic sheet with alloy material callouts ➔ final render with VFX glow effects.',
        price: '75 - 120',
        usdVal: 75,
        timeline: '3 to 5 business days',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Loot Sets',
        title: 'Inventory Loot, Potions & Consumables Set',
        desc: 'Multi-item icon bundles of enchanted artifacts, alchemy vials, and survival gear delivered with alpha-channel transparent PNGs.',
        price: '65 - 110',
        usdVal: 65,
        timeline: '3 to 5 business days',
        img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • UI Kit',
        title: 'Dark-Fantasy HUD Frames & Skill Icon Kit',
        desc: 'Custom UI frames, guild insignias, and glowing magical skill icons crafted for dark-fantasy and gothic RPG game interfaces.',
        price: '60 - 100',
        usdVal: 60,
        timeline: '3 to 4 business days',
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  sketch5: {
    id: 'sketch5',
    topSub: 'Comics, Manga & Sequential Art',
    badgeSlug: '06 • SEQUENTIAL ART',
    subcategories: ['Cinematic Storyboard', 'Inked Manga Line-Art', 'Full Color Webtoon Pages'],
    note: 'Scene pacing, dynamic camera angles, speech bubble placement, authentic pen inking with screentones, and layered comic-motion files.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Storyboard',
        title: 'Cinematic Decoupage & Production Storyboard',
        desc: 'Visual scene pacing, dynamic camera framing, lens angles, and strategic speech bubble and SFX sound-effect composition.',
        price: '80 - 130',
        usdVal: 80,
        timeline: '3 to 5 business days',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Inked Manga',
        title: 'Authentic Inked Manga & Comic Line-Art Pages',
        desc: 'Traditional pressure-sensitive inking, cross-hatching, action speedlines, deep blacks, and halftone screentone texturing.',
        price: '95 - 150',
        usdVal: 95,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 3 • Color Webtoon',
        title: 'Full-Color Webtoon Pages (Motion-Comic Ready)',
        desc: 'Dramatic cinematic coloring with rim lighting and separated character/background layers optimized for vertical-scroll and motion comics.',
        price: '130 - 200',
        usdVal: 130,
        timeline: '5 to 8 business days',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80'
      }
    ]
  },
  sketch_mascot: {
    id: 'sketch_mascot',
    topSub: 'Brand Mascot & Studio Crest',
    badgeSlug: '07 • BRAND IDENTITY',
    subcategories: ['Commercial 2D/3D Mascot', 'Studio Crest & Logo-Mascot', 'Visual Brand Guide'],
    note: 'Custom mascot creation, gaming emblems, and studio crests with luxury cyber-gold aesthetics and visual identity guideline books.',
    tiles: [
      {
        span: 'col-span-4',
        badge: 'Package 1 • Brand Mascot',
        title: 'Commercial Brand Mascot & Game Character Design',
        desc: 'Custom mascot creation across multiple action poses, 3-view turnaround sheet, and vector/high-res production files ready for commercial use.',
        price: '100 - 160',
        usdVal: 100,
        timeline: '4 to 6 business days',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'
      },
      {
        span: 'col-span-4',
        badge: 'Package 2 • Studio Crest',
        title: 'Studio Crest, Emblem & Mascot Identity Guide',
        desc: 'Authoritative dark/gold crest design with comprehensive visual brand guidelines, color palettes, and material specifications.',
        price: '120 - 180',
        usdVal: 120,
        timeline: '5 to 7 business days',
        img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
};

// Digital Assets Vault - 7 Core Production Branches
var digitalStoreProducts = [];
let _initialProds = [
  {
    id: 1,
    title: 'Rook Knight 2D Game Sprite & Multi-Directional Animation Pack',
    price: 39,
    type: '2D Game Sprites & Characters',
    loreKey: 'Extopia Universe • Rook Squad Elite Cadre',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
    desc: 'Complete character sprite sheets with multi-directional animations (Idle, Run, Dagger Strike, Aerial Dive, Death) optimized for Unity and Godot with parallax background layers.'
  },
  {
    id: 2,
    title: 'Concept Art Master Brush Engine, Rust Textures & Monster Alphas (64 Set)',
    price: 19,
    type: 'Brush Engines & Textures',
    loreKey: 'Extopia Universe • Studio Matte Painting Techniques',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
    desc: 'Proprietary Photoshop (.ABR) and Procreate brush pack designed for rendering weathered metals, aged leather, reptilian scales, and monster hide with 4K seamless alphas.'
  },
  {
    id: 3,
    title: 'Dark Fantasy Prop Kit & HUD Icon Interface Library (120 Icons + Frames)',
    price: 34,
    type: 'Prop Kits, Icons & UI',
    loreKey: 'Genesis Universe • Ancient Runic Insignias',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    desc: 'Magic skill icons, alchemy vials, legendary relics, inventory equipment frames, and status gauges in transparent PNG format (256x256 and 512x512).'
  },
  {
    id: 4,
    title: 'Genesis Graphic Lore Prologue Chapter & Layered PSD Collector Edition',
    price: 29,
    type: 'Comics & Master PSDs',
    loreKey: 'Genesis Universe • Canon Lore Chapter',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
    desc: 'Complete 24-page prologue graphic novel chapter with full layered PSD source files (character lines, lighting, color flats, dialogue) and 4K digital wallpapers.'
  },
  {
    id: 5,
    title: 'Cinematic Dark Ambient Background Loops (8 Seamless 4K Loops)',
    price: 45,
    type: '4K Cinematic Loops',
    loreKey: 'Extopia Universe • Industrial Slums & Citadel Shrines',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    desc: 'Seamless 60FPS 4K video loops for video game title menus, live streaming backdrops, Steam dynamic wallpapers, and commercial cinematic title sequences.'
  },
  {
    id: 6,
    title: 'Abyssal Behemoth Resin 3D Print STL Model & ZBrush Sculpt Base-Mesh',
    price: 35,
    type: '3D Print & STL Models',
    loreKey: 'Extopia Universe • Deep Trench Apex Predators',
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=80',
    desc: 'High-poly STL sculpt for resin 3D printing with pre-supported hollowed variants + raw ZBrush (.ZTL / .OBJ) sculpt file for game artists and mini collectors.'
  },
  {
    id: 7,
    title: 'Volumetric Fog, Blood Splatter & Ember VFX Overlay Library (45 Assets)',
    price: 24,
    type: 'FX & Atmosphere Overlays',
    loreKey: 'Atelier Production Pipeline • Visual Effects Toolkit',
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80',
    desc: 'High-resolution transparent PNG & 4K ProRes video overlays including drifting embers, sulfurous acid mist, heavy rain, and weapon impact dust.'
  }
];

digitalStoreProducts = _initialProds;
try {
  const _sp = safeGetStorage(KEYS.PRODUCTS);
  if (_sp) {
    const _parsed = JSON.parse(_sp);
    if (Array.isArray(_parsed) && _parsed.length > 0) digitalStoreProducts = _parsed;
  }
} catch(e) {}
window.digitalStoreProducts = digitalStoreProducts;

var academyCourses = [
  {
    id: 1,
    title: 'Masterclass: Fantasy Character Design & Armor Rendering',
    price: 59,
    duration: '14 Hours HD Video + Layered PSD Master Files',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    desc: 'From thumbnail silhouette exploration to 3-view turnaround model sheets and advanced metal, leather, and fabric rendering according to studio pipeline.'
  },
  {
    id: 2,
    title: 'Cinematic Environment Concept Art & Worldbuilding',
    price: 65,
    duration: '12 Hours HD Video + Custom Atelier Brush Set',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    desc: 'Practical perspective, volumetric atmosphere, value structures, and focal point orchestration for wide cinematic establishing shots.'
  },
  {
    id: 3,
    title: 'Freelance Concept Artist Career Roadmap & Global Contracts',
    price: 49,
    duration: '8 Hours Video + Legal Contract Templates',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    desc: 'Industry standard portfolio curation, international client communications, milestone pricing models, and IP agreements.'
  }
];

var ordersList = [];
try {
  const _storedOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS));
  if (Array.isArray(_storedOrders)) {
    ordersList = _storedOrders.filter(o => o && o.id !== 501 && o.client !== 'Studio Nova' && !String(o.client).includes('Nova'));
  }
} catch(e) {
  ordersList = [];
}
try {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
} catch(e) {}

var comicPages = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
];

var siteMembersData = [];
let _defaultMembers = [
  {
    id: 101,
    name: 'Seyed Soroush Taj',
    email: 'soroush@tajinkart.com',
    contact: '09120000000',
    tier: 'VIP',
    balance: ',450',
    withdrawn: ',200',
    assetsBought: [
      'Genesis Graphic Lore Chapters 1-3 + Master PSD',
      '64-Piece Rust Texture & Alpha Brush Engine',
      'Raven Knight 2D Game Sprite Animation Pack'
    ],
    totalSpent: '20'
  },
  {
    id: 102,
    name: 'Paya Games Studio',
    email: 'director@payagames.ir',
    contact: '09350000000',
    tier: 'PRO',
    balance: '50',
    withdrawn: '50',
    assetsBought: [
      'Raven Knight 2D Game Sprite Animation Pack',
      '4K Cinematic Game Menu Video Loops'
    ],
    totalSpent: '90'
  },
  {
    id: 103,
    name: 'Arya Kian',
    email: 'aria@gmail.com',
    contact: '09190000000',
    tier: 'STANDARD',
    balance: '/usr/bin/bash',
    withdrawn: '/usr/bin/bash',
    assetsBought: ['64-Piece Master Brush Engine & Monster Alphas'],
    totalSpent: '9'
  }
];
