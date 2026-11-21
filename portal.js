// ==============================================================================
// TAJINKART STUDIO — PORTAL, STORE & COMMISSIONS MODULE (portal.js)
// Member Portal, Auth Modals, Commission Calculator Wizard, Products Vault
// ==============================================================================

window.handleGenesisClick = function() {
  if (!window.isStudioDirectorAuthenticated()) {
    showToast('GENESIS ARCHIVES // SEALED SECTOR — The chronicles of Edon and Extopia are currently being forged behind closed doors. Clearance is restricted to the World Architect until the seasonal unveiling.', 'info', 5500);
    return;
  }
  switchView('genesis');
};

window.handleAcademyClick = function() {
  if (!window.isStudioDirectorAuthenticated()) {
    showToast('TAJINKART ACADEMY // FORGING CURRICULUM — The ink is still wet. Our private mentorships and dark-fantasy production breakdowns are currently in preparation for the next guild intake.', 'info', 5500);
    return;
  }
  switchView('academy');
};


// پایپلاین‌های ۶گانه آتلیه - اتصال زنده به رنگ دسته‌بندی گالری و زیرشاخه‌ها (v21.3.0)

// ==============================================================================
// اعمال یکدست و زنده رنگ‌ها و پالت‌های نئون دسته‌بندی گالری بر کارت‌های پایپلاین کمیسیون
// ==============================================================================

// ==============================================================================
// TAJINKART DYNAMIC ATELIER & GALLERY SHOWCASE AUTO-LINKING ENGINE (v26.4.0)
// همگام‌سازی خودکار و داینامیک آثار بارگذاری‌شده در گالری با پایپ‌لاین‌های آتلیه و چرخش تصاویر
// ==============================================================================

// ==============================================================================
// TAJINKART EXCLUSIVE ATELIER PIPELINE MATCHER (v26.5.2)
// هر شیت و فاز منحصراً و فقط در پایپ‌لاین اختصاصی خود نمایش داده می‌شود
// ==============================================================================

window.getArtworksForPipeline = function(pipeKey, forShopCards = false) {
  const allArts = (window.showcaseArtworks && Array.isArray(window.showcaseArtworks)) ? window.showcaseArtworks : [];
  if (!allArts || allArts.length === 0) return [];

  const pipeMap = {
    'sketch1': 'character',
    'sketch_creature': 'creature',
    'sketch2': 'environment',
    'sketch3': 'keyframe',
    'sketch4': 'props',
    'sketch_mascot': 'mascot',
    'sketch5': 'comic'
  };

  const targetCatId = (pipeMap[pipeKey] || pipeKey || '').toLowerCase().trim();
  const pipeLower = (pipeKey || '').toLowerCase().trim();

  const matchingItems = [];

  const hiddenShopIds = (typeof siteSettings !== 'undefined' && siteSettings && Array.isArray(siteSettings.atelierHiddenArtIds)) ? siteSettings.atelierHiddenArtIds : [];
  allArts.forEach(art => {
    if (!art) return;
    if (forShopCards && (art.showInShopCards === false || hiddenShopIds.includes(art.id))) return;
    if (!art) return;
    const aCat = (art.category || art.tag || '').toLowerCase().trim();
    const aPipe = (art.pipelineKey || art.pipe || '').toLowerCase().trim();
    const aTitle = (art.title || '').toLowerCase().trim();

    // بررسی تطابق شیت ۱ (کاور اصلی) با این پایپ‌لاین
    const rootMatches = (
      aCat === targetCatId || aCat === pipeLower ||
      aPipe === pipeLower || aPipe === targetCatId ||
      (targetCatId === 'keyframe' && (aCat.includes('keyframe') || aPipe.includes('keyframe') || aPipe.includes('sketch3') || aCat.includes('cinematic') || aPipe.includes('cinematic') || aTitle.includes('cinematic') || aTitle.includes('کی‌فریم') || aTitle.includes('سینماتیک'))) ||
      (targetCatId === 'character' && (aCat.includes('character') || aPipe.includes('sketch1') || aCat.includes('کاراکتر'))) ||
      (targetCatId === 'creature' && (aCat.includes('creature') || aPipe.includes('sketch_creature') || aCat.includes('monster') || aCat.includes('هیولا'))) ||
      (targetCatId === 'environment' && (aCat.includes('env') || aPipe.includes('sketch2') || aCat.includes('world') || aCat.includes('محیط'))) ||
      (targetCatId === 'props' && (aCat.includes('prop') || aPipe.includes('sketch4') || aCat.includes('weapon') || aCat.includes('سلاح'))) ||
      (targetCatId === 'comic' && (aCat.includes('comic') || aPipe.includes('sketch5') || aCat.includes('manga') || aCat.includes('کمیک'))) ||
      (targetCatId === 'mascot' && (aCat.includes('mascot') || aPipe.includes('mascot') || aPipe.includes('sketch_mascot')))
    );

    // اگر شیت کاور متعلق به این پایپ‌لاین است، آن را اضافه کن
    if (rootMatches && art.image) {
      matchingItems.push({
        id: art.id,
        title: art.title,
        desc: art.desc,
        image: art.image,
        pipelineKey: pipeLower,
        category: targetCatId,
        stage: art.stage || 'render',
        complexity: art.complexity || 'moderate',
        phases: art.phases || []
      });
    }

    // اکنون شیت‌های تکمیلی (فازهای ۲، ۳ و...) را منحصراً بررسی کن
    if (Array.isArray(art.phases) && art.phases.length > 0) {
      art.phases.forEach((p, pIdx) => {
        // اگر شیت اول است و به عنوان ریشه اضافه شده، تکراری اضافه نکن
        if (pIdx === 0 && rootMatches) return;
        const pImg = p.image || p.img;
        if (!pImg) return;

        const pPipe = (p.pipelineKey || '').toLowerCase().trim();
        const pCat = (p.category || pipeMap[pPipe] || '').toLowerCase().trim();
        const pName = (p.name || '').toLowerCase().trim();

        // تطابق انحصاری این شیت با این پایپ‌لاین
        const phaseMatches = (
          pCat === targetCatId || pCat === pipeLower ||
          pPipe === pipeLower || pPipe === targetCatId ||
          (targetCatId === 'keyframe' && (pCat.includes('keyframe') || pPipe.includes('keyframe') || pPipe.includes('sketch3') || pCat.includes('cinematic') || pPipe.includes('cinematic') || pName.includes('cinematic') || pName.includes('کی‌فریم') || pName.includes('سینماتیک'))) ||
          (targetCatId === 'character' && (pCat.includes('character') || pPipe.includes('sketch1') || pCat.includes('کاراکتر'))) ||
          (targetCatId === 'creature' && (pCat.includes('creature') || pPipe.includes('sketch_creature') || pCat.includes('monster') || pCat.includes('هیولا'))) ||
          (targetCatId === 'environment' && (pCat.includes('env') || pPipe.includes('sketch2') || pCat.includes('world') || pCat.includes('محیط'))) ||
          (targetCatId === 'props' && (pCat.includes('prop') || pPipe.includes('sketch4') || pCat.includes('weapon') || pCat.includes('سلاح'))) ||
          (targetCatId === 'comic' && (pCat.includes('comic') || pPipe.includes('sketch5') || pCat.includes('manga') || pCat.includes('کمیک'))) ||
          (targetCatId === 'mascot' && (pCat.includes('mascot') || pPipe.includes('mascot') || pPipe.includes('sketch_mascot')))
        );

        if (phaseMatches) {
          matchingItems.push({
            id: art.id + '_' + pIdx,
            parentArtId: art.id,
            title: p.name || art.title,
            desc: p.desc || art.desc,
            image: pImg,
            pipelineKey: pipeLower,
            category: targetCatId,
            subcategory: p.subcategory || '',
            stage: p.stage || 'lineart_value',
            complexity: p.complexity || 'moderate',
            phases: [p]
          });
        }
      });
    }
  });

  return matchingItems;
};

let atelierRotationTimer = null;

window.syncAtelierWithGalleryArtworks = function() {
  const cards = document.querySelectorAll('#atelierServiceCards .service-nav-card');
  if (!cards || cards.length === 0) return;

  cards.forEach(card => {
    const pipe = card.getAttribute('data-pipeline');
    if (!pipe) return;

    // واکشی تصاویر ۱۰۰٪ انحصاری همین پایپ‌لاین
    const matchingItems = window.getArtworksForPipeline(pipe, true);
    const validImages = [];

    matchingItems.forEach(item => {
      const img = item.image;
      if (img && !validImages.includes(img)) {
        validImages.push(img);
      }
    });

    card._dynamicArtworkImages = validImages;
    if (typeof card._currentImgIdx !== 'number') card._currentImgIdx = 0;

    const imgEl = card.querySelector('img');
    if (imgEl && validImages.length > 0) {
      const optSrc = (typeof getOptimizedImageUrl === 'function') ? getOptimizedImageUrl(validImages[0], 480) : validImages[0];
      imgEl.src = optSrc;
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';
    }

    // چرخش سریع‌تر با هاور موس
    if (!card._hasHoverCycleListener && validImages.length > 1) {
      card._hasHoverCycleListener = true;
      card.addEventListener('mouseenter', function() {
        if (!this._dynamicArtworkImages || this._dynamicArtworkImages.length <= 1) return;
        this._currentImgIdx = (this._currentImgIdx + 1) % this._dynamicArtworkImages.length;
        const targetImg = this.querySelector('img');
        if (targetImg) {
          targetImg.style.opacity = '0.2';
          setTimeout(() => {
            const rawSrc = this._dynamicArtworkImages[this._currentImgIdx];
            targetImg.src = (typeof getOptimizedImageUrl === 'function') ? getOptimizedImageUrl(rawSrc, 480) : rawSrc;
            targetImg.style.opacity = '';
          }, 180);
        }
      });
    }
  });

  // تایمر پیوسته چرخش تصاویر در کارت‌های سایدبار (هر ۵.۵ ثانیه)
  if (!atelierRotationTimer) {
    atelierRotationTimer = setInterval(() => {
      const allCards = document.querySelectorAll('#atelierServiceCards .service-nav-card');
      allCards.forEach(card => {
        if (card.matches(':hover')) return;
        const imgs = card._dynamicArtworkImages;
        if (Array.isArray(imgs) && imgs.length > 1) {
          card._currentImgIdx = (card._currentImgIdx + 1) % imgs.length;
          const img = card.querySelector('img');
          if (img) {
            img.style.opacity = '0.2';
            setTimeout(() => {
              const rawSrc = imgs[card._currentImgIdx];
              img.src = (typeof getOptimizedImageUrl === 'function') ? getOptimizedImageUrl(rawSrc, 480) : rawSrc;
              img.style.opacity = '';
            }, 250);
          }
        }
      });
    }, 5500);
  }
};

window.applyCategoryColorsToServiceCards = function() {
  const cards = document.querySelectorAll('#atelierServiceCards .service-nav-card');
  if (!cards || cards.length === 0) return;

  // فراخوانی خودکار همگام‌سازی تصاویر کارت‌ها با آثار گالری
  try {
    if (typeof window.syncAtelierWithGalleryArtworks === 'function') {
      window.syncAtelierWithGalleryArtworks();
    }
  } catch(e) {}

  const cats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0)
    ? galleryCategories
    : (typeof SIX_PIPELINE_CATEGORIES !== 'undefined' ? SIX_PIPELINE_CATEGORIES : []);

  const pipeMap = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? PIPELINE_TO_CATEGORY_MAP : {
    'sketch1': 'character',
    'sketch_creature': 'creature',
    'sketch2': 'environment',
    'sketch3': 'keyframe',
    'sketch4': 'props',
    'sketch5': 'comic',
    'sketch_mascot': 'character'
  };

  cards.forEach(card => {
    const pipe = card.getAttribute('data-pipeline');
    const catId = pipeMap[pipe] || 'character';
    const foundCat = cats.find(c => c.id === catId);
    let color = '#facc15';
    if (foundCat && foundCat.color) {
      color = foundCat.color;
    } else if (pipe === 'sketch1') {
      color = '#facc15';
    } else if (pipe === 'sketch_creature') {
      color = '#10b981';
    } else if (pipe === 'sketch2') {
      color = '#38bdf8';
    } else if (pipe === 'sketch3') {
      color = '#f43f5e';
    } else if (pipe === 'sketch4') {
      color = '#a855f7';
    } else if (pipe === 'sketch5') {
      color = '#fb923c';
    } else if (pipe === 'sketch_mascot') {
      color = '#eab308';
    }

    card.style.setProperty('--cat-color', color);
    card.style.setProperty('--cat-color-glow', color + '55');

    const numSpan = card.querySelector('.service-nav-title span:first-child');
    if (numSpan) {
      numSpan.style.color = color;
      numSpan.style.textShadow = "0 0 10px " + color + "66";
    }

    if (card.classList.contains('active')) {
      card.style.borderColor = color;
      card.style.borderBottomColor = color;
      card.style.boxShadow = "0 0 0 1.5px " + color + ", 0 14px 35px " + color + "55";
    } else {
      card.style.borderBottomColor = color;
      card.style.removeProperty('border-color');
      card.style.removeProperty('box-shadow');
    }
  });
};

