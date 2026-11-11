// ==============================================================================
// TAJINKART STUDIO — GALLERY & SHOWCASE MODULE (gallery.js)
// Showcase Grid, Categories & Genres Filters, Case Study Lightbox, Zoom
// ==============================================================================

var DEFAULT_STUDIO_GENRES = window.DEFAULT_STUDIO_GENRES || [
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

var studioGenres = window.studioGenres || [];
try {
  studioGenres = JSON.parse(localStorage.getItem('tajinkart_studio_genres_v1')) || DEFAULT_STUDIO_GENRES;
  if (!Array.isArray(studioGenres) || studioGenres.length === 0) studioGenres = DEFAULT_STUDIO_GENRES;
} catch(e) {
  studioGenres = DEFAULT_STUDIO_GENRES;
}
window.studioGenres = studioGenres;

var SIX_PIPELINE_CATEGORIES = window.SIX_PIPELINE_CATEGORIES || [
  { id: 'character', title: 'Character Design & Heroes', titleEN: 'Character Design & Heroes', color: '#facc15', pipeKey: 'sketch1' },
  { id: 'creature', title: 'Creatures, Titans & Monsters', titleEN: 'Creatures, Titans & Monsters', color: '#10b981', pipeKey: 'sketch_creature' },
  { id: 'environment', title: 'Environment, Worlds & Architecture', titleEN: 'Environment, Worlds & Architecture', color: '#38bdf8', pipeKey: 'sketch2' },
  { id: 'keyframe', title: 'Cinematic Keyframes & Covers', titleEN: 'Cinematic Keyframes & Covers', color: '#f43f5e', pipeKey: 'sketch3' },
  { id: 'props', title: 'Props, Weapons & Artifacts', titleEN: 'Props, Weapons & Artifacts', color: '#a855f7', pipeKey: 'sketch4' },
  { id: 'comic', title: 'Comics, Manga & Sequential Art', titleEN: 'Comics, Manga & Sequential Art', color: '#fb923c', pipeKey: 'sketch5' }
];

var galleryCategories = window.galleryCategories || SIX_PIPELINE_CATEGORIES;
try {
  localStorage.setItem('tajinkart_gallery_categories_v1', JSON.stringify(SIX_PIPELINE_CATEGORIES));
} catch(e) {}
window.galleryCategories = SIX_PIPELINE_CATEGORIES;
window.DEFAULT_GALLERY_CATEGORIES = SIX_PIPELINE_CATEGORIES;

var PIPELINE_TO_CATEGORY_MAP = window.PIPELINE_TO_CATEGORY_MAP || {
  'sketch1': 'character',
  'sketch_creature': 'creature',
  'sketch2': 'environment',
  'sketch3': 'keyframe',
  'sketch4': 'props',
  'sketch5': 'comic'
};
window.PIPELINE_TO_CATEGORY_MAP = PIPELINE_TO_CATEGORY_MAP;

let currentGalleryFilter = 'all';
let currentGalleryGenreFilter = 'all';
let currentGallerySearchQuery = '';

window.renderFloatingGenreDropdown = function() {
  const dropdown = document.getElementById('genreFilterDropdown');
  if (!dropdown) return;

  const isAll = (currentGalleryGenreFilter === 'all');
  let html = `
    <div class="cat-dropdown-item ${isAll ? 'active' : ''}" onclick="filterGalleryByGenre('all')">
      <span class="cat-item-dot" style="background:var(--cyan-electric); box-shadow:0 0 8px var(--cyan-electric);"></span>
      <span class="cat-item-text">All Genres</span>
    </div>
  `;

  const genres = (typeof studioGenres !== 'undefined' && Array.isArray(studioGenres) && studioGenres.length > 0) ? studioGenres : DEFAULT_STUDIO_GENRES;
  genres.forEach(g => {
    const isActive = (currentGalleryGenreFilter === g);
    html += `
      <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByGenre('${g}')">
        <span class="cat-item-dot" style="background:var(--cyan-electric); box-shadow:0 0 8px var(--cyan-electric);"></span>
        <span class="cat-item-text">${g}</span>
      </div>
    `;
  });

  dropdown.innerHTML = html;
};

window.toggleGenreFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('genreFilterDropdown');
  if (!dropdown) return;

  const catDropdown = document.getElementById('categoryFilterDropdown');
  if (catDropdown) catDropdown.classList.add('hidden');

  window.renderFloatingGenreDropdown();

  dropdown.classList.toggle('hidden');
};

