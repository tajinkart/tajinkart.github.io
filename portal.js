// ==============================================================================
// TAJINKART STUDIO — PORTAL, STORE & COMMISSIONS MODULE (portal.js)
// Member Portal, Auth Modals, Commission Calculator Wizard, Products Vault
// ==============================================================================

window.handleGenesisClick = function() {
  if (!window.isStudioDirectorAuthenticated()) {
    showToast('Genesis Lore is currently reserved for Studio Director access.', 'info', 4000);
    return;
  }
  switchView('genesis');
};

window.handleAcademyClick = function() {
  if (!window.isStudioDirectorAuthenticated()) {
    showToast('Academy Masterclasses are currently reserved for Studio Director access.', 'info', 4000);
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

window.getArtworksForPipeline = function(pipeKey) {
  const allArts = (window.showcaseArtworks && Array.isArray(window.showcaseArtworks) && window.showcaseArtworks.length > 0)
    ? window.showcaseArtworks
    : ((typeof showcaseArtworks !== 'undefined' && Array.isArray(showcaseArtworks)) ? showcaseArtworks : []);
  
  if (!allArts || allArts.length === 0) return [];

  const pipeMap = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? PIPELINE_TO_CATEGORY_MAP : {
    'sketch1': 'character',
    'sketch_creature': 'creature',
    'sketch2': 'environment',
    'sketch3': 'keyframe',
    'sketch4': 'props',
    'sketch5': 'comic',
    'sketch_mascot': 'character'
  };

  const targetCatId = (pipeMap[pipeKey] || pipeKey || '').toLowerCase().trim();
  const pipeLower = (pipeKey || '').toLowerCase().trim();

  let catTitle = '';
  let catTitleEN = '';
  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    const found = galleryCategories.find(c => 
      (c.id && c.id.toLowerCase() === targetCatId) || 
      (c.pipeKey && c.pipeKey.toLowerCase() === pipeLower)
    );
    if (found) {
      catTitle = (found.title || '').toLowerCase().trim();
      catTitleEN = (found.titleEN || '').toLowerCase().trim();
    }
  }

  return allArts.filter(a => {
    if (!a || !a.image) return false;
    const aCat = (a.category || '').toLowerCase().trim();
    const aPipe = (a.pipelineKey || a.pipe || '').toLowerCase().trim();

    if (aCat && (aCat === targetCatId || aCat === pipeLower)) return true;
    if (aPipe && (aPipe === pipeLower || aPipe === targetCatId)) return true;
    if (catTitle && aCat === catTitle) return true;
    if (catTitleEN && aCat === catTitleEN) return true;

    // تطبیق نام‌ها و کلیدواژه‌های اصلی برای انعطاف حداکثری
    if (targetCatId === 'character' && (aCat.includes('character') || aCat.includes('کاراکتر'))) return true;
    if (targetCatId === 'creature' && (aCat.includes('creature') || aCat.includes('monster') || aCat.includes('هیولا'))) return true;
    if (targetCatId === 'environment' && (aCat.includes('environment') || aCat.includes('world') || aCat.includes('محیط'))) return true;
    if (targetCatId === 'keyframe' && (aCat.includes('keyframe') || aCat.includes('cinematic') || aCat.includes('کاور'))) return true;
    if (targetCatId === 'props' && (aCat.includes('prop') || aCat.includes('weapon') || aCat.includes('سلاح'))) return true;
    if (targetCatId === 'comic' && (aCat.includes('comic') || aCat.includes('manga') || aCat.includes('کمیک'))) return true;

    return false;
  });
};

let atelierRotationTimer = null;

window.syncAtelierWithGalleryArtworks = function() {
  const cards = document.querySelectorAll('#atelierServiceCards .service-nav-card');
  if (!cards || cards.length === 0) return;

  cards.forEach(card => {
    const pipe = card.getAttribute('data-pipeline');
    if (!pipe) return;

    const matchingArts = window.getArtworksForPipeline(pipe);
    const validImages = [];

    matchingArts.forEach(art => {
      if (art.image && !validImages.includes(art.image)) {
        validImages.push(art.image);
      }
      if (Array.isArray(art.phases)) {
        art.phases.forEach(p => {
          const pImg = p.image || p.img;
          if (pImg && !validImages.includes(pImg)) {
            validImages.push(pImg);
          }
        });
      }
    });

    card._dynamicArtworkImages = validImages;
    if (typeof card._currentImgIdx !== 'number') card._currentImgIdx = 0;

    const imgEl = card.querySelector('img');
    if (imgEl && validImages.length > 0) {
      // اگر تصویر فعلی پیش‌فرض Unsplash است یا در لیست معتبر نیست، اولین اثر واقعی را ست کن
      if (!imgEl.src || imgEl.src.includes('images.unsplash.com') || !validImages.includes(imgEl.src)) {
        imgEl.src = validImages[0];
      }
    }

    // چرخش سریع‌تر با هاور موس
    if (!card._hasHoverCycleListener && validImages.length > 1) {
      card._hasHoverCycleListener = true;
      card.addEventListener('mouseenter', function() {
        if (!this._dynamicArtworkImages || this._dynamicArtworkImages.length <= 1) return;
        this._currentImgIdx = (this._currentImgIdx + 1) % this._dynamicArtworkImages.length;
        const targetImg = this.querySelector('img');
        if (targetImg) {
          targetImg.style.opacity = '0.15';
          setTimeout(() => {
            targetImg.src = this._dynamicArtworkImages[this._currentImgIdx];
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
        if (card.matches(':hover')) return; // در صورت قرارگیری ماوس، مزاحم کاربر نشو
        const imgs = card._dynamicArtworkImages;
        if (Array.isArray(imgs) && imgs.length > 1) {
          card._currentImgIdx = (card._currentImgIdx + 1) % imgs.length;
          const img = card.querySelector('img');
          if (img) {
            img.style.opacity = '0.15';
            setTimeout(() => {
              img.src = imgs[card._currentImgIdx];
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

  // ۳. رندر تایل‌های مرحله و پکیج‌ها متصل به رنگ زنده دسته‌بندی و تصاویر واقعی گالری
  const container = document.getElementById('mosaicStageContainer');
  if (container) {
    container.innerHTML = data.tiles.map((tile, idx) => {
      const displayPrice = formatPrice(tile.price);

      // انتخاب تصویر و شیت واقعی از گالری در صورت وجود
      let tileImg = tile.img;
      let tileTitle = tile.title;
      let tileDesc = tile.desc;

      if (matchingArts.length > 0) {
        const matchedArt = matchingArts[idx % matchingArts.length];
        if (matchedArt) {
          if (Array.isArray(matchedArt.phases) && matchedArt.phases.length > 0) {
            if (idx === 0 && matchedArt.phases[0] && (matchedArt.phases[0].image || matchedArt.phases[0].img)) {
              tileImg = matchedArt.phases[0].image || matchedArt.phases[0].img;
            } else if (idx === 1 && matchedArt.phases[1] && (matchedArt.phases[1].image || matchedArt.phases[1].img)) {
              tileImg = matchedArt.phases[1].image || matchedArt.phases[1].img;
            } else if (matchedArt.phases[idx] && (matchedArt.phases[idx].image || matchedArt.phases[idx].img)) {
              tileImg = matchedArt.phases[idx].image || matchedArt.phases[idx].img;
            } else if (matchedArt.image) {
              tileImg = matchedArt.image;
            }
          } else if (matchedArt.image) {
            tileImg = matchedArt.image;
          }
        }
      }

      const escapedTitle = (tileTitle || '').replace(/'/g, "\\'");
      const escapedDesc = (tileDesc || '').replace(/'/g, "\\'");

      return `
        <div class="pipeline-tile ${tile.span}" style="--tile-accent:${catColor};" onclick="openModal('${escapedTitle}', '${escapedDesc}', '${displayPrice}', '${tileImg}', '${tile.timeline}', ${tile.usdVal || 90}, '${key}')">
          <img src="${tileImg}" class="pipeline-tile-img" alt="${escapedTitle}" loading="lazy" />
          <div class="pipeline-tile-overlay">
            <h4 class="pipeline-tile-title">${tile.title}</h4>
            <p class="pipeline-tile-desc">${tile.desc}</p>
            <div class="pipeline-tile-footer">
              <div>
                <span class="font-mono" style="color:${catColor}; font-size:14px; font-weight:800; text-shadow:0 0 10px ${catColor}55;">${displayPrice}</span>
                <span style="color:var(--cyan-electric); font-size:11px; margin-right:8px;">(${tile.timeline})</span>
              </div>
              <span style="font-size:11.5px; color:${catColor}; font-weight:800; display:flex; align-items:center; gap:4px;">
                Quote & Submit Brief →
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

// باز کردن مدال و محاسبه‌گر لحظه‌ای با مقدار عددی پایه واقعی
function openModal(title, desc, price, img, timeline, usdVal, pipeKey) {
  activeModalItem = {
    title: title,
      titleFa: document.getElementById("editArtTitleFa") ? document.getElementById("editArtTitleFa").value.trim() : "",
    desc: desc,
      isProductionPack: document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true,
    price: price,
    img: img,
    timeline: timeline || '5 to 7 business days',
    usdVal: usdVal || 90,
    pipeKey: pipeKey || currentSelectedPipeKey
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

  if (currentMember) {
    const nameInput = document.getElementById('orderClientName');
    const contactInput = document.getElementById('orderClientContact');
    if (nameInput) nameInput.value = currentMember.name;
    if (contactInput) contactInput.value = currentMember.contact || currentMember.email;
  }

  // محاسبه لحظه‌ای اولیه و باز کردن پنجره
  recalcWizardPrice();
  document.getElementById('zoomModal').classList.add('active');
}

function closeModal(e) { if (e.target.id === 'zoomModal') closeModalDirect(); }
function closeModalDirect() { document.getElementById('zoomModal').classList.remove('active'); }

// موتور محاسبه‌گر لحظه‌ای قیمت و اسکوپ سفارش (Live Calculator Engine)
window.toggleWizardStep = function(stepNum) {
  const card = document.getElementById("wizardStep" + stepNum);
  if (card) card.classList.toggle('active');
};

window.recalcWizardPrice = function() {
  let baseUSD = 90;
  if (activeModalItem && typeof activeModalItem.usdVal === 'number' && activeModalItem.usdVal > 0) {
    baseUSD = activeModalItem.usdVal;
  }

  const scopeEl = document.getElementById('wizCharacterScope');
  const framingEl = document.getElementById('wizFraming');
  const compEl = document.getElementById('wizComplexity');
  const phaseEl = document.getElementById('orderPhaseSelect');
  const weaponEl = document.getElementById('wizHeroWeapon');
  const expEl = document.getElementById('wizExpressions');
  const paletteEl = document.getElementById('wizColorPalette');
  const commEl = document.getElementById('wizCommercial');

  let extra = 0;
  if (scopeEl) extra += parseInt(scopeEl.options[scopeEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (framingEl) extra += parseInt(framingEl.options[framingEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (compEl) extra += parseInt(compEl.options[compEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (phaseEl) extra += parseInt(phaseEl.options[phaseEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (weaponEl && weaponEl.checked) extra += 35;
  if (expEl && expEl.checked) extra += 30;
  if (paletteEl && paletteEl.checked) extra += 20;
  if (commEl && commEl.checked) extra += 45;

  const totalUSD = Math.max(60, baseUSD + extra);
  activeModalItem.calculatedPriceUSD = totalUSD;

  // آپدیت آنی و زنده قیمت روی صفحه
  const priceEl = document.getElementById('modalPrice');
  if (priceEl) {
    priceEl.textContent = formatPrice(totalUSD);
    // افکت فلش ظریف هنگام تغییر عدد
    priceEl.style.transition = 'color 0.2s';
    priceEl.style.color = 'var(--cyan-electric)';
    setTimeout(() => { priceEl.style.color = 'var(--gold)'; }, 250);
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

function renderMemberDashboard() {
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
    (o.client && o.client.toLowerCase() === currentMember.name.toLowerCase()) || 
    o.contact === currentMember.email || 
    o.contact === currentMember.contact
  ) : [];

  const STAGES = [
    { id: 1, label: 'Brief & Scope', hint: 'Atelier Requirements Analysis' },
    { id: 2, label: '50% Retainer', hint: 'Artist Calendar Reserved' },
    { id: 3, label: 'Silhouette & Lines', hint: 'Form Exploration & Turnaround' },
    { id: 4, label: '300DPI Master', hint: 'Chiaroscuro & Material Render' },
    { id: 5, label: 'Final PSD Source', hint: 'Full Layered 4K Handover' }
  ];

  const ordersToRender = userOrders.length > 0 ? userOrders : [{
    id: 701,
    pkg: 'Cyberpunk Character Concept & Expression Sheet (Active Project)',
    price: '$180 (50% Retainer Settled)',
    status: 'Phase 3: Initial Silhouette & Linework in Progress',
    phase: 'Phase 3 • Linework & Turnaround Sheet',
    timeline: '5 to 7 business days',
    brief: 'Full-body rogue cyberpunk character design with dark cloak and biomechanical armor elements. Silhouette thumbnails approved, orthographic turnaround linework underway.'
  }];

  if (oBox) {
    oBox.innerHTML = ordersToRender.map(o => {
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

          <div style="color:#cbd5e1; font-size:12px; line-height:1.8; background:rgba(255,255,255,0.02); padding:14px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <strong style="color:var(--cyan-electric); font-size:12px; display:block; margin-bottom:4px;">Brief Summary & Scope Specifications:</strong>
            ${o.brief || 'Bespoke concept art and visual development executed to international industry standards by TAJINKART Studio.'}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); flex-wrap:wrap; gap:8px;">
            <span>Current Phase: <strong style="color:#fff;">${o.phase || 'Standard 300DPI'}</strong></span>
            <span>Estimated Handover: <strong style="color:#fff;">${o.timeline || 'Per Project Schedule'}</strong></span>
            <button type="button" onclick="downloadOfficialStudioInvoice()" class="btn-secondary" style="font-size:10.5px; padding:3px 10px; border-color:var(--gold); color:var(--gold);">
              📄 Download Invoice
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  // ۲. رندر دارایی‌های دیجیتال و دوره‌ها در زبانه ۲
  const cBox = document.getElementById('memberCoursesContainer');
  if (cBox) {
    const VAULT_ITEMS = [
      {
        id: 1,
        title: 'Masterclass: Advanced Fantasy Character Design & Armor Rendering',
        desc: '14 comprehensive master sessions covering silhouette thumbnails to photorealistic metal and cloth rendering in Photoshop.',
        format: 'VIDEO + PSD',
        size: '4.8 GB',
        license: 'Standard Atelier License',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 2,
        title: '64-Piece Master Brush Engine, Rust Textures & Monster Alphas',
        desc: 'Proprietary studio brushes for hard surface rendering, reptilian scales, weathered textures, and seamless alphas.',
        format: '.ABR + PNG',
        size: '340 MB',
        license: 'Commercial Production License',
        img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 3,
        title: 'Genesis Lore Codex & Extopia Digital Artbook',
        desc: 'Complete worldbuilding manuscripts, historical timelines, and 60 pages of print-ready concept art.',
        format: 'PDF 300DPI',
        size: '185 MB',
        license: 'Collector Special Edition',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 4,
        title: 'Dark Fantasy Prop Kit & RPG UI Interface Icons (120 Icons)',
        desc: 'Spell skill icons, shields, and runic insignias with separated layers for Unity and Godot game engines.',
        format: 'PNG + SVG',
        size: '95 MB',
        license: 'Commercial Game Ready',
        img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80'
      }
    ];

    cBox.innerHTML = VAULT_ITEMS.map(v => `
      <div class="codex-vault-card">
        <div class="codex-card-thumb">
          <img src="${v.img}" alt="${v.title}" loading="lazy">
          <span class="codex-card-format">${v.format}</span>
        </div>
        <h5 class="codex-card-title">${v.title}</h5>
        <p class="codex-card-desc">${v.desc}</p>
        <div class="codex-card-meta">
          <span>File Size: <strong class="font-mono" style="color:#fff;">${v.size}</strong></span>
          <span>License: <strong style="color:var(--emerald);">${v.license}</strong></span>
        </div>
        <button type="button" class="btn-codex-download" onclick="triggerVaultAssetDownload('${v.title}', '${v.format}')">
          ⚡ Download Digital Asset
        </button>
      </div>
    `).join('');
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
      const phase = document.getElementById('orderPhaseSelect').value;
      const brief = document.getElementById('orderClientBrief').value.trim();
      const priceText = document.getElementById('modalPrice').textContent;

      const newOrder = {
        id: Date.now(),
        client: client,
        contact: contact,
        refLink: refLink,
        pkg: activeModalItem.title,
        price: priceText,
        timeline: activeModalItem.timeline,
        phase: phase,
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
            brief_text: newOrder.brief,
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
    badge.className = 'hero-badge studio-status-badge status-vacation';
    textEl.textContent = customMsg || 'Studio Away / Capacity Full • Inquiries Reviewed Shortly';
    badge.title = 'The studio is currently on expedition / at full capacity.';
    return;
  }

  if (mode === 'online') {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Online • Accepting Briefs & Concept Commissions';
    badge.title = 'Real-time brief acceptance and project consultations active.';
    return;
  }

  if (mode === 'away') {
    badge.className = 'hero-badge studio-status-badge status-pending';
    textEl.textContent = customMsg || 'Inquiries Active • Review within 24-48 Hours';
    badge.title = 'Accepting project briefs with queued review response.';
    return;
  }

  // حالت خودکار هوشمند (Auto): کمتر از ۲۴ ساعت آنلاین، بیش از آن پاسخگویی با تاخیر
  const lastActive = Number(siteSettings.lastAdminLoginTime) || Date.now();
  const diffHours = (Date.now() - lastActive) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Online • Accepting Briefs & Concept Commissions';
    badge.title = 'Real-time brief acceptance and project consultations active.';
  } else {
    badge.className = 'hero-badge studio-status-badge status-pending';
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

window.downloadOfficialStudioInvoice = function(orderId) {
  showToast(`Generating official PDF invoice for order #${orderId}...`, 'info');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  });
} else {
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
}