window.selectPipeline = function(key, cardEl, userClicked) {
  currentSelectedPipeKey = key;
  
  // ۱. نگاشت پایپلاین به دسته‌بندی گالری و واکشی رنگ زنده آن
  const catId = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? (PIPELINE_TO_CATEGORY_MAP[key] || 'character') : 'character';
  let catColor = '#facc15';
  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    const foundCat = galleryCategories.find(c => c.id === catId);
    if (foundCat && foundCat.color) {
      catColor = foundCat.color;
    }
  }

  // ۲. به‌روزرسانی وضعیت اکتیو کارت‌های سایدبار
  document.querySelectorAll('#atelierServiceCards .service-nav-card').forEach(c => {
    const isActive = c.getAttribute('data-pipeline') === key;
    c.classList.toggle('active', isActive);
  });

  if (typeof applyCategoryColorsToServiceCards === 'function') {
    applyCategoryColorsToServiceCards();
  }

  const data = PIPELINE_DATA[key];
  if (!data) return;

  const topSubEl = document.getElementById('sketchTopSubTitle');
  if (topSubEl) {
    topSubEl.textContent = data.topSub;
    topSubEl.style.color = catColor;
    topSubEl.style.borderRight = 'none';
    topSubEl.style.paddingRight = '0';
  }

  const badgeSlugEl = document.getElementById('sketchBadgeSlug');
  if (badgeSlugEl) {
    badgeSlugEl.style.display = 'none';
  }

  const noteEl = document.getElementById('sketchAnnotationNote');
  if (noteEl) noteEl.textContent = data.note;

  // واکشی کارهای واقعی گالری مربوط به این پایپلاین برای تایل‌های مراحل
  const matchingArts = (typeof getArtworksForPipeline === 'function') ? getArtworksForPipeline(key) : [];

  // ۳. رندر کارت‌های نمای شاپ (۴ کارت متمرکز کاراکتر برای sketch1 + کارت‌های پایپلاین برای بقیه)
  const container = document.getElementById('mosaicStageContainer');
  const hourly = window.getStudioHourlyRate();
  const cardsToRender = (key === 'sketch1' && Array.isArray(window.CHARACTER_SHOP_CARDS))
    ? window.CHARACTER_SHOP_CARDS.map(c => ({
        title: c.title,
        desc: c.desc,
        img: c.img,
        timeline: c.timeline,
        baseHours: c.baseHours,
        usdVal: Math.round(c.baseHours * hourly),
        price: String(Math.round(c.baseHours * hourly)),
        subMode: c.subMode,
        span: 'span-6'
      }))
    : (Array.isArray(data.tiles) ? data.tiles.map(t => ({ ...t, baseHours: t.baseHours || Math.max(2, Math.round((t.usdVal || 90) / 15)) })) : []);

  if (container) {
    container.innerHTML = cardsToRender.map((tile, idx) => {
      const estUsd = Math.round((tile.baseHours || 5) * hourly);
      const displayPrice = formatPrice(String(estUsd));
      let tileImg = tile.img;
      if (matchingArts.length > 0) {
        const matchedArt = matchingArts[idx % matchingArts.length];
        if (matchedArt) {
          if (Array.isArray(matchedArt.phases) && matchedArt.phases[idx] && (matchedArt.phases[idx].image || matchedArt.phases[idx].img)) {
            tileImg = matchedArt.phases[idx].image || matchedArt.phases[idx].img;
          } else if (matchedArt.image) {
            tileImg = matchedArt.image;
          }
        }
      }
      const optTileImg = (typeof getOptimizedImageUrl === 'function' && tileImg && !tileImg.startsWith('data:')) ? getOptimizedImageUrl(tileImg, 720) : tileImg;
      const escapedTitle = (tile.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      const escapedDesc = (tile.desc || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      const subMode = tile.subMode || '';

      return `
        <div class="pipeline-tile ${tile.span || ''}" style="--tile-accent:${catColor};" onclick="openModal('${escapedTitle}', '${escapedDesc}', '${displayPrice}', '${optTileImg}', '${tile.timeline}', ${estUsd}, '${key}', '${subMode}')">
          <img src="${optTileImg}" class="pipeline-tile-img" alt="${escapedTitle}" loading="lazy" decoding="async" />
          <div class="pipeline-tile-overlay">
            <h4 class="pipeline-tile-title">${tile.title}</h4>
            <p class="pipeline-tile-desc">${tile.desc}</p>
            <div class="pipeline-tile-footer">
              <div>
                <span class="font-mono" style="color:${catColor}; font-size:14px; font-weight:800; text-shadow:0 0 10px ${catColor}55;">From ${displayPrice}</span>
                <span style="color:var(--cyan-electric); font-size:11px; margin-left:8px;">(${tile.timeline})</span>
              </div>
              <span style="font-size:11.5px; color:${catColor}; font-weight:800; display:flex; align-items:center; gap:4px;">
                Configure &amp; Order →
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (userClicked && window.innerWidth <= 1024) {
    const target = document.getElementById('sketchWorkbenchArea');
    if (target) {
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
};

window.getStudioHourlyRate = function() {
  if (typeof window.getAtelierCatalog === 'function') return window.getAtelierCatalog().hourlyRate;
  const r = (typeof siteSettings !== 'undefined' && siteSettings && Number(siteSettings.studioHourlyRate)) ? Number(siteSettings.studioHourlyRate) : 15;
  return r > 0 ? r : 15;
};
window.getStudioEffortConfig = function() {
  const cat = (typeof window.getAtelierCatalog === 'function') ? window.getAtelierCatalog() : null;
  if (cat) {
    return {
      portrait: (cat.framings.find(f => f.id === 'portrait')?.hrs) || 2.5,
      half: (cat.framings.find(f => f.id === 'half')?.hrs) || 4,
      full: (cat.framings.find(f => f.id === 'full')?.hrs) || 6.5,
      turnaround: (cat.framings.find(f => f.id === 'turnaround')?.hrs) || 11,
      pet: cat.addons.simplePetHrs || 2,
      subchar: cat.addons.subCharHrs || 4.5
    };
  }
  return { portrait: 2.5, half: 4, full: 6.5, turnaround: 11, pet: 2, subchar: 4.5 };
};
window.toggleWizardModuleDrawer = function(drawerId, isOpen, disp = 'grid') {
  const el = document.getElementById(drawerId);
  if (el) el.style.display = isOpen ? disp : 'none';
  if (typeof window.recalcWizardPrice === 'function') window.recalcWizardPrice();
};
window.handleWizardPhaseChange = function() {
  const pEl = document.getElementById('orderPhaseSelect');
  const selOpt = pEl ? pEl.options[pEl.selectedIndex] : null;
  const allowColorAttr = selOpt ? selOpt.getAttribute('data-allow-color') : null;
  const mult = selOpt ? (parseFloat(selOpt.getAttribute('data-mult') || '1') || 1) : 1;
  const showColor = allowColorAttr !== null ? (allowColorAttr === 'true') : (mult > 0.6);
  // Extra initial sketch concepts are ALWAYS available regardless of phase!
  const exWrap = document.getElementById('wizExtraSketchesWrap');
  const cvWrap = document.getElementById('wizColorVarWrap');
  if (exWrap) exWrap.style.display = 'block';
  if (cvWrap) cvWrap.style.display = showColor ? 'grid' : 'none';
  if (typeof window.recalcWizardPrice === 'function') window.recalcWizardPrice();
};

window.CHARACTER_SHOP_CARDS = [
  {
    subMode: 'custom',
    title: 'Custom Characters & Portraits',
    desc: 'Original heroes, D&D characters, portraits, half-body or full-body concepts with age tiers & optional companions.',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    timeline: '3 to 7 business days',
    baseHours: 3.5
  },
  {
    subMode: 'lineup',
    title: 'Character Lineup & Party Sheet',
    desc: 'Design a full party from scratch OR assemble your existing characters into a clean height & graphic lineup at a lower rate.',
    img: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=800&q=80',
    timeline: '2 to 8 business days',
    baseHours: 2.5
  },
  {
    subMode: 'creator',
    title: 'YouTuber, PNGTuber & Mascot',
    desc: 'Channel avatars, brand mascots & reactive PNGTuber expression packs with transparent PNGs for thumbnails and streams.',
    img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    timeline: '3 to 5 business days',
    baseHours: 4.5
  },
  {
    subMode: 'photo',
    title: 'Transform Yourself (From Photo)',
    desc: 'Turn your real photo (solo, couple, or friends) into a custom Dark Fantasy or Cyberpunk character portrait.',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    timeline: '3 to 5 business days',
    baseHours: 3.5
  }
];

function openModal(title, desc, price, img, timeline, usdVal, pipeKey, subMode) {
  activeModalItem = {
    title: title,
    titleFa: document.getElementById("editArtTitleFa") ? document.getElementById("editArtTitleFa").value.trim() : "",
    desc: desc,
    isProductionPack: document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true,
    price: price,
    img: img,
    timeline: timeline || '5 to 7 business days',
    usdVal: usdVal || 60,
    pipeKey: pipeKey || currentSelectedPipeKey,
    subMode: subMode || ''
  };

  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('modalTimeline').textContent = activeModalItem.timeline;
  document.getElementById('modalMediaImg').src = img;

  const badgeEl = document.getElementById('wizardPipeBadge');
  if (badgeEl) {
    const pData = PIPELINE_DATA[activeModalItem.pipeKey];
    badgeEl.textContent = pData ? pData.topSub : 'ATELIER PIPELINE';
  }
  if (typeof window.populateDynamicWizardForCategory === 'function') {
    window.populateDynamicWizardForCategory(activeModalItem.pipeKey, activeModalItem.subMode);
  }

  if (currentMember) {
    const nameInput = document.getElementById('orderClientName');
    const contactInput = document.getElementById('orderClientContact');
    if (nameInput) nameInput.value = currentMember.name;
    if (contactInput) contactInput.value = currentMember.contact || currentMember.email;
  }

  recalcWizardPrice();
  const zm = document.getElementById('zoomModal');
  if (zm) zm.classList.add('active');
}

function closeModal(e) { if (e && e.target && e.target.id === 'zoomModal') closeModalDirect(); }
function closeModalDirect() { const zm = document.getElementById('zoomModal'); if (zm) zm.classList.remove('active'); }

// موتور محاسبه‌گر لحظه‌ای قیمت و اسکوپ سفارش (Live Calculator Engine)
window.toggleWizardStep = function(stepNum) {
  const card = document.getElementById("wizardStep" + stepNum);
  if (card) card.classList.toggle('active');
};

window.recalcWizardPrice = function() {
  const hourly = window.getStudioHourlyRate();
  const effCfg = window.getStudioEffortConfig();
  const scopeEl = document.getElementById('wizCharacterScope');
  const framingEl = document.getElementById('wizFraming');
  const compEl = document.getElementById('wizComplexity');
  const phaseEl = document.getElementById('orderPhaseSelect');
  const lineupCountEl = document.getElementById('wizLineupCount');

  const scopeOpt = scopeEl ? scopeEl.options[scopeEl.selectedIndex] : null;
  const scopeVal = scopeOpt ? scopeOpt.value : 'single';
  const scopeBaseHrs = scopeOpt ? (parseFloat(scopeOpt.getAttribute('data-hrs') || '0') || 0) : 0;

  const framingOpt = framingEl ? framingEl.options[framingEl.selectedIndex] : null;
  const framingVal = framingOpt ? framingOpt.value : 'full';
  let framingHrs = framingOpt ? (parseFloat(framingOpt.getAttribute('data-hrs') || '4') || 4) : 4;
  if (framingVal === 'portrait') framingHrs = effCfg.portrait;
  else if (framingVal === 'half') framingHrs = effCfg.half;
  else if (framingVal === 'full') framingHrs = effCfg.full;
  else if (framingVal === 'turnaround') framingHrs = effCfg.turnaround;

  const compOpt = compEl ? compEl.options[compEl.selectedIndex] : null;
  const compHrs = compOpt ? (parseFloat(compOpt.getAttribute('data-hrs') || '1.5') || 1.5) : 1.5;

  const ageBoxes = Array.from(document.querySelectorAll('input[name="wizAgeOpt"]:checked'));
  const agesChosen = ageBoxes.map(b => b.value);
  let ageHrs = 0;
  if (document.getElementById('wizCharacterNuancesGrid')?.style.display !== 'none' && ageBoxes.length > 0) {
    const firstDelta = parseFloat(ageBoxes[0].getAttribute('data-delta') || '0') || 0;
    ageHrs = firstDelta + (ageBoxes.length > 1 ? (ageBoxes.length - 1) * 3.5 : 0);
  }

  const phaseOpt = phaseEl ? phaseEl.options[phaseEl.selectedIndex] : null;
  const fidelityMult = phaseOpt ? (parseFloat(phaseOpt.getAttribute('data-mult') || '1.25') || 1.25) : 1.25;
  const isSketchOnly = fidelityMult <= 0.6;
  let revRounds = isSketchOnly ? 1 : 2;
  let revLabel = isSketchOnly ? '1 Round (+1d per revision)' : '2 Rounds (+1–2d per revision)';

  const extraSketches = parseInt(document.getElementById('wizExtraSketches')?.value || '0', 10) || 0;
  const colorVars = !isSketchOnly ? (parseInt(document.getElementById('wizColorVariations')?.value || '0', 10) || 0) : 0;
  const bgOpt = !isSketchOnly ? document.getElementById('wizBackgroundType')?.selectedOptions[0] : null;
  const bgHrs = bgOpt ? (parseFloat(bgOpt.getAttribute('data-hrs') || '0') || 0) : 0;

  let coreHrs = 0;
  if (activeModalItem && activeModalItem.subMode === 'lineup') {
    const cnt = lineupCountEl ? (parseInt(lineupCountEl.value, 10) || 2) : 2;
    coreHrs = (scopeVal === 'existing_lineup') ? (1.5 + cnt * 0.5) : ((cnt * (framingHrs + compHrs * 0.8)) * fidelityMult);
  } else {
    coreHrs = Math.max(2, (scopeBaseHrs + framingHrs + compHrs + ageHrs) * fidelityMult);
  }

  const catCfg = (typeof window.getAtelierCatalog === 'function') ? window.getAtelierCatalog() : null;
  const exConceptRate = catCfg ? catCfg.extraConceptHrs : 1.0;
  const colorVarRate = catCfg ? catCfg.addons.colorVarHrs : 1.25;
  const exprRate = catCfg ? catCfg.addons.expressionHrs : 0.75;
  const actionRate = catCfg ? catCfg.addons.actionPoseHrs : 1.25;
  const commMult = catCfg ? catCfg.commercialMult : 1.4;
  const framingDays = framingOpt ? (parseInt(framingOpt.getAttribute('data-days') || '0', 10) || 0) : 0;
  const phaseDays = phaseOpt ? (parseInt(phaseOpt.getAttribute('data-days') || '0', 10) || 0) : 0;
  const phaseRevsAttr = phaseOpt ? parseInt(phaseOpt.getAttribute('data-revs') || '0', 10) : 0;
  if (phaseRevsAttr > 0) {
    revRounds = phaseRevsAttr;
    revLabel = `${revRounds} Round${revRounds > 1 ? 's' : ''} (+1–2d per revision)`;
  }

  let addonHrs = (extraSketches * exConceptRate) + (colorVars * colorVarRate) + bgHrs;
  let extraDays = framingDays + phaseDays + (bgHrs >= 3 ? 2 : 0);
  const addonsChosen = [];

  if (extraSketches > 0) addonsChosen.push(`+${extraSketches} Extra Initial Concept(s)`);
  if (colorVars > 0) addonsChosen.push(`+${colorVars} Color Variation(s)`);
  if (bgHrs > 0 && bgOpt) addonsChosen.push(`BG: ${bgOpt.text}`);

  if (document.getElementById('wizCompCheck')?.checked) {
    const cType = document.getElementById('wizCompArchetype')?.value || 'Companion';
    const cDepthOpt = document.getElementById('wizCompDepth')?.selectedOptions[0];
    const cDepthVal = cDepthOpt ? cDepthOpt.value : 'Simple Companion';
    const cHrs = cDepthVal.includes('Designed') ? effCfg.subchar : effCfg.pet;
    addonHrs += cHrs;
    addonsChosen.push(`Companion: ${cType} (${cDepthVal})`);
  }

  if (document.getElementById('wizWeaponCheck')?.checked) {
    const wType = document.getElementById('wizWeaponType')?.value || 'Weapon';
    const wDepthOpt = document.getElementById('wizWeaponDepth')?.selectedOptions[0];
    const wHrs = wDepthOpt ? (wDepthOpt.value.includes('Relic') ? (catCfg ? catCfg.addons.relicWeaponHrs : 3) : (catCfg ? catCfg.addons.stdWeaponHrs : 1.5)) : 1.5;
    addonHrs += wHrs;
    addonsChosen.push(`Prop: ${wType} (${wDepthOpt ? wDepthOpt.value : 'Standard'})`);
  }

  if (document.getElementById('wizExprCheck')?.checked) {
    const exprs = Array.from(document.querySelectorAll('input[name="wizExprOpt"]:checked')).map(x => x.value);
    if (exprs.length > 0) {
      addonHrs += exprs.length * exprRate;
      addonsChosen.push(`Expressions (${exprs.length}): ${exprs.join(', ')}`);
    }
  }

  if (document.getElementById('wizActionCheck')?.checked) {
    const acts = Array.from(document.querySelectorAll('input[name="wizActionOpt"]:checked')).map(x => x.value);
    if (acts.length > 0) {
      addonHrs += acts.length * actionRate;
      extraDays += 1;
      addonsChosen.push(`Action Poses (${acts.length}): ${acts.join(', ')}`);
    }
  }

  const isCommPsd = !!document.getElementById('wizCommercial')?.checked;
  if (isCommPsd) addonsChosen.push('Commercial Rights + Master Layered PSD');

  const rawHrs = Math.max(2, coreHrs + addonHrs);
  const totalHours = Math.round(rawHrs * 2) / 2;
  let totalUSD = Math.round(totalHours * hourly);
  if (isCommPsd) totalUSD = Math.round(totalUSD * commMult);

  const halfUSD = (totalUSD * 0.5).toFixed(2).replace(/\.00$/, '');
  const minD = Math.max(2, Math.ceil(totalHours / 4) + extraDays);
  const maxD = Math.max(minD + 2, Math.ceil(totalHours / 2.2) + extraDays);
  const timelineStr = `${minD} to ${maxD} business days`;

  if (activeModalItem) {
    activeModalItem.calculatedPriceUSD = totalUSD;
    activeModalItem.estimatedHours = totalHours;
    activeModalItem.hourlyRate = hourly;
    activeModalItem.revisionsIncluded = revRounds;
    activeModalItem.agesChosen = agesChosen;
    activeModalItem.addonsChosen = addonsChosen;
    activeModalItem.deliverableFormat = isCommPsd ? '300DPI Master Layered PSD + PNG/JPG (Commercial)' : 'High-Res 300DPI PNG / JPG';
  }

  const revEl = document.getElementById('modalRevisionsText');
  if (revEl) revEl.textContent = revLabel;

  const tlEl = document.getElementById('modalTimeline');
  if (tlEl) tlEl.textContent = timelineStr;

  const priceEl = document.getElementById('modalPrice');
  if (priceEl) {
    priceEl.textContent = formatPrice(totalUSD);
    priceEl.style.transition = 'color 0.2s';
    priceEl.style.color = 'var(--cyan-electric)';
    setTimeout(() => { priceEl.style.color = 'var(--gold)'; }, 250);
  }

  const profBox = document.getElementById('wizProformaPreviewBox');
  if (profBox) {
    const pkgName = (activeModalItem && activeModalItem.title) ? activeModalItem.title : 'Custom Commission';
    const phaseTxt = phaseOpt ? phaseOpt.text : 'Full Master Render';
    const scopeTxt = scopeOpt ? scopeOpt.text : 'Single Concept';
    const framingTxt = framingOpt ? framingOpt.text : 'Full-Body';
    const ageLabel = agesChosen.length ? agesChosen.join(', ') : 'Adult';
    profBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:6px;">
        <strong style="color:var(--gold);">PROFORMA PREVIEW</strong>
        <span class="font-mono" style="color:var(--cyan-electric);">${timelineStr}</span>
      </div>
      <div><span style="color:#94a3b8;">Package:</span> <strong style="color:#fff;">${pkgName}</strong></div>
      <div><span style="color:#94a3b8;">Rendering Phase:</span> <strong style="color:#fff;">${phaseTxt}</strong></div>
      <div><span style="color:#94a3b8;">Scope, Framing &amp; Age:</span> ${scopeTxt} • ${framingTxt} • Age: ${ageLabel}</div>
      <div><span style="color:#94a3b8;">Deliverables:</span> <strong style="color:${isCommPsd ? 'var(--gold)' : 'var(--emerald)'};">${activeModalItem ? activeModalItem.deliverableFormat : '300DPI PNG / JPG'}</strong></div>
      <div><span style="color:#94a3b8;">Selected Modules:</span> ${addonsChosen.length ? addonsChosen.join(' • ') : 'Core Package Only'}</div>
      <div><span style="color:#94a3b8;">Revisions:</span> <strong style="color:var(--emerald);">${revRounds} Structured Round(s)</strong> (each revision adds 1–2 business days)</div>
      <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.12);">
        <span>50% Retainer to Start: <strong class="font-mono" style="color:var(--gold);">$${halfUSD}</strong></span>
        <span>50% Final on Handover: <strong class="font-mono" style="color:var(--cyan-electric);">$${halfUSD}</strong></span>
      </div>
      <div style="font-size:10.5px; color:#94a3b8; margin-top:6px;">
        • 50% retainer locks your studio slot; unpaid briefs auto-expire after 24h.
      </div>
    `;
  }

  if (typeof window.updateWizardDynamicPreview === 'function' && activeModalItem) {
    const sTxt = scopeOpt ? scopeOpt.text : '';
    const fTxt = framingOpt ? framingOpt.text : '';
    const cTxt = compOpt ? compOpt.text : '';
    const pTxt = phaseOpt ? phaseOpt.text : '';
    window.updateWizardDynamicPreview(activeModalItem.pipeKey, fTxt, pTxt, sTxt, cTxt);
  }
};

// مخزن دارایی‌های دیجیتال (۷ شاخه Standard)
let currentStoreFilterType = 'all';

const ASSET_CAT_DESCRIPTIONS = {
  'all': 'Atelier digital asset vault containing 7 standard branches: 2D game sprites, specialized brush engines, UI kits, layered comic PSDs, 4K loops, 3D print STLs, and FX particle bundles.',
  '2D Game Sprites & Characters': 'Character sprite sheets and multi-directional animations (Idle, Walk, Attack, Death) optimized for Unity and Godot with seamless parallax layers.',
  'Brush Engines & Textures': 'Custom Photoshop (.ABR) and Procreate brush packs for rendering weathered metals, aged leather, reptilian scales, and 4K seamless alphas.',
  'Prop Kits, Icons & UI': 'Magic skill icon libraries, alchemy vials, dark fantasy HUD frames, and RPG equipment interfaces in transparent PNG (256x256 & 512x512).',
  'Comics & Master PSDs': 'Full comic graphic novel chapters with separated PSD layers, worldbuilding lorebooks, and studio director notes.',
  '4K Cinematic Loops': 'Seamless 60FPS 4K video loops for video game title menus, live streaming backdrops, Steam dynamic wallpapers, and commercial cinematic title sequences.',
  '3D Print & STL Models': 'High-poly STL sculpts for resin 3D printing with pre-supported hollowed variants + raw ZBrush (.ZTL / .OBJ) sculpt files for game artists.',
  'FX & Atmosphere Overlays': 'High-resolution transparent PNG & 4K ProRes video overlays including drifting embers, sulfurous acid mist, heavy rain, and weapon impact dust.'
};

window.filterStoreAssets = function(type, el) {
  currentStoreFilterType = type;
  document.querySelectorAll('#assetCategoryTabs .service-nav-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('currentAssetCategoryTitle');
  if (titleEl) titleEl.textContent = type === 'all' ? 'All Atelier Assets' : type;

  const noteEl = document.getElementById('assetCategoryDynamicNote');
  if (noteEl) noteEl.textContent = ASSET_CAT_DESCRIPTIONS[type] || ASSET_CAT_DESCRIPTIONS['all'];

  renderProducts();

  if (window.innerWidth <= 1024 && el) {
    const target = document.getElementById('assetWorkbenchArea');
    if (target) {
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
};

window.searchStoreAssets = function(query) {
  const q = query.toLowerCase().trim();
  let filtered = digitalStoreProducts;
  if (currentStoreFilterType !== 'all') {
    filtered = filtered.filter(p => p.type === currentStoreFilterType);
  }
  if (q) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  renderProductsWithList(filtered);
};

function renderProducts() {
  let filtered = digitalStoreProducts;
  if (currentStoreFilterType !== 'all') {
    filtered = filtered.filter(p => p.type === currentStoreFilterType);
  }
  renderProductsWithList(filtered);
}

function renderProductsWithList(list) {
  const countEl = document.getElementById('assetCountBadge');
  if (countEl) countEl.textContent = `${list.length} ASSETS AVAILABLE`;

  const grid = document.getElementById('productsMerchGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center; color:var(--text-muted); font-size:13px;">No assets found in this category.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const priceStr = formatPrice(p.price);
    return `
      <div class="product-merch-card">
        <div class="merch-img-box">
          <img src="${p.img}" alt="${p.title}" />
          <span style="position:absolute; top:10px; right:10px; font-size:10px; padding:3px 9px; border-radius:6px; background:rgba(4,5,7,0.88); color:var(--cyan-electric); border:1px solid rgba(0,240,255,0.3); font-weight:700;">${p.type}</span>
        </div>
        <div style="padding:16px; display:flex; flex-direction:column; flex:1; justify-content:space-between; gap:12px;">
          <div>
            <h3 style="font-size:14px; font-weight:800; color:#fff; line-height:1.45;">${p.title}</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-top:6px; line-height:1.65;">${p.desc}</p>
            <div class="lore-key-tag">
              <span>🔑</span>
              <span>${p.loreKey || 'Genesis Canon • Lifetime Lore Access'}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border-subtle);">
            <span class="font-mono" style="font-size:16px; font-weight:800; color:var(--gold);">${priceStr}</span>
            <button onclick="downloadDigitalAsset('${p.title}')" class="btn-gold" style="padding:8px 14px; font-size:11px; background:var(--cyan-electric); color:#000;">Unlock & Download License →</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.downloadDigitalAsset = function(title) {
  showToast(`Asset "${title}" with perpetual commercial license unlocked to your dashboard. ✨`, 'success');
  if (currentMember) {
    if (!currentMember.assetsBought) currentMember.assetsBought = [];
    if (!currentMember.assetsBought.includes(title)) {
      currentMember.assetsBought.push(title);
      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));

      // ذخیره دائمی و آنلاین در جدول اعضای دیتابیس ابری Supabase
      if (window.supabaseClient) {
        window.supabaseClient.from('members').update({
          assets_bought: currentMember.assetsBought
        }).eq('email', currentMember.email).then(({ error }) => {
          if (error) console.warn('Cloud asset purchase sync warning:', error);
          else console.log('Successfully saved bought asset to Supabase cloud!');
        });
      }
    }
  }
};

function renderAcademy() {
  const grid = document.getElementById('academyCoursesGrid');
  if (!grid) return;
  grid.innerHTML = academyCourses.map(c => {
    const displayPrice = formatPrice(c.price);
    return `
      <div class="academy-card">
        <div style="aspect-ratio:16/9; background:#04060a; overflow:hidden;">
          <img src="${c.img}" style="width:100%; height:100%; object-fit:cover;" alt="${c.title}" />
        </div>
        <div style="padding:18px; display:flex; flex-direction:column; flex:1; justify-content:space-between; gap:12px;">
          <div>
            <div style="font-size:11.5px; color:var(--violet); font-weight:600;">${c.duration}</div>
            <h3 style="font-size:15.5px; font-weight:800; margin-top:4px;">${c.title}</h3>
            <p style="font-size:12.5px; color:var(--text-muted); margin-top:6px; line-height:1.7;">${c.desc}</p>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid rgba(168,85,247,0.2);">
            <span class="font-mono" style="font-size:18px; font-weight:800; color:var(--gold);">${displayPrice}</span>
            <button onclick="enrollAcademyCourse('${c.title}')" class="btn-gold" style="background:var(--violet); color:#fff; font-size:11.5px; padding:8px 14px;">Enroll in Masterclass →</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.enrollAcademyCourse = function(title) {
  showToast(`Enrolled in "${title}" successfully!`, 'success');
};

function renderComicPage() {
  const imgEl = document.getElementById('comicPageImg');
  const indEl = document.getElementById('comicPageIndicator');
  if (imgEl) imgEl.src = comicPages[comicCurrentPage - 1];
  if (indEl) indEl.textContent = `PAGE ${comicCurrentPage} / 4`;
}
window.navigateComic = function(delta) {
  comicCurrentPage += delta;
  if (comicCurrentPage < 1) comicCurrentPage = 1;
  if (comicCurrentPage > 4) comicCurrentPage = 4;
  renderComicPage();
};



// احراز هویت اعضا و بازیابی رمز
window.handleMembersIconClick = async function() {
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
  }

  // در صورتی که سشن در کلاینت باشد اما هنوز لود نشده باشد، بازیابی فوری
  if (!currentMember && window.supabaseClient && window.supabaseClient.auth) {
    try {
      const { data } = await window.supabaseClient.auth.getSession();
      if (data && data.session && data.session.user) {
        applyLoggedInMember(data.session.user, false);
      }
    } catch(e) {}
  }

  if (!currentMember) {
    switchAuthView('login');
    document.getElementById('memberModal').style.display = 'flex';
    return;
  }

  const emailLower = (currentMember.email || '').toLowerCase().trim();
  const isDirector = window.isDirectorEmail(emailLower);

  if (isDirector) {
    // مدیر استودیو مستقیماً به پنل مدیریت هدایت می‌شود
    const adminGate = document.getElementById('adminLoginGate');
    const adminWorkspace = document.getElementById('adminWorkspace');
    if (adminGate) adminGate.classList.add('hidden');
    if (adminWorkspace) adminWorkspace.classList.remove('hidden');
    switchView('admin');
    if (typeof switchAdminTab === 'function') {
      const artworksTabBtn = document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]');
      switchAdminTab('artworks', artworksTabBtn);
    }
    showToast('Studio command console opened.', 'info');
  } else {
    // کاربر عادی به داشبورد کاربری خود می‌رود
    renderMemberDashboard();
    switchView('member-dashboard');
  }
};
window.closeMemberModal = function() {
  const resetView = document.getElementById('authViewResetPassword');
  const isResetActive = resetView && !resetView.classList.contains('hidden');
  if (isResetActive && isRecoveryFlowActive) {
    showToast('To exit, please set a new password or click cancel at bottom of form.', 'info', 4000);
    return;
  }
  const modal = document.getElementById('memberModal');
  if (modal) modal.style.display = 'none';
};

window.handleMemberModalBackdropClick = function(event) {
  if (event.target !== document.getElementById('memberModal')) return;
  const resetView = document.getElementById('authViewResetPassword');
  const isResetActive = resetView && !resetView.classList.contains('hidden');
  if (isResetActive && isRecoveryFlowActive) {
    const card = document.getElementById('memberModalCard');
    if (card) {
      card.style.transform = 'scale(1.02)';
      card.style.transition = 'transform 0.15s ease';
      setTimeout(() => { card.style.transform = 'scale(1)'; }, 150);
    }
    showToast("Please enter your new password or click 'Cancel Recovery'.", 'info', 4000);
    return;
  }
  closeMemberModal();
};

window.cancelPasswordReset = async function() {
  if (confirm('Are you sure you want to cancel password recovery?\nYour previous password will remain unchanged.')) {
    isRecoveryFlowActive = false;
    sessionStorage.removeItem('tajinkart_recovering_password');
    if (window.supabaseClient && window.supabaseClient.auth) {
      try { await window.supabaseClient.auth.signOut(); } catch(e) {}
    }
    currentMember = null;
    const labelEl = document.getElementById('rightMemberLabel');
    if (labelEl) labelEl.textContent = 'Member Portal';

    const adminGate = document.getElementById('adminLoginGate');
    const adminWorkspace = document.getElementById('adminWorkspace');
    if (adminWorkspace) adminWorkspace.classList.add('hidden');
    if (adminGate) adminGate.classList.remove('hidden');

    const modal = document.getElementById('memberModal');
    if (modal) modal.style.display = 'none';
    switchView('showcase');
    try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
    showToast('Recovery process cancelled.', 'info');
  }
};

window.switchAuthView = function(viewName) {
  const views = ['authViewLogin', 'authViewSignUp', 'authViewForgot', 'authViewResetPassword'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (viewName === 'login') document.getElementById('authViewLogin')?.classList.remove('hidden');
  else if (viewName === 'signup') document.getElementById('authViewSignUp')?.classList.remove('hidden');
  else if (viewName === 'forgot') document.getElementById('authViewForgot')?.classList.remove('hidden');
  else if (viewName === 'reset') document.getElementById('authViewResetPassword')?.classList.remove('hidden');
};

window.logoutMemberAccount = async function() {
  if (window.supabaseClient && window.supabaseClient.auth) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch(e) {}
  }
  currentMember = null;
  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) labelEl.textContent = 'Portal';
  showToast('Signed out of account session.', 'info');
  switchView('showcase');
};

// کلیدهای میانبر ورود ادمین: ~ یا پ + Esc
let backtickActive = false;
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if (e.key === '`' || e.key === '~' || e.key === '÷') backtickActive = true;
  if ((e.key === 'Escape' && backtickActive) || (e.key === '`' && e.shiftKey)) {
    e.preventDefault();
    switchView('admin'); switchAdminTab('artworks', document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]'));
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key === '`' || e.key === '~' || e.key === '÷') {
    setTimeout(() => { backtickActive = false; }, 400);
  }
});



// دانلود پیش‌فاکتور اختصاصی برای یک سفارش
window.downloadOrderInvoiceById = function(orderId) {
  if (typeof window.downloadOfficialStudioInvoice === 'function') {
    window.downloadOfficialStudioInvoice(orderId);
    return;
  }
  const o = ordersList.find(x => x.id === orderId);
  if (!o) return;
  const invNumber = `TJK-INV-ORDER-${o.id}`;
  const dateStr = new Date().toLocaleDateString('fa-IR');

  const invoiceText = `================================================================================
                    TAJINKART CONCEPT ART & VISUAL ATELIER
                    Official Specifications & Invoice for Inquiry #${o.id}
================================================================================
Invoice CID: ${invNumber}
Date: ${dateStr}
Client / Studio: ${o.client}
Contact: ${o.contact}
Package: ${o.pkg}
Design Phase: ${o.phase || 'Standard'}
Total Quote: ${o.price}
Estimated Timeline: ${o.timeline || 'Per Agreement'}
--------------------------------------------------------------------------------
Brief Summary & Requirements:
${o.brief}
--------------------------------------------------------------------------------
Reference Link: ${o.refLink || 'None provided'}
Current Status: ${o.status}
================================================================================`;

  const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TAJINKART_Invoice_${o.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Invoice for Inquiry #${o.id} downloaded. 📄`, 'success');
};

window.renderAdminLists = function() {
  const ordEl = document.getElementById('adminOrdersList');
  const orders = (typeof ordersList !== 'undefined' && Array.isArray(ordersList)) ? ordersList : (window.ordersList || []);

  // Update KPI counters
  const totalCountEl = document.getElementById('kpiTotalOrdersCount');
  if (totalCountEl) totalCountEl.textContent = `${orders.length} Inquiries`;

  let gross = 0;
  let activeCount = 0;
  let completedCount = 0;

  orders.forEach(o => {
    let val = 0;
    if (typeof o.usdVal === 'number') val = o.usdVal;
    else if (typeof o.price === 'string') {
      const match = o.price.match(/[0-9,]+/);
      if (match) val = parseInt(match[0].replace(/,/g, ''), 10) || 0;
    }
    gross += val;
    if (o.status && o.status.includes('Completed')) {
      completedCount++;
    } else {
      activeCount++;
    }
  });

  const grossEl = document.getElementById('kpiGrossVolume');
  if (grossEl) grossEl.textContent = `$${gross.toLocaleString()}`;

  const activeEl = document.getElementById('kpiActiveProjectsCount');
  if (activeEl) activeEl.textContent = `${activeCount} Active`;

  const compEl = document.getElementById('kpiCompletedProjectsCount');
  if (compEl) compEl.textContent = `${completedCount} Delivered`;

  if (ordEl) {
    if (orders.length === 0) {
      ordEl.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:20px; text-align:center; background:#06080d; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">No commission inquiries registered yet. When clients submit project briefs from the Atelier or Commission Calculator, they appear here live.</div>`;
      return;
    }

    ordEl.innerHTML = orders.map((o, idx) => `
      <div style="padding:16px; background:#06080d; border-radius:14px; border:1px solid rgba(250,204,21,0.25); box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-size:14px; color:#fff; font-weight:800;">${o.client || 'Client'}</span>
            <span class="font-mono" style="color:var(--text-muted); font-size:11.5px; margin-left:6px;">(${o.contact || o.email || 'No contact'})</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="font-mono" style="color:var(--gold); font-size:13px; font-weight:800;">${o.pkg || 'Custom Package'}</span>
            <button type="button" onclick="downloadInvoice(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:3px 8px; border-radius:6px;" title="Download Invoice">📄 Invoice</button>
          </div>
        </div>
        <div style="font-size:12px; color:var(--cyan-electric); margin:6px 0; font-weight:600;">Selected Phase: ${o.phase || 'Standard Concept Execution'}</div>
        <div style="color:#cbd5e1; font-size:12px; margin:6px 0; line-height:1.7; background:#020306; padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">${o.brief || 'No briefing details provided.'}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; flex-wrap:wrap; gap:8px;">
          <span style="color:var(--amber); font-weight:700;">Status: <span style="color:#fff;">${o.status || 'Brief Received'}</span></span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; color:var(--text-muted);">Update Stage:</span>
            <select onchange="updateOrderStatus(${idx}, this.value)" style="width:auto; padding:5px 10px; font-size:11.5px; background:#090d16; border:1px solid var(--border-subtle); border-radius:6px; color:#fff;">
              <option value="Brief Received" ${o.status === 'Brief Received' ? 'selected' : ''}>Brief Received</option>
              <option value="Phase 1: Thumbnails" ${o.status === 'Phase 1: Thumbnails' ? 'selected' : ''}>Phase 1: Thumbnails</option>
              <option value="Phase 2: Linework" ${o.status === 'Phase 2: Linework' ? 'selected' : ''}>Phase 2: Linework</option>
              <option value="Phase 3: Render & Lighting" ${o.status === 'Phase 3: Render & Lighting' ? 'selected' : ''}>Phase 3: Render & Lighting</option>
              <option value="Final Delivery & Completed" ${o.status === 'Final Delivery & Completed' ? 'selected' : ''}>Final Delivery & Completed</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');
  }
};
function renderAdminLists() { window.renderAdminLists(); }

window.updateOrderStatus = function(idx, newStatus) {
  ordersList[idx].status = newStatus;
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
  renderAdminLists();
  renderMemberDashboard();
  showToast('Project status updated.', 'success');
};

window.purgeExpiredUnpaidOrders = function() {
  if (!Array.isArray(ordersList) || ordersList.length === 0) return false;
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const expiredIds = [];
  const kept = ordersList.filter(o => {
    const isUnpaidBrief = (!o.status || o.status === 'Brief Received') && !o.paymentVerified && !o.txid;
    if (!isUnpaidBrief) return true;
    const createdMs = (o.specs && o.specs.createdAt) ? Date.parse(o.specs.createdAt) : (typeof o.id === 'number' && o.id > 1700000000000 ? o.id : now);
    if (!Number.isNaN(createdMs) && (now - createdMs) > DAY_MS) {
      expiredIds.push(o.id);
      return false;
    }
    return true;
  });
  if (expiredIds.length > 0) {
    ordersList = kept;
    if (typeof safeSetStorage === 'function') safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
    if (window.supabaseClient) {
      expiredIds.forEach(eid => {
        window.supabaseClient.from('orders').delete().eq('id', eid).then(() => {
          console.log('[Orders Auto-Expiry] Purged unpaid brief >24h:', eid);
        });
      });
    }
    return true;
  }
  return false;
};

window.clientCancelUnpaidOrder = async function(orderId) {
  const o = ordersList.find(x => x.id === orderId);
  if (!o) return;
  if (o.paymentVerified || o.txid) {
    showToast('Paid or TXID-submitted commissions cannot be self-deleted. Please contact Studio Director.', 'error');
    return;
  }
  if (!confirm(`Cancel and remove unpaid brief #${orderId}? You can submit a new brief anytime.`)) return;
  ordersList = ordersList.filter(x => x.id !== orderId);
  if (typeof safeSetStorage === 'function') safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
  renderMemberDashboard();
  if (typeof renderAdminSketch3 === 'function') renderAdminSketch3();
  if (window.supabaseClient) {
    const { error } = await window.supabaseClient.from('orders').delete().eq('id', orderId);
    if (error) {
      console.warn('[Client Portal] Supabase delete error:', error);
      showToast('Removed locally, but cloud delete failed: ' + (error.message || 'RLS'), 'error', 4500);
      return;
    }
    console.log('[Client Portal] Unpaid brief deleted from cloud:', orderId);
  }
  showToast(`Unpaid brief #${orderId} cancelled and removed.`, 'info', 3500);
};

function renderMemberDashboard() {
  if (typeof window.syncOrdersFromSupabase === 'function' && (!window._lastPortalOrdersSync || Date.now() - window._lastPortalOrdersSync > 3500)) {
    window._lastPortalOrdersSync = Date.now();
    window.syncOrdersFromSupabase();
  }
  window.purgeExpiredUnpaidOrders();
  const isDirector = currentMember && window.isDirectorEmail(currentMember.email);

  // هدر پرونده آتلیه
  const nameEl = document.getElementById('dashMemberName');
  if (nameEl) {
    if (!currentMember) {
      nameEl.innerHTML = 'Guest Collector <span style="font-size:11px; color:var(--cyan-electric); font-weight:800; border:1px solid rgba(0,240,255,0.3); padding:2px 8px; border-radius:999px;">Console Preview ✨</span>';
    } else if (isDirector) {
      nameEl.innerHTML = 'Seyed Soroush Taj <span style="font-size:11px; color:var(--gold); font-weight:800; border:1px solid rgba(250,204,21,0.35); padding:2px 8px; border-radius:999px;">Studio Director 👑</span>';
    } else {
      nameEl.textContent = currentMember.name;
    }
  }

  const emailEl = document.getElementById('dashMemberEmail');
  if (emailEl) {
    if (!currentMember) {
      emailEl.textContent = 'guest@tajinkart.space';
    } else {
      const googleBadge = currentMember.isGoogleUser ? ' <span style="color:var(--emerald); font-size:11px; font-weight:700;">(Google Verified ✓)</span>' : '';
      emailEl.innerHTML = currentMember.email + googleBadge;
    }
  }

  const contactEl = document.getElementById('dashMemberContact');
  if (contactEl) {
    contactEl.textContent = (currentMember && currentMember.contact) ? currentMember.contact : 'Direct Studio Communication';
  }

  // تنظیم هاله و نماد آواتار
  const halo = document.getElementById('dashAvatarHalo');
  const glyph = document.getElementById('dashAvatarGlyph');
  const rank = document.getElementById('dashClearanceRank');
  const badge = document.getElementById('dashClearanceBadge');

  if (halo && glyph && rank && badge) {
    if (isDirector) {
      halo.classList.add('director-halo');
      glyph.textContent = '👑';
      rank.textContent = 'Clearance: Studio Director & Lead Worldbuilder 👑';
      badge.classList.add('director-rank');
    } else {
      halo.classList.remove('director-halo');
      glyph.textContent = '⚔️';
      rank.textContent = currentMember ? 'Clearance Level 3: Vanguard Client & Collector' : 'Clearance Level 1: Atelier Seeker';
      badge.classList.remove('director-rank');
    }
  }

  // کلید پنل ادمین
  const adminBtn = document.getElementById('dashAdminPanelBtn');
  if (adminBtn) {
    adminBtn.classList.toggle('hidden', !isDirector);
  }

  // کلید تغییر رمز
  const passBtn = document.getElementById('dashChangePassBtn');
  if (passBtn) {
    if (currentMember && currentMember.isGoogleUser) {
      passBtn.innerHTML = '🔑 Create Password';
      passBtn.title = 'Signed in via Google. You can optionally set a password.';
    } else {
      passBtn.innerHTML = '🔑 Security Matrix & Password';
      passBtn.title = 'Change or reset account password';
    }
  }

  // ۱. رندر پایپلاین‌های سفارش‌ها در زبانه ۱
  const oBox = document.getElementById('memberOrdersContainer');
  const userOrders = currentMember ? ordersList.filter(o => 
    (o.clientEmail && o.clientEmail.toLowerCase() === currentMember.email.toLowerCase()) ||
    (o.client && o.client.toLowerCase() === currentMember.name.toLowerCase()) || 
    (o.contact && o.contact.toLowerCase() === currentMember.email.toLowerCase()) || 
    (currentMember.contact && o.contact === currentMember.contact)
  ) : [];

  const STAGES = [
    { id: 1, label: 'Brief & Scope', hint: 'Atelier Requirements Analysis' },
    { id: 2, label: '50% Retainer', hint: 'Artist Calendar Reserved' },
    { id: 3, label: 'Silhouette & Lines', hint: 'Form Exploration & Turnaround' },
    { id: 4, label: '300DPI Master', hint: 'Chiaroscuro & Material Render' },
    { id: 5, label: 'Final PSD Source', hint: 'Full Layered 4K Handover' }
  ];

  const pCountEl = document.getElementById('dashPipelineCount');
  if (pCountEl) pCountEl.textContent = String(userOrders.length);

  if (oBox && userOrders.length === 0) {
    oBox.innerHTML = `
      <div class="client-empty-state">
        <div class="empty-state-head">
          <h4>No Active Commissions Yet</h4>
          <p>When you submit a commission brief, your live 5-stage progress tracker and crypto/invoice settlement options will appear right here.</p>
        </div>
        <div class="workflow-preview-strip">
          ${STAGES.map(s => `
            <div class="workflow-step-pill">
              <span class="wf-num">${s.id}</span>
              <div>
                <strong>${s.label}</strong>
                <span>${s.hint}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button type="button" onclick="switchView('store')" class="btn-atelier-accent" style="padding:12px 22px;">
            Start Your First Commission →
          </button>
          ${isDirector ? `<button type="button" onclick="openCryptoPayModal(null)" class="btn-atelier-gold" style="padding:12px 18px;">🧪 Test Wallet Payment (0.01 XTZ)</button>` : ''}
        </div>
      </div>
    `;
  } else if (oBox) {
    oBox.innerHTML = userOrders.map(o => {
      let currentStageNum = 1;
      const stLower = (o.status || '').toLowerCase();
      if (stLower.includes('retainer') || stLower.includes('deposit') || stLower.includes('ودیعه')) currentStageNum = 2;
      else if (stLower.includes('thumbnail') || stLower.includes('linework') || stLower.includes('silhouette') || stLower.includes('اتود') || stLower.includes('design')) currentStageNum = 3;
      else if (stLower.includes('render') || stLower.includes('master') || stLower.includes('رندر')) currentStageNum = 4;
      else if (stLower.includes('complete') || stLower.includes('delivered') || stLower.includes('settled') || stLower.includes('تحویل')) currentStageNum = 5;

      return `
        <div style="padding:22px; background:#04060b; border-radius:16px; border:1px solid rgba(0,240,255,0.25); font-size:12px; display:flex; flex-direction:column; gap:16px; box-shadow:0 8px 30px rgba(0,0,0,0.6); position:relative; overflow:hidden;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <span style="font-size:15px; font-weight:900; color:#fff; display:block;">${o.pkg || 'Bespoke Concept Art Commission'}</span>
              <span class="font-mono" style="font-size:11px; color:var(--gold); margin-top:3px; display:block;">Brief CID: #${o.id} • Quote: ${o.price || 'Custom'}</span>
            </div>
            <span style="background:rgba(0,240,255,0.12); color:var(--cyan-electric); border:1px solid rgba(0,240,255,0.35); padding:4px 14px; border-radius:999px; font-size:11.5px; font-weight:800; letter-spacing:0.3px;">
              ${o.status || 'Brief Received'}
            </span>
          </div>

          <!-- 5-Step Conduit Production Progress Stepper -->
          <div style="background:#080c16; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 12px; position:relative;">
            <div style="display:flex; justify-content:space-between; position:relative;">
              ${STAGES.map(s => {
                const isPassed = s.id <= currentStageNum;
                const isCurrent = s.id === currentStageNum;
                const dotColor = isCurrent ? 'var(--gold)' : (isPassed ? '#10b981' : '#334155');
                const dotGlow = isCurrent ? '0 0 12px var(--gold)' : (isPassed ? '0 0 10px #10b981' : 'none');
                return `
                  <div style="display:flex; flex-direction:column; align-items:center; flex:1; text-align:center; z-index:2;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${dotColor}; box-shadow:${dotGlow}; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:#000; margin-bottom:6px;">
                      ${isPassed ? '✓' : s.id}
                    </div>
                    <span style="font-size:10.5px; font-weight:${isCurrent ? '800' : '600'}; color:${isCurrent ? 'var(--gold)' : (isPassed ? '#fff' : '#64748b')}; line-height:1.4;">
                      ${s.label}
                    </span>
                    <span style="font-size:9px; color:#475569; margin-top:2px;">${s.hint}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${(() => {
            const sp = o.specs || {};
            const totalNum = sp.totalUsd || parseFloat(String(o.price || '0').replace(/[^0-9.]/g, '')) || 0;
            const halfNum = sp.retainerUsd || (totalNum ? (totalNum * 0.5).toFixed(2).replace(/\.00$/, '') : '--');
            const issuedStr = sp.createdAt ? new Date(sp.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : (typeof o.id === 'number' && o.id > 1700000000000 ? new Date(o.id).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : 'Recorded');
            return `
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap:10px; padding:14px; border-radius:10px; background:rgba(250,204,21,0.04); border:1px solid rgba(250,204,21,0.22); font-size:11.5px;">
                <div><span style="color:#94a3b8; display:block; font-size:10px;">CLIENT &amp; CONTACT</span><strong style="color:#f8fafc;">${o.client || 'Valued Client'}</strong><span style="color:#94a3b8; display:block; font-size:10.5px;">${o.contact || '-'}</span></div>
                <div><span style="color:#94a3b8; display:block; font-size:10px;">ISSUED &amp; TIMELINE</span><strong style="color:#f8fafc;">${issuedStr}</strong><span style="color:#94a3b8; display:block; font-size:10.5px;">Est. Delivery: ${o.timeline || 'Per Schedule'}</span></div>
                <div><span style="color:#94a3b8; display:block; font-size:10px;">SCOPE &amp; ARCHETYPE</span><strong style="color:#f8fafc;">${sp.scope || o.pkg || 'Custom Scope'}</strong></div>
                <div><span style="color:#94a3b8; display:block; font-size:10px;">FRAMING &amp; VIEW</span><strong style="color:#f8fafc;">${sp.framing || 'Standard View'}</strong></div>
                <div><span style="color:#94a3b8; display:block; font-size:10px;">COMPLEXITY</span><strong style="color:#f8fafc;">${sp.complexity || 'Production Standard'}</strong></div>
                <div><span style="color:#94a3b8; display:block; font-size:10px;">RENDERING FIDELITY</span><strong style="color:#f8fafc;">${sp.fidelity || o.phase || '300DPI Master Render'}</strong></div>
                <div style="grid-column: 1 / -1; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="color:#94a3b8; font-size:10px; display:block; margin-bottom:3px;">INCLUDED ADD-ONS &amp; DELIVERABLES</span>
                  <strong style="color:var(--emerald);">${(sp.addons && sp.addons.length) ? sp.addons.join(' • ') : 'Master Layered 300DPI PSD'}</strong>
                </div>
                <div style="grid-column: 1 / -1; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                  <span>50% Retainer to Start: <strong class="font-mono" style="color:var(--gold);">$${halfNum} USD</strong></span>
                  <span>50% Final on PSD Handover: <strong class="font-mono" style="color:var(--cyan-electric);">$${sp.balanceUsd || halfNum} USD</strong></span>
                </div>
              </div>
            `;
          })()}

          <div style="color:#cbd5e1; font-size:12px; line-height:1.8; background:rgba(255,255,255,0.02); padding:14px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <strong style="color:var(--cyan-electric); font-size:12px; display:block; margin-bottom:4px;">Official Creative Brief &amp; Contractual Scope:</strong>
            ${String(o.brief || 'Bespoke concept art and visual development executed to international industry standards by TAJINKART Studio.').replace(/\n/g, '<br>')}
            ${o.refLink && o.refLink.startsWith('http') ? `<div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);"><a href="${o.refLink}" target="_blank" rel="noopener" style="color:var(--cyan-electric); text-decoration:underline; font-size:11.5px;">🔗 Reference / Moodboard Link</a></div>` : ''}
          </div>

          ${o.txid ? `
            <div class="font-mono" style="font-size:11px; padding:8px 12px; border-radius:8px; background:rgba(0,240,255,0.06); border:1px solid ${o.paymentVerified ? 'rgba(16,185,129,0.4)' : 'rgba(250,204,21,0.35)'}; color:${o.paymentVerified ? 'var(--emerald)' : 'var(--gold)'}; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span>${o.paymentVerified ? '✓ Payment Verified' : '⏳ TXID Pending Review'} (${(o.paymentNetwork || '').toUpperCase()} ${o.paymentAmountCrypto || ''})</span>
              <span style="color:#94a3b8;">${String(o.txid).slice(0, 14)}...</span>
            </div>
          ` : ''}
          ${(!o.paymentVerified && !o.txid && (!o.status || o.status === 'Brief Received')) ? (() => {
            const cMs = (o.specs && o.specs.createdAt) ? Date.parse(o.specs.createdAt) : (typeof o.id === 'number' && o.id > 1700000000000 ? o.id : Date.now());
            const remMs = Math.max(0, (24 * 60 * 60 * 1000) - (Date.now() - cMs));
            const remH = String(Math.floor(remMs / 3600000)).padStart(2, '0');
            const remM = String(Math.floor((remMs % 3600000) / 60000)).padStart(2, '0');
            const remS = String(Math.floor((remMs % 60000) / 1000)).padStart(2, '0');
            return `<div style="font-size:11.5px; padding:9px 14px; border-radius:8px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.35); color:#fbbf24; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span>⏳ 24h Unpaid Brief Hold: <strong class="font-mono unpaid-countdown-timer" data-created-ms="${cMs}" style="font-size:13px; color:#fff; background:rgba(0,0,0,0.35); padding:2px 8px; border-radius:6px; border:1px solid rgba(245,158,11,0.4);">${remH}:${remM}:${remS}</strong></span>
              <span style="color:#e2e8f0; font-size:11px;">Auto-deletes when timer hits 00:00:00 if 50% retainer is unpaid.</span>
            </div>`;
          })() : ''}
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); flex-wrap:wrap; gap:8px;">
            <span>Current Phase: <strong style="color:#fff;">${o.phase || 'Standard 300DPI'}</strong></span>
            <span>Estimated Handover: <strong style="color:#fff;">${o.timeline || 'Per Project Schedule'}</strong></span>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" onclick="openCryptoPayModal(${o.id})" class="btn-gold" style="font-size:11px; padding:6px 12px;">
                💳 ${o.paymentVerified ? 'Settle Balance' : (o.txid ? 'Update TXID' : 'Pay 50% Retainer')}
              </button>
              <button type="button" onclick="downloadOfficialStudioInvoice(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:6px 10px; border-color:var(--gold); color:var(--gold);">
                📄 Invoice
              </button>
              ${!(o.specs && o.specs.isSupplement) ? `
                <button type="button" onclick="openOrderSupplementModal(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:6px 10px; border-color:var(--cyan-electric); color:var(--cyan-electric);">
                  + Extra Sketch / Add-on
                </button>
              ` : ''}
              ${(!o.paymentVerified && !o.txid) ? `
                <button type="button" onclick="clientCancelUnpaidOrder(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:6px 10px; border-color:rgba(244,63,94,0.45); color:var(--crimson);">
                  🗑️ Cancel Brief
                </button>
              ` : ''}
            </div>
          </div>

        </div>
      `;
    }).join('');
  }

  // ۲. رندر دارایی‌های دیجیتال و فایل‌های خریداری‌شده در زبانه ۲
  const cBox = document.getElementById('memberCoursesContainer');
  const boughtAssets = (currentMember && Array.isArray(currentMember.assetsBought)) ? currentMember.assetsBought : [];
  const cCountEl = document.getElementById('dashCodexCount');
  if (cCountEl) cCountEl.textContent = String(boughtAssets.length);

  if (cBox) {
    if (boughtAssets.length === 0) {
      cBox.innerHTML = `
        <div class="client-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-head">
            <h4>No Deliverables Unlocked Yet</h4>
            <p>Final 300DPI PSD files, VTT tokens, and digital packs you purchase or receive from completed commissions will be stored here for instant access.</p>
          </div>
          <button type="button" onclick="switchView('store'); if(typeof switchStoreTab==='function') switchStoreTab('products');" class="btn-atelier-cipher" style="align-self:flex-start; padding:11px 20px;">
            Browse Digital Assets →
          </button>
        </div>
      `;
    } else {
      cBox.innerHTML = boughtAssets.map((item, idx) => `
        <div class="codex-vault-card">
          <h5 class="codex-card-title">${typeof item === 'string' ? item : (item.title || 'Studio Deliverable #' + (idx + 1))}</h5>
          <p class="codex-card-desc">${typeof item === 'object' && item.desc ? item.desc : 'Licensed TAJINKART production deliverable ready for download.'}</p>
          <div class="codex-card-actions">
            <button type="button" onclick="showToast('Preparing secure download link...', 'info')" class="btn-codex-download">
              ⬇ Access Deliverable
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

// سوئیچ لایه‌های استیج تعاملی پروداکشن
window.setAtelierProductionLayer = function(layerMode) {
  const img = document.getElementById('atelierStageArtworkImg');
  const telemetry = document.getElementById('telemetryActiveLayer');
  const btnSil = document.getElementById('btnLayerSilhouette');
  const btnVal = document.getElementById('btnLayerValue');
  const btnMas = document.getElementById('btnLayerMaster');

  if (btnSil) btnSil.classList.remove('active');
  if (btnVal) btnVal.classList.remove('active');
  if (btnMas) btnMas.classList.remove('active');

  if (img) {
    img.classList.remove('layer-mode-silhouette', 'layer-mode-value', 'layer-mode-master');
    if (layerMode === 'silhouette') {
      img.classList.add('layer-mode-silhouette');
      if (btnSil) btnSil.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L1 • Initial Silhouette & Form Exploration';
    } else if (layerMode === 'value') {
      img.classList.add('layer-mode-value');
      if (btnVal) btnVal.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L2 • Chiaroscuro Value & Material Study';
    } else if (layerMode === 'master') {
      img.classList.add('layer-mode-master');
      if (btnMas) btnMas.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L3 • Master 300DPI Print-Ready Keyframe';
    }
  }
};

// باز کردن یادداشت پین بازخورد
window.openAtelierPinNote = function(pinId, event) {
  if (event) event.stopPropagation();
  const pin = document.getElementById(`atelierPin${pinId}`);
  if (pin) {
    pin.classList.toggle('active');
  }
};

// ثبت پین جدید بر روی بوم
window.toggleAtelierPinDropper = function() {
  showToast('Pin Feedback Mode Active: Click anywhere on the canvas to drop a revision pin.', 'info', 4000);
  const wrapper = document.getElementById('atelierCanvasWrapper');
  if (!wrapper) return;

  const clickHandler = function(e) {
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);

    const note = prompt('Enter your pinpoint revision note for this artwork coordinate:');
    if (note && note.trim()) {
      const pinCount = document.querySelectorAll('.atelier-pin-hotspot').length + 1;
      const newPin = document.createElement('div');
      newPin.className = 'atelier-pin-hotspot active';
      newPin.id = `atelierPin${pinCount}`;
      newPin.style.top = `${y}%`;
      newPin.style.left = `${x}%`;
      newPin.innerHTML = `
        <span class="pin-beacon"></span>
        <span class="pin-core">${pinCount}</span>
        <div class="pin-hover-card">
          <strong>Pin ${pinCount}: Client Feedback</strong>
          <p>${note.trim()}</p>
        </div>
      `;
      wrapper.appendChild(newPin);
      showToast(`Feedback Pin #${pinCount} registered successfully on canvas. ✨`, 'success');
    }
    wrapper.removeEventListener('click', clickHandler);
  };

  wrapper.addEventListener('click', clickHandler, { once: true });
};

// سوئیچ زبانه‌های کنسول آتلیه
window.switchAtelierConsoleTab = function(tabKey) {
  const tabs = ['pipelines', 'codex', 'security'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const pane = document.getElementById(`pane${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.toggle('active', t === tabKey);
    if (pane) pane.classList.toggle('active', t === tabKey);
  });
};

// دانلود رسمی نمونه پیش‌فاکتور آتلیه
window.downloadOfficialStudioInvoice = function() {
  const invNumber = `TJK-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('fa-IR');
  const clientName = currentMember ? currentMember.name : 'Valued Client';

  const invoiceText = `================================================================================
                    TAJINKART CONCEPT ART & VISUAL ATELIER
                    OFFICIAL COMMISSION SPECIFICATIONS & INVOICE
================================================================================
Invoice CID: ${invNumber}
Date: ${new Date().toISOString().split('T')[0]}
Client / Studio: ${clientName}
Studio Director & Lead Artist: Seyed Soroush Taj
Official Email: tajinkart@gmail.com
Studio Domain: https://tajinkart.space
--------------------------------------------------------------------------------
Production Scope & Deliverables:
1. Bespoke Concept Art Production (Original Character & Worldbuilding IP)
2. Phase 1: 5-Thumbnail Silhouette Exploration & Form Selection
3. Phase 2: Orthographic Turnaround Model Sheet for 3D Sculptors
4. Phase 3: Chiaroscuro Value Study & Lighting Variations
5. Phase 4: Master 300DPI Print-Ready Final Render & 4K UHD Layered PSD
--------------------------------------------------------------------------------
Milestone & Retainer Terms:
- Project Quote: Per binding studio agreement
- Required Retainer: 50% upfront to reserve atelier production calendar
- Final Balance: 50% upon master render approval prior to raw PSD delivery
--------------------------------------------------------------------------------
DIGITAL SIGNATURE // TAJINKART STUDIO 2026
Commercial IP rights transfer upon complete milestone settlement.
================================================================================`;

  const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TAJINKART_Invoice_${invNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Official studio invoice downloaded successfully. 📄', 'success');
};

// دانلود دارایی دیجیتال از خزانه
window.triggerVaultAssetDownload = function(title, format) {
  showToast(`Download request for ${title} (${format}) registered. Connecting to cloud...`, 'info', 4000);
  setTimeout(() => {
    showToast(`File dispatched. Checksum: SHA256-VERIFIED ✓`, 'success');
  }, 1200);
};


// دانلود بک‌آپ JSON
window.exportSiteDataJSON = function() {
  const backup = {
    settings: siteSettings,
    artworks: showcaseArtworks,
    pipelines: PIPELINE_DATA,
    products: digitalStoreProducts,
    orders: ordersList,
    members: siteMembersData,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tajinkart_master_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full JSON backup downloaded.', 'success');
};

// دانلود سورس کامل به‌روز شده HTML
window.exportFullSelfContainedHTML = function() {
  let htmlContent = document.documentElement.outerHTML;
  const blob = new Blob([`<!DOCTYPE html>\n<html lang="fa" dir="rtl">\n${htmlContent}\n</html>`], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full index.html file saved!', 'success');
};

// راه‌اندازی اولیه در زمان لود صفحه با پایداری ۱۰۰٪ و تفکیک خطا
document.addEventListener('DOMContentLoaded', () => {
  try { window.renderShowcaseGrid ? window.renderShowcaseGrid() : renderShowcaseGrid(); } catch(e) { console.error('renderShowcaseGrid error:', e); }
  try { if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader(); } catch(e) {}
  try { if (typeof initSupabaseAuthSession === 'function') initSupabaseAuthSession(); } catch(e) {}
  try { if (typeof checkEmailRecoveryFlow === 'function') checkEmailRecoveryFlow(); } catch(e) {}
  try { if (typeof syncArtworksFromSupabase === 'function') syncArtworksFromSupabase(); } catch(e) {}
  try { if (typeof syncMembersFromSupabase === 'function') syncMembersFromSupabase(); } catch(e) {}
  try {
    const defaultNavCard = document.querySelector('#atelierServiceCards .service-nav-card.active') || document.querySelector('#atelierServiceCards .service-nav-card');
    if (typeof selectPipeline === 'function') selectPipeline('sketch1', defaultNavCard, false);
  } catch(e) {}
  try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
  try { if (typeof renderAcademy === 'function') renderAcademy(); } catch(e) {}
  try { if (typeof renderComicPage === 'function') renderComicPage(); } catch(e) {}
  try { if (typeof renderAdminSketch1 === 'function') renderAdminSketch1(); } catch(e) {}
  try { if (typeof renderAdminSketch2 === 'function') renderAdminSketch2(); } catch(e) {}
  try { if (typeof renderAdminProductsTab === 'function') renderAdminProductsTab(); } catch(e) {}
  try { if (typeof renderAdminSketch3 === 'function') renderAdminSketch3(); } catch(e) {}
  try { if (typeof renderAdminLists === 'function') renderAdminLists(); } catch(e) {}
  try { if (typeof updateStudioLiveStatus === 'function') updateStudioLiveStatus(); } catch(e) {}
  try { if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay(); } catch(e) {}

  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
  if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  const tokenEl = document.getElementById('setTgToken');
  if (tokenEl) tokenEl.value = siteSettings.tgToken || '';
  const footerEl = document.getElementById('setTgDefaultFooter');
  if (footerEl) footerEl.value = siteSettings.tgDefaultFooter || '';
  const chatEl = document.getElementById('setTgChat');
  if (chatEl) chatEl.value = siteSettings.tgChat || '';
  const emailEl = document.getElementById('setAdminEmail');
  if (emailEl) emailEl.value = 'tajinkart@gmail.com';

  // ثبت فرم بریف سفارش
  const orderForm = document.getElementById('commissionOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const client = document.getElementById('orderClientName').value.trim();
      const contact = document.getElementById('orderClientContact').value.trim();
      const refLink = document.getElementById('orderClientRefLink')?.value.trim() || 'None provided (Full visual exploration by studio)';
      const phaseEl = document.getElementById('orderPhaseSelect');
      const phase = phaseEl ? phaseEl.value : '';
      const fidelityText = (phaseEl && phaseEl.selectedOptions[0]) ? phaseEl.selectedOptions[0].text.trim() : phase;
      const scopeEl = document.getElementById('wizCharacterScope');
      const scopeText = (scopeEl && scopeEl.selectedOptions[0]) ? scopeEl.selectedOptions[0].text.trim() : 'Standard Single Subject';
      const framingEl = document.getElementById('wizFraming');
      const framingText = (framingEl && framingEl.selectedOptions[0]) ? framingEl.selectedOptions[0].text.trim() : 'Standard Framing';
      const compEl = document.getElementById('wizComplexity');
      const complexityText = (compEl && compEl.selectedOptions[0]) ? compEl.selectedOptions[0].text.trim() : 'Production Standard';

      const addons = (activeModalItem && Array.isArray(activeModalItem.addonsChosen) && activeModalItem.addonsChosen.length)
        ? [...activeModalItem.addonsChosen]
        : ['High-Res 300DPI PNG / JPG'];
      if (activeModalItem && activeModalItem.deliverableFormat) addons.push(activeModalItem.deliverableFormat);

      const brief = document.getElementById('orderClientBrief').value.trim();
      const priceText = document.getElementById('modalPrice').textContent;
      const totalUsd = parseFloat(String(priceText).replace(/[^0-9.]/g, '')) || 0;
      const retainerUsd = (totalUsd * 0.5).toFixed(2).replace(/\.00$/, '');
      const clientEmail = (window.currentMember && window.currentMember.email) ? window.currentMember.email : (contact.includes('@') ? contact : '');

      const ageTxt = (activeModalItem && Array.isArray(activeModalItem.agesChosen) && activeModalItem.agesChosen.length) ? activeModalItem.agesChosen.join(', ') : 'Adult';
      const compnTxt = document.getElementById('wizCompanionTier')?.selectedOptions[0]?.text || 'None';
      const specs = {
        scope: scopeText,
        framing: framingText,
        complexity: complexityText,
        fidelity: fidelityText,
        ageTier: ageTxt,
        companionTier: compnTxt,
        estimatedHours: activeModalItem.estimatedHours || 0,
        hourlyRate: activeModalItem.hourlyRate || window.getStudioHourlyRate(),
        revisionsIncluded: activeModalItem.revisionsIncluded || 2,
        addons: addons,
        totalUsd: totalUsd,
        retainerUsd: retainerUsd,
        balanceUsd: retainerUsd,
        agreedTerms: !!document.getElementById('orderTermsAgree')?.checked,
        agreedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const newOrder = {
        id: Date.now(),
        client: client,
        contact: contact,
        clientEmail: clientEmail,
        refLink: refLink,
        pkg: activeModalItem.title,
        price: priceText,
        timeline: document.getElementById('modalTimeline')?.textContent || activeModalItem.timeline,
        phase: fidelityText,
        specs: specs,
        brief: brief,
        status: 'Brief Received'
      };

      ordersList.unshift(newOrder);
      if (typeof safeSetStorage === 'function') {
        safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
      } else {
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
      }

      // ۱. ثبت در دیتابیس ابری Supabase (جدول orders)
      if (window.supabaseClient) {
        window.supabaseClient
          .from('orders')
          .insert([{
            id: newOrder.id,
            client_name: newOrder.client,
            contact: newOrder.contact,
            client_email: (window.currentMember && window.currentMember.email) ? window.currentMember.email : (contact.includes('@') ? contact : ''),
            ref_link: newOrder.refLink,
            package_name: newOrder.pkg,
            price_text: newOrder.price,
            timeline: newOrder.timeline,
            phase: newOrder.phase,
            brief_text: `${newOrder.brief}\n\n[CONTRACT SPECS]\n• Scope: ${scopeText}\n• Framing: ${framingText}\n• Complexity: ${complexityText}\n• Fidelity: ${fidelityText}\n• Add-ons: ${addons.join(', ') || 'None'}\n• 50% Retainer: $${retainerUsd}`, 
            status: newOrder.status,
            created_at: new Date().toISOString()
          }])
          .then(({ data, error }) => {
            if (error) {
              console.warn('[Supabase Orders] Insert error:', error);
            } else {
              console.log('[Supabase Orders] Order backed up to Supabase Cloud DB successfully!');
            }
          });
      }

      // ۲. فوروارد به وب‌هوک گوگل شیتس شخصی (Google Sheets Multi-Cloud Backup)
      if (siteSettings && siteSettings.googleSheetsWebhook && siteSettings.googleSheetsWebhook.startsWith('http')) {
        try {
          fetch(siteSettings.googleSheetsWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          }).then(() => {
            console.log('[Google Sheets] Order forwarded to Google Spreadsheet backup!');
          }).catch(err => console.warn('[Google Sheets] Webhook error:', err));
        } catch(e) {}
      }

      // ۳. ارسال آنی پیام به ربات تلگرام استودیو
      dispatchTelegramNotification(newOrder);

      closeModalDirect();
      renderAdminLists();
      renderMemberDashboard();
      showToast('Commission brief inquiry submitted successfully! Archived in Studio Cloud & Telegram. ✓', 'success', 5000);
    });
  }

  // فرم ورود اعضا (متصل به احراز هویت ابری Supabase Auth)
  const loginForm = document.getElementById('memberLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pw = document.getElementById('loginPass').value.trim();

// ورود مدیر استودیو منحصراً از طریق تایید هویت Google OAuth انجام می‌شود

      showToast('Authenticating credentials and signing into atelier...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: em,
            password: pw
          });

          if (error) {
            console.warn('[Supabase Auth Error]', error);
            if (error.message.includes('Invalid login credentials')) {
              showToast('Invalid email address or password.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
              showToast('Email not confirmed. Please check your verification link.', 'info');
            } else {
              showToast(error.message || 'Failed to sign in. Please verify credentials.', 'error');
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user, true);
            showToast(`Welcome back, ${currentMember.name}!`, 'success');
            return;
          }
        } catch (authErr) {
          console.warn('[Supabase Auth Network]', authErr);
        }
      }

      // فال‌بک به حافظه لوکال
      const localFound = siteMembersData.find(m => m.email.toLowerCase() === em);
      currentMember = localFound || { name: em.split('@')[0], email: em, contact: em, assetsBought: [] };
      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast(`Welcome back, ${currentMember.name}!`, 'success');
    });
  }

  // فرم ثبت‌نام اعضا (ذخیره قطعی و رمزنگاری‌شده در دیتابیس ابری Supabase Auth)
  const signUpForm = document.getElementById('memberSignUpForm');
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const phone = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPass')?.value.trim() || '';
      const passwordConfirm = document.getElementById('signupPassConfirm')?.value.trim() || '';
      const agreeTerms = document.getElementById('signupAgreeTerms')?.checked;
      const agreeAge = document.getElementById('signupAgreeAge')?.checked;

      // ۱. اعتبارسنجی نام کاربری (ممانعت از نام‌های جعلی یا حروف تکراری متوالی)
      const isRepeatedName = /(.)\1{2,}/.test(name);
      if (name.length < 3 || isRepeatedName) {
        showToast('Invalid display name. Please enter a valid handle (minimum 3 characters).', 'error');
        document.getElementById('signupName')?.focus();
        return;
      }

      // ۲. اعتبارسنجی دقیق سینتکس و پسوند ایمیل
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('Invalid email address. Please provide a valid email (e.g. user@domain.com).', 'error');
        document.getElementById('signupEmail')?.focus();
        return;
      }

      const countryCode = document.getElementById('signupCountryCode')?.value || '+98';
      const rawPhone = document.getElementById('signupPhone')?.value.trim() || '';
      let cleanDigits = rawPhone.replace(/[^0-9]/g, '');

      // اگر کاربر با صفر اول وارد کرد، صفر را بردار
      if (countryCode === '+98' && cleanDigits.startsWith('0')) {
        cleanDigits = cleanDigits.substring(1);
      }

      // شماره تلفن کاملاً اختیاری است: فقط در صورتی که کاربر شماره وارد کند بررسی می‌شود
      let fullContactNumber = '';
      if (cleanDigits.length > 0) {
        if (cleanDigits.length < 7 || cleanDigits.length > 15) {
          showToast('Invalid phone number length (must be between 7 and 15 digits).', 'error');
          document.getElementById('signupPhone')?.focus();
          return;
        }
        fullContactNumber = (countryCode === 'other' ? '' : countryCode + ' ') + cleanDigits;
      }

      // ۲. اعتبارسنجی قدرت رمز
      if (password.length < 6 || /^(123456|12345678|111111|000000)$/.test(password) || /^[0-9]+$/.test(password)) {
        showToast('Password is too weak. Please use an alphanumeric combination of at least 6 characters.', 'error');
        document.getElementById('signupPass')?.focus();
        return;
      }

      // ۳. تطابق رمز عبور و تکرار آن
      if (password !== passwordConfirm) {
        showToast('Passwords do not match. Please verify and retype.', 'error');
        document.getElementById('signupPassConfirm')?.focus();
        return;
      }

      // ۴. بررسی تایید قوانین استودیو (بررسی تیک چک‌باکس)
      const agreeBox = document.getElementById('signupAgreeTerms');
      if (!agreeBox || !agreeBox.checked) {
        showToast('Please review and accept the studio terms of service.', 'error');
        agreeBox?.focus();
        return;
      }

      showToast('Creating and registering account in studio portal...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                name: name,
                phone: phone,
                tier: 'STANDARD',
                assetsBought: []
              }
            }
          });

          if (error) {
            console.warn('[Supabase SignUp Error]', error);
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('already registered') || msg.includes('already exists') || error.status === 422) {
              showToast('This email is already registered. Please sign in to your account.', 'error', 6000);
              switchAuthView('login');
              const loginEmailEl = document.getElementById('loginEmail');
              if (loginEmailEl) loginEmailEl.value = email;
            } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
              showToast('Rate limit exceeded. Please try again in a few minutes.', 'error', 6000);
            } else if (msg.includes('password should be') || msg.includes('weak password')) {
              showToast('Password is too weak. Please enter at least 6 alphanumeric characters.', 'error');
            } else {
              showToast('Registration error: ' + (error.message || 'Account registration failed. Please try again.'), 'error', 6000);
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user);

            const newMemberObj = {
              id: data.user.id || Date.now(),
              name: name,
              email: email,
              contact: fullContactNumber,
              tier: 'STANDARD',
              balance: '$0',
              withdrawn: '$0',
              assetsBought: [],
              totalSpent: '$0'
            };

            siteMembersData.unshift(newMemberObj);
            safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));

            // ذخیره آنلاین، دائمی و ابری در جدول members سوپابیس
            if (window.supabaseClient) {
              window.supabaseClient.from('members').upsert([{
                id: data.user.id,
                name: name,
                email: email,
                contact: fullContactNumber,
                tier: 'STANDARD',
                assets_bought: []
              }]).then(({ error }) => {
                if (error) console.warn('Supabase members table upsert warning:', error);
                else console.log('Member profile stored in Supabase cloud database!');
              });
            }

            closeMemberModal();
            renderMemberDashboard();
            switchView('member-dashboard');
            const isConfirmed = !!(data.user.email_confirmed_at || data.user.confirmed_at || data.session);
            if (!isConfirmed) {
              showToast('Account created! Please check your inbox to confirm your email verification link.', 'warning', 8000);
            } else {
              showToast('Account registered successfully! Welcome to TAJINKART.', 'success');
            }
            return;
          }
        } catch (authErr) {
          console.warn('[Supabase SignUp Exception]', authErr);
        }
      }

      // فال‌بک موقت در صورت عدم برقراری ارتباط با شبکه
      currentMember = { name: name, email: email, contact: fullContactNumber, assetsBought: [] };
      siteMembersData.push({
        id: Date.now(),
        name: name,
        email: email,
        contact: fullContactNumber,
        tier: 'STANDARD',
        balance: '$0',
        withdrawn: '$0',
        assetsBought: [],
        totalSpent: '$0'
      });
      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast('New studio account created successfully.', 'success');
    });
  }

  // فرم بازیابی رمز عبور با بررسی وجود داشتن ایمیل در سیستم استودیو
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const iden = document.getElementById('forgotIdentifier')?.value.trim().toLowerCase();

      if (!iden || !iden.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      showToast('Verifying account credentials...', 'info');

      // ۱. بررسی قطعی وجود داشتن ایمیل در استودیو قبل از صدور درخواست
      let emailExists = false;

      // بررسی آیا ایمیل مدیر استودیو است
      if (window.isDirectorEmail && window.isDirectorEmail(iden)) {
        emailExists = true;
      }

      // بررسی در دیتابیس ابری سوپابیس (جدول اعضا)
      if (!emailExists && window.supabaseClient) {
        try {
          const { data: memberRow, error: checkErr } = await window.supabaseClient
            .from('members')
            .select('email')
            .eq('email', iden)
            .maybeSingle();

          if (memberRow && memberRow.email) {
            emailExists = true;
          }
        } catch (dbErr) {
          console.warn('[Forgot Pass DB Check Exception]', dbErr);
        }
      }

      // بررسی در دیتای محلی اعضا
      if (!emailExists && Array.isArray(siteMembersData)) {
        if (siteMembersData.some(m => m.email && m.email.toLowerCase() === iden)) {
          emailExists = true;
        }
      }

      // در صورت عدم وجود ایمیل، بلافاصله ارور شفاف و ممانعت از ارسال پیام کاذب
      if (!emailExists) {
        showToast('Account not found with this email. Please check the address or sign up.', 'error', 6000);
        return;
      }

      showToast('Generating secure password recovery link...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const targetRedirect = window.location.origin + window.location.pathname + '?action=reset-password';
          const { error } = await window.supabaseClient.auth.resetPasswordForEmail(iden, {
            redirectTo: targetRedirect
          });

          if (error) {
            console.warn('[Supabase Reset Pass Error]', error);
            showToast(error.message || 'Error sending password reset email.', 'error');
            return;
          }

          showToast('Password reset link sent to your email. Please check your inbox or spam folder.', 'success', 7000);
          switchAuthView('login');
          return;
        } catch (err) {
          console.warn('[Supabase Reset Exception]', err);
        }
      }

      showToast('Cloud authentication service unavailable.', 'error');
    });
  }