window.filterGalleryByGenre = function(genreName) {
  currentGalleryGenreFilter = genreName;
  const labelEl = document.getElementById('currentGenrePillLabel');
  if (labelEl) {
    labelEl.textContent = (genreName === 'all') ? 'All Genres' : genreName;
  }

  const pillBtn = document.getElementById('currentGenrePillBtn');
  if (pillBtn) {
    const isFiltered = (genreName !== 'all');
    pillBtn.style.setProperty('--pill-accent-color', isFiltered ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.2)', 'important');
    pillBtn.style.setProperty('border-color', isFiltered ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.25)', 'important');
    pillBtn.style.setProperty('box-shadow', isFiltered ? '0 0 16px rgba(0,240,255,0.5)' : 'none', 'important');
  }

  const dropdown = document.getElementById('genreFilterDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
  const gEl = document.getElementById('showcaseGrid');
  if (gEl && window.scrollY > 200) { window.scrollTo({ top: gEl.offsetTop - 85, behavior: 'smooth' }); }
};

window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'All Artworks')">
      <span class="cat-item-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
      <span class="cat-item-text">All Artworks</span>
    </div>
  `;

  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    galleryCategories.forEach(cat => {
      const isActive = currentGalleryFilter === cat.id;
      const color = cat.color || '#38bdf8';
      const title = cat.titleEN || cat.title || cat.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

window.toggleCategoryFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  const genreDropdown = document.getElementById('genreFilterDropdown');
  if (genreDropdown) genreDropdown.classList.add('hidden');

  window.renderFloatingCategoryDropdown();

  dropdown.classList.toggle('hidden');
};

window.filterGalleryByCategory = function(categoryKey, categoryName) {
  currentGalleryFilter = categoryKey;
  const labelEl = document.getElementById('currentCategoryPillLabel');
  if (labelEl) labelEl.textContent = categoryName;

  const pillBtn = document.getElementById('currentCategoryPillBtn');
  if (pillBtn) {
    if (categoryKey !== 'all') {
      let color = '#facc15';
      const cat = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) 
        ? galleryCategories.find(c => c.id === categoryKey) : null;
      if (cat && cat.color) {
        color = cat.color;
      } else {
        const categoryColorMap = {
          'character': '#facc15',
          'environment': '#38bdf8',
          'creature': '#10b981',
          'keyframe': '#f43f5e',
          'props': '#a855f7',
          'comic': '#fb923c',
          'mascot': '#ec4899'
        };
        color = categoryColorMap[categoryKey] || '#38bdf8';
      }
      const glow = color.startsWith('#') ? `${color}88` : color;
      pillBtn.style.setProperty('--pill-accent-color', color, 'important');
      pillBtn.style.setProperty('--pill-glow-color', glow, 'important');
      pillBtn.style.setProperty('border-color', color, 'important');
      pillBtn.style.setProperty('box-shadow', `0 0 18px ${glow}, inset 0 0 8px ${glow}`, 'important');
      if (labelEl) labelEl.style.setProperty('color', color, 'important');
    } else {
      // حالت خنثی، آرام و شیشه‌ای اولیه دقیقاً مانند All Genres
      pillBtn.style.setProperty('--pill-accent-color', 'rgba(255,255,255,0.2)', 'important');
      pillBtn.style.setProperty('--pill-glow-color', 'transparent', 'important');
      pillBtn.style.setProperty('border-color', 'rgba(255,255,255,0.25)', 'important');
      pillBtn.style.setProperty('box-shadow', 'none', 'important');
      if (labelEl) labelEl.style.setProperty('color', '#fff', 'important');
    }
  }

  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
  const gEl = document.getElementById('showcaseGrid');
  if (gEl && window.scrollY > 200) { window.scrollTo({ top: gEl.offsetTop - 85, behavior: 'smooth' }); }
};

window.resetGalleryFilters = function() {
  currentGalleryFilter = 'all';
  currentGalleryGenreFilter = 'all';
  const labelCat = document.getElementById('currentCategoryPillLabel');
  if (labelCat) labelCat.textContent = 'All Artworks';
  const labelGenre = document.getElementById('currentGenrePillLabel');
  if (labelGenre) labelGenre.textContent = 'All Genres';
  renderShowcaseGrid();
};

document.addEventListener('click', (e) => {
  const genreMenu = document.getElementById('floatingGalleryGenreMenu');
  if (genreMenu && !genreMenu.contains(e.target)) {
    const dropdown = document.getElementById('genreFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
  const catMenu = document.getElementById('floatingGalleryCategoryMenu');
  if (catMenu && !catMenu.contains(e.target)) {
    const dropdown = document.getElementById('categoryFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
});

// Auto initialize on script evaluation
setTimeout(() => {
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
}, 60);


// =========================================================
// موتور تشخیص خودکار ابعاد و فرمول کادر گالری
// بدون نیاز به انتخاب دستی کاربر — تشخیص ۱۰۰٪ خودکار
// =========================================================
const artDimensionCache = {};

function detectAndApplyArtworkDimensions(art, onDetected) {
  if (!art || !art.image) return;
  if (artDimensionCache[art.image]) {
    const cached = artDimensionCache[art.image];
    art.width = cached.width;
    art.height = cached.height;
    art.aspectRatio = cached.ratio;
    if (onDetected) onDetected(cached);
    return;
  }
  const img = new Image();
  img.onload = function() {
    const w = this.naturalWidth;
    const h = this.naturalHeight;
    const r = parseFloat((w / h).toFixed(2));
    art.width = w;
    art.height = h;
    art.aspectRatio = r;
    artDimensionCache[art.image] = { width: w, height: h, ratio: r };
    if (onDetected) onDetected({ width: w, height: h, ratio: r });
  };
  img.src = art.image;
}

// فرمول هوشمند تقسیم ستون‌های ۱۲گانه بر اساس نسبت واقعی عرض به ارتفاع
function getAutoSpanClass(art) {
  let r = art.aspectRatio;
  if (!r && art.width && art.height) r = art.width / art.height;
  if (!r && artDimensionCache[art.image]) r = artDimensionCache[art.image].ratio;

  // پیش‌فرض هوشمند موقت قبل از اتمام لود
  if (!r) {
    if (art.tag === 'character' || art.tag === 'comic') r = 0.65;
    else if (art.tag === 'environment') r = 1.77;
    else if (art.tag === 'props') r = 1.0;
    else r = 1.5;
  }

  if (r >= 1.6) return 'span-col-wide';       // Wide (5 columns)
  if (r >= 1.2) return 'span-col-medium';     // Medium (4 columns)
  if (r >= 0.85) return 'span-col-square';    // Square (3 columns)
  return 'span-col-portrait';                 // Portrait (2 columns)
}

// رندر گالری با فرمول خودکار کادربندی و نمایش کامل اثر بدون کراپ
window.renderShowcaseGrid = function() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;

  const allArts = (window.showcaseArtworks && Array.isArray(window.showcaseArtworks) && window.showcaseArtworks.length > 0) ? window.showcaseArtworks : (showcaseArtworks || []);
  
  const pipeMap = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? PIPELINE_TO_CATEGORY_MAP : {
    'sketch1': 'character',
    'sketch_creature': 'creature',
    'sketch2': 'environment',
    'sketch3': 'keyframe',
    'sketch4': 'props',
    'sketch5': 'comic'
  };

  const CATEGORY_COLORS = {
    'character': '#facc15',
    'creature': '#10b981',
    'environment': '#38bdf8',
    'keyframe': '#f43f5e',
    'props': '#a855f7',
    'comic': '#fb923c',
    'mascot': '#ec4899'
  };

  const CATEGORY_LABELS = {
    'character': 'Character',
    'creature': 'Creature',
    'environment': 'Environment',
    'keyframe': 'Keyframe',
    'props': 'Props',
    'comic': 'Comic',
    'mascot': 'Mascot'
  };

  const filteredArtworks = allArts.filter(art => {
    // 1. Category Filter (بررسی تطابق ریشه اثر و تمام شیت‌های فرعی ۱، ۲، ۳ و ...)
    if (currentGalleryFilter && currentGalleryFilter !== 'all') {
      const targetCat = currentGalleryFilter.toLowerCase();
      const artPipe = (art.pipelineKey || '').toLowerCase();
      const artCat = (art.category || art.tag || (artPipe ? (pipeMap[artPipe] || '') : '')).toLowerCase();

      let catMatch = (artCat === targetCat || artPipe === targetCat || (pipeMap[artPipe] && pipeMap[artPipe].toLowerCase() === targetCat));

      if (!catMatch && art.phases && Array.isArray(art.phases)) {
        catMatch = art.phases.some(p => {
          const pPipe = (p.pipelineKey || '').toLowerCase();
          const pCat = (p.category || (pPipe ? (pipeMap[pPipe] || '') : '')).toLowerCase();
          const pSub = (p.subcategory || '').toLowerCase();
          const pName = (p.name || '').toLowerCase();

          if (pCat === targetCat || pPipe === targetCat) return true;
          if (targetCat === 'creature' && (pCat.includes('creature') || pPipe.includes('creature') || pSub.includes('creature') || pSub.includes('monster') || pSub.includes('titan') || pSub.includes('boss') || pSub.includes('موجود') || pName.includes('creature') || pName.includes('titan') || pName.includes('monster'))) return true;
          if (targetCat === 'environment' && (pCat.includes('env') || pPipe.includes('sketch2') || pSub.includes('env') || pSub.includes('world') || pSub.includes('arch') || pSub.includes('محیط') || pName.includes('env') || pName.includes('world'))) return true;
          if (targetCat === 'character' && (pCat.includes('char') || pPipe.includes('sketch1') || pSub.includes('char') || pSub.includes('hero') || pSub.includes('mascot') || pSub.includes('کاراکتر') || pName.includes('character') || pName.includes('hero'))) return true;
          if (targetCat === 'keyframe' && (pCat.includes('keyframe') || pPipe.includes('sketch3') || pSub.includes('keyframe') || pSub.includes('cover') || pSub.includes('splash') || pSub.includes('کی‌فریم'))) return true;
          if (targetCat === 'props' && (pCat.includes('prop') || pPipe.includes('sketch4') || pSub.includes('prop') || pSub.includes('weapon') || pSub.includes('relic') || pSub.includes('ui') || pSub.includes('پراپ'))) return true;
          if (targetCat === 'comic' && (pCat.includes('comic') || pPipe.includes('sketch5') || pSub.includes('comic') || pSub.includes('manga') || pSub.includes('storyboard') || pSub.includes('کمیک'))) return true;
          return false;
        });
      }
      if (!catMatch) return false;
    }

    // 2. Genre Filter
    if (currentGalleryGenreFilter && currentGalleryGenreFilter !== 'all') {
      const gTarget = currentGalleryGenreFilter.toLowerCase();
      const artG = (art.genre || '').toLowerCase();
      const artT = (art.title || '').toLowerCase();
      const artD = (art.desc || '').toLowerCase();
      const artTag = (art.tag || '').toLowerCase();

      let subMatch = false;
      if (art.subgenres && Array.isArray(art.subgenres)) {
        subMatch = art.subgenres.some(sg => String(sg).toLowerCase() === gTarget || String(sg).toLowerCase().includes(gTarget));
      }
      let genreMatch = (artG === gTarget || artG.includes(gTarget) || artT.includes(gTarget) || artD.includes(gTarget) || subMatch);

      if (!genreMatch && art.phases && Array.isArray(art.phases)) {
        genreMatch = art.phases.some(p => {
          const pg = (p.genre || '').toLowerCase();
          const pd = (p.desc || '').toLowerCase();
          const pn = (p.name || '').toLowerCase();
          return pg === gTarget || pg.includes(gTarget) || pd.includes(gTarget) || pn.includes(gTarget);
        });
      }

      if (!genreMatch) {
        if (gTarget.includes('dark fantasy') || gTarget.includes('fantasy')) {
          if (artTag === 'character' || artTag === 'creature' || artT.includes('knight') || artT.includes('warrior') || artD.includes('fantasy')) genreMatch = true;
        } else if (gTarget.includes('cyberpunk') || gTarget.includes('sci-fi')) {
          if (artT.includes('cyber') || artT.includes('mech') || artD.includes('cyber') || artD.includes('future') || artTag === 'keyframe') genreMatch = true;
        } else if (gTarget.includes('mythic')) {
          if (artTag === 'creature' || artD.includes('myth') || artT.includes('ancient')) genreMatch = true;
        } else if (gTarget.includes('post-apocalyptic')) {
          if (artTag === 'environment' || artD.includes('ruin') || artD.includes('wasteland')) genreMatch = true;
        }
      }

      if (!genreMatch) return false;
    }

    // 3. Search Query Filter
    if (currentGallerySearchQuery) {
      const q = currentGallerySearchQuery;
      const titleMatch = (art.title || '').toLowerCase().includes(q);
      const slugMatch = (art.shortSlug || '').toLowerCase().includes(q);
      const descMatch = (art.desc || '').toLowerCase().includes(q);
      const tagMatch = (art.tag || '').toLowerCase().includes(q);
      const catMatch = (art.category || '').toLowerCase().includes(q);
      const genreMatch = (art.genre || '').toLowerCase().includes(q);
      let phaseMatch = false;
      if (art.phases && Array.isArray(art.phases)) {
        phaseMatch = art.phases.some(p => 
          (p.name || '').toLowerCase().includes(q) ||
          (p.subcategory || '').toLowerCase().includes(q) ||
          (p.desc || '').toLowerCase().includes(q) ||
          (p.genre || '').toLowerCase().includes(q)
        );
      }
      if (!titleMatch && !slugMatch && !descMatch && !tagMatch && !catMatch && !genreMatch && !phaseMatch) {
        return false;
      }
    }

    return true;
  });

  if (filteredArtworks.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); width: 100%;">
        <p style="font-size: 15px; margin-bottom: 12px; color: #fff;">No artworks found matching your filter / search.</p>
        <button onclick="resetGalleryFilters()" class="btn-gold" style="font-size: 12px; padding: 7px 16px;">Display All Artworks</button>
      </div>
    `;
    return;
  }

  // چیدمان گالری نسبت به تعداد کارهای شاخه انتخابی
  const workCount = filteredArtworks.length;
  if (window.innerWidth > 768) {
    if (workCount === 1) {
      grid.style.setProperty('column-count', '1', 'important');
      grid.style.setProperty('max-width', '720px', 'important');
    } else if (workCount === 2) {
      grid.style.setProperty('column-count', '2', 'important');
      grid.style.setProperty('max-width', '980px', 'important');
    } else if (workCount === 3) {
      grid.style.setProperty('column-count', '3', 'important');
      grid.style.setProperty('max-width', '1240px', 'important');
    } else {
      grid.style.setProperty('column-count', '4', 'important');
      grid.style.setProperty('max-width', '1480px', 'important');
    }
  } else {
    grid.style.setProperty('column-count', workCount === 1 ? '1' : '2', 'important');
  }

  function hexToRgbaStr(hex, alpha) {
    if (!hex) return `rgba(250, 204, 21, ${alpha})`;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 250;
    const g = parseInt(hex.substring(2, 4), 16) || 204;
    const b = parseInt(hex.substring(4, 6), 16) || 21;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  grid.innerHTML = filteredArtworks.map((art) => {
    const spanClass = getAutoSpanClass(art);
    const richAlt = `${art.title} — Concept Art & Worldbuilding by TAJINKART Studio`;
    const defaultImg = art.image || art.img || '';

    let slug = art.shortSlug || '';
    if (!slug || slug === art.title) {
      slug = art.tag ? art.tag.toUpperCase() : 'CONCEPT';
    }

    let tileImg = defaultImg;
    let targetPhaseIdx = 0;
    let displayTitle = art.title || "Untitled Concept";
    let displaySlug = slug;
    
    // شناسایی دسته اصلی اثر
    let artRootCat = art.category || art.tag || (art.pipelineKey ? (pipeMap[art.pipelineKey] || 'character') : 'character');
    let activeKey = artRootCat;

    // تایل داینامیک انحصاری: اگر دسته‌ای فیلتر شده، شیت منطبق (اول، دوم، سوم و ...) انتخاب می‌شود
    if (currentGalleryFilter && currentGalleryFilter !== 'all' && art.phases && Array.isArray(art.phases)) {
      const targetCat = currentGalleryFilter.toLowerCase();
      const matchIdx = art.phases.findIndex((p) => {
        const pPipe = (p.pipelineKey || '').toLowerCase();
        const pCat = (p.category || (pPipe ? (pipeMap[pPipe] || '') : '')).toLowerCase();
        const pSub = (p.subcategory || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();

        if (pCat === targetCat || pPipe === targetCat) return true;
        if (targetCat === 'creature' && (pCat.includes('creature') || pPipe.includes('creature') || pSub.includes('creature') || pSub.includes('monster') || pSub.includes('titan') || pSub.includes('boss') || pSub.includes('موجود') || pName.includes('creature') || pName.includes('titan') || pName.includes('monster'))) return true;
        if (targetCat === 'environment' && (pCat.includes('env') || pPipe.includes('sketch2') || pSub.includes('env') || pSub.includes('world') || pSub.includes('arch') || pSub.includes('محیط') || pName.includes('env') || pName.includes('world'))) return true;
        if (targetCat === 'character' && (pCat.includes('char') || pPipe.includes('sketch1') || pSub.includes('char') || pSub.includes('hero') || pSub.includes('mascot') || pSub.includes('کاراکتر') || pName.includes('character') || pName.includes('hero'))) return true;
        if (targetCat === 'keyframe' && (pCat.includes('keyframe') || pPipe.includes('sketch3') || pSub.includes('keyframe') || pSub.includes('cover') || pSub.includes('splash') || pSub.includes('کی‌فریم'))) return true;
        if (targetCat === 'props' && (pCat.includes('prop') || pPipe.includes('sketch4') || pSub.includes('prop') || pSub.includes('weapon') || pSub.includes('relic') || pSub.includes('ui') || pSub.includes('پراپ'))) return true;
        if (targetCat === 'comic' && (pCat.includes('comic') || pPipe.includes('sketch5') || pSub.includes('comic') || pSub.includes('manga') || pSub.includes('storyboard') || pSub.includes('کمیک'))) return true;
        return false;
      });

      if (matchIdx !== -1) {
        const matchedPhase = art.phases[matchIdx];
        if (matchedPhase.img || matchedPhase.image) {
          tileImg = matchedPhase.img || matchedPhase.image;
          targetPhaseIdx = matchIdx + 1;
          displayTitle = matchedPhase.name || art.title;
          displaySlug = matchedPhase.subcategory || (CATEGORY_LABELS[targetCat] ? `${CATEGORY_LABELS[targetCat]} Concept` : slug);
          activeKey = targetCat;
        }
      }
    }

    // استخراج دقیق رنگ نئون دسته‌بندی انتخاب‌شده / اصلی
    let catHex = CATEGORY_COLORS[activeKey] || CATEGORY_COLORS[pipeMap[activeKey]] || '#facc15';
    if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
      const found = galleryCategories.find(c => c.id === activeKey || c.id === (pipeMap[activeKey] || '') || c.pipeKey === activeKey);
      if (found && found.color) catHex = found.color;
    }

    const neon = {
      border: catHex,
      glow: hexToRgbaStr(catHex, 0.85),
      soft: hexToRgbaStr(catHex, 0.3)
    };

    const catBadgeName = CATEGORY_LABELS[activeKey] || activeKey.toUpperCase();

    let subLabel = '';
    if (art.phases && Array.isArray(art.phases) && art.phases.length > 1) {
      subLabel = `Production Case Study • ${art.phases.length} Sheets`;
    } else {
      subLabel = `${catBadgeName} Concept`;
    }

    // زیرعنوان شیک در هاور: نمایش ژانر اثر و در صورت وجود ساب‌ژانر یا شیت‌های متعدد
    let hoverGenreLabel = art.genre || 'Dark Fantasy';
    if (art.subgenres && Array.isArray(art.subgenres) && art.subgenres.length > 0) {
      hoverGenreLabel += ' • ' + art.subgenres.slice(0, 2).join(' / ');
    }
    if (art.phases && Array.isArray(art.phases) && art.phases.length > 1) {
      hoverGenreLabel += ` (${art.phases.length} Sheets)`;
    }

    return `
      <div class="mosaic-tile ${spanClass}" id="galleryTile_${art.id}" 
           style="--neon-border:${neon.border}; --neon-glow:${neon.glow}; --neon-soft:${neon.soft}; border-color:${neon.border} !important;" 
           onclick="openArtModalWithPhase(${art.id}, ${targetPhaseIdx})">
        
        <div class="tile-center-title">
          <span class="tile-slug" style="color:${neon.border}; text-shadow:0 0 16px ${neon.glow}; font-size:13.5px; font-weight:900;"># ${displayTitle} #</span>
          <span class="tile-divider" style="background:${neon.border}; box-shadow:0 0 14px ${neon.glow}; width:38px;"></span>
          <span class="tile-sub font-mono" style="font-size:11.5px; font-weight:700; opacity:0.95; color:#f1f5f9; letter-spacing:0.04em;">${hoverGenreLabel}</span>
        </div>
        <img src="${tileImg}" loading="lazy" alt="${richAlt}" onload="handleImageAutoDetect(this, ${art.id}); this.parentElement.classList.add('loaded');" />
      </div>
    `;
  }).join('');
};