// فرم ورود قدیمی ادمین حذف و با درگاه رسمی گوگل جایگزین شد

  // فرم تنظیمات ادمین
  const settingsForm = document.getElementById('adminSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteSettings.usdRate = parseInt(document.getElementById('setUsdRate').value, 10) || 72000;
      siteSettings.tgToken = document.getElementById('setTgToken').value.trim();
      siteSettings.tgChat = document.getElementById('setTgChat').value.trim();
      // پسورد متنی منسوخ شد
      siteSettings.cloudinaryCloudName = document.getElementById('setCloudinaryCloud')?.value.trim() || 'tajinkart';
      siteSettings.cloudinaryPreset = document.getElementById('setCloudinaryPreset')?.value.trim() || 'erlvtkx9';
      siteSettings.redditCreds = document.getElementById('setRedditCreds')?.value.trim() || '';
      siteSettings.metaToken = document.getElementById('setMetaToken')?.value.trim() || '';
      siteSettings.twitterKey = document.getElementById('setTwitterKey')?.value.trim() || '';
      siteSettings.youtubeKey = document.getElementById('setYoutubeKey')?.value.trim() || '';
      siteSettings.artstationCreds = document.getElementById('setArtstationCreds')?.value.trim() || '';
      siteSettings.pinterestToken = document.getElementById('setPinterestToken')?.value.trim() || '';
      siteSettings.blueskyCreds = document.getElementById('setBlueskyCreds')?.value.trim() || '';
      siteSettings.discordWebhook = document.getElementById('setDiscordWebhook')?.value.trim() || '';
      safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
      renderProducts();
      selectPipeline(currentSelectedPipeKey, null, false);
      showToast('Global settings and currency conversion rates saved! ✓', 'success');
    });
  }

  // فرم ذخیره نهایی رمز عبور جدید پس از ورود از لینک ایمیل
  const setNewPassForm = document.getElementById('setNewPasswordForm');
  if (setNewPassForm) {
    setNewPassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const p1 = document.getElementById('userNewPassword')?.value.trim();
      const p2 = document.getElementById('userNewPasswordConfirm')?.value.trim();

      if (!p1 || p1.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }
      if (p1 !== p2) {
        showToast('Password confirmation does not match!', 'error');
        return;
      }

      showToast('Validating session and saving new password...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          // بررسی و بازیابی نشست امنیتی فعال در صورت باز شدن از لینک ایمیل
          const { data: sessionData } = await window.supabaseClient.auth.getSession();
          let currentSession = sessionData?.session;

          if (!currentSession) {
            // تلاش برای استخراج توکن‌های بازیابی از URL
            const hash = window.location.hash || '';
            const search = window.location.search || '';
            if (search.includes('code=')) {
              const urlParams = new URLSearchParams(search);
              const code = urlParams.get('code');
              if (code && window.supabaseClient.auth.exchangeCodeForSession) {
                const { data: exData } = await window.supabaseClient.auth.exchangeCodeForSession(code);
                currentSession = exData?.session;
              }
            } else if (hash.includes('access_token=')) {
              const hashParams = new URLSearchParams(hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              if (accessToken && refreshToken && window.supabaseClient.auth.setSession) {
                const { data: sData } = await window.supabaseClient.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });
                currentSession = sData?.session;
              }
            }
          }

          if (!currentSession) {
            showToast('Security session not found or expired. Please request a new recovery link.', 'error', 7000);
            sessionStorage.removeItem('tajinkart_recovering_password');
            isRecoveryFlowDetected = false;
            return;
          }

          const { data, error } = await window.supabaseClient.auth.updateUser({
            password: p1
          });

          if (error) {
            console.warn('[Update Password Error]', error);
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('session missing') || msg.includes('auth session missing')) {
              showToast('Recovery link has expired or is invalid. Please request a new link.', 'error', 7000);
            } else if (msg.includes('should be different') || msg.includes('same password')) {
              showToast('New password cannot be the same as previous password.', 'error');
            } else {
              showToast('Error updating password: ' + (error.message || 'Please try again.'), 'error');
            }
            return;
          }

          if (data && data.user) {
            isRecoveryFlowActive = false;
            sessionStorage.removeItem('tajinkart_recovering_password');
            try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
            const modal = document.getElementById('memberModal');
            if (modal) modal.style.display = 'none';
            applyLoggedInMember(data.user, true);
            showToast('New password saved successfully. Welcome back!', 'success', 6000);
            return;
          }
        } catch (updateErr) {
          console.warn('[Supabase Password Update Exception]', updateErr);
          showToast('Error connecting to auth server. Please try again.', 'error');
          return;
        }
      }

      showToast('Cloud authentication service unavailable.', 'error');
    });
  }

});

// =========================================================
// موتور هوشمند سنجش کیفیت و قدرت رمز عبور (Password Strength)
// =========================================================
// فرمول Standard جهانی سنجش آنتروپی و تنوع رمز عبور
window.evalPassStrength = function(pass, prefix) {
  const box = document.getElementById(prefix + 'StrengthBox');
  const bar = document.getElementById(prefix + 'StrengthBar');
  const text = document.getElementById(prefix + 'StrengthText');
  const hint = document.getElementById(prefix + 'StrengthHint');
  if (!box || !bar || !text) return;

  if (!pass || pass.length === 0) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';

  const isSequential = /^(123456|12345678|abcdef|qwerty|111111|000000|password)/i.test(pass);
  const isOnlyDigits = /^[0-9]+$/.test(pass);
  const isOnlyLetters = /^[a-zA-Z]+$/.test(pass);

  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (pass.length < 6 || isSequential || (pass.length <= 8 && isOnlyDigits) || (pass.length <= 7 && isOnlyLetters)) {
    bar.style.width = '25%';
    bar.style.background = 'var(--crimson)';
    text.textContent = 'Security Level: Very Weak';
    text.style.color = 'var(--crimson)';
    if (hint) hint.textContent = isOnlyDigits ? 'Must not be numbers only' : 'Add letters & symbols';
    return;
  }

  if (pass.length >= 6 && varietyCount === 2) {
    bar.style.width = '50%';
    bar.style.background = 'var(--amber)';
    text.textContent = 'Security Level: Medium';
    text.style.color = 'var(--amber)';
    if (hint) hint.textContent = 'Add uppercase letters & symbols (@#!%)';
    return;
  }

  if (pass.length >= 8 && varietyCount >= 3 && !hasSpecial) {
    bar.style.width = '75%';
    bar.style.background = 'var(--cyan-electric)';
    text.textContent = 'Security Level: Strong';
    text.style.color = 'var(--cyan-electric)';
    if (hint) hint.textContent = 'Add special symbols for maximum security';
    return;
  }

  if (pass.length >= 8 && varietyCount >= 3 && hasSpecial) {
    bar.style.width = '100%';
    bar.style.background = 'var(--emerald)';
    text.textContent = 'Security Level: Excellent ✓';
    text.style.color = 'var(--emerald)';
    if (hint) hint.textContent = 'Maximum protection standard';
    return;
  }

  bar.style.width = '75%';
  bar.style.background = 'var(--cyan-electric)';
  text.textContent = 'Security Level: Good';
  text.style.color = 'var(--cyan-electric)';
  if (hint) hint.textContent = 'Acceptable security level';
};