window.handleImageAutoDetect = function(imgEl, artId) {
  if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  const r = parseFloat((w / h).toFixed(2));
  artDimensionCache[imgEl.src] = { width: w, height: h, ratio: r };
  const art = showcaseArtworks.find(a => a.id == artId);
  if (art && (!art.aspectRatio || Math.abs(art.aspectRatio - r) > 0.08)) {
    art.width = w;
    art.height = h;
    art.aspectRatio = r;
    const tile = document.getElementById(`galleryTile_${art.id}`);
    if (tile) {
      tile.className = `mosaic-tile ${getAutoSpanClass(art)}`;
    }
  }
};
// لایت‌باکس مطالعه موردی چندمرحله‌ای (Case-Study Interactive Engine)
let currentCaseStudyIdx = 0;


window.closeAllFloatingDrawersAndMenus = function() {
  const catMenu = document.getElementById('floatingCategoryDropdown');
  if (catMenu) catMenu.classList.remove('active');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileDrawer) mobileDrawer.classList.remove('active');
  const searchBar = document.getElementById('gallerySearchBar');
  if (searchBar) searchBar.classList.remove('active');
  const phaseDrawer = document.getElementById('phaseScopeDrawerOverlay');
  if (phaseDrawer) phaseDrawer.classList.remove('active');
};