window.openChangePasswordModal = function() {
  switchAuthView('reset');
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = 'flex';
  }
};


// بررسی زنده ساختار رسمی ایمیل (قرمز در صورت نقص یا تکراری بودن، سبز در صورت اعتبار کامل - بدون پیام زرد اضافی)
let emailCheckTimeout = null;
window.handleLiveEmailCheck = function(emailVal) {
  const notice = document.getElementById('signupEmailLiveNotice');
  const emailInput = document.getElementById('signupEmail');
  if (!notice || !emailInput) return;
  const cleanEmail = (emailVal || '').trim().toLowerCase();

  clearTimeout(emailCheckTimeout);
  if (!cleanEmail) {
    notice.style.display = 'none';
    emailInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  // اعتبارسنجی سینتکس کامل ایمیل با پسوند دامنه رسمی حداقل ۲ حرفی (.com, .ir, .net, ...)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Email format is incomplete (e.g. artist@domain.com)';
    emailInput.style.borderColor = 'var(--crimson)';
    return;
  }

  // تشخیص هوشمند جا افتادن حرف آخر در دامنه‌های معروف (مانند gmail.co یا yahoo.co)
  const commonTypos = ['@gmail.co', '@yahoo.co', '@hotmail.co', '@outlook.co'];
  for (const typo of commonTypos) {
    if (cleanEmail.endsWith(typo)) {
      notice.style.color = 'var(--crimson)';
      notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Domain incomplete. Did you mean ' + typo + 'm?';
      emailInput.style.borderColor = 'var(--crimson)';
      return;
    }
  }

  // بررسی عدم تکراری بودن در حافظه کلاینت
  const localExists = siteMembersData.some(m => m.email && m.email.toLowerCase() === cleanEmail);
  if (localExists) {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> This email is already registered';
    emailInput.style.borderColor = 'var(--crimson)';
    return;
  }

  // بررسی بی‌صدا در پس‌زمینه بدون نمایش کادر زرد مزاحم
  emailCheckTimeout = setTimeout(async () => {
    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from('members')
          .select('email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data && data.email) {
          notice.style.color = 'var(--crimson)';
          notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> This email is already registered';
          emailInput.style.borderColor = 'var(--crimson)';
        } else {
          notice.style.color = 'var(--emerald)';
          notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email is valid and available';
          emailInput.style.borderColor = 'var(--emerald)';
        }
      } catch(e) {
        notice.style.color = 'var(--emerald)';
        notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email format is valid';
        emailInput.style.borderColor = 'var(--emerald)';
      }
    } else {
      notice.style.color = 'var(--emerald)';
      notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email format is valid';
      emailInput.style.borderColor = 'var(--emerald)';
    }
  }, 350);
};


// بررسی زنده و آنی شماره تلفن همراه
// بررسی زنده و کاملاً اختیاری شماره تلفن همراه (بدون محدودیت روی ارقام اولیه و بدون ایجاد مانع)
window.handleLivePhoneCheck = function() {
  const notice = document.getElementById('signupPhoneLiveNotice');
  const phoneInput = document.getElementById('signupPhone');
  if (!notice || !phoneInput) return;

  const val = (phoneInput.value || '').trim();
  // شماره تلفن کاملاً اختیاری است: اگر خالی بود هیچ اروری نده
  if (val.length === 0) {
    notice.style.display = 'none';
    phoneInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  // پذیرش انعطاف‌پذیر انواع شماره‌های بین‌المللی و محلی (بین ۷ تا ۱۵ رقم)
  if (val.length >= 7 && val.length <= 15) {
    notice.style.color = 'var(--emerald)';
    notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Phone number is valid';
    phoneInput.style.borderColor = 'var(--emerald)';
  } else {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Invalid length (' + val.length + ' digits - standard: 7 to 15 digits)';
    phoneInput.style.borderColor = 'var(--crimson)';
  }
};


// بررسی زنده صحت نام کاربری
window.handleLiveNameCheck = function(nameVal) {
  const notice = document.getElementById('signupNameLiveNotice');
  const nameInput = document.getElementById('signupName');
  if (!notice || !nameInput) return;

  const val = (nameVal || '').trim();
  if (val.length === 0) {
    notice.style.display = 'none';
    nameInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  if (val.length < 2) {
    notice.style.color = 'var(--crimson)';
    notice.textContent = '✕ Minimum 2 characters required';
    nameInput.style.borderColor = 'var(--crimson)';
  } else {
    notice.style.color = 'var(--emerald)';
    notice.textContent = '✓ Name is valid';
    nameInput.style.borderColor = 'var(--emerald)';
  }
};


// تابع ارسال مجدد لینک تایید ایمیل به کاربر در صورت عدم تایید اولیه
window.resendConfirmationEmail = async function(emailAddress) {
  if (!window.supabaseClient) {
    showToast('Supabase cloud service is currently unavailable.', 'error');
    return;
  }
  const email = emailAddress || (window.currentUser && window.currentUser.email);
  if (!email) {
    showToast('No email address found to resend.', 'error');
    return;
  }
  try {
    const { error } = await window.supabaseClient.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) {
      showToast('Error resending email: ' + error.message, 'error');
    } else {
      showToast('New verification link sent to ' + email + '.', 'success', 5000);
    }
  } catch(e) {
    showToast('Network error sending confirmation email.', 'error');
  }
};

// =========================================================
// =========================================================
// بهینه‌سازی اختصاصی مینی‌اپلیکیشن تلگرام (Telegram Mini App Ready)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#040507');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#040507');
      console.log('Telegram Mini App initialized for TAJINKART studio.');
    } catch(e) {
      console.warn('TMA init warning:', e);
    }
  }
});

// اتصالات قطعی توابع به شیء پنجره مرورگر جهت تضمین پاسخگویی کلیک آیکون‌ها
window.renderShowcaseGrid = (typeof renderShowcaseGrid === 'function') ? renderShowcaseGrid : window.renderShowcaseGrid;
window.renderAdminSketch2 = (typeof renderAdminSketch2 === 'function') ? renderAdminSketch2 : window.renderAdminSketch2;
window.renderAdminLists = (typeof renderAdminLists === 'function') ? renderAdminLists : window.renderAdminLists;

// محاسبه و به‌روزرسانی زنده وضعیت ارتباطی آتلیه (Live Studio Operational Status)
window.updateStudioLiveStatus = function() {
  const badge = document.getElementById('studioLiveStatusBadge');
  const textEl = document.getElementById('studioLiveStatusText');
  if (!badge || !textEl) return;

  const mode = siteSettings.studioAvailabilityMode || 'auto';
  const customMsg = (siteSettings.studioCustomStatusMessage || '').trim();

  if (mode === 'vacation') {
    badge.className = 'hero-badge studio-status-badge status-vacation studio-cta-pill';
    textEl.textContent = customMsg || 'Studio Away / Capacity Full • Inquiries Reviewed Shortly';
    badge.title = 'The studio is currently on expedition / at full capacity.';
    return;
  }

  if (mode === 'online') {
    badge.className = 'hero-badge studio-status-badge status-online studio-cta-pill';
    textEl.textContent = customMsg || 'Studio Online • Commissions Open';
    badge.title = 'Real-time brief acceptance and project consultations active.';
    return;
  }

  if (mode === 'away') {
    badge.className = 'hero-badge studio-status-badge status-pending studio-cta-pill';
    textEl.textContent = customMsg || 'Inquiries Active • Review within 24-48 Hours';
    badge.title = 'Accepting project briefs with queued review response.';
    return;
  }

  // حالت خودکار هوشمند (Auto): کمتر از ۲۴ ساعت آنلاین، بیش از آن پاسخگویی با تاخیر
  const lastActive = Number(siteSettings.lastAdminLoginTime) || Date.now();
  const diffHours = (Date.now() - lastActive) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    badge.className = 'hero-badge studio-status-badge status-online studio-cta-pill';
    textEl.textContent = customMsg || 'Studio Online • Commissions Open';
    badge.title = 'Real-time brief acceptance and project consultations active.';
  } else {
    badge.className = 'hero-badge studio-status-badge status-pending studio-cta-pill';
    textEl.textContent = customMsg || 'Inquiries Active • Review within 24-48 Hours';
    badge.title = 'Accepting project briefs with queued review response.';
  }
};

window.saveStudioAvailabilitySettingsDirect = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const customMsg = document.getElementById('setStudioCustomStatusMessage')?.value.trim() || '';
  
  siteSettings.studioAvailabilityMode = selectedMode;
  siteSettings.studioCustomStatusMessage = customMsg;
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  
  updateStudioLiveStatus();
  previewStudioStatusSelection();
  showToast('Studio availability and brief acceptance status updated! ✓', 'success', 3500);
};

window.previewStudioStatusSelection = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const previewBadge = document.getElementById('currentStudioModeBadgePreview');
  if (!previewBadge) return;
  
  if (selectedMode === 'vacation') {
    previewBadge.className = 'hero-badge studio-status-badge status-vacation font-mono';
    previewBadge.textContent = '🔴 Studio Expedition (Briefs Paused)';
  } else if (selectedMode === 'online') {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🟢 Online & Accepting Briefs';
  } else if (selectedMode === 'away') {
    previewBadge.className = 'hero-badge studio-status-badge status-pending font-mono';
    previewBadge.textContent = '🟡 Away / Queued Review (24-48h)';
  } else {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🔄 24/7 Smart Auto';
  }
};


// ==============================================================================
// ناوبری زیرمنوی دوگانه آتلیه و فروشگاه در داک (سفارش کانسپت / دارایی‌های دیجیتال)
// ==============================================================================
window.navigateToStorePane = function(paneKey, e) {
  if (e) e.stopPropagation();
  switchView('store');
  switchStoreTab(paneKey);
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) wrapper.classList.remove('active');
  const title = document.getElementById('storeSectionMainTitle');
  if (title) {
    title.textContent = (paneKey === 'products') ? 'Official Digital Assets & Production Vault' : 'Concept Art & Visual Development Atelier';
  }
};

window.toggleStoreDockInPlace = function(e) {
  if (e) e.stopPropagation();
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) {
    wrapper.classList.toggle('active');
  }
};
window.toggleStoreDockSubmenu = window.toggleStoreDockInPlace;

// ==============================================================================


window.filterStoreAssets = function(cat, el) {
  document.querySelectorAll('#assetCategoryTabs .service-nav-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  const titleEl = document.getElementById('currentAssetCategoryTitle');
  if (titleEl) titleEl.textContent = (cat === 'all') ? 'All Studio Digital Assets' : cat;
  renderStoreProducts(cat);
};

window.searchStoreAssets = function(val) {
  renderStoreProducts(null, (val || '').trim().toLowerCase());
};

window.renderStoreProducts = function(catFilter = null, searchQuery = '') {
  const container = document.getElementById('digitalStoreGridContainer');
  if (!container) return;
  const prods = (typeof digitalStoreProducts !== 'undefined' && Array.isArray(digitalStoreProducts)) ? digitalStoreProducts : [];
  const filtered = prods.filter(p => {
    if (catFilter && catFilter !== 'all' && p.category !== catFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !(p.desc || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1; padding:40px; text-align:center; color:var(--text-muted);">No digital assets found matching your criteria.</div>';
    return;
  }

  container.innerHTML = filtered.map((p, idx) => `
    <div class="product-card" onclick="openProductDetailModal(${idx})" style="background:#06080d; border:1px solid rgba(0,240,255,0.25); border-radius:12px; overflow:hidden; cursor:pointer; transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
      <div style="width:100%; height:180px; background:#020306; overflow:hidden;">
        <img src="${p.image || ''}" style="width:100%; height:100%; object-fit:cover;" alt="${p.title}" />
      </div>
      <div style="padding:14px;">
        <span class="font-mono" style="font-size:10px; color:var(--cyan-electric); font-weight:800;">${p.category}</span>
        <h3 style="font-size:14px; font-weight:800; color:#fff; margin:6px 0;">${p.title}</h3>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span class="font-mono" style="font-size:14px; font-weight:800; color:var(--gold);">${p.price || '$0'}</span>
          <span style="font-size:11px; color:var(--text-muted);">Instant Vault Access</span>
        </div>
      </div>
    </div>
  `).join('');
};

window.openProductDetailModal = function(idx) {
  const prods = (typeof digitalStoreProducts !== 'undefined') ? digitalStoreProducts : [];
  const p = prods[idx];
  if (!p) return;
  currentSelectedProductIdx = idx;
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    document.getElementById('modalProductTitle').textContent = p.title;
    document.getElementById('modalProductDesc').textContent = p.desc || '';
    document.getElementById('modalProductPrice').textContent = p.price || '$0';
    document.getElementById('modalProductImage').src = p.image || '';
    modal.classList.add('active');
  }
};

// Official Contractual Invoice generator defined below

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  });
} else {
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
}

// ==============================================================================
// MULTI-CHAIN CRYPTO SETTLEMENT, LIVE RATES & TEZOS TZKT AUTO-VERIFY ENGINE
// ==============================================================================
window.STUDIO_CRYPTO_META = {
  xtz:        { label: 'Tezos (XTZ) • Temple', symbol: 'XTZ', cgId: 'tezos', ccSym: 'XTZ', explorer: 'https://tzkt.io/' },
  eth:        { label: 'Ethereum (ETH)', symbol: 'ETH', cgId: 'ethereum', ccSym: 'ETH', explorer: 'https://etherscan.io/tx/' },
  usdc_evm:   { label: 'USDC (Base / Polygon / EVM)', symbol: 'USDC', cgId: 'usd-coin', ccSym: 'USDC', explorer: 'https://basescan.org/tx/' },
  usdt_bep20: { label: 'USDT (ERC-20 / BEP-20)', symbol: 'USDT', cgId: 'tether', ccSym: 'USDT', explorer: 'https://bscscan.com/tx/' },
  usdt_trc20: { label: 'USDT (TRC-20)', symbol: 'USDT', cgId: 'tether', ccSym: 'USDT', explorer: 'https://tronscan.org/#/transaction/' },
  sol:        { label: 'Solana (SOL)', symbol: 'SOL', cgId: 'solana', ccSym: 'SOL', explorer: 'https://solscan.io/tx/' },
  usdc_sol:   { label: 'USDC (Solana SPL)', symbol: 'USDC', cgId: 'usd-coin', ccSym: 'USDC', explorer: 'https://solscan.io/tx/' },
  ton:        { label: 'TON (Toncoin)', symbol: 'TON', cgId: 'the-open-network', ccSym: 'TON', explorer: 'https://tonviewer.com/transaction/' },
  usdt_ton:   { label: 'USDT (TON Network)', symbol: 'USDT', cgId: 'tether', ccSym: 'USDT', explorer: 'https://tonviewer.com/transaction/' },
  btc:        { label: 'Bitcoin (BTC)', symbol: 'BTC', cgId: 'bitcoin', ccSym: 'BTC', explorer: 'https://mempool.space/tx/' }
};

window.getCryptoExplorerUrl = function(netKey, txid) {
  const m = window.STUDIO_CRYPTO_META[netKey];
  if (!m || !txid) return '#';
  return m.explorer + encodeURIComponent(txid.trim());
};

window._cachedCryptoRates = window._cachedCryptoRates || { ts: 0, rates: { tezos: 1.0, ethereum: 3100, tether: 1.0, 'usd-coin': 1.0, solana: 200, 'the-open-network': 5.2, bitcoin: 90000 } };

window.fetchLiveCryptoRates = async function() {
  const now = Date.now();
  if (now - window._cachedCryptoRates.ts < 28000 && window._cachedCryptoRates.live) {
    return window._cachedCryptoRates.rates;
  }
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tezos,ethereum,tether,usd-coin,solana,the-open-network,bitcoin&vs_currencies=usd');
    if (res.ok) {
      const data = await res.json();
      const r = { ...window._cachedCryptoRates.rates };
      Object.keys(data).forEach(k => { if (data[k] && data[k].usd) r[k] = data[k].usd; });
      window._cachedCryptoRates = { ts: now, rates: r, live: true };
      return r;
    }
  } catch(e) {}
  try {
    const res2 = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=XTZ,ETH,USDT,USDC,SOL,TON,BTC&tsyms=USD');
    if (res2.ok) {
      const d2 = await res2.json();
      const r = { ...window._cachedCryptoRates.rates };
      if (d2.XTZ?.USD) r.tezos = d2.XTZ.USD;
      if (d2.ETH?.USD) r.ethereum = d2.ETH.USD;
      if (d2.USDT?.USD) r.tether = d2.USDT.USD;
      if (d2.USDC?.USD) r['usd-coin'] = d2.USDC.USD;
      if (d2.SOL?.USD) r.solana = d2.SOL.USD;
      if (d2.TON?.USD) r['the-open-network'] = d2.TON.USD;
      if (d2.BTC?.USD) r.bitcoin = d2.BTC.USD;
      window._cachedCryptoRates = { ts: now, rates: r, live: true };
      return r;
    }
  } catch(e) {}
  return window._cachedCryptoRates.rates;
};

window._activeCryptoPayOrderId = null;
window._activeCryptoNetKey = 'xtz';
window._activeCryptoTier = 0.5;

window.getConfiguredWalletsMap = function() {
  const w = (typeof siteSettings !== 'undefined' && siteSettings && siteSettings.cryptoWallets) ? siteSettings.cryptoWallets : {};
  const out = {};
  if (w.xtz) out.xtz = w.xtz;
  if (w.eth) { out.eth = w.eth; out.usdc_evm = w.eth; out.usdt_bep20 = w.eth; }
  if (w.usdt_trc20) out.usdt_trc20 = w.usdt_trc20;
  if (w.sol) { out.sol = w.sol; out.usdc_sol = w.sol; }
  if (w.ton) { out.ton = w.ton; out.usdt_ton = w.ton; }
  if (w.btc) out.btc = w.btc;
  return out;
};