window.openArtModalWithPhase = function(id, targetPhaseIdx = 0) {
  closeAllFloatingDrawersAndMenus();
  let idx = showcaseArtworks.findIndex(a => String(a.id) === String(id) || a.id == id);
  if (idx === -1 && typeof id === 'number') idx = id;
  if (idx < 0 || idx >= showcaseArtworks.length) idx = 0;

  openArtModalByIndex(idx);

  if (targetPhaseIdx > 0) {
    setTimeout(() => {
      const modal = document.getElementById('artDetailModal');
      const items = document.querySelectorAll('.project-stream-item');
      if (items && items[targetPhaseIdx] && modal) {
        const itemTop = items[targetPhaseIdx].offsetTop - 20;
        modal.scrollTo({ top: itemTop, behavior: 'smooth' });
      }
    }, 280);
  }
};

window.orderProjectPack = function(artId) {
  const art = showcaseArtworks.find(a => String(a.id) === String(artId) || a.id == artId);
  closeArtModalDirect();
  switchView('store');
  const pipeKey = art ? (art.pipelineKey || 'sketch1') : 'sketch1';
  selectPipeline(pipeKey);
  showToast('Full production package loaded into atelier scope calculator.', 'success', 4500);
};

window.openArtModalByIndex = function(idx) {
  if (idx < 0 || idx >= showcaseArtworks.length) return;
  closeAllFloatingDrawersAndMenus();
  currentCaseStudyIdx = idx;
  const art = showcaseArtworks[idx];
  renderArtStationProject(art);
  const modal = document.getElementById('artDetailModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'block';
    modal.scrollTop = 0;
  }
  // ثبت وضعیت در تاریخچه تا دکمه بازگشت (Back) گوشی پنجره را ببندد و از سایت خارج نشود
  pushModalState('artDetail');
};