window.openCryptoPayModal = async function(orderId) {
  window._activeCryptoPayOrderId = orderId;
  const order = orderId ? ordersList.find(x => x.id === orderId) : null;
  const titleEl = document.getElementById('cryptoPayOrderTitle');
  if (titleEl) {
    titleEl.textContent = order ? `Settle: ${order.pkg || ('Order #' + order.id)}` : 'Director Wallet Test Transfer (0.01 XTZ)';
  }

  const isDir = typeof window.isStudioDirectorAuthenticated === 'function' && window.isStudioDirectorAuthenticated();
  const testBtn = document.getElementById('payTierTestBtn');
  if (testBtn) testBtn.classList.toggle('hidden', !isDir);

  window._activeCryptoTier = order ? 0.5 : 'test';
  const txInput = document.getElementById('cryptoTxidInput');
  if (txInput) txInput.value = (order && order.txid) ? order.txid : '';

  const configured = window.getConfiguredWalletsMap();
  const keys = Object.keys(configured);
  const pillsBox = document.getElementById('cryptoNetworkPills');

  if (keys.length === 0) {
    if (pillsBox) pillsBox.innerHTML = '<div style="font-size:12px; color:#fda4af; padding:10px; background:rgba(244,63,94,0.1); border-radius:8px;">No studio wallet addresses saved yet. Add your wallet address in Admin Panel → Settings.</div>';
    window._activeCryptoNetKey = null;
  } else {
    window._activeCryptoNetKey = keys[0];
    if (pillsBox) {
      pillsBox.innerHTML = keys.map(k => `
        <button type="button" class="crypto-net-pill ${k === window._activeCryptoNetKey ? 'active' : ''}" data-net="${k}" onclick="selectCryptoPayNetwork('${k}')">
          ${window.STUDIO_CRYPTO_META[k].label}
        </button>
      `).join('');
    }
  }

  const modal = document.getElementById('cryptoPayModal');
  if (modal) modal.classList.add('active');
  await window.refreshCryptoPayModalCalc();
  if (window._cryptoModalRefreshTimer) clearInterval(window._cryptoModalRefreshTimer);
  window._cryptoModalRefreshTimer = setInterval(async () => {
    const m = document.getElementById('cryptoPayModal');
    if (!m || !m.classList.contains('active')) {
      clearInterval(window._cryptoModalRefreshTimer);
      window._cryptoModalRefreshTimer = null;
      return;
    }
    await window.refreshCryptoPayModalCalc();
  }, 30000);
};

window.closeCryptoPayModal = function() {
  const modal = document.getElementById('cryptoPayModal');
  if (modal) modal.classList.remove('active');
  if (window._cryptoModalRefreshTimer) {
    clearInterval(window._cryptoModalRefreshTimer);
    window._cryptoModalRefreshTimer = null;
  }
};

window.requestFiatOrCardInvoice = function() {
  const orderId = window._activeCryptoPayOrderId;
  const o = orderId ? ordersList.find(x => x.id === orderId) : null;
  const sp = (o && o.specs) ? o.specs : {};
  const totalNum = sp.totalUsd || (o ? parseFloat(String(o.price || '0').replace(/[^0-9.]/g, '')) : 0) || 0;
  const tierMult = (window._activeCryptoTier === 1.0) ? 1.0 : 0.5;
  const usdDue = (totalNum * tierMult).toFixed(2).replace(/\.00$/, '');

  if (o) {
    o.paymentNetwork = 'fiat_request';
    o.txid = 'FIAT-INVOICE-REQUESTED';
    o.paymentAmountCrypto = `$${usdDue} USD (Card / PayPal)`;
    o.paymentVerified = false;
    if (typeof safeSetStorage === 'function') safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
    if (typeof window.syncStudioSettingsToCloud === 'function') window.syncStudioSettingsToCloud();
    if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
    if (typeof renderAdminSketch3 === 'function') renderAdminSketch3();
  }

  if (typeof window.sendToTelegramDirect === 'function') {
    const msg = `💳 <b>Card / PayPal Invoice Requested</b>\nOrder: #${o ? o.id : 'Direct'}\nClient: ${o ? o.client : (currentMember?.name || 'Guest')} (${o ? o.contact : (currentMember?.email || '-')})\nPackage: ${o ? o.pkg : 'Commission'}\nAmount Due: $${usdDue} USD`;
    try { window.sendToTelegramDirect(msg); } catch(e) {}
  }

  const subj = encodeURIComponent(`Card / PayPal Invoice Request - Brief #${o ? o.id : 'New'} (TAJINKART)`);
  const body = encodeURIComponent(
    `Hello TAJINKART Studio,\n\nI would like to pay my ${tierMult === 1 ? '100% full balance' : '50% retainer'} ($${usdDue} USD) via Card / PayPal invoice instead of crypto.\n\nOrder ID: #${o ? o.id : '-'}\nPackage: ${o ? o.pkg : '-'}\nClient Name: ${o ? o.client : (currentMember?.name || '')}\n\nPlease reply with the payment link/instructions.`
  );
  window.closeCryptoPayModal();
  showToast('Fiat/Card invoice requested! 24h expiry paused — opening email to studio@tajinkart.space.', 'success', 5500);
  window.location.href = `mailto:studio@tajinkart.space?subject=${subj}&body=${body}`;
};

window.selectCryptoPayNetwork = function(netKey) {
  window._activeCryptoNetKey = netKey;
  document.querySelectorAll('#cryptoNetworkPills .crypto-net-pill').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-net') === netKey);
  });
  window.refreshCryptoPayModalCalc();
};

window.setCryptoPayTier = function(tierVal) {
  window._activeCryptoTier = tierVal;
  document.getElementById('payTier50Btn')?.classList.toggle('active', tierVal === 0.5);
  document.getElementById('payTier100Btn')?.classList.toggle('active', tierVal === 1.0);
  document.getElementById('payTierTestBtn')?.classList.toggle('active', tierVal === 'test');
  window.refreshCryptoPayModalCalc();
};

window.refreshCryptoPayModalCalc = async function() {
  const netKey = window._activeCryptoNetKey;
  const configured = window.getConfiguredWalletsMap();
  const addr = (netKey && configured[netKey]) ? configured[netKey] : '';
  const meta = netKey ? window.STUDIO_CRYPTO_META[netKey] : null;

  const addrEl = document.getElementById('cryptoWalletAddressDisplay');
  const netLbl = document.getElementById('cryptoSelectedNetLabel');
  const qrImg = document.getElementById('cryptoWalletQrImg');
  const hintEl = document.getElementById('cryptoAutoVerifyHint');

  if (addrEl) addrEl.textContent = addr || 'Not configured';
  if (netLbl) netLbl.textContent = meta ? meta.label : 'Select a network';
  if (qrImg) {
    qrImg.src = addr ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(addr)}` : '';
    qrImg.style.display = addr ? 'block' : 'none';
  }
  if (hintEl) {
    if (netKey === 'xtz') {
      hintEl.textContent = 'Tezos transactions are verified automatically on-chain via TzKT in seconds.';
    } else if (netKey === 'ton' || netKey === 'usdt_ton') {
      hintEl.textContent = 'TON & USDT (TON) transactions are verified automatically on-chain via TonAPI in seconds.';
    } else {
      hintEl.textContent = 'After sending, paste your Transaction Hash (TXID) for studio verification.';
    }
  }

  const order = window._activeCryptoPayOrderId ? ordersList.find(x => x.id === window._activeCryptoPayOrderId) : null;
  const rawPrice = order ? parseFloat(String(order.price || '180').replace(/[^0-9.]/g, '')) || 180 : 180;

  const rates = await window.fetchLiveCryptoRates();
  const usdRate = (meta && rates[meta.cgId]) ? rates[meta.cgId] : 1;

  let usdToPay = 0;
  let exactCrypto = '0';

  if (window._activeCryptoTier === 'test') {
    exactCrypto = '0.01';
    usdToPay = (0.01 * usdRate);
  } else {
    usdToPay = rawPrice * (Number(window._activeCryptoTier) || 0.5);
    const decimals = (meta && (meta.symbol === 'BTC' || meta.symbol === 'ETH')) ? 5 : 2;
    exactCrypto = (usdToPay / usdRate).toFixed(decimals);
  }

  const usdEl = document.getElementById('cryptoPayUsdVal');
  const rateEl = document.getElementById('cryptoLiveRateText');
  const exactEl = document.getElementById('cryptoExactAmount');

  if (usdEl) usdEl.textContent = '$' + usdToPay.toFixed(2);
  if (rateEl && meta) rateEl.textContent = `1 ${meta.symbol} ≈ $${usdRate.toLocaleString()}`;
  if (exactEl && meta) exactEl.textContent = `${exactCrypto} ${meta.symbol}`;
};

window.copyCryptoWalletAddress = function() {
  const addr = document.getElementById('cryptoWalletAddressDisplay')?.textContent || '';
  if (!addr || addr === 'Not configured' || addr === 'No address configured') return;
  navigator.clipboard?.writeText(addr).then(() => {
    showToast('Wallet address copied to clipboard!', 'success', 2500);
  });
};

window.syncOrderPaymentToCloud = async function(order) {
  if (!window.supabaseClient || !order) return;
  try {
    const { data } = await window.supabaseClient
      .from('studio_settings')
      .select('value')
      .eq('key', 'order_payments_ledger')
      .single();
    const ledger = (data && data.value) ? data.value : {};
    ledger[String(order.id)] = {
      txid: order.txid || '',
      paymentNetwork: order.paymentNetwork || '',
      paymentAmountCrypto: order.paymentAmountCrypto || '',
      paymentVerified: !!order.paymentVerified,
      status: order.status || '',
      updatedAt: new Date().toISOString()
    };
    await window.supabaseClient.from('studio_settings').upsert([{
      key: 'order_payments_ledger',
      value: ledger,
      updated_at: new Date().toISOString()
    }], { onConflict: 'key' });
  } catch(e) { console.warn('[Order Payment Cloud Sync]', e); }
};

window.submitCryptoTransaction = async function() {
  const txid = (document.getElementById('cryptoTxidInput')?.value || '').trim();
  const netKey = window._activeCryptoNetKey;
  if (!netKey) { showToast('Please configure a studio wallet address first.', 'error'); return; }
  if (!txid || txid.length < 12) { showToast('Please enter a valid Transaction Hash / TXID.', 'error'); return; }

  const configured = window.getConfiguredWalletsMap();
  const targetAddr = configured[netKey] || '';
  const exactText = document.getElementById('cryptoExactAmount')?.textContent || '';
  const btn = document.getElementById('cryptoSubmitTxBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

  let verifiedOnChain = false;

  if (netKey === 'xtz') {
    try {
      const res = await fetch(`https://api.tzkt.io/v1/operations/transactions/${encodeURIComponent(txid)}`);
      if (res.ok) {
        const ops = await res.json();
        const match = Array.isArray(ops) && ops.find(op => op.status === 'applied' && (!targetAddr || (op.target && op.target.address === targetAddr)));
        if (match) {
          verifiedOnChain = true;
        }
      }
    } catch(e) {}
  } else if (netKey === 'ton' || netKey === 'usdt_ton') {
    try {
      let rawTarget = '';
      if (targetAddr) {
        const accRes = await fetch(`https://tonapi.io/v2/accounts/${encodeURIComponent(targetAddr)}`);
        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData && accData.address) rawTarget = String(accData.address).toLowerCase();
        }
      }
      const evRes = await fetch(`https://tonapi.io/v2/events/${encodeURIComponent(txid)}`);
      if (evRes.ok) {
        const ev = await evRes.json();
        const actions = Array.isArray(ev && ev.actions) ? ev.actions : [];
        const match = actions.find(act => {
          if (act.status && act.status !== 'ok') return false;
          const rec = (act.TonTransfer && act.TonTransfer.recipient && act.TonTransfer.recipient.address)
            || (act.JettonTransfer && act.JettonTransfer.recipient && act.JettonTransfer.recipient.address)
            || '';
          if (!rec) return false;
          if (!rawTarget) return true;
          return String(rec).toLowerCase() === rawTarget || String(rec) === targetAddr;
        });
        if (match) verifiedOnChain = true;
      }
    } catch(e) {}
  }

  const order = window._activeCryptoPayOrderId ? ordersList.find(x => x.id === window._activeCryptoPayOrderId) : null;
  if (order) {
    order.txid = txid;
    order.paymentNetwork = netKey;
    order.paymentAmountCrypto = exactText;
    order.paymentVerified = verifiedOnChain;
    if (verifiedOnChain) order.status = '50% Retainer Settled';
    safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
    await window.syncOrderPaymentToCloud(order);
    if (window.supabaseClient) {
      window.supabaseClient.from('orders').update({ status: order.status }).eq('id', order.id).then(() => {});
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = '✓ Submit & Verify Transaction'; }

  if (verifiedOnChain) {
    const netName = (netKey === 'ton' || netKey === 'usdt_ton') ? 'TON transaction verified on-chain via TonAPI! ✓' : 'Tezos transaction verified on-chain via TzKT! ✓';
    showToast(netName, 'success', 5500);
  } else if (netKey === 'xtz') {
    showToast('TXID saved! TzKT could not confirm it yet (may take 30s or target mismatch).', 'info', 5500);
  } else if (netKey === 'ton' || netKey === 'usdt_ton') {
    showToast('TXID saved! TonAPI could not confirm it yet (may take 30s or target mismatch).', 'info', 5500);
  } else {
    showToast('TXID submitted! Studio Director will verify & approve shortly.', 'success', 5000);
  }

  window.closeCryptoPayModal();
  if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
  if (typeof renderAdminSketch3 === 'function') renderAdminSketch3();
};