window.openArtModal = function(id) {
  if (id === undefined || id === null) return;
  let idx = showcaseArtworks.findIndex(a => String(a.id) === String(id) || a.id == id);
  if (idx === -1 && typeof id === 'number' && id >= 0 && id < showcaseArtworks.length) {
    idx = id;
  }
  if (idx !== -1) {
    openArtModalByIndex(idx);
  } else if (showcaseArtworks.length > 0) {
    openArtModalByIndex(0);
  }
};

window.closeArtModalDirect = function(updateHistory = true) {
  const modal = document.getElementById('artDetailModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  // آزادسازی قطعی و بی‌قیدوشرط اسکرول بدنه و کل صفحه
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');

  if (updateHistory && window.history.state && window.history.state.modalOpen === 'artDetail') {
    try { window.history.back(); } catch(e) {}
  }
};

window.closeArtModal = function(e) {
  if (e.target && e.target.id === 'artDetailModal') {
    closeArtModalDirect();
  }
};

window.navigateCaseStudy = function(direction, e) {
  if (e) e.stopPropagation();
  if (!showcaseArtworks || showcaseArtworks.length === 0) return;
  currentCaseStudyIdx = (currentCaseStudyIdx + direction + showcaseArtworks.length) % showcaseArtworks.length;
  const nextArt = showcaseArtworks[currentCaseStudyIdx];
  if (nextArt) {
    renderArtStationProject(nextArt);
    const modal = document.getElementById('artDetailModal');
    if (modal) modal.scrollTop = 0;
  }
};

function renderArtStationProject(art) {
  if (!art) return;
  activeCaseStudyArt = art;

  const stream = document.getElementById('caseStudyImagesStream');
  if (!stream) return;

  const mainTitle = art.title || 'Untitled Concept';
  const mainDesc = art.desc || 'Concept art and visual development by TAJINKART Studio.';
  const mainPipe = art.pipelineKey || 'sketch1';
  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[mainPipe]) ? PIPELINE_DATA[mainPipe] : { topSub: 'Concept Design Atelier' };
  const mainPipeName = pipeData.topSub;
  const artLore = art.lore || 'Extopia Universe';

  let streamHtml = '';

  // ۱. سرتیتر یکپارچه و مجلل اثر (فرمت وسط‌چین نامه طراح بدون هشتگ یا بج اضافه)
  streamHtml += `
    <div class="unified-project-header">
      <h1 class="project-header-title">${mainTitle}</h1>
      <p class="project-header-desc">${mainDesc}</p>
    </div>
  `;

  // ۲. استخراج لیست یکپارچه تصاویر
  const mainSrc = art.image || art.img || (art.phases && art.phases[0] && (art.phases[0].img || art.phases[0].image)) || '';
  let imageList = [];

  if (mainSrc) {
    imageList.push({
      src: mainSrc,
      name: mainTitle,
      phaseNum: '01',
      desc: mainDesc,
      pipe: mainPipe,
      sub: '',
      genre: art.genre || (art.phases && art.phases[0] && art.phases[0].genre) || ''
    });
  }

  if (art.phases && Array.isArray(art.phases) && art.phases.length > 0) {
    art.phases.forEach((p, pIdx) => {
      const pSrc = p.img || p.image;
      if (pSrc && pSrc !== mainSrc) {
        const phaseName = p.name || `Project Sheet • Phase ${imageList.length + 1}`;
        const phaseDesc = p.desc || p.description || p.note || '';
        const phasePipe = p.pipelineKey || mainPipe;
        const phaseSub = p.subcategory || '';
        const phaseGenre = p.genre || art.genre || '';
        imageList.push({
          src: pSrc,
          name: phaseName,
          phaseNum: (imageList.length + 1 < 10 ? `0${imageList.length + 1}` : `${imageList.length + 1}`),
          desc: phaseDesc,
          pipe: phasePipe,
          sub: phaseSub,
          genre: phaseGenre
        });
      }
    });
  }

  // رندر تک‌تک فریم‌های استریم عمودی همراه با یادداشت‌های فنی بین تصاویر
  imageList.forEach((item, idx) => {
    const pipeInfo = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[item.pipe]) ? PIPELINE_DATA[item.pipe].topSub : 'Design Atelier';
    streamHtml += `
      <div class="artstation-img-card project-stream-item" 
           data-index="${idx}"
           data-title="${escapeQuotes(item.name)}">
        <img src="${item.src}" alt="${item.name}" loading="${idx === 0 ? 'eager' : 'lazy'}" class="elastic-pinch-target" onclick="toggleImageZoom(this, event)" title="Click to zoom and inspect details" />
        <div class="stream-phase-note" style="padding: 16px 20px; background: rgba(6, 8, 13, 0.75); border-radius: 12px; margin-top: 10px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 240px; text-align: right;">
              <h3 class="stream-phase-title" style="margin: 0 0 8px; font-size: 16px; font-weight: 800; color: #fff; line-height: 1.4;">
                ${item.phaseNum} • ${item.name}
              </h3>
              ${item.desc ? `<p class="stream-phase-desc" style="margin: 0; font-size: 12.5px; color: #94a3b8; line-height: 1.85;">${item.desc}</p>` : ''}
            </div>
            <div style="flex-shrink: 0; text-align: left;">
              <span class="stream-phase-pipe font-mono" style="display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(250, 204, 21, 0.12); border: 1px solid rgba(250, 204, 21, 0.35); color: var(--gold); font-size: 11px; font-weight: 800;">
                ${pipeInfo}${item.sub ? ` • ${item.sub}` : ''}${item.genre ? ` • 🌌 ${item.genre}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // ۳. کارت باوقار سفارش پکیج کامل در انتهای اثر (در صورت فعال بودن در اثر)
  if (art.isProductionPack !== false) {
    streamHtml += `
      <div class="production-pack-card">
        
        <h3 class="pack-title">Order Full Production Case Study</h3>
        <p class="pack-desc">Commission this complete concept art pipeline (including exploratory thumbnails, orthographic sheets, and final renders) directly through the studio calculator.</p>
        <button type="button" onclick="orderProjectPack('${art.id}')" class="btn-gold pack-order-btn">
          Inquire / Order in Studio Calculator ←
        </button>
      </div>
    `;
  }

  stream.innerHTML = streamHtml;

}

// موتور ردیابی زنده اسکرول برای تغییر هماهنگ سایدبار بر اساس عکس در حال مشاهده با رهگیر نوری و ترنزیشن جهت‌دار
let lastScrollPosition = 0;

function initProjectStreamScrollSpy() {
  const modal = document.getElementById('artDetailModal');
  const items = document.querySelectorAll('.project-stream-item');
  if (!modal || items.length === 0) return;

  lastScrollPosition = modal.scrollTop;

  function onScroll() {
    const isScrollingDown = modal.scrollTop >= lastScrollPosition;
    lastScrollPosition = modal.scrollTop;

    let currentItem = items[0];
    let activeIndex = 0;
    const triggerLine = window.innerHeight * 0.45;

    items.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        currentItem = item;
        activeIndex = idx;
      }
    });

    const phase = currentItem.getAttribute('data-phase');
    const title = currentItem.getAttribute('data-title');
    const desc = currentItem.getAttribute('data-desc');

    const phaseEl = document.getElementById('artDetailPhaseIndicator');
    const titleEl = document.getElementById('artDetailTitle');
    const descEl = document.getElementById('artDetailDesc');

    // به‌روزرسانی نقاط رهگیر نوری سایدبار
    const dots = document.querySelectorAll('.sidebar-optical-tracker .tracker-dot');
    dots.forEach((dot, dIdx) => {
      if (dIdx === activeIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (titleEl && title && titleEl.textContent !== title) {
      titleEl.textContent = title;
      if (phaseEl && phase) phaseEl.textContent = phase;
      if (descEl && desc) descEl.textContent = desc;

      const sidebarEl = document.getElementById('artStationSidebar');
      if (sidebarEl) {
        sidebarEl.classList.remove('sidebar-slide-down', 'sidebar-slide-up', 'sidebar-gold-pulse');
        void sidebarEl.offsetWidth; // Reflow for directional animation
        sidebarEl.classList.add(isScrollingDown ? 'sidebar-slide-down' : 'sidebar-slide-up');
        sidebarEl.classList.add('sidebar-gold-pulse');
        setTimeout(() => sidebarEl.classList.remove('sidebar-gold-pulse'), 400);
      }

      const itemPipe = currentItem.getAttribute('data-pipe');
      if (itemPipe) {
        currentDrawerPipelineKey = itemPipe;
        const pipeNameEl = document.getElementById('caseStudyPipeName');
        const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[itemPipe]) ? PIPELINE_DATA[itemPipe] : null;
        if (pipeNameEl && pipeData) {
          const itemSub = currentItem.getAttribute('data-sub');
          pipeNameEl.textContent = pipeData.topSub + (itemSub ? ` (${itemSub})` : '');
        }
      }
    }
  }

  modal.removeEventListener('scroll', modal._scrollSpyHandler);
  modal._scrollSpyHandler = onScroll;
  modal.addEventListener('scroll', onScroll, { passive: true });
}

window.scrollStreamToItem = function(index) {
  const items = document.querySelectorAll('.project-stream-item');
  if (items[index]) {
    items[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.toggleImageZoom = function(imgEl, e) {
  if (!imgEl) return;
  // روی تبلت و موبایل کلیک تک‌ضربه غیرفعال است و منحصراً از زوم لمسی پینچ دوانگشتی استفاده می‌شود
  if (window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024)) return;
  const isZoomed = imgEl.classList.toggle('zoomed-image');
  if (isZoomed) {
    if (e) {
      const rect = imgEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      imgEl.style.transformOrigin = `${x}% ${y}%`;
    } else {
      imgEl.style.transformOrigin = 'center center';
    }

    imgEl.onmousemove = function(moveEvent) {
      if (!imgEl.classList.contains('zoomed-image')) return;
      const rect = imgEl.getBoundingClientRect();
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      imgEl.style.transformOrigin = `${x}% ${y}%`;
    };
  } else {
    imgEl.style.transformOrigin = 'center center';
    imgEl.onmousemove = null;
  }
};

// گوش دادن به کلیدهای کیبورد برای ناوبری
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('artDetailModal');
  if (modal && (modal.classList.contains('active') || modal.style.display === 'block')) {
    if (e.key === 'Escape') closeArtModalDirect();
    if (e.key === 'ArrowLeft') navigateCaseStudy(1);
    if (e.key === 'ArrowRight') navigateCaseStudy(-1);
  }
});

window.setCaseStudyPhase = function(idx) {
  activeCaseStudyPhaseIdx = idx;
  updateCaseStudyPhaseView();
  renderCaseStudyPhasesSwitcher();
};

function updateCaseStudyPhaseView() {
  if (!activeCaseStudyArt) return;
  const phases = activeCaseStudyArt.phases || [{ name: 'Master Render', img: activeCaseStudyArt.image }];
  const currentPhase = phases[activeCaseStudyPhaseIdx] || phases[0];

  const imgEl = document.getElementById('caseStudyMainImg');
  const badgeEl = document.getElementById('caseStudyPhaseBadge');
  const displayImg = currentPhase.img || activeCaseStudyArt.image;
  if (imgEl) imgEl.src = getOptimizedImageUrl(displayImg, 1600);
  if (badgeEl) badgeEl.textContent = `Phase ${activeCaseStudyPhaseIdx + 1} • ${currentPhase.name}`;
}

// دیپ‌لینک هوشمند از مطالعه موردی به پایپلاین آتلیه کمیسیون
window.deepLinkToPipeline = function() {
  closeArtModalDirect();
  const pipeKey = activeCaseStudyArt ? activeCaseStudyArt.pipelineKey : 'sketch1';
  switchView('store');
  switchStoreTab('commissions', document.querySelector('.store-dual-nav .store-dual-btn'));
  selectPipeline(pipeKey, null, true);
  showToast('Commission pipeline opened for this concept project.', 'info');
};

// closeArtModalDirect handled uniformly above


// =========================================================
// کشوی شیک و پرستیژدار تشریح فازهای تخصصی (Phase Scope Drawer)
// =========================================================
let currentDrawerPipelineKey = 'sketch1';

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\'");
}