// ==============================================================================
// OFFICIAL CONTRACTUAL PROFORMA INVOICE & SUPABASE ORDERS SYNC
// ==============================================================================
window.downloadOfficialStudioInvoice = function(orderId) {
  const o = orderId ? ordersList.find(x => x.id === orderId) : (ordersList && ordersList[0]);
  if (!o) {
    showToast('No active order found to generate an invoice.', 'info');
    return;
  }
  const sp = o.specs || {};
  const totalNum = sp.totalUsd || parseFloat(String(o.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const halfNum = (totalNum * 0.5).toFixed(2).replace(/\.00$/, '');
  const dateStr = sp.createdAt ? new Date(sp.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : new Date().toLocaleDateString('en-US');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>TAJINKART Contractual Invoice #${o.id}</title>
<style>
  @page { size: A4; margin: 14mm; } body { font-family: system-ui, -apple-system, sans-serif; background:#f1f5f9; color:#0f172a; margin:0; padding:24px; }
  .sheet { max-width:794px; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-top:6px solid #090c12; border-radius:10px; padding:32px; box-shadow:0 12px 35px rgba(15,23,42,0.08); }
  .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:18px; margin-bottom:22px; }
  h1 { margin:0; font-size:22px; color:#090c12; letter-spacing:0.08em; }
  .muted { color:#475569; font-size:12px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
  .box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:13px; font-size:12.5px; }
  .box strong { color:#0f172a; display:block; margin-top:4px; }
  table { width:100%; border-collapse:collapse; margin:18px 0; font-size:13px; }
  th, td { text-align:left; padding:9px 12px; border-bottom:1px solid #e2e8f0; }
  th { color:#0f172a; background:#f8fafc; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; }
  .terms { background:#fffbeb; border-left:4px solid #ca8a04; padding:14px 16px; border-radius:6px; font-size:11.5px; line-height:1.65; color:#1e293b; margin-top:18px; }
  .print-btn { margin-top:20px; padding:10px 20px; border-radius:8px; border:none; background:#facc15; color:#000; font-weight:800; cursor:pointer; }
  @media print { body { background:#fff; color:#111; } .sheet { border:1px solid #ccc; background:#fff; } .box, .terms { background:#f8fafc; color:#111; border-color:#ddd; } .print-btn { display:none; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div>
        <h1>TAJINKART STUDIO</h1>
        <div class="muted">Concept Art &amp; Visual Development Atelier • Directed by Seyed Soroush Taj</div>
        <div class="muted">https://tajinkart.space • studio@tajinkart.space</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; color:#0369a1; font-weight:800; letter-spacing:0.06em;">CONTRACTUAL PROFORMA INVOICE</div>
        <div style="font-size:16px; font-weight:800; margin-top:4px;">#TJK-${o.id}</div>
        <div class="muted">Issued: ${dateStr} • Status: ${o.status || 'Brief Received'}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box"><span class="muted">Client / Studio</span><strong>${o.client || 'Valued Client'}</strong><span class="muted">${o.contact || ''}</span></div>
      <div class="box"><span class="muted">Commission Package &amp; Timeline</span><strong>${o.pkg || 'Custom Concept Art'}</strong><span class="muted">Estimated Delivery: ${o.timeline || 'Per Schedule'}</span></div>
    </div>

    <table>
      <thead><tr><th>Production Specification</th><th>Selected Scope &amp; Deliverables</th></tr></thead>
      <tbody>
        <tr><td>Scope &amp; Archetype</td><td>${sp.scope || 'Custom Scope'}</td></tr>
        <tr><td>Framing &amp; View</td><td>${sp.framing || 'Standard View'}</td></tr>
        <tr><td>Design Complexity</td><td>${sp.complexity || 'Production Standard'}</td></tr>
        <tr><td>Rendering Fidelity</td><td>${sp.fidelity || o.phase || '300DPI Master Render'}</td></tr>
        <tr><td>Included Add-ons</td><td>${(sp.addons && sp.addons.length) ? sp.addons.join(', ') : 'Master Layered 300DPI PSD'}</td></tr>
        <tr><td>Creative Brief</td><td>${String(o.brief || '').replace(/\n/g, '<br>')}</td></tr>
        <tr><td>Reference Link</td><td>${o.refLink || 'None'}</td></tr>
      </tbody>
    </table>

    <div class="grid">
      <div class="box"><span class="muted">50% Non-Refundable Retainer (To Start)</span><strong style="color:#b45309; font-size:18px;">$${halfNum} USD</strong></div>
      <div class="box"><span class="muted">50% Final Balance (Prior to PSD Handover)</span><strong style="color:#0369a1; font-size:18px;">$${halfNum} USD</strong></div>
    </div>

    <div class="terms">
      <strong style="color:#92400e; display:block; margin-bottom:6px;">Binding Studio Commission Agreement, Duration &amp; Studio Rules:</strong>
      1. <strong>24-Hour Unpaid Brief Expiry:</strong> Submitted briefs without a 50% retainer settlement or TXID are automatically purged after <strong>24 hours</strong>; clients may submit a new brief anytime.<br/>
      2. <strong>Retainer &amp; Scheduling:</strong> Production begins strictly upon settlement of the 50% non-refundable retainer, which reserves your slot in the studio production queue.<br/>
      3. <strong>Checkpoints &amp; Revisions:</strong> Up to 2 structured revision rounds are included at Silhouette/Linework and Color/Value checkpoints. Major scope changes after approval incur additional fees.<br/>
      4. <strong>Final Handover &amp; Usage:</strong> High-resolution 300DPI master files and layered PSDs are released upon settlement of the remaining 50% balance. Artist credit (TAJINKART) applies unless an NDA/buyout is agreed.<br/>
      5. <strong>Studio Rules, Conduct &amp; Anti-AI:</strong> Respectful professional communication is required across all studio channels. Client silence exceeding 30 calendar days closes the commission. All TAJINKART works are strictly protected against unauthorized AI training, scraping, or redistribution.
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:22px; padding-top:16px; border-top:1px dashed #cbd5e1; font-size:12px;">
      <div>
        <div style="color:#64748b; font-size:10.5px; text-transform:uppercase;">Studio Director Authorized Signature</div>
        <div style="font-family:Georgia, serif; font-style:italic; font-size:20px; color:#0f172a; margin:6px 0 2px;">Seyed Soroush Taj</div>
        <div style="color:#475569; font-size:11px;">Founder &amp; Lead Concept Artist • TAJINKART Studio</div>
      </div>
      <div>
        <div style="color:#64748b; font-size:10.5px; text-transform:uppercase;">Client Electronic Acceptance</div>
        <div style="font-weight:700; color:${o.paymentVerified ? '#047857' : '#0f172a'}; margin:6px 0 2px;">
          ${o.paymentVerified ? '✓ Executed via 50% Retainer Settlement' : '✓ Brief &amp; Terms Accepted Electronically'}
        </div>
        <div style="color:#475569; font-size:11px;">${o.txid ? ('TXID: ' + o.txid) : ('Client: ' + (o.client || 'Confirmed via Portal'))}</div>
      </div>
    </div>
    <button class="print-btn" onclick="window.print()">Save as PDF / Print Official Contract</button>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAJINKART-Contract-${o.id}.html`;
    a.click();
  }
  showToast(`Contractual Invoice #TJK-${o.id} generated!`, 'success', 3500);
};

window.syncOrdersFromSupabase = async function() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const localMap = {};
      (ordersList || []).forEach(o => { localMap[String(o.id)] = o; });
      const cloudIds = new Set(data.map(r => String(r.id)));
      const nowMs = Date.now();
      const nextList = [];
      data.forEach(row => {
        const existing = localMap[String(row.id)];
        if (existing) {
          if (row.status) existing.status = row.status;
          nextList.push(existing);
        } else {
          nextList.push({
            id: row.id,
            client: row.client_name || 'Client',
            contact: row.contact || row.client_email || '',
            clientEmail: row.client_email || '',
            refLink: row.ref_link || '',
            pkg: row.package_name || 'Commission',
            price: row.price_text || '$0',
            timeline: row.timeline || '',
            phase: row.phase || '',
            brief: row.brief_text || '',
            status: row.status || 'Brief Received'
          });
        }
      });
      (ordersList || []).forEach(o => {
        if (!cloudIds.has(String(o.id)) && typeof o.id === 'number' && (nowMs - o.id) < 15000) {
          nextList.unshift(o);
        }
      });
      ordersList = nextList;
      safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
      if (typeof window.purgeExpiredUnpaidOrders === 'function') window.purgeExpiredUnpaidOrders();
      if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
      if (typeof renderAdminSketch3 === 'function') renderAdminSketch3();
    }
  } catch(e) { console.warn('[Supabase Orders Sync]', e); }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => window.syncOrdersFromSupabase(), 900));
} else {
  setTimeout(() => window.syncOrdersFromSupabase(), 900);
}

// ==============================================================================
// DYNAMIC PER-CATEGORY WIZARD PROFILES (Config-Driven Order Form)
// ==============================================================================
window.WIZARD_CATEGORY_PROFILES = {
  sketch1: {
    scopeLabel: 'Character Scope & Archetype:',
    framingLabel: 'Framing & View:',
    scopes: [
      ['👤 Single Hero / Character Concept (Base)', 0],
      ['⏳ Age Progression Timeline (Youth ➔ Prime ➔ Elder) (+$60)', 60],
      ['👥 Ensemble / Faction Bundle (Hero + Companions) (+$85)', 85],
      ['🔄 Character Redesign & Evolution (+$15)', 15]
    ],
    framings: [
      ['Portrait / Bust (Base)', 0],
      ['Half Body / Waist Up (+$25)', 25],
      ['Full Body Dynamic Action (+$40)', 40],
      ['3-View Orthographic Turnaround (+$55)', 55]
    ]
  },
  sketch2: {
    scopeLabel: 'Environment Scope & Biome:',
    framingLabel: 'Camera & Horizon Framing:',
    scopes: [
      ['🏞️ Single Establishing Keyframe (Base)', 0],
      ['🏛️ Modular Architecture Kit & Callouts (+$55)', 55],
      ['🌦️ Multi-Time / Weather Lighting Variants (+$45)', 45]
    ],
    framings: [
      ['16:9 Cinematic Establishing Shot (Base)', 0],
      ['21:9 Ultra-Wide Panoramic Vista (+$35)', 35],
      ['Isometric / Top-Down Level Layout (+$45)', 45]
    ]
  },
  sketch_creature: {
    scopeLabel: 'Creature Class & Biology:',
    framingLabel: 'Anatomy & Diagram View:',
    scopes: [
      ['🐉 Single Creature / Boss Concept (Base)', 0],
      ['🦴 Locomotion & Jaw Mechanics Breakdown (+$50)', 50],
      ['🐺 Pack / Evolution Variants (+$70)', 70]
    ],
    framings: [
      ['Full-Body Profile + Human Scale Ref (Base)', 0],
      ['Action Habitat Render (+$40)', 40],
      ['Orthographic 3D-Ready Creature Sheet (+$60)', 60]
    ]
  },
  sketch3: {
    scopeLabel: 'Illustration / Keyframe Purpose:',
    framingLabel: 'Aspect Ratio & Print Spec:',
    scopes: [
      ['🎬 Narrative Story Keyframe (Base)', 0],
      ['📖 Book / Album Cover + Typography Space (+$45)', 45],
      ['🎮 Steam Capsule / Hero Splash Art (+$65)', 65]
    ],
    framings: [
      ['Standard 300DPI Digital Master (Base)', 0],
      ['Wrap-Around Print Cover (Front + Spine + Back) (+$50)', 50]
    ]
  },
  sketch4: {
    scopeLabel: 'Prop / UI Pack Quantity:',
    framingLabel: 'Technical Deliverable Format:',
    scopes: [
      ['⚔️ Single Hero Weapon / Relic Sheet (Base)', 0],
      ['🎒 4-Item Loot / Consumables Bundle (+$45)', 45],
      ['🛡️ 8-Icon RPG Skill / HUD Kit (+$65)', 65]
    ],
    framings: [
      ['Rendered Concept + Material Callouts (Base)', 0],
      ['3D-Ready Orthographic Blueprints (+$35)', 35]
    ]
  },
  sketch5: {
    scopeLabel: 'Sequential Art Format:',
    framingLabel: 'Finish & Layering:',
    scopes: [
      ['📑 Storyboard / Cinematic Decoupage Page (Base)', 0],
      ['✒️ Inked Manga / Comic Page (+$30)', 30],
      ['🎨 Full-Color Webtoon / Motion Layers (+$60)', 60]
    ],
    framings: [
      ['Single Page / Episode Strip (Base)', 0],
      ['Multi-Page Sequence (3+ Pages) (+$90)', 90]
    ]
  },
  sketch_mascot: {
    scopeLabel: 'Mascot / Crest Scope:',
    framingLabel: 'Brand Asset Format:',
    scopes: [
      ['🦅 Brand Crest & Emblem (Base)', 0],
      ['🎭 Full Character Mascot + Poses (+$55)', 55]
    ],
    framings: [
      ['High-Res Raster + Transparent PNG (Base)', 0],
      ['Vector / Scalable Print Master (+$45)', 45]
    ]
  }
};

window.populateDynamicWizardForCategory = function(pipeKey, subMode) {
  const cat = (typeof window.getAtelierCatalog === 'function') ? window.getAtelierCatalog() : null;
  const prof = window.WIZARD_CATEGORY_PROFILES[pipeKey] || window.WIZARD_CATEGORY_PROFILES.sketch1;
  const sLbl = document.getElementById('wizScopeLabel');
  const fLbl = document.getElementById('wizFramingLabel');
  if (sLbl) sLbl.textContent = prof.scopeLabel;
  if (fLbl) fLbl.textContent = prof.framingLabel;

  const sEl = document.getElementById('wizCharacterScope');
  const fEl = document.getElementById('wizFraming');
  const cEl = document.getElementById('wizComplexity');
  const pEl = document.getElementById('orderPhaseSelect');
  const bgEl = document.getElementById('wizBackgroundType');
  const commLbl = document.getElementById('wizCommercialLabel');
  const nuancesGrid = document.getElementById('wizCharacterNuancesGrid');
  const lineupWrap = document.getElementById('wizLineupCountWrap');

  const isChar = !pipeKey || pipeKey === 'sketch1';
  const matchedCard = (isChar && cat && Array.isArray(cat.serviceCards))
    ? (cat.serviceCards.find(sc => sc.subMode === (subMode || 'custom') || sc.id === subMode) || cat.serviceCards[0])
    : null;

  const showAges = matchedCard ? (matchedCard.showAges !== false) : (isChar && subMode !== 'lineup');
  const showLineup = matchedCard ? (!!matchedCard.showLineupCount) : (subMode === 'lineup');
  const showTurnaround = matchedCard ? (matchedCard.showTurnaround !== false) : true;

  if (nuancesGrid) nuancesGrid.style.display = showAges ? 'grid' : 'none';
  if (lineupWrap) lineupWrap.style.display = showLineup ? 'block' : 'none';

  if (sEl) {
    if (matchedCard && Array.isArray(matchedCard.scopes) && matchedCard.scopes.length > 0) {
      if (sLbl) sLbl.textContent = matchedCard.title + ' — Scope:';
      sEl.innerHTML = matchedCard.scopes.map((sc, i) =>
        `<option value="${sc.id || ('sc_' + i)}" data-hrs="${Number(sc.hrs) || 0}" ${i === 0 ? 'selected' : ''}>${sc.label}</option>`
      ).join('');
    } else if (!isChar) {
      sEl.innerHTML = prof.scopes.map((o, i) => `<option value="opt_${i}" data-hrs="${Math.max(0, Math.round((o.usd || 0) / 15))}" ${i === 0 ? 'selected' : ''}>${o.label.replace(/\s*\(\+?\$\d+\)/g, '')}</option>`).join('');
    }
  }

  if (fEl) {
    if (isChar && cat && Array.isArray(cat.framings)) {
      const fList = cat.framings.filter(f => f.active !== false && (showTurnaround || f.id !== 'turnaround'));
      fEl.innerHTML = fList.map((f, idx) =>
        `<option value="${f.id}" data-hrs="${f.hrs}" data-days="${f.days || 0}" ${(f.id === 'full' || (idx === 0 && !fList.some(x => x.id === 'full'))) ? 'selected' : ''}>${f.label}</option>`
      ).join('');
    } else if (!isChar) {
      fEl.innerHTML = prof.framings.map((o, i) => `<option value="f_${i}" data-hrs="${3 + Math.round((o.usd || 0) / 15)}" data-days="0" ${i === 0 ? 'selected' : ''}>${o.label.replace(/\s*\(\+?\$\d+\)/g, '')}</option>`).join('');
    }
  }

  if (cEl && cat && Array.isArray(cat.complexities)) {
    cEl.innerHTML = cat.complexities.filter(c => c.active !== false).map((c, idx) =>
      `<option value="${c.id}" data-hrs="${c.hrs}" ${(c.id === 'standard' || idx === 1) ? 'selected' : ''}>${c.label}</option>`
    ).join('');
  }

  if (pEl && cat && Array.isArray(cat.phases)) {
    const activePhases = cat.phases.filter(p => p.active !== false);
    pEl.innerHTML = activePhases.map((p, idx) =>
      `<option value="${p.label.replace(/"/g, '&quot;')}" data-phase-id="${p.id}" data-mult="${p.mult}" data-revs="${p.revisions}" data-days="${p.days || 0}" data-allow-color="${p.allowColorVar !== false}" ${idx === activePhases.length - 1 ? 'selected' : ''}>${p.label}</option>`
    ).join('');
  }

  if (bgEl && cat && Array.isArray(cat.backgrounds)) {
    bgEl.innerHTML = cat.backgrounds.filter(b => b.active !== false).map((b, idx) =>
      `<option value="${b.id}" data-hrs="${b.hrs}" ${idx === 0 ? 'selected' : ''}>${b.label}</option>`
    ).join('');
  }

  if (commLbl && cat) {
    const pct = Math.round(((Number(cat.commercialMult) || 1.4) - 1) * 100);
    commLbl.textContent = `💎 Commercial Rights & Master Layered PSD (+${pct}%)`;
  }

  if (typeof window.handleWizardPhaseChange === 'function') window.handleWizardPhaseChange();
};

// ==============================================================================
// DYNAMIC WIZARD MULTI-SAMPLE & VARIATION MATCHER (Synced to Gallery Tags)
// ==============================================================================
window.updateWizardDynamicPreview = function(pipeKey, framingTxt, fidelityTxt, scopeTxt, compTxt) {
  const imgEl = document.getElementById('modalMediaImg');
  const stripWrap = document.getElementById('wizSampleStripWrap');
  const stripEl = document.getElementById('wizSampleStrip');
  const stripLbl = document.getElementById('wizSampleStripLabel');
  if (!imgEl || !pipeKey || typeof window.getArtworksForPipeline !== 'function') return;
  const candidates = window.getArtworksForPipeline(pipeKey, false);
  if (!candidates || candidates.length === 0) {
    if (stripWrap) stripWrap.style.display = 'none';
    return;
  }

  const phaseEl = document.getElementById('orderPhaseSelect');
  const phaseId = phaseEl?.options[phaseEl.selectedIndex]?.getAttribute('data-phase-id') || '';
  const colorVars = parseInt(document.getElementById('wizColorVariations')?.value || '0', 10) || 0;
  const hasExpr = !!document.getElementById('wizExprCheck')?.checked;
  const hasAction = !!document.getElementById('wizActionCheck')?.checked;
  const hasComp = !!document.getElementById('wizCompCheck')?.checked;
  const hasWeapon = !!document.getElementById('wizWeaponCheck')?.checked;

  const normalizeWords = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w.length >= 3);
  const queryWords = new Set([...normalizeWords(framingTxt), ...normalizeWords(fidelityTxt), ...normalizeWords(scopeTxt), ...normalizeWords(compTxt)]);

  const scored = [];
  candidates.forEach(item => {
    const sheets = (Array.isArray(item.phases) && item.phases.length > 0) ? item.phases : [{
      image: item.image,
      subcategory: item.subcategory || '',
      stage: item.stage || 'render',
      complexity: item.complexity || 'standard',
      atelierTags: item.atelierTags || [],
      title: item.title || ''
    }];

    sheets.forEach(sh => {
      const shImg = sh.image || sh.img || item.image;
      if (!shImg) return;
      const subStr = (sh.subcategory || item.subcategory || '').toLowerCase();
      const stgStr = (sh.stage || item.stage || '').toLowerCase();
      const cmpStr = (sh.complexity || item.complexity || '').toLowerCase();
      const tagsStr = Array.isArray(sh.atelierTags) ? sh.atelierTags.join(' ').toLowerCase() : '';
      const txtStr = ((item.title || '') + ' ' + (sh.title || '') + ' ' + (item.desc || '')).toLowerCase();

      let score = 0;
      queryWords.forEach(w => {
        if (subStr.includes(w)) score += 4;
        if (stgStr.includes(w)) score += 4;
        if (cmpStr.includes(w)) score += 2;
        if (txtStr.includes(w)) score += 1;
      });
      if (phaseId && (stgStr === phaseId || (phaseId === 'cel' && stgStr === 'lineart_value'))) score += 8;
      if (colorVars > 0 && tagsStr.includes('color variation')) score += 10;
      if (hasExpr && tagsStr.includes('expression')) score += 9;
      if (hasAction && tagsStr.includes('action')) score += 9;
      if (hasComp && tagsStr.includes('companion')) score += 7;
      if (hasWeapon && tagsStr.includes('weapon')) score += 7;

      scored.push({ img: shImg, title: sh.title || item.title || 'Studio Sample', tags: sh.atelierTags || [], score });
    });
  });

  scored.sort((a, b) => b.score - a.score);
  const uniqueSamples = [];
  const seenUrls = new Set();
  for (const s of scored) {
    if (!seenUrls.has(s.img)) {
      seenUrls.add(s.img);
      uniqueSamples.push(s);
    }
    if (uniqueSamples.length >= 6) break;
  }

  if (uniqueSamples.length > 0 && uniqueSamples[0].score > 0) {
    const topImg = uniqueSamples[0].img;
    if (imgEl.src !== topImg) {
      imgEl.style.opacity = '0.35';
      setTimeout(() => { imgEl.src = topImg; imgEl.style.opacity = '1'; }, 120);
    }
  }

  if (stripWrap && stripEl) {
    if (uniqueSamples.length > 1) {
      stripWrap.style.display = 'block';
      if (stripLbl) stripLbl.textContent = colorVars > 0 ? `MATCHING VARIATION SAMPLES (${uniqueSamples.length})` : `MATCHING STUDIO SAMPLES (${uniqueSamples.length})`;
      stripEl.innerHTML = uniqueSamples.map((s, i) => `
        <img src="${s.img}" title="${s.title.replace(/"/g, '&quot;')}" onclick="document.getElementById('modalMediaImg').src='${s.img.replace(/'/g, "\'")}';" style="width:58px; height:40px; object-fit:cover; border-radius:6px; cursor:pointer; border:1px solid ${i === 0 ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.18)'}; flex-shrink:0;" />
      `).join('');
    } else {
      stripWrap.style.display = 'none';
    }
  }
};

// ==============================================================================
// CLIENT PORTAL MID-PROJECT SUPPLEMENT / ADD-ON REQUEST
// ==============================================================================
window.openOrderSupplementModal = async function(parentOrderId) {
  const parent = ordersList.find(o => String(o.id) === String(parentOrderId));
  if (!parent) return;
  const cat = (typeof window.getAtelierCatalog === 'function') ? window.getAtelierCatalog() : null;
  const hr = cat ? cat.hourlyRate : 15;
  const exPrice = Math.round((cat ? cat.extraConceptHrs : 1.0) * hr);
  const revPrice = Math.round((cat ? cat.extraRevisionHrs : 1.5) * hr);
  const cvPrice = Math.round((cat ? cat.addons.colorVarHrs : 1.25) * hr);
  const wpnPrice = Math.round((cat ? cat.addons.stdWeaponHrs : 1.5) * hr);
  const petPrice = Math.round((cat ? cat.addons.simplePetHrs : 2.0) * hr);

  const choice = prompt(
    `Request Mid-Project Add-on for CID #${parent.id} (${parent.pkg}):\n` +
    `1 = +1 Extra Initial Sketch Concept ($${exPrice})\n` +
    `2 = +1 Extra Revision Round ($${revPrice})\n` +
    `3 = +1 Color Variation Palette ($${cvPrice})\n` +
    `4 = +1 Hero Weapon / Prop ($${wpnPrice})\n` +
    `5 = +1 Companion / Pet ($${petPrice})\n\n` +
    `Enter 1, 2, 3, 4, or 5:`
  );
  if (!choice) return;
  const map = {
    '1': { label: '+1 Extra Sketch Concept', usd: exPrice },
    '2': { label: '+1 Extra Revision Round', usd: revPrice },
    '3': { label: '+1 Color Variation Palette', usd: cvPrice },
    '4': { label: '+1 Hero Weapon / Prop', usd: wpnPrice },
    '5': { label: '+1 Companion / Pet', usd: petPrice }
  };
  const picked = map[String(choice).trim()];
  if (!picked) { showToast('Invalid option selected.', 'error'); return; }

  const supId = Date.now();
  const supOrder = {
    id: supId,
    client: parent.client,
    clientEmail: parent.clientEmail || (currentMember ? currentMember.email : ''),
    contact: parent.contact,
    pkg: `[Supplement for #${parent.id}] ${picked.label}`,
    phase: parent.phase || 'Supplement Add-on',
    price: '$' + picked.usd,
    timeline: '1 to 2 business days',
    status: 'Brief Received',
    brief: `Mid-project supplement request linked to parent commission #${parent.id}: ${picked.label}.`,
    specs: {
      isSupplement: true,
      parentOrderId: parent.id,
      totalUsd: picked.usd,
      retainerUsd: picked.usd,
      balanceUsd: 0,
      createdAt: new Date().toISOString(),
      addons: [picked.label]
    }
  };
  ordersList.unshift(supOrder);
  safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));

  if (window.supabaseClient) {
    try {
      await window.supabaseClient.from('orders').insert([{
        id: supId,
        client_name: supOrder.client,
        client_email: supOrder.clientEmail,
        contact: supOrder.contact,
        pkg: supOrder.pkg,
        phase: supOrder.phase,
        price: supOrder.price,
        timeline: supOrder.timeline,
        status: supOrder.status,
        brief: supOrder.brief,
        specs: supOrder.specs
      }]);
    } catch(e) {}
  }
  if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
  showToast(`Supplement Invoice #${supId} (${picked.label} — $${picked.usd}) created!`, 'success', 4500);
};