// =========================================================
// تفکیک تعامل تصویر: تپ برای شیت مشخصات در موبایل، ذره‌بین متمرکز در دسکتاپ
// =========================================================
window.handleImageClick = function(imgEl, phaseTitle, pipeKey, phaseDesc, phaseSub, e) {
  if (window.innerWidth <= 992) {
    // در موبایل: باز شدن کشوی مشخصات فنی فاز به سبک Bottom Sheet
    openPhaseScopeDrawer(phaseTitle, pipeKey, phaseDesc, phaseSub);
  } else {
    // در دسکتاپ: باز شدن ذره‌بین متمرکز وسط صفحه با امکان هدایت آزادانه لنز
    openCenteredMagnifier(imgEl.src, phaseTitle);
  }
};

window.openCenteredMagnifier = function(imgSrc, phaseTitle) {
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  const imgEl = document.getElementById('magnifierActiveImg');
  const titleEl = document.getElementById('magnifierPhaseTitle');
  const viewport = document.getElementById('magnifierViewport');
  if (!overlay || !imgEl || !viewport) return;

  imgEl.src = imgSrc;
  if (titleEl) titleEl.textContent = phaseTitle || 'Concept Case Study Details';
  overlay.classList.add('active');

  // هدایت فوق‌روان ۶۰ فریم بر ثانیه لنز با حرکت موس
  viewport.onmousemove = function(e) {
    const rect = viewport.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    imgEl.style.transformOrigin = `${xPct}% ${yPct}%`;
    imgEl.style.transform = 'scale(2.2)';
  };

  viewport.onmouseleave = function() {
    imgEl.style.transform = 'scale(1)';
    imgEl.style.transformOrigin = 'center center';
  };
};

window.closeCenteredMagnifier = function(e) {
  if (e && e.target && e.target.tagName === 'IMG') return; // Image click does not close
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  const imgEl = document.getElementById('magnifierActiveImg');
  const viewport = document.getElementById('magnifierViewport');
  if (viewport) {
    viewport.onmousemove = null;
    viewport.onmouseleave = null;
  }
  if (imgEl) {
    imgEl.style.transform = '';
    imgEl.style.transformOrigin = 'center center';
  }
  if (overlay) overlay.classList.remove('active');
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCenteredMagnifier();
  }
});

window.openPhaseScopeDrawer = function(phaseTitle, pipeKey, customDesc = '', customSub = '') {
  currentDrawerPipelineKey = pipeKey || 'sketch1';
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (!overlay) return;

  const titleEl = document.getElementById('drawerPhaseTitle');
  if (titleEl) titleEl.textContent = phaseTitle || 'Production Phase Specifications';

  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[currentDrawerPipelineKey]) ? 
                   PIPELINE_DATA[currentDrawerPipelineKey] : { topSub: 'Character Design & Heroes' };
  
  const pipeEl = document.getElementById('drawerPhasePipeline');
  if (pipeEl) {
    pipeEl.textContent = pipeData.topSub + (customSub ? ` • ${customSub}` : '');
  }

  const purposeEl = document.getElementById('drawerPhasePurpose');
  if (purposeEl) {
    if (customDesc && customDesc.trim().length > 0) {
      purposeEl.textContent = customDesc.trim();
    } else if (phaseTitle.toLowerCase().includes('turnaround') || phaseTitle.toLowerCase().includes('ortho') || phaseTitle.toLowerCase().includes('model sheet') || phaseTitle.includes('سه‌نما')) {
      purposeEl.textContent = 'This sheet establishes orthographic reference angles (Front, Profile, Back) for 3D sculptors and animators, preventing proportion drift.';
    } else if (phaseTitle.toLowerCase().includes('expression') || phaseTitle.toLowerCase().includes('face') || phaseTitle.includes('اکسپرشن')) {
      purposeEl.textContent = 'Explores dynamic emotional states, facial expressions, and personality nuances under combat, dialogue, and narrative tension.';
    } else if (phaseTitle.toLowerCase().includes('silhouette') || phaseTitle.toLowerCase().includes('thumbnail') || phaseTitle.toLowerCase().includes('sketch') || phaseTitle.includes('اتود')) {
      purposeEl.textContent = 'Early visual exploration of core silhouette, proportions, and archetype identity, establishing the production design trajectory.';
    } else if (phaseTitle.toLowerCase().includes('render') || phaseTitle.toLowerCase().includes('master') || phaseTitle.toLowerCase().includes('light') || phaseTitle.includes('رندر')) {
      purposeEl.textContent = 'Final photorealistic polish, material separation (leather, metal, cloth), chiaroscuro value study, and 300DPI print-ready master delivery.';
    } else {
      purposeEl.textContent = 'Architected as a core component of the studio visual development pipeline, fulfilling international entertainment industry standards.';
    }
  }

  overlay.classList.add('active');
};

window.closePhaseScopeDrawer = function(e) {
  if (e && e.target && e.target.id !== 'phaseScopeDrawerOverlay' && !e.target.closest('button')) return;
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.goToPipelineFromDrawer = function() {
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (overlay) overlay.classList.remove('active');

  const artModal = document.getElementById('artDetailModal');
  if (artModal) closeArtModalDirect();

  switchView('store');
  selectPipeline(currentDrawerPipelineKey);
  showToast('Navigated to atelier commission pipeline. Scope calculator active.', 'info', 4000);
};


// ==============================================================================
// زوم لمسی پینچ و جابجایی دو انگشتی روان سبک اینستاگرام در موبایل (Pinch & Pan)
// ==============================================================================
let pinchInitDist = 0;
let pinchCurrentScale = 1;
let pinchInitCenter = { x: 0, y: 0 };
let pinchPanX = 0;
let pinchPanY = 0;
let activePinchImg = null;

document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length === 2) {
    const target = e.target.closest('.elastic-pinch-target');
    if (target) {
      activePinchImg = target;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchInitDist = Math.hypot(dx, dy);
      pinchInitCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      pinchPanX = 0;
      pinchPanY = 0;
      activePinchImg.style.transition = 'none';
      activePinchImg.style.willChange = 'transform';
    }
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (activePinchImg && e.touches && e.touches.length === 2 && pinchInitDist > 0) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scaleFactor = dist / pinchInitDist;
    // مهار نرم بین ۱ تا ۲.۵ برابر
    pinchCurrentScale = Math.min(Math.max(scaleFactor, 1), 2.5);
    
    // جابجایی آزاد دو انگشت (Pan)
    if (pinchCurrentScale > 1.05) {
      const currentCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      pinchPanX = (currentCenter.x - pinchInitCenter.x) * 1.15;
      pinchPanY = (currentCenter.y - pinchInitCenter.y) * 1.15;
      if (e.cancelable) e.preventDefault();
    } else {
      pinchPanX = 0;
      pinchPanY = 0;
    }
    
    activePinchImg.style.transform = `translate(${pinchPanX}px, ${pinchPanY}px) scale(${pinchCurrentScale})`;
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (activePinchImg && (!e.touches || e.touches.length < 2)) {
    activePinchImg.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
    activePinchImg.style.transform = 'translate(0px, 0px) scale(1)';
    setTimeout(() => {
      if (activePinchImg) {
        activePinchImg.style.transition = '';
        activePinchImg.style.willChange = '';
        activePinchImg = null;
      }
    }, 340);
    pinchInitDist = 0;
    pinchCurrentScale = 1;
    pinchPanX = 0;
    pinchPanY = 0;
  }
}, { passive: true });


// ==============================================================================
// همگام‌سازی دوطرفه و ادغام هوشمند آثار (بدون حذف کارهای جدید ذخیره‌شده محلی)
// ==============================================================================
window.syncArtworksFromSupabase = async function() {
  if (!window.supabaseClient) {
    if (typeof ensureSupabaseClient === 'function') ensureSupabaseClient();
    if (!window.supabaseClient) return;
  }

  try {
    const { data: cloudArtworks, error } = await window.supabaseClient
      .from('artworks')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, maintaining local cache:', error);
      return;
    }

    // ۱. لیست شناسه‌های حذف‌شده صریح توسط کاربر
    let deletedIds = [];
    try {
      const delKey = (typeof KEYS !== 'undefined' && KEYS.DELETED_ARTWORKS) ? KEYS.DELETED_ARTWORKS : 'tajinkart_deleted_artworks_v2';
      deletedIds = JSON.parse(localStorage.getItem(delKey) || '[]').map(Number);
    } catch(e) { deletedIds = []; }
    const deletedSet = new Set(deletedIds);

    // تابع تشخیص آثار آزمایشی/دموی اولیه آنسپلش
    const isLegacySample = (art) => {
      if (!art) return true;
      const id = Number(art.id);
      if (id <= 8 || (id >= 101 && id <= 106)) return true;
      const img = String(art.image || '').toLowerCase();
      if (img.includes('images.unsplash.com')) return true;
      const title = String(art.title || '').toLowerCase();
      if (title.includes('obsidian vanguard') || title.includes('abyssal leviathan') || title.includes('neo-tirann') || title.includes('eclipse sovereign') || title.includes('runeforged vorpal') || title.includes('chronicles of extopia') || title.includes('potato')) return true;
      return false;
    };

    const pipeMap = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? PIPELINE_TO_CATEGORY_MAP : {};
    const mergedMap = new Map();

    // ۲. کارهای معتبر دیتابیس ابری را اضافه می‌کنیم
    const legacyCloudIdsToDelete = [];
    if (cloudArtworks && Array.isArray(cloudArtworks)) {
      cloudArtworks.forEach(row => {
        if (!row || !row.id) return;
        const rowId = Number(row.id);
        
        // اگر جزو آثار دمو قدیمی است، شناسه‌اش را برای حذف قطعی از سوپابیس ذخیره کن
        if (isLegacySample(row)) {
          legacyCloudIdsToDelete.push(rowId);
          return;
        }

        // اگر کاربر این کار را قبلاً حذف کرده، نمایش نده
        if (deletedSet.has(rowId)) return;

        const pipe = row.pipeline_key || 'sketch1';
        const mappedCat = row.category || row.tag || pipeMap[pipe] || 'character';
        mergedMap.set(rowId, {
          id: rowId,
          orderIndex: (row.order_index !== undefined && row.order_index !== null) ? Number(row.order_index) : undefined,
          tag: mappedCat,
          category: mappedCat,
          shortSlug: row.short_slug || row.title,
          title: row.title,
          desc: row.desc_text || '',
          pipelineKey: pipe,
          genre: row.genre || 'Dark Fantasy',
          subgenres: row.subgenres || [],
          image: row.image,
          colorSpace: row.color_space || 'Master 4K / 16-Bit ProPhoto RGB',
          lore: row.lore || 'Extopia Universe',
          phases: row.phases || []
        });
      });

      // حذف فیزیکی هر گونه اثر تستی/آنسپلش باقی‌مانده از دیتابیس کلود
      if (legacyCloudIdsToDelete.length > 0 && window.supabaseClient) {
        window.supabaseClient.from('artworks').delete().in('id', legacyCloudIdsToDelete)
          .then(() => console.log('Purged legacy cloud items:', legacyCloudIdsToDelete))
          .catch(e => console.warn('Cloud purge note:', e));
      }
    }

    // ۳. کارهای ذخیره‌شده محلی کاربر را به ادغام اضافه می‌کنیم (تا کار جدیدی که کاربر تازه ذخیره کرده هرگز نپرد)
    const localArts = (window.showcaseArtworks && Array.isArray(window.showcaseArtworks) && window.showcaseArtworks.length > 0)
      ? window.showcaseArtworks
      : (typeof showcaseArtworks !== 'undefined' && Array.isArray(showcaseArtworks) ? showcaseArtworks : []);

    localArts.forEach(art => {
      if (!art || !art.id) return;
      const artId = Number(art.id);
      
      // اگر کار تستی قدیمی یا در لیست حذف‌شده‌ها است، نادیده بگیر
      if (isLegacySample(art) || deletedSet.has(artId)) return;

      // اگر در مپ نیست (مثلاً کاربر تازه در ادمین ثبت کرده و هنوز در کلود ننشسته)، حفظش کن
      if (!mergedMap.has(artId)) {
        mergedMap.set(artId, art);
        
        // تلاش مجدد برای ثبت در کلود با شناسه مطمئن
        if (window.supabaseClient) {
          window.supabaseClient.from('artworks').upsert([{
            id: art.id,
            tag: art.tag || 'character',
            short_slug: art.shortSlug || art.title,
            title: art.title,
            desc_text: art.desc || '',
            pipeline_key: art.pipelineKey || 'sketch1',
            genre: art.genre || 'Dark Fantasy',
            image: art.image,
            color_space: art.colorSpace || 'Master 4K / 16-Bit ProPhoto RGB',
            phases: art.phases || []
          }], { onConflict: 'id' }).then(() => {}).catch(() => {});
        }
      }
    });

    const finalArtworks = Array.from(mergedMap.values()).sort((a, b) => {
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) return a.orderIndex - b.orderIndex;
      return b.id - a.id;
    });

    showcaseArtworks = finalArtworks;
    window.showcaseArtworks = finalArtworks;
    const artKey = (typeof KEYS !== 'undefined' && KEYS.ARTWORKS) ? KEYS.ARTWORKS : 'tajinkart_artworks_fa_v2';
    safeSetStorage(artKey, JSON.stringify(finalArtworks));
    
    if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
    if (typeof renderAdminSketch2 === 'function') renderAdminSketch2();
    console.log('Safe reconciliation complete. Total artworks:', finalArtworks.length);
  } catch (err) {
    console.warn('Auto-sync execution error:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (typeof window.syncArtworksFromSupabase === 'function') window.syncArtworksFromSupabase(); }, 500);
  });
} else {
  setTimeout(() => { if (typeof window.syncArtworksFromSupabase === 'function') window.syncArtworksFromSupabase(); }, 500);
}


// اجرای قطعی و فوری رندر شوکیس و فیلترهای بالا-چپ در لود صفحه
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
    if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
    if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  });
} else {
  if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
}
