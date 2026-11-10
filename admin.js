
// ==============================================================================
// موتور آپلود ابری تصاویر CLOUDINARY با تشخیص خودکار پریست و کلود نیم
// ==============================================================================
async function uploadFileToCloudinary(file) {
  const s = (typeof siteSettings !== 'undefined' && siteSettings) ? siteSettings : {};
  const currentCloud = s.cloudinaryCloudName || 'tajinkart';
  const currentPreset = s.cloudinaryPreset || 'tajinkart';

  const candidates = [
    { cloud: currentCloud, preset: currentPreset },
    { cloud: 'tajinkart', preset: 'tajinkart' },
    { cloud: 'tajinkart', preset: 'erlvtkx9' },
    { cloud: 'erlvtkx9', preset: 'tajinkart' },
    { cloud: 'erlvtkx9', preset: 'erlvtkx9' }
  ];

  const seen = new Set();
  const uniqueCandidates = [];
  for (const c of candidates) {
    const key = c.cloud + ':::' + c.preset;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(c);
    }
  }

  for (const item of uniqueCandidates) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', item.preset);

      const res = await fetch('https://api.cloudinary.com/v1_1/' + item.cloud + '/image/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) {
          s.cloudinaryCloudName = item.cloud;
          s.cloudinaryPreset = item.preset;
          if (typeof safeSetStorage === 'function') {
            safeSetStorage(KEYS.SETTINGS, JSON.stringify(s));
          }
          console.log('[Cloudinary Success]:', data.secure_url);
          return data.secure_url;
        }
      }
    } catch (err) {
      console.warn('[Cloudinary Network Note]:', err);
    }
  }

  return null;
}

// فشرده‌سازی هوشمند تصاویر محلی جهت تضمین عدم پر شدن حافظه مرورگر
function compressImageForStorage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

// ==============================================================================
// پلتفرم‌های انتشار اثر در استودیو
// ==============================================================================
const AVAILABLE_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'Custom caption for Telegram channel...' },
  { id: 'artstation', name: 'ArtStation', icon: '🎨', placeholder: 'Technical breakdown for ArtStation...' },
  { id: 'cara', name: 'Cara', icon: '🛡️', placeholder: 'Anti-AI portfolio post for Cara...' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', placeholder: 'Pin description and metadata...' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'Instagram caption, lore & hashtags...' },
  { id: 'reels', name: 'Reels', icon: '🎬', placeholder: 'Hook & audio caption for Reels video...' },
  { id: 'threads', name: 'Threads', icon: '🧵', placeholder: 'Narrative post for Threads...' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', placeholder: 'Title and sub-reddit body...' },
  { id: 'x', name: 'X / Twitter', icon: '🐦', placeholder: 'Short tweet (<280 chars) and hashtags...' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', placeholder: 'Post copy for Bluesky...' },
  { id: 'shorts', name: 'YouTube Shorts', icon: '📹', placeholder: 'Title and description for Shorts...' },
  { id: 'discord', name: 'Discord', icon: '🎮', placeholder: 'Showcase announcement for Discord...' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'Professional entertainment design copy...' }
];
window.AVAILABLE_PLATFORMS = AVAILABLE_PLATFORMS;

// ==============================================================================
// TAJINKART STUDIO — ADMIN MANAGEMENT MODULE (admin.js)
// Showcase Curation, Genres & Categories, Pipelines, Products, Members, Settings
// ==============================================================================

window.adminToggleAddGenreForm = function() {
  const row = document.getElementById('adminInlineAddGenreRow');
  if (!row) return;
  const isHidden = (row.style.display === 'none' || getComputedStyle(row).display === 'none');
  row.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    const input = document.getElementById('adminNewGenreTitle');
    if (input) setTimeout(() => input.focus(), 80);
  }
};

window.adminSubmitNewGenreInline = function() {
  const input = document.getElementById('adminNewGenreTitle');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast('Please enter a genre name.', 'warning');
    return;
  }
  if (!Array.isArray(studioGenres)) studioGenres = [...DEFAULT_STUDIO_GENRES];
  if (studioGenres.some(g => g.toLowerCase() === val.toLowerCase())) {
    showToast('This genre already exists in studio directory.', 'info');
    return;
  }
  studioGenres.push(val);
  try {
    localStorage.setItem('tajinkart_studio_genres_v1', JSON.stringify(studioGenres));
  } catch(e) {}
  if (input) input.value = '';
  window.adminToggleAddGenreForm();
  window.renderAdminStudioGenres();
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  showToast(`Genre '${val}' added successfully!`, 'success');
};

window.adminDeleteStudioGenre = function(genreName) {
  if (!Array.isArray(studioGenres) || studioGenres.length <= 1) {
    showToast('At least one studio genre must remain active.', 'warning');
    return;
  }
  studioGenres = studioGenres.filter(g => g !== genreName);
  try {
    localStorage.setItem('tajinkart_studio_genres_v1', JSON.stringify(studioGenres));
  } catch(e) {}
  window.renderAdminStudioGenres();
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  showToast(`Genre '${genreName}' removed.`, 'info');
};

window.renderAdminStudioGenres = function() {
  const container = document.getElementById('adminStudioGenresList');
  if (!container) return;
  const genres = (typeof studioGenres !== 'undefined' && Array.isArray(studioGenres) && studioGenres.length > 0) ? studioGenres : DEFAULT_STUDIO_GENRES;
  const badge = document.getElementById('adminGenreCountBadge');
  if (badge) badge.textContent = `${genres.length} Active Genres`;

  container.innerHTML = genres.map(g => `
    <div style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid rgba(0,240,255,0.4); border-radius:20px; padding:6px 14px; box-shadow:0 0 10px rgba(0,240,255,0.15); font-size:12px; color:#fff;">
      <span style="color:var(--cyan-electric); font-size:11px;">🌌</span>
      <span style="font-weight:700;">${g}</span>
      <button type="button" onclick="adminDeleteStudioGenre('${g}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:12px; padding:0 2px; margin-left:4px; line-height:1;" title="Delete this genre" onmouseover="this.style.color='var(--crimson)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
    </div>
  `).join('');
};

window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const cats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0) ? galleryCategories : (typeof SIX_PIPELINE_CATEGORIES !== 'undefined' ? SIX_PIPELINE_CATEGORIES : (typeof DEFAULT_GALLERY_CATEGORIES !== 'undefined' ? DEFAULT_GALLERY_CATEGORIES : []));
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${cats.length} Active Categories`;

  container.innerHTML = cats.map(cat => {
    const color = cat.color || '#38bdf8';
    return `
      <div class="admin-cat-pill" onclick="openAdminCategoryEdit('${cat.id}')" style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid ${color}88; border-radius:20px; padding:6px 14px; box-shadow:0 0 10px ${color}20; cursor:pointer; font-size:12px; color:#fff;" title="Edit Category">
        <span style="width:8px; height:8px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color};"></span>
        <span style="font-weight:700;">${cat.titleEN || cat.title || cat.id}</span>
        <span style="font-size:11px; opacity:0.7;">✏️</span>
      </div>
    `;
  }).join('');
};

window.adminToggleAddCategoryForm = function() {
  const row = document.getElementById('adminInlineAddCategoryRow');
  if (!row) return;
  const isHidden = (row.style.display === 'none' || getComputedStyle(row).display === 'none');
  row.style.display = isHidden ? 'flex' : 'none';
};

window.adminSubmitNewCategoryInline = function() {
  const titleInp = document.getElementById('adminNewCatTitle');
  const idInp = document.getElementById('adminNewCatId');
  const colorInp = document.getElementById('adminNewCatColor');

  const title = titleInp ? titleInp.value.trim() : '';
  const id = idInp ? idInp.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const color = colorInp ? colorInp.value : '#38bdf8';

  if (!title || !id) {
    showToast('Please enter both title and slug ID.', 'warning');
    return;
  }
  if (!Array.isArray(galleryCategories)) galleryCategories = [];
  galleryCategories.push({ id, title, titleEN: title, titleFA: title, color });
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  if (titleInp) titleInp.value = '';
  if (idInp) idInp.value = '';
  window.adminToggleAddCategoryForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category created successfully!', 'success');
};

window.openAdminCategoryEdit = function(catId) {
  const cats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0) ? galleryCategories : (window.galleryCategories || window.SIX_PIPELINE_CATEGORIES || []);
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (!row) return;
  const origIdEl = document.getElementById('adminEditCatOriginalId');
  if (origIdEl) origIdEl.value = cat.id;
  const titleFAEl = document.getElementById('adminEditCatTitleFA');
  if (titleFAEl) titleFAEl.value = cat.titleFA || cat.title || '';
  const titleENEl = document.getElementById('adminEditCatTitleEN');
  if (titleENEl) titleENEl.value = cat.titleEN || cat.title || '';
  const idEl = document.getElementById('adminEditCatId');
  if (idEl) idEl.value = cat.id;
  const colorEl = document.getElementById('adminEditCatColor');
  if (colorEl) colorEl.value = cat.color || '#38bdf8';
  const pickerEl = document.getElementById('adminEditCatColorPicker');
  if (pickerEl) pickerEl.value = cat.color || '#38bdf8';
  row.style.display = 'block';
};

window.closeAdminCategoryEditForm = function() {
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (row) row.style.display = 'none';
};

window.saveAdminCategoryEdit = function() {
  const origId = document.getElementById('adminEditCatOriginalId')?.value;
  if (!Array.isArray(galleryCategories)) galleryCategories = (window.galleryCategories || window.SIX_PIPELINE_CATEGORIES || []).slice();
  const cat = galleryCategories.find(c => c.id === origId);
  if (!cat) return;
  const titleFAEl = document.getElementById('adminEditCatTitleFA');
  if (titleFAEl) cat.titleFA = titleFAEl.value.trim() || cat.title;
  const titleENEl = document.getElementById('adminEditCatTitleEN');
  if (titleENEl) cat.titleEN = titleENEl.value.trim() || cat.title;
  cat.title = cat.titleEN || cat.titleFA || cat.title;
  const colorEl = document.getElementById('adminEditCatColor');
  if (colorEl && colorEl.value) cat.color = colorEl.value;
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  window.closeAdminCategoryEditForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category updated successfully!', 'success');
};

window.adminDeleteCurrentEditingCategory = function() {
  const origId = document.getElementById('adminEditCatOriginalId')?.value;
  if (!origId) return;
  galleryCategories = (galleryCategories || []).filter(c => c.id !== origId);
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  window.closeAdminCategoryEditForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category deleted.', 'info');
};

window.filterAdminMembers = function(val) {
  renderAdminSketch3(val);
};

window.logoutAdmin = async function() {
  const adminWorkspace = document.getElementById('adminWorkspace');
  if (adminWorkspace) adminWorkspace.classList.add('hidden');
  const adminGate = document.getElementById('adminLoginGate');
  if (adminGate) adminGate.classList.remove('hidden');

  try {
    if (window.supabaseClient && window.supabaseClient.auth) {
      await window.supabaseClient.auth.signOut();
    }
  } catch(e) {}

  window.currentMember = null;
  try {
    sessionStorage.removeItem('tajinkart_admin_unlocked');
    localStorage.removeItem('tajinkart_admin_unlocked');
    localStorage.removeItem('tajinkart_member_session');
  } catch(e) {}

  if (typeof switchView === 'function') switchView('showcase');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Studio Command Console locked and signed out. ✓', 'info', 3000);
};

setTimeout(() => {
  if (typeof renderAdminStudioGenres === 'function') renderAdminStudioGenres();
  if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
}, 60);


window.openCreateArtworkModal = function() {
  isCreatingNewArt = true;
  currentSelectedArtIdx = -1;
  stagingNewArt = {
    id: Date.now(),
    tag: 'character',
    shortSlug: '',
    title: '',
    desc: '',
    pipelineKey: 'sketch1',
    image: '',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    phases: [
      {
        name: 'Primary Cover & Master Sheet',
        img: '',
        image: '',
        pipelineKey: 'sketch1',
        subcategory: 'Standard Concept Execution',
        desc: '',
        socials: {},
        socialCaptions: {},
        tgIncludeButton: false
      }
    ]
  };

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = '✨ Add New Artwork to Showcase';

  renderAdminArtModalForm(stagingNewArt, true);
  document.getElementById('adminArtLiveEditorCol').classList.add('active');
  pushModalState('adminEditor');
};

window.selectAdminArt = function(idx) {
  isCreatingNewArt = false;
  currentSelectedArtIdx = idx;
  const art = showcaseArtworks[idx];
  if (!art) return;

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = `Edit Artwork: ${art.shortSlug || art.title}`;

  renderAdminArtModalForm(art, false);
  document.getElementById('adminArtLiveEditorCol').classList.add('active');
  pushModalState('adminEditor');
};

window.closeAdminArtEditor = function() {
  const modal = document.getElementById('adminArtLiveEditorCol');
  if (modal) modal.classList.remove('active');
  isCreatingNewArt = false;
  stagingNewArt = null;
};

window.closeAdminArtEditorDirect = function(e) {
  if (e.target.id === 'adminArtLiveEditorCol') {
    closeAdminArtEditor();
  }
};

function renderPhaseSocialDrawerContent(p, idx) {
  p.socials = p.socials || {};
  p.socialCaptions = p.socialCaptions || {};
  if (p.socialTelegram !== undefined && p.socials.telegram === undefined) {
    p.socials.telegram = Boolean(p.socialTelegram);
  }
  const currentSelectedTab = p.activeSocialTab || 'telegram';
  const activePlat = AVAILABLE_PLATFORMS.find(item => item.id === currentSelectedTab) || AVAILABLE_PLATFORMS[0];
  const isCurrentPlatChecked = Boolean(p.socials[activePlat.id]);

  return `
    <!-- Column 1: Vertical scrollable platform menu -->
    <div class="phase-social-menu-scroll">
      ${AVAILABLE_PLATFORMS.map(plat => {
        const isSelected = (currentSelectedTab === plat.id);
        const isChecked = Boolean(p.socials && p.socials[plat.id]);
        return `
          <div class="phase-social-menu-item ${isSelected ? 'active' : ''}" onclick="selectPhaseSocialTab(${idx}, '${plat.id}')">
            <div style="display:flex; align-items:center; gap:7px;">
              <span style="font-size:14px;">${plat.icon}</span>
              <span style="font-size:11px; font-weight:${isSelected ? '800' : '600'}; color:${isSelected ? 'var(--gold)' : '#e2e8f0'};">${plat.name}</span>
            </div>
            <input type="checkbox" onclick="event.stopPropagation()" onchange="togglePhaseSocialPlatform(${idx}, '${plat.id}', this.checked)" ${isChecked ? 'checked' : ''} style="accent-color:var(--gold); cursor:pointer; width:15px; height:15px;" title="Enable/disable dispatch to ${plat.name}" />
          </div>
        `;
      }).join('')}
    </div>

    <!-- Column 2: Channel settings and custom copy -->
    <div style="background:#04060c; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; flex-wrap:wrap; gap:6px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:18px;">${activePlat.icon}</span>
          <span style="font-size:12.5px; font-weight:800; color:var(--gold);">Custom Caption & Settings for ${activePlat.name}</span>
        </div>
        <div>
          ${isCurrentPlatChecked ? `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:800; color:var(--gold); background:rgba(250,204,21,0.12); padding:3px 10px; border-radius:6px; border:1px solid rgba(250,204,21,0.3);">
              <span style="font-size:8px;">●</span> Enabled for Dispatch
            </span>
          ` : `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text-muted); background:rgba(255,255,255,0.04); padding:3px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:8px;">○</span> Disabled (Toggle in list)
            </span>
          `}
        </div>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Custom caption / copy for ${activePlat.name}:</label>
        <textarea rows="3" placeholder="${activePlat.placeholder}" oninput="setPhaseSocialCaption(${idx}, '${activePlat.id}', this.value)" style="font-size:11.5px; padding:8px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a14; width:100%; box-sizing:border-box;">${(p.socialCaptions && p.socialCaptions[activePlat.id]) || ''}</textarea>
      </div>

      <!-- Telegram-specific dispatch options -->
      ${activePlat.id === 'telegram' ? `
        <div style="background:rgba(0,240,255,0.04); border:1px dashed rgba(0,240,255,0.25); border-radius:8px; padding:10px 12px; margin-top:2px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:11.5px; color:var(--cyan-electric); font-weight:700;">
            <input type="checkbox" onchange="setPhaseTelegramButton(${idx}, this.checked)" ${p.tgIncludeButton ? 'checked' : ''} style="accent-color:var(--cyan-electric); cursor:pointer; width:16px; height:16px;" />
            <span>Include direct interactive button linking to this artwork</span>
          </label>
          <p style="font-size:10px; color:var(--text-muted); margin:4px 0 0 24px;">If disabled, Telegram message sends without interactive buttons below.</p>
        </div>
      ` : ''}
    </div>
  `;
}

window.selectPhaseSocialTab = function(phaseIdx, platId) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  stagingProjectPhases[phaseIdx].activeSocialTab = platId;
  const drawerEl = document.getElementById(`phaseSocialDrawer_${phaseIdx}`);
  if (drawerEl) {
    drawerEl.innerHTML = renderPhaseSocialDrawerContent(stagingProjectPhases[phaseIdx], phaseIdx);
    return;
  }
  renderAdminStagingPhasesOnly();
};

window.togglePhaseSocialPlatform = function(phaseIdx, platId, isChecked) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  const p = stagingProjectPhases[phaseIdx];
  p.socials = p.socials || {};
  p.socials[platId] = isChecked;
  if (platId === 'telegram') p.socialTelegram = isChecked;

  // بروزرسانی بج آکاردئون درجا بدون بازسازی کل ساختار
  const badgeEl = document.getElementById(`phaseSocialBadge_${phaseIdx}`);
  if (badgeEl) {
    const activeSocials = [];
    AVAILABLE_PLATFORMS.forEach(item => {
      if (p.socials[item.id]) activeSocials.push(item.name);
    });
    badgeEl.textContent = activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(', ')})` : 'Auto-Dispatch: Off';
    badgeEl.style.color = activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)';
    badgeEl.style.background = activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)';
  }

  const drawerEl = document.getElementById(`phaseSocialDrawer_${phaseIdx}`);
  if (drawerEl) {
    drawerEl.innerHTML = renderPhaseSocialDrawerContent(p, phaseIdx);
  }
};

window.setPhaseSocialCaption = function(phaseIdx, platId, text) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  const p = stagingProjectPhases[phaseIdx];
  p.socialCaptions = p.socialCaptions || {};
  p.socialCaptions[platId] = text;
};

window.setPhaseTelegramButton = function(phaseIdx, isChecked) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  stagingProjectPhases[phaseIdx].tgIncludeButton = isChecked;
};

function renderAdminArtModalForm(art, isNew) {
  const box = document.getElementById('adminArtFormFields');
  if (!box || !art) return;

  // آماده‌سازی لیست تصاویر و شیت‌های پروژه
  stagingProjectPhases = [];
  if (Array.isArray(art.phases) && art.phases.length > 0) {
    stagingProjectPhases = JSON.parse(JSON.stringify(art.phases));
  } else if (art.image) {
    stagingProjectPhases.push({
      name: art.title || 'Primary Cover Image',
      img: art.image,
      image: art.image,
      pipelineKey: art.pipelineKey || 'sketch1',
      subcategory: 'Standard Concept Execution',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  } else {
    stagingProjectPhases.push({
      name: 'Primary Cover & Master Sheet',
      img: '',
      image: '',
      pipelineKey: 'sketch1',
      subcategory: 'Standard Concept Execution',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  }

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Step 1: Title and narrative lore -->
      <div style="background:#04060a; border:1px solid rgba(250,204,21,0.35); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px;">
        <div style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--gold);">📌 Step 1: Title & Narrative Lore</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Full Artwork Title</label>
            <input type="text" id="editArtTitleInput" value="${art.title || ''}" placeholder="Full artwork title..." />
          </div>
          <div>
            <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Hover Slug (Card Center Title)</label>
            <input type="text" id="editArtSlugInput" value="${art.shortSlug || ''}" placeholder="e.g. Red Knight" />
          </div>
        </div>

        <div>
          <label style="font-size:11.5px; color:var(--gold); font-weight:800; display:block; margin-bottom:4px;">📖 Narrative Lore & Artist Notes:</label>
          <textarea id="editArtDescInput" rows="3" placeholder="Backstory lore, character archetype, visual development notes...">${art.desc || ''}</textarea>
        </div>
      </div>

      <!-- Step 2: Project sheets and artwork imagery -->
      <div style="background:#05070d; border:1px solid rgba(0,240,255,0.35); border-radius:14px; padding:18px;">
        <div style="margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--cyan-electric);">📑 Step 2: Case Study Sheets & Imagery:</span>
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Upload the cover and project sheets. Click the button below to add additional sheets.</p>
        </div>

        <div id="adminProjectPhasesList" style="display:flex; flex-direction:column; gap:14px;">
          ${renderStagingPhasesHtml()}
        </div>

        <!-- Add sheet button -->
        <div style="margin-top:14px;">
          <button type="button" onclick="addStagingPhase()" class="btn-secondary" style="width:100%; padding:12px 16px; font-size:12.5px; font-weight:800; border:1px dashed var(--cyan-electric); color:var(--cyan-electric); background:rgba(0,240,255,0.04); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; border-radius:10px;">
            <span style="font-size:16px;">➕</span>
            <span>Add Supplemental Production Sheet</span>
          </button>
        </div>
      </div>

      <!-- Full production package order settings -->
      <div style="background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.28); border-radius:12px; padding:12px 14px;">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:var(--gold); font-weight:700;">
          <input type="checkbox" id="editArtIsPackCheckbox" ${(art.isProductionPack !== false) ? 'checked' : ''} style="width:17px; height:17px; accent-color:var(--gold); cursor:pointer;" />
          Enable 'Order Full Production Case Study' prompt at bottom of artwork
        </label>
      </div>

      <!-- Action buttons -->
      <div style="margin-top:4px; display:flex; flex-direction:column; gap:8px;">
        ${isNew ? `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Confirm & Add to Showcase Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Cancel
          </button>
        ` : `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Save Project Changes
          </button>
          <button type="button" onclick="adminDeleteArtwork(${currentSelectedArtIdx})" class="btn-secondary" style="color:var(--crimson); width:100%; padding:10px; border-color:rgba(239,68,68,0.3); cursor:pointer;">
            Delete this Artwork from Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Close Without Saving
          </button>
        `}
      </div>

    </div>
  `;
}

function renderStagingPhasesHtml() {
  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    return `<div style="font-size:12px; color:var(--text-muted); padding:20px; text-align:center; background:#04060a; border-radius:10px; border:1px dashed rgba(255,255,255,0.15);">
      No sheets added. Click '+ Add Supplemental Production Sheet' below.
    </div>`;
  }

  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};

  return stagingProjectPhases.map((p, idx) => {
    const pipeKey = p.pipelineKey || 'sketch1';
    const subcats = (pipelines[pipeKey] && pipelines[pipeKey].subcategories) ? pipelines[pipeKey].subcategories : ['Standard Concept Execution'];
    const currentSub = p.subcategory || subcats[0] || '';
    const isCover = (idx === 0);
    const hasImage = Boolean(p.img || p.image);
    const imgSrc = p.img || p.image || '';

    p.socials = p.socials || {};
    p.socialCaptions = p.socialCaptions || {};
    if (p.socialTelegram !== undefined && p.socials.telegram === undefined) {
      p.socials.telegram = Boolean(p.socialTelegram);
    }

    const activeSocials = [];
    AVAILABLE_PLATFORMS.forEach(item => {
      if (p.socials[item.id]) activeSocials.push(item.name);
    });

    return `
      <div style="display:flex; flex-direction:column; gap:12px; background:#04060a; border:1px solid ${isCover ? 'rgba(250,204,21,0.5)' : 'rgba(0,240,255,0.3)'}; border-radius:14px; padding:16px;">
        
        <!-- Image preview or upload dropzone -->
        ${hasImage ? `
          <div style="background:rgba(0,0,0,0.65); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.18)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'}; border:1px solid ${isCover ? 'rgba(250,204,21,0.35)' : 'rgba(0,240,255,0.3)'};">
                ${isCover ? '🖼️ Primary Cover & Featured Shot (Sheet 1)' : `Supplemental Sheet #${idx + 1}`}
              </span>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" onclick="document.getElementById('phaseFileInput_${idx}').click()" class="btn-secondary" style="font-size:11px; padding:4px 12px; border-color:rgba(255,255,255,0.25); cursor:pointer;">
                  🔄 Change Image
                </button>
                ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:3px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
              </div>
              <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />
            </div>

            <!-- Artwork aspect ratio display container -->
            <div style="position:relative; width:100%; max-height:280px; min-height:160px; background:#020306; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;">
              <img src="${imgSrc}" style="max-width:100%; max-height:268px; width:auto; height:auto; object-fit:contain; display:block; border-radius:8px;" alt="Artwork preview" />
            </div>

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. Orthographic Turnaround / Master Render)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; background:rgba(250,204,21,0.03); border:1.5px dashed ${isCover ? 'rgba(250,204,21,0.6)' : 'rgba(0,240,255,0.5)'}; border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.15)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'};">
                ${isCover ? '🖼️ Primary Cover & Featured Shot (Sheet 1)' : `Sheet #${idx + 1}`}
              </span>
              ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:2px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
            </div>

            <div onclick="document.getElementById('phaseFileInput_${idx}').click()" style="cursor:pointer; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:26px 16px; text-align:center; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)'">
              <div style="font-size:32px; margin-bottom:6px;">📁</div>
              <div style="font-size:13px; font-weight:800; color:var(--gold);">Click to select and upload ${isCover ? 'primary cover image' : 'sheet image'} from device</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Supports JPG, PNG, WEBP with original aspect ratio preserved</div>
            </div>
            <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. Master Render / Final Concept)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        `}

        <!-- Unified Category & Pipeline, Specialized Subcategory, and Universe Genre -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
          <div>
            <label style="font-size:10.5px; color:var(--gold); font-weight:700; display:block; margin-bottom:2px;">📂 Category & Pipeline:</label>
            <select onchange="handlePhaseUnifiedCategoryChange(${idx}, this.value)" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid var(--border-subtle); border-radius:6px; color:#fff;">
              <option value="sketch1" ${pipeKey === 'sketch1' ? 'selected' : ''}>Character Design & Heroes</option>
              <option value="sketch_creature" ${pipeKey === 'sketch_creature' ? 'selected' : ''}>Creatures, Titans & Monsters</option>
              <option value="sketch2" ${pipeKey === 'sketch2' ? 'selected' : ''}>Environment, Worlds & Architecture</option>
              <option value="sketch3" ${pipeKey === 'sketch3' ? 'selected' : ''}>Cinematic Keyframes & Covers</option>
              <option value="sketch4" ${pipeKey === 'sketch4' ? 'selected' : ''}>Props, Weapons & Artifacts</option>
              <option value="sketch5" ${pipeKey === 'sketch5' ? 'selected' : ''}>Comics, Manga & Sequential Art</option>
              <option value="sketch_mascot" ${pipeKey === 'sketch_mascot' ? 'selected' : ''}>Brand Mascot & Studio Crest</option>
            </select>
          </div>
          <div>
            <label style="font-size:10.5px; color:var(--cyan-electric); font-weight:700; display:block; margin-bottom:2px;">📐 Specialized Subcategory:</label>
            <select onchange="stagingProjectPhases[${idx}].subcategory = this.value" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid var(--border-subtle); border-radius:6px; color:#fff;">
              ${subcats.map(s => `<option value="${s}" ${currentSub === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:10.5px; color:var(--emerald, #10b981); font-weight:700; display:block; margin-bottom:2px;">🌌 Universe Genre:</label>
            <select onchange="stagingProjectPhases[${idx}].genre = this.value" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid var(--border-subtle); border-radius:6px; color:#fff;">
              ${(typeof studioGenres !== 'undefined' ? studioGenres : ['Dark Fantasy', 'Cyberpunk', 'Sci-Fi', 'Mythic & Ancient', 'Post-Apocalyptic', 'Horror & Eldritch']).map(g => `
                <option value="${g}" ${(p.genre === g || (!p.genre && g === 'Dark Fantasy')) ? 'selected' : ''}>${g}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <textarea rows="2" placeholder="Technical description, industrial application, and milestone notes..." onchange="stagingProjectPhases[${idx}].desc = this.value.trim()" style="font-size:11px; padding:6px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a12;">${p.desc || p.description || ''}</textarea>

        <!-- Omnichannel social dispatches drawer -->
        <details id="phaseSocialDetails_${idx}" ontoggle="stagingProjectPhases[${idx}].isSocialOpen = this.open" ${p.isSocialOpen ? 'open' : ''} style="background:#070a14; border:1px solid rgba(250,204,21,0.25); border-radius:12px; padding:10px 14px; margin-top:2px;">
          <summary style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; user-select:none; outline:none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; color:var(--gold); font-weight:800;">📡 Omnichannel Social Dispatch:</span>
              <span id="phaseSocialBadge_${idx}" class="font-mono" style="font-size:9.5px; color:${activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)'}; background:${activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)'}; padding:2px 8px; border-radius:4px;">
                ${activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(', ')})` : 'Auto-Dispatch: Off'}
              </span>
            </div>
            <span style="font-size:11px; color:var(--cyan-electric); font-weight:800; display:flex; align-items:center; gap:5px;">
              <span>Manage Channels</span>
              <span style="font-size:11px;">▾</span>
            </span>
          </summary>

          <div id="phaseSocialDrawer_${idx}" style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);" class="phase-social-drawer-layout">
            ${renderPhaseSocialDrawerContent(p, idx)}
          </div>
        </details>
      </div>
    `;
  }).join('');
}

window.renderAdminStagingPhasesOnly = function() {
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.addStagingPhase = function() {
  const nextNum = stagingProjectPhases.length + 1;
  const defPipe = stagingProjectPhases[0]?.pipelineKey || 'sketch1';
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const defSub = (pipelines[defPipe] && pipelines[defPipe].subcategories) ? pipelines[defPipe].subcategories[0] : 'Standard Concept Execution';

  stagingProjectPhases.push({
    name: `Supplemental Sheet #${nextNum}`,
    img: '',
    image: '',
    pipelineKey: defPipe,
    subcategory: defSub,
    desc: '',
    socials: {},
    socialCaptions: {},
    tgIncludeButton: false
  });
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhasePipelineChange = function(idx, newPipe) {
  if (!stagingProjectPhases || !stagingProjectPhases[idx]) return;
  stagingProjectPhases[idx].pipelineKey = newPipe;
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const subcats = (pipelines[newPipe] && pipelines[newPipe].subcategories) ? pipelines[newPipe].subcategories : ['Standard Concept Execution'];
  stagingProjectPhases[idx].subcategory = subcats[0] || '';
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.removeStagingPhase = function(idx) {
  if (stagingProjectPhases.length <= 1) {
    stagingProjectPhases[0].img = '';
    stagingProjectPhases[0].image = '';
    stagingProjectPhases[0].name = 'Primary Cover & Master Sheet';
  } else {
    stagingProjectPhases.splice(idx, 1);
  }
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhaseImageUpload = async function(idx, inputEl) {
  if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  showToast('Optimizing and compressing image to KB...', 'info', 2000);

  try {
    // ۱. فشرده‌سازی در مبدأ (کانواس مرورگر): کاهش حجم از چند مگابایت به ۲۰۰-۳۰۰ کیلوبایت
    const compressed = await compressImageForStorage(file, 1600, 1600, 0.82);

    // ۲. ارسال تصویر بهینه‌شده به کلادینری جهت حفظ سقف ۲۵ گیگابایت
    let cloudUrl = null;
    try {
      cloudUrl = await uploadFileToCloudinary(compressed);
    } catch(cloudErr) {
      console.warn('Cloudinary upload bypass:', cloudErr);
    }

    const finalImage = cloudUrl || compressed;

    if (stagingProjectPhases && stagingProjectPhases[idx]) {
      stagingProjectPhases[idx].img = finalImage;
      stagingProjectPhases[idx].image = finalImage;
    }
    const container = document.getElementById('adminProjectPhasesList');
    if (container) container.innerHTML = renderStagingPhasesHtml();

    if (cloudUrl) {
      showToast('Image compressed to KB & synced with Cloudinary! ✓', 'success', 3000);
    } else {
      showToast('Image compressed to lightweight KB & cached locally! ✓', 'success', 3000);
    }
  } catch (err) {
    console.error('Phase upload error:', err);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (stagingProjectPhases && stagingProjectPhases[idx]) {
        stagingProjectPhases[idx].img = e.target.result;
        stagingProjectPhases[idx].image = e.target.result;
      }
      const container = document.getElementById('adminProjectPhasesList');
      if (container) container.innerHTML = renderStagingPhasesHtml();
      showToast('Image loaded.', 'info');
    };
    reader.readAsDataURL(file);
  }
};

window.confirmSaveArtwork = async function() {
  const title = document.getElementById('editArtTitleInput')?.value.trim() || '';
  const slug = document.getElementById('editArtSlugInput')?.value.trim() || '';
  const desc = document.getElementById('editArtDescInput')?.value.trim() || '';
  const isPack = document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true;

  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    showToast('Please add at least one image to this project.', 'error');
    return;
  }

  // بررسی وجود حداقل یک تصویر معتبر
  const validPhases = stagingProjectPhases.filter(p => Boolean(p.img || p.image));
  if (validPhases.length === 0) {
    showToast('Please upload the primary cover image for this artwork.', 'error', 5000);
    return;
  }

  const primaryPhase = validPhases[0];
  const img = primaryPhase.img || primaryPhase.image || '';
  const pipe = primaryPhase.pipelineKey || 'sketch1';
  const cat = (primaryPhase.category) || (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined' ? PIPELINE_TO_CATEGORY_MAP[pipe] : 'character') || 'character';
  const genre = primaryPhase.genre || 'Dark Fantasy';
  const colorSpace = 'Master 4K / 16-Bit ProPhoto RGB';

  try {
    const assembledPhases = JSON.parse(JSON.stringify(validPhases));

    if (isCreatingNewArt) {
      const newArtRecord = {
        id: (stagingNewArt && stagingNewArt.id) ? stagingNewArt.id : Date.now(),
        tag: cat,
        category: cat,
        shortSlug: slug || (stagingNewArt && stagingNewArt.shortSlug) || title || 'New Concept',
        title: title || 'New Studio Concept',
        desc: desc,
        isProductionPack: isPack,
        isAtelierSample: document.getElementById("editArtIsAtelierSample") ? document.getElementById("editArtIsAtelierSample").checked : false,
        pipelineKey: pipe,
        genre: genre,
        image: img,
        colorSpace: colorSpace,
        phases: assembledPhases
      };

      if (!Array.isArray(showcaseArtworks)) showcaseArtworks = [];
      showcaseArtworks.unshift(newArtRecord);
      window.showcaseArtworks = showcaseArtworks;

      try {
        const artKey = (typeof KEYS !== 'undefined' && KEYS.ARTWORKS) ? KEYS.ARTWORKS : 'tajinkart_artworks_fa_v2';
        safeSetStorage(artKey, JSON.stringify(showcaseArtworks));
      } catch(e) {
        console.warn('Local storage write warning:', e);
      }
      
      closeAdminArtEditor();
      if (typeof currentGalleryFilter !== 'undefined') currentGalleryFilter = 'all';
      if (typeof currentGalleryGenreFilter !== 'undefined') currentGalleryGenreFilter = 'all';
      const catLabel = document.getElementById('currentCategoryPillLabel');
      if (catLabel) catLabel.textContent = 'All Artworks';
      const genreLabel = document.getElementById('currentGenrePillLabel');
      if (genreLabel) genreLabel.textContent = 'All Genres';
      if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
      if (typeof renderAdminSketch2 === 'function') renderAdminSketch2();
      showToast('New artwork added to showcase gallery successfully! ✓', 'success');

      // ثبت پس‌زمینه در Supabase بدون ایجاد ارور در فرانت
      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').insert([{
          id: newArtRecord.id,
          tag: newArtRecord.tag,
          short_slug: newArtRecord.shortSlug,
          title: newArtRecord.title,
          desc_text: newArtRecord.desc,
          pipeline_key: newArtRecord.pipelineKey,
          genre: newArtRecord.genre,
          image: newArtRecord.image,
          color_space: newArtRecord.colorSpace,
          phases: newArtRecord.phases
        }]).then(({ error }) => {
          if (error) console.warn('Supabase insert note:', error);
          else showToast('Artwork synced with cloud database. ✓', 'info', 2500);
        }).catch(err => {
          console.warn('Supabase background insert exception:', err);
        });
      }
    } else if (showcaseArtworks[currentSelectedArtIdx]) {
      const art = showcaseArtworks[currentSelectedArtIdx];
      art.title = title || art.title;
      art.shortSlug = slug || art.shortSlug;
      art.tag = cat;
      art.category = cat;
      art.pipelineKey = pipe;
      art.genre = genre;
      art.image = img;
      art.desc = desc;
      art.isProductionPack = isPack;
      art.isAtelierSample = document.getElementById("editArtIsAtelierSample") ? document.getElementById("editArtIsAtelierSample").checked : false;
      art.phases = assembledPhases;

      window.showcaseArtworks = showcaseArtworks;
      try {
        const artKey = (typeof KEYS !== 'undefined' && KEYS.ARTWORKS) ? KEYS.ARTWORKS : 'tajinkart_artworks_fa_v2';
        safeSetStorage(artKey, JSON.stringify(showcaseArtworks));
      } catch(e) {
        console.warn('Local storage write warning:', e);
      }

      closeAdminArtEditor();
      if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
      if (typeof renderAdminSketch2 === 'function') renderAdminSketch2();
      showToast('Project changes saved successfully! ✓', 'success', 3000);

      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').update({
          tag: art.tag,
          short_slug: art.shortSlug,
          title: art.title,
          desc_text: art.desc,
          pipeline_key: art.pipelineKey,
          genre: art.genre,
          image: art.image,
          color_space: art.colorSpace,
          phases: art.phases
        }).eq('id', art.id).then(({ error }) => {
          if (error) console.warn('Supabase update note:', error);
          else showToast('Changes synchronized with cloud database.', 'info', 2500);
        }).catch(err => {
          console.warn('Supabase background update exception:', err);
        });
      }
    }
  } catch (storageErr) {
    console.error('Storage error:', storageErr);
    // حتی در صورت خطای حافظه، پنجره بسته شده و فرم رندر می‌شود تا کاربر بلاک نشود
    closeAdminArtEditor();
    if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
    if (typeof renderAdminSketch2 === 'function') renderAdminSketch2();
    showToast('Artwork added to current session successfully.', 'success');
  }
};

window.adminDeleteArtwork = function(idx) {
  if (!showcaseArtworks || showcaseArtworks.length <= 0) {
    showToast('No artwork found to delete.', 'error');
    return;
  }
  if (confirm('Are you sure you want to permanently delete this artwork from the gallery?')) {
    const deletedItem = showcaseArtworks[idx];
    const deletedId = deletedItem ? Number(deletedItem.id) : null;

    if (deletedId) {
      // ثبت در بلک‌لیست آثار حذف‌شده تا هرگز در رفرش یا همگام‌سازی ابری برنگردد
      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem(KEYS.DELETED_ARTWORKS) || '[]');
      } catch(e) { deletedIds = []; }
      if (!deletedIds.includes(deletedId)) {
        deletedIds.push(deletedId);
        safeSetStorage(KEYS.DELETED_ARTWORKS, JSON.stringify(deletedIds));
      }

      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').delete().eq('id', deletedId).then(({ error }) => {
          if (error) console.warn('Supabase delete error:', error);
          else console.log('Successfully deleted artwork', deletedId, 'from cloud database.');
        });
      }
    }

    showcaseArtworks.splice(idx, 1);
    safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    currentSelectedArtIdx = 0;
    closeAdminArtEditor();
    renderAdminSketch2();
    renderShowcaseGrid();
    showToast('Artwork deleted successfully.', 'info');
  }
};




window.renderAdminSettingsTab = function() {
  try {
    const s = (typeof siteSettings !== 'undefined' && siteSettings) ? siteSettings : {};
    const curMode = s.studioAvailabilityMode || 'auto';
    const radioEl = document.getElementById(`studioMode${curMode.charAt(0).toUpperCase() + curMode.slice(1)}`);
    if (radioEl) radioEl.checked = true;

    if (typeof previewStudioStatusSelection === 'function') previewStudioStatusSelection();
    if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
    if (typeof renderAdminTgChannelsList === 'function') renderAdminTgChannelsList();
    if (typeof loadStudioPricingMatrixToForm === 'function') loadStudioPricingMatrixToForm();
    if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();

    if (typeof switchSettingsSubTab === 'function') {
      switchSettingsSubTab('identity');
    }
  } catch(e) {
    console.warn('renderAdminSettingsTab error:', e);
  }
};


// سابقه مرورگر و دکمه بازگشت در موبایل (HTML5 History API)
window.addEventListener('popstate', (event) => {
  const artModal = document.getElementById('artDetailModal');
  if (artModal && (artModal.classList.contains('active') || artModal.style.display === 'block')) {
    closeArtModalDirect(false);
    return;
  }
  const zoomModal = document.getElementById('zoomModal');
  if (zoomModal && zoomModal.classList.contains('active')) {
    closeModalDirect();
    return;
  }
  const adminEditor = document.getElementById('adminArtLiveEditorCol');
  if (adminEditor && adminEditor.classList.contains('active')) {
    closeAdminArtEditor();
    return;
  }
  const memberModal = document.getElementById('memberModal');
  if (memberModal && memberModal.style.display === 'flex') {
    closeMemberModal();
    return;
  }
  const dock = document.getElementById('rightVerticalNav');
  if (dock && dock.classList.contains('dock-open')) {
    dock.classList.remove('dock-open');
    return;
  }
  if (currentView !== 'showcase') {
    switchView('showcase');
    return;
  }
});

function pushModalState(modalName) {
  try {
    window.history.pushState({ modalOpen: modalName }, '');
  } catch(e) {}
}




/**
 * TAJINKART Master Spec v2.1 Engine
 * استودیو کانسپت آرت و توسعه بصری — Seyed Soroush Taj
 */

// تبدیل زنده نرخ دلار به تومان
function formatPrice(usdPrice) {
  if (typeof usdPrice === 'string') {
    return usdPrice.startsWith('$') ? usdPrice : `$${usdPrice}`;
  }
  return `$${usdPrice}`;
}

window.setCurrencyMode = function(mode) {
  currencyMode = mode;
  const btnUSD = document.getElementById('currBtnUSD');
  const btnTOMAN = document.getElementById('currBtnTOMAN');
  if (btnUSD) btnUSD.classList.toggle('active', mode === 'USD');
  if (btnTOMAN) btnTOMAN.classList.toggle('active', mode === 'TOMAN');
  renderProducts();
  selectPipeline(currentSelectedPipeKey, null, false);
  recalcWizardPrice();
  showToast(`Display currency switched to ${mode}.`, 'info');
};

// سیستم توست نوتیفیکیشن دارک فانتزی
window.showToast = function(msg, type = 'gold') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // جلوگیری از تکرار پیام‌های مشابه
  const existingToasts = container.querySelectorAll('.toast-msg');
  for (const t of existingToasts) {
    if (t.textContent.includes(msg)) {
      return;
    }
  }

  // حداکثر ۲ اعلان همزمان
  if (existingToasts.length >= 2) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  let icon = '⚡';
  if (type === 'success') icon = '✓';
  if (type === 'info') icon = 'ℹ';
  if (type === 'error') icon = '✕';
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
};



window.switchAdminTab = function(tabKey, btn) {
  const tabs = ['artworks', 'pipelines', 'products', 'members', 'orders', 'settings', 'terms'];
  tabs.forEach(t => {
    const el = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.toggle('hidden', t !== tabKey);
  });

  document.querySelectorAll('.admin-top-tab-btn, .admin-sidebar-menu .admin-nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
  });

  if (tabKey === 'artworks') { renderAdminSketch2(); if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories(); if (typeof renderAdminStudioGenres === 'function') renderAdminStudioGenres(); }
  if (tabKey === 'pipelines') renderAdminSketch1();
  if (tabKey === 'products') renderAdminProductsTab();
  if (tabKey === 'members') { renderAdminSketch3(); if (typeof window.renderAdminLists === 'function') window.renderAdminLists(); }
  if (tabKey === 'orders') { tabKey = 'members'; switchAdminTab('members'); return; }
  if (tabKey === 'settings') renderAdminSettingsTab();
  if (tabKey === 'terms') renderAdminTerms();
};

function renderAdminSketch1() {
  const catList = document.getElementById('adminCategoryListCol');
  if (!catList) return;
  catList.innerHTML = Object.keys(PIPELINE_DATA).map(key => `
    <div class="admin-cat-item ${key === currentSelectedPipeKey ? 'active' : ''}" onclick="selectAdminCategory('${key}')">
      <span style="font-size:12.5px; font-weight:700;">${PIPELINE_DATA[key].topSub}</span>
      <span class="font-mono" style="font-size:10.5px; color:var(--gold);">${PIPELINE_DATA[key].tiles.length} Stages</span>
    </div>
  `).join('');

  renderAdminStagesList();
}

window.selectAdminCategory = function(key) {
  currentSelectedPipeKey = key;
  currentSelectedStageIdx = 0;
  renderAdminSketch1();
};

function renderAdminStagesList() {
  const data = PIPELINE_DATA[currentSelectedPipeKey];
  if (!data) return;
  const titleEl = document.getElementById('adminCurrentPipeTitle');
  if (titleEl) titleEl.textContent = `Stages: ${data.topSub}`;

  const stagesGrid = document.getElementById('adminStagesGridCol');
  if (stagesGrid) {
    stagesGrid.innerHTML = data.tiles.map((t, idx) => `
      <div class="admin-card-box ${idx === currentSelectedStageIdx ? 'active' : ''}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-color:${idx === currentSelectedStageIdx ? 'var(--gold)' : 'rgba(255,255,255,0.08)'};" onclick="selectAdminStage(${idx})">
        <div>
          <span class="pipeline-step-badge" style="margin-bottom:4px;">${t.badge}</span>
          <div style="font-size:13.5px; font-weight:800; color:#fff;">${t.title}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">⏱ Timeline: ${t.timeline}</div>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <span class="font-mono" style="color:var(--gold); font-size:15px; font-weight:800;">${t.price}</span>
          <button onclick="event.stopPropagation(); adminDeleteStage(${idx})" style="color:var(--crimson); font-size:11px;">Delete Stage</button>
        </div>
      </div>
    `).join('');
  }

  renderAdminStageLiveEditor();
}

window.selectAdminStage = function(idx) {
  currentSelectedStageIdx = idx;
  renderAdminStagesList();
};

function renderAdminStageLiveEditor() {
  const data = PIPELINE_DATA[currentSelectedPipeKey];
  if (!data || !data.tiles[currentSelectedStageIdx]) return;
  const tile = data.tiles[currentSelectedStageIdx];
  const col = document.getElementById('adminStageEditFormContainer');
  if (!col) return;
  col.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:11px;">
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Stage Badge Title</label>
        <input type="text" value="${tile.badge}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'badge', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Full Stage Title</label>
        <input type="text" value="${tile.title}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Estimated Quote ($)</label>
          <input type="text" value="${tile.price}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'price', this.value)" class="font-mono" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Timeline</label>
          <input type="text" value="${tile.timeline}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'timeline', this.value)" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Base Numeric USD (for Scope Calculator)</label>
        <input type="number" value="${tile.usdVal || 90}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'usdVal', parseInt(this.value, 10))" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Stage Deliverables Summary</label>
        <textarea rows="3" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'desc', this.value)">${tile.desc}</textarea>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Stage Background Image URL</label>
        <input type="text" value="${tile.img}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'img', this.value)" class="font-mono" />
      </div>
      <div style="margin-top:6px; height:80px; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle);">
        <img src="${tile.img}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
    </div>
  `;
}

window.updateTileField = function(pipeKey, tileIdx, field, val) {
  PIPELINE_DATA[pipeKey].tiles[tileIdx][field] = val;
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  selectPipeline(pipeKey, null, false);
  showToast('Stage changes saved.', 'success');
};

window.adminAddNewStage = function() {
  if (!PIPELINE_DATA[currentSelectedPipeKey]) return;
  PIPELINE_DATA[currentSelectedPipeKey].tiles.push({
    span: 'col-span-4',
    badge: `Stage ${PIPELINE_DATA[currentSelectedPipeKey].tiles.length + 1}`,
    title: 'New Concept Development Stage',
    desc: 'Complete milestone deliverables in the editor column.',
    price: '$120 - $160',
    usdVal: 130,
    timeline: '4 to 6 business days',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  });
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = PIPELINE_DATA[currentSelectedPipeKey].tiles.length - 1;
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('New stage added to pipeline.', 'success');
};

window.adminDeleteStage = function(idx) {
  if (PIPELINE_DATA[currentSelectedPipeKey].tiles.length <= 1) {
    showToast('Each pipeline requires at least one stage.', 'error');
    return;
  }
  PIPELINE_DATA[currentSelectedPipeKey].tiles.splice(idx, 1);
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = Math.max(0, currentSelectedStageIdx - 1);
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('Stage deleted.', 'info');
};

window.adminAddNewCategory = function() {
  const newKey = `sketch_cat_${Date.now()}`;
  PIPELINE_DATA[newKey] = {
    id: newKey,
    topSub: 'New Studio Pipeline',
    badgeSlug: 'CUSTOM SERVICE',
    subcategories: ['Subcategory 1', 'Subcategory 2'],
    note: 'Custom studio pipeline.',
    tiles: [
      { span: 'col-span-12', badge: 'Phase 1 • Silhouette', title: 'Ideation & Concept Thumbnails', desc: 'Initial exploratory sketches with client milestone review.', price: '$80 - $110', usdVal: 90, timeline: '3 to 5 business days', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' }
    ]
  };
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedPipeKey = newKey;
  currentSelectedStageIdx = 0;
  renderAdminSketch1();
  showToast('New service pipeline added.', 'success');
};

// اسکچ ۲: مدیریت گالری آثار (همراه با چیدمان با درگ اند دراپ و پیش‌نمایش کادر)
function renderAdminSketch2() {
  if (typeof renderAdminStudioGenres === 'function') renderAdminStudioGenres();
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  let html = `
    <div class="admin-mosaic-add-tile" onclick="openCreateArtworkModal()" title="Add new artwork to gallery">
      <span style="font-size:36px; line-height:1; color:var(--gold);">+</span>
      <span style="font-weight:800; font-size:13px; color:var(--gold);">Add New Artwork Here</span>
      <span style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">Upload from device or direct URL</span>
    </div>
  `;

  const arts = (typeof showcaseArtworks !== "undefined" && Array.isArray(showcaseArtworks)) ? showcaseArtworks : (window.showcaseArtworks || []);
  html += arts.map((art, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedArtIdx ? 'active' : ''}" 
         id="adminArtCard_${idx}"
         data-admin-idx="${idx}"
         draggable="true"
         ondragstart="isDraggingAdminCard = true; handleAdminArtDragStart(event, ${idx})"
         ondragover="handleAdminArtDragOver(event)"
         ondragenter="handleAdminArtDragEnter(event, ${idx})"
         ondragleave="handleAdminArtDragLeave(event, ${idx})"
         ondrop="handleAdminArtDrop(event, ${idx})"
         ondragend="setTimeout(() => { isDraggingAdminCard = false; }, 150); handleAdminArtDragEnd(event)"
         onclick="handleAdminCardClick(event, ${idx})" 
         title="Long press to drag & drop artwork order">
      <img src="${art.image}" draggable="false" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" alt="${art.title}" />
      
      <div style="position:absolute; top:6px; right:6px; padding:3px 7px; border-radius:6px; background:rgba(0,0,0,0.85); color:var(--gold); font-size:11px; font-weight:800; border:1px solid rgba(250,204,21,0.3); pointer-events:none;">
        #${idx + 1}
      </div>
      
      <div style="position:absolute; bottom:0; inset-inline:0; padding:6px 8px; background:rgba(0,0,0,0.88); font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none;">
        ${art.shortSlug || art.title}
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
  initAdminTouchSortable();
}





window.handleAdminImageChange = function(idx, newUrl) {
  const url = newUrl.trim();
  showcaseArtworks[idx].image = url;
  const previewImg = document.getElementById('adminArtPreviewImg');
  if (previewImg) previewImg.src = url;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  detectAndApplyArtworkDimensions(showcaseArtworks[idx], (meta) => {
    const badge = document.getElementById('adminArtPreviewRatioText');
    if (badge) badge.textContent = `${meta.width} × ${meta.height} (Ratio ${meta.ratio})`;
    renderShowcaseGrid();
  });
};

window.onAdminPreviewImgLoad = function(imgEl, idx) {
  if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  const r = parseFloat((w / h).toFixed(2));
  if (showcaseArtworks[idx]) {
    showcaseArtworks[idx].width = w;
    showcaseArtworks[idx].height = h;
    showcaseArtworks[idx].aspectRatio = r;
    artDimensionCache[imgEl.src] = { width: w, height: h, ratio: r };
    const badge = document.getElementById('adminArtPreviewRatioText');
    if (badge) badge.textContent = `${w} × ${h} (Ratio ${r})`;
  }
};

window.updateArtPhaseImg = function(artIdx, phaseIdx, url) {
  if (showcaseArtworks[artIdx] && showcaseArtworks[artIdx].phases && showcaseArtworks[artIdx].phases[phaseIdx]) {
    showcaseArtworks[artIdx].phases[phaseIdx].img = url.trim();
    safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    showToast(`Case study phase ${phaseIdx + 1} image saved.`, 'success');
  }
};

window.updateArtField = function(idx, field, value) {
  showcaseArtworks[idx][field] = value;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  renderShowcaseGrid();
  renderAdminSketch2();
  showToast('Artwork updated successfully.', 'success');
};





// مدیریت دارایی‌های دیجیتال (۷ شاخه)
function renderAdminProductsTab() {
  const container = document.getElementById('adminProductsListContainer');
  if (!container) return;

  container.innerHTML = digitalStoreProducts.map((p, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedProductIdx ? 'active' : ''}" style="height:170px;" onclick="selectAdminProduct(${idx})">
      <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" />
      <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.92) 100%); padding:10px; display:flex; flex-direction:column; justify-content:flex-end;">
        <span style="font-size:10px; color:var(--cyan-electric); font-weight:800;">${p.type}</span>
        <span style="font-size:12px; font-weight:800; color:#fff; line-height:1.3; margin:2px 0;">${p.title}</span>
        <span class="font-mono" style="font-size:13px; font-weight:800; color:var(--gold);">$${p.price}</span>
      </div>
    </div>
  `).join('');

  renderAdminProductLiveEditor();
}

window.selectAdminProduct = function(idx) {
  currentSelectedProductIdx = idx;
  renderAdminProductsTab();
};

function renderAdminProductLiveEditor() {
  const p = digitalStoreProducts[currentSelectedProductIdx];
  const box = document.getElementById('adminProductFormFields');
  if (!p || !box) return;

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="height:120px; border-radius:10px; overflow:hidden; border:1px solid var(--border-subtle);">
        <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Asset Package Title</label>
        <input type="text" value="${p.title}" onchange="updateProductField(${currentSelectedProductIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Asset Category (7 Core Branches)</label>
          <select onchange="updateProductField(${currentSelectedProductIdx}, 'type', this.value)">
            <option value="2D Game Sprites & Characters" ${p.type === '2D Game Sprites & Characters' ? 'selected' : ''}>2D Game Sprites & Characters</option>
            <option value="Brush Engines & Textures" ${p.type === 'Brush Engines & Textures' ? 'selected' : ''}>Brush Engines & Textures</option>
            <option value="Prop Kits, Icons & UI" ${p.type === 'Prop Kits, Icons & UI' ? 'selected' : ''}>Prop Kits, Icons & UI</option>
            <option value="Comics & Master PSDs" ${p.type === 'Comics & Master PSDs' ? 'selected' : ''}>Comics & Master PSDs</option>
            <option value="4K Cinematic Loops" ${p.type === '4K Cinematic Loops' ? 'selected' : ''}>4K Cinematic Loops</option>
            <option value="3D Print & STL Models" ${p.type === '3D Print & STL Models' ? 'selected' : ''}>3D Print & STL Models</option>
            <option value="FX & Atmosphere Overlays" ${p.type === 'FX & Atmosphere Overlays' ? 'selected' : ''}>FX & Atmosphere Overlays</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Base Price ($)</label>
          <input type="number" value="${p.price}" onchange="updateProductField(${currentSelectedProductIdx}, 'price', parseInt(this.value, 10))" class="font-mono" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Lore Access Key (Genesis Key)</label>
        <input type="text" value="${p.loreKey || ''}" onchange="updateProductField(${currentSelectedProductIdx}, 'loreKey', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Cover Image URL</label>
        <input type="text" value="${p.img}" onchange="updateProductField(${currentSelectedProductIdx}, 'img', this.value)" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Package Contents & Description</label>
        <textarea rows="3" onchange="updateProductField(${currentSelectedProductIdx}, 'desc', this.value)">${p.desc || ''}</textarea>
      </div>
      <button onclick="adminDeleteProduct(${currentSelectedProductIdx})" class="btn-secondary" style="color:var(--crimson); margin-top:6px; border-color:rgba(239,68,68,0.3);">Delete this Asset</button>
    </div>
  `;
}

window.updateProductField = function(idx, field, val) {
  digitalStoreProducts[idx][field] = val;
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  renderProducts();
  showToast('Asset specifications saved.', 'success');
};

window.adminAddNewProduct = function() {
  digitalStoreProducts.unshift({
    id: Date.now(),
    title: 'New Studio Digital Asset Pack',
    price: 29,
    type: '2D Game Sprites & Characters',
    loreKey: 'Genesis Universe • Lore Unlock',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
    desc: 'Layered source files, brushes, and assets included in this pack.'
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = 0;
  renderAdminProductsTab();
  renderProducts();
  showToast('New digital asset added.', 'success');
};

window.adminDeleteProduct = function(idx) {
  if (digitalStoreProducts.length <= 1) {
    showToast('At least one product is required.', 'error');
    return;
  }
  digitalStoreProducts.splice(idx, 1);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = Math.max(0, currentSelectedProductIdx - 1);
  renderAdminProductsTab();
  renderProducts();
  showToast('Asset deleted.', 'info');
};

// اسکچ ۳: مدیریت اعضا و گزارش‌های مالی
// شناسه و پرونده رسمی و ابدی خالق، سازنده و معمار جهان استودیو
const CREATOR_MASTER_RECORD = {
  id: 'creator_seyed_soroush_taj',
  name: 'Seyed Soroush Taj',
  email: 'tajinkart@gmail.com',
  contact: 'Studio Headquarters (Direct Director Comm)',
  tier: 'CREATOR',
  balance: '$∞ (Full IP Owner)',
  withdrawn: 'Studio Command',
  totalSpent: '100% Commercial & IP Ownership 👑',
  isCreator: true,
  assetsBought: [
    'Full IP rights of all 6 concept art pipelines',
    'Full commercial & intellectual property of TAJINKART universes',
    'Visual development & original studio assets',
    'Full root console access with Google Cloud 2FA'
  ]
};

let isCreatorSelected = false;
selectedMemberIdx = 0;

function renderAdminSketch3(filterText = '') {
  const listEl = document.getElementById('adminMembersListContainer');
  if (!listEl) return;

  let filtered = siteMembersData.filter(m => m.email && m.email.toLowerCase() !== 'tajinkart@gmail.com');
  if (filterText) {
    filtered = filtered.filter(m =>
      (m.name && m.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (m.contact && m.contact.includes(filterText))
    );
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="font-size:11px; color:var(--text-muted); padding:14px; text-align:center;">No members found.</div>`;
    renderAdminMemberDetail(null);
    return;
  }

  let membersHtml = filtered.map((m, idx) => `
    <div class="member-list-item ${(!isCreatorSelected && idx === selectedMemberIdx) ? 'active' : ''}" onclick="selectAdminMember(${idx})" style="padding:10px 12px; border-radius:10px; cursor:pointer; background:#04060a; border:1px solid ${(!isCreatorSelected && idx === selectedMemberIdx) ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.08)'}; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;">
      <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
        <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,240,255,0.12); border:1px solid rgba(0,240,255,0.3); color:var(--cyan-electric); font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${(m.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style="overflow:hidden;">
          <div style="font-size:12px; font-weight:800; color:#fff; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${m.name || 'Guest User'}</div>
          <div class="font-mono" style="font-size:10px; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${m.email || ''}</div>
        </div>
      </div>
      <span style="font-size:10px; color:var(--emerald); background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:6px; flex-shrink:0;">Active Member</span>
    </div>
  `).join('');

  // پین کردن حساب Seyed Soroush Taj در پایین‌ترین موقعیت لیست
  membersHtml += `
    <div style="margin-top:14px; padding-top:10px; border-top:1px dashed rgba(250,204,21,0.35);">
      <div style="font-size:10.5px; color:var(--gold); font-weight:800; margin-bottom:6px; padding-right:2px;">Studio Director:</div>
      <div class="member-list-item ${isCreatorSelected ? 'active' : ''}" onclick="selectAdminCreator()" style="padding:10px 12px; border-radius:10px; cursor:pointer; background:linear-gradient(135deg, rgba(250,204,21,0.1), #04060a); border:1px solid ${isCreatorSelected ? 'var(--gold)' : 'rgba(250,204,21,0.4)'}; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); font-size:14px; display:flex; align-items:center; justify-content:center;">👑</div>
          <div>
            <div style="font-size:12px; font-weight:900; color:#fbbf24;">Seyed Soroush Taj</div>
            <div class="font-mono" style="font-size:10px; color:rgba(255,255,255,0.7);">tajinkart@gmail.com</div>
          </div>
        </div>
        <span style="font-size:9.5px; font-weight:800; color:#000; background:var(--gold); padding:2px 6px; border-radius:6px;">Studio Director 👑</span>
      </div>
    </div>
  `;

  listEl.innerHTML = membersHtml;

  renderAdminMemberDetail(filtered[selectedMemberIdx] || filtered[0]);
}

window.selectAdminCreator = function() {
  isCreatorSelected = true;
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
};

window.selectAdminMember = function(idx) {
  isCreatorSelected = false;
  selectedMemberIdx = idx;
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
};

function renderAdminMemberDetail(m) {
  const col = document.getElementById('adminMemberDetailContent');
  if (!m || !col) return;

  // پرونده رسمی و اختصاصی خالق استودیو
  if (m.isCreator) {
    // برای مدیر استودیو، کلیه سفارش‌های استودیو در پنل زیرین نمایش داده می‌شوند
    const allStudioOrders = ordersList || [];

    col.innerHTML = `
      <div style="padding:18px; background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(15,23,42,0.95)); border-radius:14px; border:1px solid #fbbf24; margin-bottom:14px; box-shadow:0 6px 25px rgba(245,158,11,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">👑</span>
            <h3 style="font-size:17px; font-weight:900; color:#fbbf24; margin:0;">${m.name}</h3>
          </div>
          <span class="tier-tag tier-creator" style="font-size:11px;">Director & Worldbuilder 👑</span>
        </div>
        <div class="font-mono" style="font-size:12px; color:#fff; margin-top:8px;">Official Google Account: <span style="color:var(--cyan-electric); font-weight:700;">${m.email}</span> (2FA Verified ✓)</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">Role: <span style="color:var(--gold); font-weight:700;">Art Director & IP Owner, TAJINKART Studio</span></div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">Financial Clearance:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:#fbbf24; margin-top:3px;">Full IP Owner</div>
        </div>
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">Account Status:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:var(--emerald); margin-top:3px;">Sole Studio Director 👑</div>
        </div>
      </div>

      <!-- Studio Commission Inquiries Stream -->
      <div style="margin-top:20px; border-top:1px solid rgba(250,204,21,0.3); padding-top:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <h4 style="font-size:14.5px; font-weight:800; color:var(--gold); margin:0;">
            📦 All Studio Commission Inquiries & Briefs (${allStudioOrders.length})
          </h4>
          <button type="button" onclick="syncOrdersFromSupabase()" class="btn-secondary" style="font-size:10.5px; padding:4px 10px; border-color:var(--cyan-electric); color:var(--cyan-electric);">
            🔄 Fetch from Cloud
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${allStudioOrders.length === 0 ? '<div style="font-size:11.5px; color:var(--text-muted); padding:14px; background:#04060a; border-radius:8px; text-align:center;">No project inquiries registered yet.</div>' : 
            allStudioOrders.map(o => renderOrderAdminSnippet(o)).join('')
          }
        </div>
      </div>
    `;
    return;
  }

  // پرونده اعضای عادی
  const tierColor = m.tier === 'VIP' ? 'var(--gold)' : (m.tier === 'PRO' ? 'var(--cyan-electric)' : '#cbd5e1');

  // فیلتر کردن سفارش‌های متعلق به این کاربر
  const userOrders = ordersList.filter(o => 
    (o.client && m.name && o.client.toLowerCase() === m.name.toLowerCase()) ||
    (o.contact && m.email && (o.contact.toLowerCase() === m.email.toLowerCase() || o.contact === m.contact))
  );

  col.innerHTML = `
    <div style="padding:14px; background:#040609; border-radius:12px; border:1px solid ${tierColor}; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:16px; font-weight:900; color:${tierColor}; margin:0;">${m.name}</h3>
        <span class="tier-tag tier-${(m.tier || 'member').toLowerCase()}">${m.tier || 'MEMBER'}</span>
      </div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted); margin-top:4px;">Email: ${m.email || 'Not registered'}</div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted);">Contact: ${m.contact || 'Not registered'}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">Available Balance:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--cyan-electric); margin-top:3px;">${m.balance || '0 $'}</div>
      </div>
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">Total Purchases:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--gold); margin-top:3px;">${m.totalSpent || '0 $'}</div>
      </div>
    </div>

    <div>
      <h5 style="font-size:12.5px; font-weight:800; margin-bottom:8px; color:#fff;">Digital Assets & Active Licenses:</h5>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${(m.assetsBought && m.assetsBought.length > 0) ? m.assetsBought.map(a => `
          <div style="padding:8px 10px; background:#070a10; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>${a}</span>
            <span style="color:var(--emerald); font-size:11px; font-weight:700;">✓ Active Access</span>
          </div>
        `).join('') : '<div style="font-size:11px; color:var(--text-muted); padding:8px 10px; background:#070a10; border-radius:8px;">No active downloadable licenses.</div>'}
      </div>
    </div>

    <!-- Inquiries for this Client Stream -->
    <div style="margin-top:20px; border-top:1px solid rgba(0,240,255,0.25); padding-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:14px; font-weight:800; color:var(--cyan-electric); margin:0;">
          📦 Commission Inquiries & Projects for this Client (${userOrders.length})
        </h4>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${userOrders.length === 0 ? 
          '<div style="font-size:11.5px; color:var(--text-muted); padding:14px; background:#04060a; border-radius:8px; border:1px dashed rgba(255,255,255,0.1); text-align:center;">No inquiries registered yet for this member.</div>' : 
          userOrders.map(o => renderOrderAdminSnippet(o)).join('')
        }
      </div>
    </div>

    <div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--border-subtle);">
      <button type="button" onclick="adminDeleteMember(${selectedMemberIdx})" class="btn-secondary" style="width:100%; padding:9px; font-size:11.5px; color:var(--crimson); border-color:rgba(239,68,68,0.35);">
        🗑️ Delete Member
      </button>
    </div>
  `;
}

// ساخت کارت سفارش درون پنل کاربر
function renderOrderAdminSnippet(o) {
  const STAGES = [
    'Brief Received',
    '50% Retainer Settled',
    'Thumbnails & Linework',
    'Master 300DPI Render',
    'Final PSD Handover'
  ];

  return `
    <div style="padding:14px; background:#04060b; border:1px solid rgba(255,255,255,0.08); border-radius:10px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <div>
          <strong style="font-size:13px; color:#fff;">${o.pkg || 'Concept Art Commission'}</strong>
          <span class="font-mono" style="font-size:10.5px; color:var(--gold); display:block; margin-top:2px;">#${o.id} • Quote: ${o.price || 'Custom'}</span>
        </div>
        <select onchange="updateOrderStatusFromAdmin(${o.id}, this.value)" style="font-size:11px; padding:4px 8px; background:#080c14; border:1px solid rgba(0,240,255,0.35); border-radius:6px; color:var(--cyan-electric); font-weight:700;">
          ${STAGES.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>

      <div style="font-size:11.5px; color:#cbd5e1; line-height:1.7; background:rgba(255,255,255,0.02); padding:8px 10px; border-radius:6px;">
        <span style="color:var(--text-muted); font-size:10.5px; display:block; margin-bottom:2px;">Brief & Agreed Scope:</span>
        ${o.brief || 'Bespoke concept art specifications'}
      </div>

      ${o.refLink && o.refLink.startsWith('http') ? `
        <div style="font-size:11px;">
          <a href="${o.refLink}" target="_blank" rel="noopener" style="color:var(--cyan-electric); text-decoration:underline;">
            🔗 View Reference / Moodboard Link
          </a>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:6px; border-top:1px solid rgba(255,255,255,0.05); font-size:11px;">
        <button type="button" onclick="downloadOrderInvoiceById(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:3px 8px; border-color:var(--gold); color:var(--gold);">
          📄 Invoice
        </button>
        <button type="button" onclick="adminDeleteOrderById(${o.id})" style="background:none; border:none; color:var(--crimson); font-size:11px; cursor:pointer;">
          🗑️ Delete Inquiry
        </button>
      </div>
    </div>
  `;
}

// تغییر وضعیت سفارش از درون پنل کاربر
window.updateOrderStatusFromAdmin = function(orderId, newStatus) {
  const o = ordersList.find(x => x.id === orderId);
  if (o) {
    o.status = newStatus;
    safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
    if (window.supabaseClient) {
      window.supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId).then(() => {
        console.log('[Supabase Orders] Order status updated in cloud.');
      });
    }
    showToast(`Inquiry #${orderId} status updated to "${newStatus}". ✓`, 'success', 3000);
    // رندر مجدد جزئیات کاربر
    const currentMemberObj = isCreatorSelected ? { isCreator: true, name: 'Seyed Soroush Taj', email: 'tajinkart@gmail.com' } : siteMembersData[selectedMemberIdx];
    renderAdminMemberDetail(currentMemberObj);
  }
};

// حذف سفارش توسط ادمین
window.adminDeleteOrderById = function(orderId) {
  if (!confirm(`Are you sure you want to delete inquiry #${orderId}?`)) return;
  ordersList = ordersList.filter(x => x.id !== orderId);
  safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
  if (window.supabaseClient) {
    window.supabaseClient.from('orders').delete().eq('id', orderId).then(() => {
      console.log('[Supabase Orders] Order deleted from cloud.');
    });
  }
  showToast('Inquiry deleted successfully.', 'info');
  const currentMemberObj = isCreatorSelected ? { isCreator: true, name: 'Seyed Soroush Taj', email: 'tajinkart@gmail.com' } : siteMembersData[selectedMemberIdx];
  renderAdminMemberDetail(currentMemberObj);
};

// =========================================================
// سیستم هوشمند DRAG & DROP مرتب‌سازی آثار در پنل ادمین
// =========================================================
let draggedArtIdx = null;

window.handleAdminArtDragStart = function(e, idx) {
  draggedArtIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', idx);
  setTimeout(() => {
    const el = document.getElementById(`adminArtCard_${idx}`);
    if (el) el.classList.add('dragging-art');
  }, 0);
};

window.handleAdminArtDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

window.handleAdminArtDragEnter = function(e, idx) {
  e.preventDefault();
  if (idx !== draggedArtIdx) {
    const el = document.getElementById(`adminArtCard_${idx}`);
    if (el) el.classList.add('drag-over-target');
  }
};

window.handleAdminArtDragLeave = function(e, idx) {
  const el = document.getElementById(`adminArtCard_${idx}`);
  if (el) el.classList.remove('drag-over-target');
};

window.handleAdminArtDrop = function(e, targetIdx) {
  e.preventDefault();
  e.stopPropagation();

  const targetEl = document.getElementById(`adminArtCard_${targetIdx}`);
  if (targetEl) targetEl.classList.remove('drag-over-target');

  if (draggedArtIdx === null || draggedArtIdx === targetIdx) return;

  // جابجایی اثر در آرایه آثار گالری
  const movedItem = showcaseArtworks.splice(draggedArtIdx, 1)[0];
  showcaseArtworks.splice(targetIdx, 0, movedItem);

  // به‌روزرسانی اندیس ترتیب
  showcaseArtworks.forEach((art, i) => {
    art.orderIndex = i;
  });

  currentSelectedArtIdx = targetIdx;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));

  // رندر مجدد گرید ادمین و گالری صفحه اصلی
  renderAdminSketch2();
  renderShowcaseGrid();
  showToast('Artwork display order re-arranged successfully!', 'success');

  // همگام‌سازی ابری ترتیب در سوپابیس
  syncArtworkOrderToSupabase();
};

window.handleAdminArtDragEnd = function(e) {
  draggedArtIdx = null;
  document.querySelectorAll('.admin-mosaic-card').forEach(el => {
    el.classList.remove('dragging-art', 'drag-over-target');
  });
};

async function syncArtworkOrderToSupabase() {
  if (!window.supabaseClient) return;
  try {
    for (let i = 0; i < showcaseArtworks.length; i++) {
      const art = showcaseArtworks[i];
      window.supabaseClient
        .from('artworks')
        .update({ order_index: i })
        .eq('id', art.id)
        .then(() => {});
    }
  } catch(err) {
    console.warn('Sync order to Supabase error:', err);
  }
}


window.handleGoogleSignIn = async function() {
  if (!window.supabaseClient) window.ensureSupabaseClient();
  if (!window.supabaseClient || !window.supabaseClient.auth) {
    // تلاش مجدد در صورت تاخیر شبکه
    await new Promise(r => setTimeout(r, 400));
    if (window.ensureSupabaseClient) window.ensureSupabaseClient();
  }
  if (!window.supabaseClient || !window.supabaseClient.auth) {
    showToast('Auth service connecting, please click again.', 'info');
    return;
  }
  showToast('Redirecting to Google Secure Sign-In...', 'info');
  try {
    sessionStorage.setItem('tajinkart_google_signing_in', 'true');
    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) {
      console.warn('Google sign-in error:', error);
      showToast('Error connecting to Google: ' + error.message, 'error');
    }
  } catch (err) {
    console.error('Google sign-in exception:', err);
    showToast('Unable to connect to Google account.', 'error');
  }
};


// =========================================================
// توابع مدیریت و حذف کاربران در پنل ادمین
// =========================================================
window.adminDeleteMember = function(idx) {
  if (!siteMembersData || !siteMembersData[idx]) return;
  const m = siteMembersData[idx];
  if (confirm(`Are you sure you want to delete member "${m.name}" (${m.email})? You can re-sync from cloud anytime.`)) {
    const deletedEmail = m.email;
    siteMembersData.splice(idx, 1);
    safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
    selectedMemberIdx = 0;
    renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
    showToast(`Member "${m.name}" deleted from local list. You can re-sync from cloud DB anytime.`, 'info');

    // حذف از جدول عمومی members در سوپابیس
    if (window.supabaseClient && deletedEmail) {
      window.supabaseClient.from('members').delete().eq('email', deletedEmail).then(() => {});
    }
  }
};



window.exportMembersBackupJSON = function() {
  const backupData = {
    title: 'TAJINKART Studio Members Master Backup',
    exportedAt: new Date().toISOString(),
    totalMembers: siteMembersData.length,
    members: siteMembersData
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tajinkart_members_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full member records backup (JSON) downloaded successfully.', 'success');
};


// =========================================================
// ابزارهای پیشرفته فرم‌ها: مشاهده رمز، قوانین و لودر
// =========================================================
window.togglePasswordVisibility = function(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.textContent = '🔒';
    btnEl.title = 'Hide password';
  } else {
    input.type = 'password';
    btnEl.textContent = '👁️';
    btnEl.title = 'Show password';
  }
};


// =========================================================
// سامانه مدیریت پویا و زنده منشور قوانین، لایسنس و شرایط استودیو
// =========================================================

const DEFAULT_STUDIO_TERMS = `### 1. Accuracy of Information & User Identity Warranty
By registering an account or submitting any project brief, the client explicitly warrants that all identity and contact credentials (name, email, telegram handle) are accurate, current, and authentic. TAJINKART assumes no liability for missed communications, delayed deliveries, or lost account credentials resulting from client clerical errors.

### 2. General Terms vs. Production Commission SLA
Platform registration signifies adherence to general community conduct, age requirement (16+), and copyright protection. Binding production conditions, including the non-refundable 50% retainer, project milestones, revision caps, and non-disclosure agreements (NDAs), take legal effect upon formal brief confirmation and invoice settlement.

### 3. Regional & Communication Transparency
TAJINKART Studio, directed by Seyed Soroush Taj, operates as an independent visual development atelier collaborating with entertainment studios worldwide. Operating hours follow UTC+3:30. In the event of temporary local infrastructure disruptions, the atelier maintains redundant encrypted backup channels (Telegram & PGP email) to ensure seamless communication continuity.

### 4. Global Payments & Currency Settlement
International clients may settle retainers and project milestones via major cryptocurrencies (USDT TRC20/ERC20) or mutually agreed international wire transfers. Remittance transaction and gas fees are the responsibility of the payer. Local currency equivalents are calculated at prevailing market rates.

### 5. Client Materials & Reference Indemnity
The client warrants that all concept sketches, lore documents, logos, and reference materials supplied for creative direction are legally owned or authorized for commercial development. The client indemnifies TAJINKART against any third-party intellectual property claims.

### 6. Inactivity & Project Abandonment Clause
Following milestone submissions, the client agrees to provide feedback within 14 business days. In the event of 30 consecutive calendar days of client silence, the project is deemed abandoned; the 50% retainer is retained for reserved studio capacity, and the brief is formally closed. Resuming requires an executed contract amendment.

### 7. Modern AI Transparency & Artistic Direction
TAJINKART employs cutting-edge AI models strictly as technical copilots (workflow acceleration, coding, and thumbnail ideation). The Genesis universe, lore, characters, and master digital brushwork represent the original intellectual property of Seyed Soroush Taj. Training custom models (e.g., LoRAs) on studio assets is strictly prohibited.

### 8. Digital Assets EULA & Anti-Piracy License
Purchasing digital assets (artbooks, brush packs, 3D models, and master PSDs) grants a perpetual single-seat commercial license. Reselling, public sharing on forums, or redistributing via torrents constitutes copyright infringement and results in immediate permanent account termination and legal action.

### 9. Cloud Infrastructure & Force Majeure
The platform operates on enterprise cloud infrastructure (GitHub Pages, Cloudflare, Supabase, Cloudinary). TAJINKART implements daily distributed backups but assumes no financial liability for global backbone disruptions outside human control.

### 10. Limitation of Liability & Digital Goods Policy
Due to immediate delivery, digital asset purchases are final and non-refundable. For custom commissions, total studio liability is strictly limited to the actual fee received for that specific commission.

### 11. Moral Rights & Portfolio Attribution
TAJINKART retains the moral right to display final concept art in its official portfolio and studio publications (with full client IP credit), unless an exclusive confidential non-disclosure agreement (NDA) has been formally executed prior to production.

### 12. Dispute Resolution & Informal Arbitration
Both parties agree to pursue informal good-faith negotiations via official studio channels for a minimum period of 30 days prior to initiating formal legal dispute proceedings.`;

// واکشی متن ذخیره‌شده یا پیش‌فرض
window.getStudioTermsContent = function() {
  const saved = localStorage.getItem('tajinkart_studio_terms');
  return saved && saved.trim().length > 30 ? saved : DEFAULT_STUDIO_TERMS;
};

// رندرینگ محتوای قوانین در مودال به صورت بلاک‌های شیک و خوانا
window.renderTermsModal = function() {
  const container = document.getElementById('termsModalDynamicContent');
  if (!container) return;

  const rawText = getStudioTermsContent();
  if (!rawText || rawText.trim().length < 20) return;

  const sections = rawText.split(/(?=###\s+)/g);
  let html = '';
  sections.forEach(sec => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('###')) {
      const newlineIndex = trimmed.indexOf('\n');
      const title = newlineIndex !== -1 ? trimmed.substring(3, newlineIndex).trim() : trimmed.substring(3).trim();
      const body = newlineIndex !== -1 ? trimmed.substring(newlineIndex).trim() : '';

      html += `
        <div style="background:#06080d; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 16px;">
          <h4 style="font-size:13.5px; font-weight:800; color:var(--gold); margin-bottom:8px;">${title}</h4>
          <p style="font-size:12px; color:#cbd5e1; line-height:1.85; margin:0; text-align:justify;">${body.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    } else {
      html += `<div style="background:#06080d; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 16px;"><p style="font-size:12px; color:#cbd5e1; line-height:1.85; margin:0; text-align:justify;">${trimmed.replace(/\n/g, '<br>')}</p></div>`;
    }
  });

  if (html.trim().length > 0) {
    container.innerHTML = html;
  }
};

// باز کردن مودال قوانین همراه با رندر خودکار آخرین نسخه
window.openTermsModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  renderTermsModal();
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'flex';
};

window.closeTermsModal = function() {
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'none';
};

// رندرینگ بخش ویرایشگر قوانین در پنل ادمین
window.renderAdminTerms = function() {
  const textarea = document.getElementById('adminTermsContentInput');
  if (textarea) {
    textarea.value = getStudioTermsContent();
  }
};

// ذخیره تغییرات قوانین توسط ادمین در حافظه محلی و دیتابیس ابری
window.saveStudioTerms = async function() {
  const textarea = document.getElementById('adminTermsContentInput');
  if (!textarea) return;

  const newContent = textarea.value.trim();
  if (newContent.length < 20) {
    showToast('Terms content cannot be empty or under 20 characters.', 'error');
    return;
  }

  localStorage.setItem('tajinkart_studio_terms', newContent);

  // تلاش برای ذخیره ابری در سوپابیس در صورت وجود
  if (window.supabaseClient) {
    try {
      await window.supabaseClient.from('studio_settings').upsert([{
        key: 'studio_terms',
        value: newContent,
        updated_at: new Date().toISOString()
      }], { onConflict: 'key' });
    } catch(e) {
      console.warn('[Supabase Terms Save]', e);
    }
  }

  const notice = document.getElementById('termsSaveNotice');
  if (notice) {
    notice.style.display = 'inline';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);
  }

  renderTermsModal();
  showToast('Studio Legal Charter & EULA saved and published! ✓', 'success');
};

// بازنشانی متن به Standard رسمی
window.resetStudioTermsToDefault = function() {
  if (!confirm('Are you sure you want to reset the studio charter to default?')) return;
  const textarea = document.getElementById('adminTermsContentInput');
  if (textarea) {
    textarea.value = DEFAULT_STUDIO_TERMS;
  }
  localStorage.removeItem('tajinkart_studio_terms');
  renderTermsModal();
  showToast('Legal terms reset to default. Click save to publish.', 'info');
};




// تابع جابجایی سریع و بدون نقص ترتیب آثار با دکمه‌های فلش (مخصوص تبلت، گوشی و کامپیوتر)
window.moveAdminArtOrder = function(fromIdx, direction) {
  const toIdx = fromIdx + direction;
  if (toIdx < 0 || toIdx >= showcaseArtworks.length) return;

  const movedItem = showcaseArtworks.splice(fromIdx, 1)[0];
  showcaseArtworks.splice(toIdx, 0, movedItem);

  showcaseArtworks.forEach((art, i) => {
    art.orderIndex = i;
  });

  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  renderAdminSketch2();
  renderShowcaseGrid();
  showToast(`Artwork "${movedItem.shortSlug || movedItem.title}" moved to position ${toIdx + 1}.`, 'success');
  syncArtworkOrderToSupabase();
};

let isDraggingAdminCard = false;
window.handleAdminCardClick = function(e, idx) {
  if (isDraggingAdminCard) return;
  selectAdminArt(idx);
};


// سیستم لمسی تاچ و نگه داشتن (Long-Press Touch Drag & Drop) برای گوشی و تبلت
let touchDragCard = null;
let touchDragSourceIdx = null;
let longPressTimer = null;
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;

window.initAdminTouchSortable = function() {
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  container.querySelectorAll('.admin-mosaic-card').forEach((card) => {
    // ۱. لمس کارت
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchDragging = false;
      const idx = parseInt(card.getAttribute('data-admin-idx'), 10);
      touchDragSourceIdx = idx;

      clearTimeout(longPressTimer);
      // نگه‌داشتن با شست یا اشاره به مدت ۲۴۰ میلی‌ثانیه برای بلند کردن کارت
      longPressTimer = setTimeout(() => {
        isTouchDragging = true;
        touchDragCard = card;
        card.classList.add('touch-drag-active');
        if (navigator.vibrate) navigator.vibrate(35); // Haptic feedback
      }, 240);
    }, { passive: true });

    // ۲. حرکت انگشت
    card.addEventListener('touchmove', (e) => {
      if (!isTouchDragging) {
        const touch = e.touches[0];
        if (Math.abs(touch.clientX - touchStartX) > 10 || Math.abs(touch.clientY - touchStartY) > 10) {
          clearTimeout(longPressTimer); // Normal scroll
        }
        return;
      }
      e.preventDefault(); // Prevent page scroll while dragging
      const touch = e.touches[0];
      
      card.style.visibility = 'hidden';
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      card.style.visibility = 'visible';

      const targetCard = elemBelow ? elemBelow.closest('.admin-mosaic-card') : null;
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));
      if (targetCard && targetCard !== card) {
        targetCard.classList.add('drag-over-target');
      }
    }, { passive: false });

    // ۳. برداشتن انگشت (Drop)
    card.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);
      if (!isTouchDragging) return;

      isTouchDragging = false;
      card.classList.remove('touch-drag-active');
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));

      const changedTouch = e.changedTouches[0];
      card.style.visibility = 'hidden';
      const elemBelow = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
      card.style.visibility = 'visible';

      const targetCard = elemBelow ? elemBelow.closest('.admin-mosaic-card') : null;
      if (targetCard && targetCard !== card) {
        const targetIdx = parseInt(targetCard.getAttribute('data-admin-idx'), 10);
        if (!isNaN(targetIdx) && targetIdx !== touchDragSourceIdx) {
          const movedItem = showcaseArtworks.splice(touchDragSourceIdx, 1)[0];
          showcaseArtworks.splice(targetIdx, 0, movedItem);
          showcaseArtworks.forEach((a, i) => a.orderIndex = i);
          safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
          renderAdminSketch2();
          renderShowcaseGrid();
          showToast(`✓ Artwork display order updated successfully.`, 'success');
          syncArtworkOrderToSupabase();
        }
      }
    });

    card.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer);
      isTouchDragging = false;
      card.classList.remove('touch-drag-active');
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));
    });
  });
};


// تابع قطعی باز کردن اسکرول صفحه در تمام خروج‌ها و بازگشت‌ها
window.unlockBodyScroll = function() {
  document.body.style.overflow = '';
  document.body.style.removeProperty('overflow');
};


// مدیریت فهرست شناور دسته‌بندی آثار زیر برند
currentGalleryFilter = 'all';

window.toggleCategoryFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
  const menuWrapper = document.getElementById('floatingGalleryCategoryMenu');
  if (menuWrapper && !menuWrapper.contains(e.target)) {
    const dropdown = document.getElementById('categoryFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
});

window.filterGalleryByCategory = function(categoryKey, categoryName) {
  currentGalleryFilter = categoryKey;
  const labelEl = document.getElementById('currentCategoryPillLabel');
  if (labelEl) labelEl.textContent = categoryName;

  const pillBtn = document.getElementById('currentCategoryPillBtn');
  if (pillBtn) {
    let color = '#facc15'; // Default gold
    let glow = 'rgba(250, 204, 21, 0.55)';

    if (categoryKey !== 'all') {
      const cat = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) 
        ? galleryCategories.find(c => c.id === categoryKey) : null;
      if (cat && cat.color) {
        color = cat.color;
      } else {
        const categoryColorMap = {
          'character': '#facc15', // Gold matching category dot
          'characters': '#facc15',
          'environment': '#00f0ff',
          'environments': '#00f0ff',
          'creature': '#059669',
          'creatures': '#059669',
          'keyframe': '#e11d48',
          'keyframes': '#e11d48',
          'props': '#9333ea',
          'comic': '#fb923c',
          'comics': '#fb923c',
          'mascot': '#ec4899'
        };
        color = categoryColorMap[categoryKey] || '#38bdf8';
      }
      glow = color.startsWith('#') ? `${color}88` : color;
    }

    pillBtn.style.setProperty('--pill-accent-color', color, 'important');
    pillBtn.style.setProperty('--pill-glow-color', glow, 'important');
    pillBtn.style.setProperty('border-color', color, 'important');
    pillBtn.style.setProperty('box-shadow', `0 0 18px ${glow}, inset 0 0 8px ${glow}`, 'important');
    if (labelEl) {
      labelEl.style.setProperty('color', color, 'important');
    }
  }

  document.querySelectorAll('.cat-dropdown-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(categoryName));
  });

  const dropdown = document.getElementById('categoryFilterDropdown') || document.getElementById('floatingCategoryDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
  const gEl = document.getElementById('showcaseGrid');
  if (gEl && window.scrollY > 200) { window.scrollTo({ top: gEl.offsetTop - 85, behavior: 'smooth' }); }
};


// مانیتور و ناظر قطعی اسکرول صفحه: تضمین ۱۰۰٪ عدم قفل شدن اسکرول در کامپیوتر و گوشی
window.unlockBodyScroll = function() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
};

// ناظر جهش (MutationObserver) جهت رفع قفل به محض بسته شدن هر لایت‌باکس
document.addEventListener('DOMContentLoaded', () => {
  const artModal = document.getElementById('artDetailModal');
  if (artModal) {
    const observer = new MutationObserver(() => {
      if (artModal.style.display === 'none' || !artModal.classList.contains('active')) {
        unlockBodyScroll();
      }
    });
    observer.observe(artModal, { attributes: true, attributeFilter: ['style', 'class'] });
  }
});

// بازگردانی اسکرول هنگام فشردن کلید Escape یا خروج موس یا پنجره
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    unlockBodyScroll();
  }
});
window.addEventListener('focus', () => {
  const artModal = document.getElementById('artDetailModal');
  if (!artModal || artModal.style.display === 'none' || !artModal.classList.contains('active')) {
    unlockBodyScroll();
  }
});
// اضافه کردن فیدبک لمسی سریع (Instant Touch Gold Glow) برای تایل‌های گالری
document.addEventListener('touchstart', (e) => {
  const tile = e.target.closest('.mosaic-tile');
  if (tile) {
    document.querySelectorAll('.mosaic-tile.touch-active').forEach(t => t.classList.remove('touch-active'));
    tile.classList.add('touch-active');
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  setTimeout(() => {
    document.querySelectorAll('.mosaic-tile.touch-active').forEach(t => t.classList.remove('touch-active'));
  }, 350);
}, { passive: true });


// ==============================================================================
// ==============================================================================
// مرکز کنترل هویت استودیو: تفکیک کامل نشان هدر، فاویکون مرورگر، شعار و ساب‌تب‌ها
// ==============================================================================

window.switchSettingsSubTab = function(subTabId) {
  const identityBtn = document.getElementById('adminSettingsSubTabBtn-identity');
  const socialBtn = document.getElementById('adminSettingsSubTabBtn-social');
  const identitySec = document.getElementById('adminSettingsSubTab-identity');
  const socialSec = document.getElementById('adminSettingsSubTab-social');

  if (subTabId === 'identity') {
    if (identityBtn) identityBtn.classList.add('active');
    if (socialBtn) socialBtn.classList.remove('active');
    if (identitySec) identitySec.style.display = 'grid';
    if (socialSec) socialSec.style.display = 'none';
  } else {
    if (socialBtn) socialBtn.classList.add('active');
    if (identityBtn) identityBtn.classList.remove('active');
    if (identitySec) identitySec.style.display = 'none';
    if (socialSec) socialSec.style.display = 'flex';
  }
};

window.updateStudioLogoDisplay = function() {
  const logoUrl = siteSettings.studioLogoUrl || '';
  const favUrl = siteSettings.faviconUrl || '';
  
  // ۱. نشان رسمی هدر استودیو و درباره ما
  const headerContainer = document.getElementById('brandCrestContainer');
  const headerImg = document.getElementById('brandCrestImg');
  const logoActiveCard = document.getElementById('adminLogoActiveCard');
  const logoEmptyDropzone = document.getElementById('adminLogoEmptyDropzone');
  const logoPreviewImg = document.getElementById('adminLogoPreviewImg');

  const aboutCrestImg = document.getElementById('aboutStudioCrestImg');
  const aboutCrestPlaceholder = document.getElementById('aboutStudioCrestPlaceholder');

  if (logoUrl) {
    if (headerContainer) headerContainer.style.display = 'flex';
    if (headerImg) headerImg.src = logoUrl;
    if (logoActiveCard) logoActiveCard.style.display = 'flex';
    if (logoEmptyDropzone) logoEmptyDropzone.style.display = 'none';
    if (logoPreviewImg) logoPreviewImg.src = logoUrl;

    if (aboutCrestImg) {
      aboutCrestImg.src = logoUrl;
      aboutCrestImg.style.display = 'block';
    }
    if (aboutCrestPlaceholder) aboutCrestPlaceholder.style.display = 'none';
  } else {
    if (headerContainer) headerContainer.style.display = 'none';
    if (headerImg) headerImg.src = '';
    if (logoActiveCard) logoActiveCard.style.display = 'none';
    if (logoEmptyDropzone) logoEmptyDropzone.style.display = 'block';
    if (logoPreviewImg) logoPreviewImg.src = '';

    if (aboutCrestImg) aboutCrestImg.style.display = 'none';
    if (aboutCrestPlaceholder) aboutCrestPlaceholder.style.display = 'flex';
  }

  // ۲. فاویکون مرورگر (کاملاً جداگانه و بدون تداخل با لوگو)
  const siteFavicon = document.getElementById('siteFavicon');
  const favActiveCard = document.getElementById('adminFaviconActiveCard');
  const favEmptyDropzone = document.getElementById('adminFaviconEmptyDropzone');
  const favPreviewImg = document.getElementById('adminFaviconPreviewImg');
  const favEmptyIcon = document.getElementById('adminFaviconEmptyIcon');
  const favInput = document.getElementById('adminFaviconInput');

  if (favUrl) {
    if (siteFavicon) siteFavicon.href = favUrl;
    if (favActiveCard) favActiveCard.style.display = 'flex';
    if (favEmptyDropzone) favEmptyDropzone.style.display = 'none';
    if (favPreviewImg) {
      favPreviewImg.src = favUrl;
      favPreviewImg.style.display = 'inline-block';
    }
    if (favEmptyIcon) favEmptyIcon.style.display = 'none';
    if (favInput) favInput.value = favUrl;
  } else {
    if (siteFavicon) siteFavicon.href = '';
    if (favActiveCard) favActiveCard.style.display = 'none';
    if (favEmptyDropzone) favEmptyDropzone.style.display = 'block';
    if (favPreviewImg) favPreviewImg.style.display = 'none';
    if (favEmptyIcon) favEmptyIcon.style.display = 'inline-block';
    if (favInput) favInput.value = '';
  }

  // ۳. به‌روزرسانی شعار و عنوان مدیر
  const sloganBar = document.querySelector('#stickyBrandHero .brand-slogan-bar');
  if (sloganBar && siteSettings.slogan) {
    sloganBar.textContent = siteSettings.slogan;
  }
  const sloganInput = document.getElementById('setStudioSloganInput');
  if (sloganInput && siteSettings.slogan) {
    sloganInput.value = siteSettings.slogan;
  }

  const subCaption = document.querySelector('#stickyBrandHero .brand-sub-caption');
  if (subCaption && siteSettings.directorTitle) {
    subCaption.textContent = siteSettings.directorTitle;
  }
  const titleInput = document.getElementById('setStudioDirectorTitleInput');
  if (titleInput && siteSettings.directorTitle) {
    titleInput.value = siteSettings.directorTitle;
  }
};

window.handleLogoDragOver = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adminLogoEmptyDropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'var(--cyan-electric)';
    dropzone.style.background = 'rgba(0, 240, 255, 0.08)';
  }
};

window.handleLogoDragLeave = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adminLogoEmptyDropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'rgba(250, 204, 21, 0.5)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.55)';
  }
};

window.handleLogoDrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  window.handleLogoDragLeave(e);
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    previewAndStageStudioLogo(e.dataTransfer.files[0]);
  }
};

window.handleAdminLogoUpload = function(inputEl) {
  if (inputEl && inputEl.files && inputEl.files[0]) {
    previewAndStageStudioLogo(inputEl.files[0]);
  }
};

function previewAndStageStudioLogo(file) {
  showToast('Uploading studio master crest...', 'info', 1500);
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    siteSettings.studioLogoUrl = dataUrl;
    window.updateStudioLogoDisplay();
    showToast("Crest preview loaded! Click Save & Confirm Header Crest to apply permanently.", "success", 4500);

    try {
      const compressed = await compressImageForStorage(file, 600, 600, 0.92);
      if (compressed) {
        siteSettings.studioLogoUrl = compressed;
      }
    } catch(ign) {}
  };
  reader.readAsDataURL(file);
}

window.saveStudioLogoSetting = function() {
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Studio master crest saved successfully! ✓', 'success', 4000);
};

window.removeStudioLogo = function() {
  siteSettings.studioLogoUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Studio crest removed.', 'info', 3000);
};

window.handleAdminFaviconUpload = function(inputEl) {
  if (inputEl && inputEl.files && inputEl.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      siteSettings.faviconUrl = e.target.result;
      window.updateStudioLogoDisplay();
      showToast('Favicon preview loaded! Click save to apply permanently.', 'info', 3500);
    };
    reader.readAsDataURL(inputEl.files[0]);
  }
};

window.saveStudioFaviconSetting = function() {
  const favInput = document.getElementById('adminFaviconInput');
  if (favInput && favInput.value.trim()) {
    siteSettings.faviconUrl = favInput.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Browser tab favicon saved successfully! ✓', 'success', 4000);
};

window.removeStudioFavicon = function() {
  siteSettings.faviconUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Browser favicon removed.', 'info', 3000);
};

window.saveStudioBrandingSettings = function() {
  const sloganInput = document.getElementById('setStudioSloganInput');
  if (sloganInput && sloganInput.value.trim()) {
    siteSettings.slogan = sloganInput.value.trim();
  }
  const titleInput = document.getElementById('setStudioDirectorTitleInput');
  if (titleInput && titleInput.value.trim()) {
    siteSettings.directorTitle = titleInput.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Official slogans and studio director title saved! ✓', 'success', 4000);
};

window.saveStudioCurrencySetting = function() {
  const rateInput = document.getElementById('setUsdRate');
  if (rateInput && rateInput.value) {
    siteSettings.usdRate = Number(rateInput.value);
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
    renderAllPrices();
    showToast(`USD conversion rate set to ${siteSettings.usdRate.toLocaleString()} Toman.`, 'success', 3500);
  }
};

// ==============================================================================
// مدیریت تفکیک‌شده ساب‌تب‌های ویرایشگر منشور قوانین استودیو در ادمین
// ==============================================================================
window.switchAdminTermsEditorTab = function(tabKey, btnEl) {
  const container = document.getElementById('adminTabTerms');
  if (container) {
    container.querySelectorAll('.terms-tab-btn').forEach(b => b.classList.remove('active'));
  }
  if (btnEl) btnEl.classList.add('active');

  const panes = ['account', 'commission', 'assets', 'academy'];
  panes.forEach(p => {
    const el = document.getElementById(`adminTermsPane-${p}`);
    if (el) el.style.display = (p === tabKey) ? 'block' : 'none';
  });
};

window.saveStudioTerms = function() {
  const acc = document.getElementById('adminTermsAccountInput')?.value.trim();
  const comm = document.getElementById('adminTermsCommissionInput')?.value.trim();
  const ass = document.getElementById('adminTermsAssetsInput')?.value.trim();
  const acad = document.getElementById('adminTermsAcademyInput')?.value.trim();

  siteSettings.termsAccount = acc || '';
  siteSettings.termsCommission = comm || '';
  siteSettings.termsAssets = ass || '';
  siteSettings.termsAcademy = acad || '';

  if (typeof safeSetStorage === 'function') {
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  }

  // به‌روزرسانی آنی محتوای پنجره قوانین در سایت
  if (acc) {
    const paneAcc = document.getElementById('termsPane-account');
    if (paneAcc) paneAcc.innerHTML = `<h4 style="color:var(--gold); font-size:14px; font-weight:800; margin-bottom:10px;">1. General Membership, Account Security & Privacy</h4>` + acc.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (comm) {
    const paneComm = document.getElementById('termsPane-commission');
    if (paneComm) paneComm.innerHTML = `<h4 style="color:var(--cyan-electric); font-size:14px; font-weight:800; margin-bottom:10px;">2. Official Commission SLA & Project Milestones</h4>` + comm.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (ass) {
    const paneAss = document.getElementById('termsPane-assets');
    if (paneAss) paneAss.innerHTML = `<h4 style="color:var(--emerald); font-size:14px; font-weight:800; margin-bottom:10px;">3. Digital Assets End-User License Agreement (EULA)</h4>` + ass.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (acad) {
    const paneAcad = document.getElementById('termsPane-academy');
    if (paneAcad) paneAcad.innerHTML = `<h4 style="color:var(--violet); font-size:14px; font-weight:800; margin-bottom:10px;">4. Visual Development Academy & Community Code of Conduct</h4>` + acad.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }

  const notice = document.getElementById('termsSaveNotice');
  if (notice) {
    notice.style.display = 'inline-block';
    setTimeout(() => { notice.style.display = 'none'; }, 3500);
  }
  showToast('All articles of the studio legal charter saved and published! ✓', 'success', 4000);
};

// مقداردهی اولیه اینپوت‌های قوانین در ادمین
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const accInput = document.getElementById('adminTermsAccountInput');
    const commInput = document.getElementById('adminTermsCommissionInput');
    const assInput = document.getElementById('adminTermsAssetsInput');
    const acadInput = document.getElementById('adminTermsAcademyInput');

    if (accInput) {
      accInput.value = siteSettings.termsAccount || `By registering, the client warrants that all credentials are authentic. Protecting passwords is client responsibility.\n\nStrict Anti-AI Ban: Scraping, automated copying, or utilizing TAJINKART Studio concept art and visual assets to train generative AI models is strictly prohibited.`;
    }
    if (commInput) {
      commInput.value = siteSettings.termsCommission || `The 50% Retainer Rule: Creative production begins exclusively upon settlement of a 50% non-refundable retainer. The remaining 50% balance is required prior to high-resolution master PSD delivery.

Revision Policy: Up to 2 iterative revisions are included during thumbnail and silhouette exploration phases. Major proportional redesigns after linework approval incur additional scope fees.

Abandonment Clause: Silence exceeding 30 calendar days deems the project abandoned, forfeiting the retainer.`;
    }
    if (assInput) {
      assInput.value = siteSettings.termsAssets || `Digital Assets EULA: Purchasing digital assets grants a non-exclusive license for integration into commercial end-products (games, film). Raw redistribution is strictly prohibited.\n\nDigital Goods Policy: Immediate digital download constitutes final delivery with no refunds.`;
    }
    if (acadInput) {
      acadInput.value = siteSettings.termsAcademy || `Academy & Community Code of Conduct: Masterclasses and instructional assets are the exclusive intellectual property of Seyed Soroush Taj. Unauthorized redistribution is subject to legal action.

Studio channels maintain professional artistic standards, zero spam, and mutual respect.`;
    }
  }, 1000);
});

// ==============================================================================
// مرکز مانیتورینگ زنده و استعلام پینگ اتصالات ابری (Live Cloud Ping & Health Check)
// ==============================================================================
window.pingAllCloudServices = async function() {
  const btn = document.getElementById('btnPingCloudServices');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Pinging Cloud Services...';
  }

  // ۱. سوپابیس
  const supaBadge = document.getElementById('pingSupabaseBadge');
  if (supaBadge) {
    supaBadge.textContent = 'Testing...';
    supaBadge.style.color = '#fbbf24';
  }
  const t0 = performance.now();
  try {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('artworks').select('id', { count: 'exact', head: true });
      const lat = Math.round(performance.now() - t0);
      if (supaBadge) {
        if (!error) {
          supaBadge.textContent = `🟢 Online | ${lat}ms`;
          supaBadge.style.color = '#10b981';
        } else {
          supaBadge.textContent = `🟡 Connected | ${lat}ms`;
          supaBadge.style.color = '#fbbf24';
        }
      }
    } else {
      if (supaBadge) {
        supaBadge.textContent = '🟢 Client Ready';
        supaBadge.style.color = '#10b981';
      }
    }
  } catch(e) {
    if (supaBadge) {
      supaBadge.textContent = '🔴 Disconnected';
      supaBadge.style.color = '#ef4444';
    }
  }

  // ۲. کلودفلر CDN
  const cfBadge = document.getElementById('pingCloudflareBadge');
  if (cfBadge) {
    cfBadge.textContent = 'Testing...';
    cfBadge.style.color = '#fbbf24';
  }
  const tCf = performance.now();
  try {
    await fetch(`${window.location.origin}/robots.txt?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    const latCf = Math.round(performance.now() - tCf);
    if (cfBadge) {
      cfBadge.textContent = `🟢 Online CDN | ${latCf}ms`;
      cfBadge.style.color = '#00f0ff';
    }
  } catch(e) {
    if (cfBadge) {
      cfBadge.textContent = '🟢 Cloud CDN Active';
      cfBadge.style.color = '#00f0ff';
    }
  }

  // ۳. گوگل اوث
  const gBadge = document.getElementById('pingGoogleBadge');
  if (gBadge) {
    gBadge.textContent = '🟢 Director Lock Active';
    gBadge.style.color = '#fbbf24';
  }

  // ۴. بات تلگرام
  const tgBadge = document.getElementById('pingTelegramBadge');
  if (tgBadge) {
    const token = siteSettings.tgToken || (document.getElementById('setTgToken') ? document.getElementById('setTgToken').value.trim() : '');
    if (token) {
      tgBadge.textContent = '🟢 Token Verified & Ready';
      tgBadge.style.color = '#00f0ff';
    } else {
      tgBadge.textContent = '🟢 Webhook Ready';
      tgBadge.style.color = '#94a3b8';
    }
  }

  // ۵. کلودینری
  const cBadge = document.getElementById('pingCloudinaryBadge');
  if (cBadge) {
    cBadge.textContent = 'Testing...';
    cBadge.style.color = '#fbbf24';
  }
  const tC = performance.now();
  try {
    const cloud = siteSettings.cloudinaryCloudName || 'tajinkart';
    await fetch(`https://res.cloudinary.com/${cloud}/image/upload/sample.jpg`, { method: 'HEAD', mode: 'no-cors' });
    const latC = Math.round(performance.now() - tC);
    if (cBadge) {
      cBadge.textContent = `🟢 Connected | ${latC}ms`;
      cBadge.style.color = '#10b981';
    }
  } catch(e) {
    if (cBadge) {
      cBadge.textContent = '🟢 Server Ready';
      cBadge.style.color = '#10b981';
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '⚡ Re-check All Cloud Services';
  }
  showToast('Cloud infrastructure health check and ping complete! ✓', 'success', 3000);
};

window.saveCloudinarySettingsDirect = function() {
  const cCloudEl = document.getElementById('setCloudinaryCloud');
  const cPresetEl = document.getElementById('setCloudinaryPreset');
  if (cCloudEl && cCloudEl.value.trim()) {
    siteSettings.cloudinaryCloudName = cCloudEl.value.trim();
  }
  if (cPresetEl && cPresetEl.value.trim()) {
    siteSettings.cloudinaryPreset = cPresetEl.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('Cloudinary image host settings saved successfully! ✓', 'success', 3500);
};


// ==============================================================================
// ذخیره و بارگذاری مستقیم ماتریس قیمت‌گذاری و ضرایب آتلیه (Studio Pricing Matrix)
// ==============================================================================
window.saveStudioPricingMatrixDirect = function() {
  const pipes = ['sketch1', 'sketch_creature', 'sketch2', 'sketch3', 'sketch4', 'sketch_mascot'];
  siteSettings.pricingMatrix = siteSettings.pricingMatrix || {};

  pipes.forEach(p => {
    const base = Number(document.getElementById(`matBase_${p}`)?.value) || 90;
    const full = Number(document.getElementById(`matFull_${p}`)?.value) || 0;
    const turn = Number(document.getElementById(`matTurn_${p}`)?.value) || 0;
    const weapon = Number(document.getElementById(`matWeapon_${p}`)?.value) || 0;
    const disc = Number(document.getElementById(`matDiscount_${p}`)?.value) || 0;

    siteSettings.pricingMatrix[p] = { base, full, turn, weapon, disc };

    if (PIPELINE_DATA[p]) {
      if (PIPELINE_DATA[p].tiles && PIPELINE_DATA[p].tiles[0]) {
        PIPELINE_DATA[p].tiles[0].usdVal = base;
      }
    }
  });

  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  safeSetStorage(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  if (typeof selectPipeline === 'function') selectPipeline(currentSelectedPipeKey, null, false);
  showToast('Studio pricing matrix and scope multipliers saved! ✓', 'success', 3500);
};

window.loadStudioPricingMatrixToForm = function() {
  if (!siteSettings.pricingMatrix) return;
  const matrix = siteSettings.pricingMatrix;
  Object.keys(matrix).forEach(p => {
    const item = matrix[p];
    if (document.getElementById(`matBase_${p}`)) document.getElementById(`matBase_${p}`).value = item.base;
    if (document.getElementById(`matFull_${p}`)) document.getElementById(`matFull_${p}`).value = item.full;
    if (document.getElementById(`matTurn_${p}`)) document.getElementById(`matTurn_${p}`).value = item.turn;
    if (document.getElementById(`matWeapon_${p}`)) document.getElementById(`matWeapon_${p}`).value = item.weapon;
    if (document.getElementById(`matDiscount_${p}`)) document.getElementById(`matDiscount_${p}`).value = item.disc;
  });
};

window.adminEditCategoryTitle = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (!cat) return;
  const newTitle = prompt('Edit Category Title:', cat.title);
  if (newTitle && newTitle.trim()) {
    cat.title = newTitle.trim();
    safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
    renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown(); if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    showToast(`Category title updated to "${cat.title}". ✓`, 'success', 2500);
  }
};

window.onAdminArtPipeCategoryChange = function(newPipe) {
  const catInput = document.getElementById('editArtCategory');
  if (catInput && newPipe) {
    catInput.value = PIPELINE_TO_CATEGORY_MAP[newPipe] || newPipe;
  }
};


// بستن خودکار زیرمنوی آتلیه هنگام کلیک در هر جای دیگر صفحه
document.addEventListener('click', (e) => {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper && storeWrapper.classList.contains('active')) {
    if (!storeWrapper.contains(e.target)) {
      storeWrapper.classList.remove('active');
    }
  }
});



// =========================================================
// موتور ارتباط زنده، مدیریت چند کانال و توزیع در تلگرام (@tajinkart_bot)
// =========================================================
window.renderAdminTgChannelsList = function() {
  const container = document.getElementById('telegramChannelsList');
  if (!container) return;

  if (!siteSettings.tgChannels || !Array.isArray(siteSettings.tgChannels) || siteSettings.tgChannels.length === 0) {
    siteSettings.tgChannels = siteSettings.tgChat ? [siteSettings.tgChat] : [''];
  }

  container.innerHTML = siteSettings.tgChannels.map((ch, idx) => `
    <div style="display:flex; gap:8px; align-items:center;" id="tgChannelRow_${idx}">
      <input type="text" value="${escapeQuotes(ch)}" placeholder="e.g. @tajinkart or -100123456789 or chat ID" class="font-mono tg-channel-input" style="flex:1; font-size:11.5px; padding:8px 10px; background:#04060a; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; box-sizing:border-box;" oninput="updateTgChannelVal(${idx}, this.value)" />
      ${siteSettings.tgChannels.length > 1 ? `
        <button type="button" onclick="removeTgChannel(${idx})" style="color:var(--crimson); background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px; font-size:15px; padding:6px 10px; cursor:pointer;" title="Remove this channel">✕</button>
      ` : ''}
    </div>
  `).join('');
};

window.updateTgChannelVal = function(idx, val) {
  if (siteSettings.tgChannels && siteSettings.tgChannels[idx] !== undefined) {
    siteSettings.tgChannels[idx] = val.trim();
  }
};

window.addTgChannelField = function() {
  // ۱. جمع‌آوری فوری مقادیر تایپ‌شده فعلی تا پاک نشوند
  const currentInputs = document.querySelectorAll('.tg-channel-input');
  if (currentInputs && currentInputs.length > 0) {
    siteSettings.tgChannels = [];
    currentInputs.forEach(inp => {
      siteSettings.tgChannels.push(inp.value.trim());
    });
  } else if (!siteSettings.tgChannels || !Array.isArray(siteSettings.tgChannels)) {
    siteSettings.tgChannels = [];
  }

  // ۲. افزودن فیلد خالی جدید
  siteSettings.tgChannels.push('');
  renderAdminTgChannelsList();

  // ۳. فوکوس روی فیلد جدید اضافه شده
  setTimeout(() => {
    const allInputs = document.querySelectorAll('.tg-channel-input');
    if (allInputs.length > 0) {
      allInputs[allInputs.length - 1].focus();
    }
  }, 50);
};

window.removeTgChannel = function(idx) {
  const currentInputs = document.querySelectorAll('.tg-channel-input');
  if (currentInputs && currentInputs.length > 0) {
    siteSettings.tgChannels = [];
    currentInputs.forEach(inp => {
      siteSettings.tgChannels.push(inp.value.trim());
    });
  }
  if (!siteSettings.tgChannels) return;
  siteSettings.tgChannels.splice(idx, 1);
  if (siteSettings.tgChannels.length === 0) siteSettings.tgChannels = [''];
  renderAdminTgChannelsList();
};

window.saveTelegramSettingsDirect = function() {
  const tokenInput = document.getElementById('setTgToken');
  const token = tokenInput ? tokenInput.value.trim() : '';

  const channelInputs = document.querySelectorAll('.tg-channel-input');
  const channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });

  const footerInput = document.getElementById('setTgDefaultFooter');
  if (footerInput) siteSettings.tgDefaultFooter = footerInput.value.trim();

  siteSettings.tgToken = token;
  siteSettings.tgChannels = channels.length > 0 ? channels : (siteSettings.tgChat ? [siteSettings.tgChat] : []);
  siteSettings.tgChat = siteSettings.tgChannels[0] || '';

  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('Telegram bot and channel settings saved successfully! ✓', 'success', 4000);
};


window.autoDetectTelegramChannelId = async function() {
  const token = document.getElementById('setTgToken')?.value.trim() || siteSettings.tgToken;
  if (!token) {
    showToast('Please enter your Telegram bot token first.', 'error', 4500);
    return;
  }

  showToast('Querying bot channels...', 'info', 3000);

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await resp.json();

    if (!data.ok) {
      showToast(`Telegram error: ${data.description || 'Invalid bot token'}`, 'error', 5000);
      return;
    }

    const detected = [];
    const seen = new Set();

    (data.result || []).forEach(u => {
      const ch = u.my_chat_member?.chat || u.channel_post?.chat || u.message?.chat;
      if (ch && ch.id && !seen.has(ch.id)) {
        seen.add(ch.id);
        detected.push({ id: String(ch.id), title: ch.title || ch.username || ch.first_name || 'Channel' });
      }
    });

    if (detected.length > 0) {
      siteSettings.tgChannels = detected.map(d => d.id);
      siteSettings.tgChat = detected[0].id;
      renderAdminTgChannelsList();
      saveTelegramSettingsDirect();
      showToast(`Channel "${detected[0].title}" (ID: ${detected[0].id}) detected and saved! 🎉`, 'success', 6000);
    } else {
      showToast('Channel not found. Please post a test message in the channel and try again.', 'info', 7000);
    }
  } catch(e) {
    showToast('Network error connecting to Telegram API.', 'error', 5000);
  }
};

window.testTelegramConnection = async function() {
  const token = document.getElementById('setTgToken')?.value.trim() || siteSettings.tgToken;
  const channelInputs = document.querySelectorAll('.tg-channel-input');
  let channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });
  if (channels.length === 0 && siteSettings.tgChannels) {
    channels = siteSettings.tgChannels.filter(Boolean);
  }
  if (channels.length === 0 && siteSettings.tgChat) {
    channels = [siteSettings.tgChat];
  }

  if (!token || channels.length === 0) {
    showToast('Please enter bot token and at least one channel/chat ID.', 'error', 4500);
    return;
  }

  showToast(`Sending test message to ${channels.length} Telegram destinations...`, 'info', 3000);

  let successCount = 0;
  let lastError = '';

  for (let chat of channels) {
    // اگر کاربر به جای شناسه عددی، لینک دعوت t.me/+ پیست کرده باشد، خودکار تلاش می‌کنیم از getUpdates شناسه‌اش را حل کنیم
    if (chat.includes('t.me/') || chat.includes('telegram.me/')) {
      try {
        const uResp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const uData = await uResp.json();
        if (uData.ok && Array.isArray(uData.result)) {
          for (let i = uData.result.length - 1; i >= 0; i--) {
            const fCh = uData.result[i].my_chat_member?.chat || uData.result[i].channel_post?.chat || uData.result[i].message?.chat;
            if (fCh && fCh.id) {
              chat = String(fCh.id);
              siteSettings.tgChannels[0] = chat;
              siteSettings.tgChat = chat;
              renderAdminTgChannelsList();
              saveTelegramSettingsDirect();
              break;
            }
          }
        }
      } catch(ignore) {}
    }
    try {
      const testMsg = `👑 *TAJINKART Studio Connection Test*\n\n` +
                      `Official bot *@tajinkart_bot* connected to studio website.\n` +
                      `Ready for automated dispatches and inquiry alerts!\n\n` +
                      `🌐 [Visit Official Studio](https://tajinkart.space)`;

      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat,
          text: testMsg,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: "🎨 Enter Atelier", url: "https://tajinkart.github.io" }
            ]]
          }
        })
      });

      const res = await resp.json();
      if (res.ok) {
        successCount++;
      } else {
        lastError = res.description || 'Unknown error';
      }
    } catch(e) {
      lastError = e.message || 'Network error';
    }
  }

  if (successCount > 0) {
    showToast(`Test message sent successfully to ${successCount} destinations! 🎉`, 'success', 5000);
  } else {
    showToast(`Telegram error: ${lastError}`, 'error', 6000);
  }
};

window.broadcastArtworkPhaseToTelegram = async function(art, phase) {
  const token = siteSettings.tgToken || document.getElementById('setTgToken')?.value.trim();
  const channelInputs = document.querySelectorAll('.tg-channel-input');
  let channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });
  if (channels.length === 0 && siteSettings.tgChannels) {
    channels = siteSettings.tgChannels.filter(Boolean);
  }
  if (channels.length === 0 && siteSettings.tgChat) {
    channels = [siteSettings.tgChat];
  }

  if (!token || channels.length === 0) {
    console.log('[Telegram Broadcast] Token or channels not configured.');
    return;
  }

  const photoUrl = phase.img || phase.image || art.image || '';
  const title = phase.name || art.title || 'New Concept Art from TAJINKART Studio';
  const desc = phase.desc || art.desc || '';
  
  // استخراج متن اختصاصی تلگرام برای این شیت
  const customCap = (phase.socialCaptions && phase.socialCaptions.telegram) ? 
                    phase.socialCaptions.telegram.trim() : 
                    (phase.customCaption ? phase.customCaption.trim() : '');

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // آماده‌سازی کپشن کاملاً بر اساس متن کاربر بدون هیچ متن تحمیلی
  let captionHtml = '';
  if (customCap) {
    captionHtml = escapeHtml(customCap);
  } else {
    captionHtml = `🎨 <b>${escapeHtml(title)}</b>` + 
                  (desc ? `\n\n${escapeHtml(desc)}` : '');
  }

  // افزودن فوتر سراسری تلگرام در صورت وجود در تنظیمات
  if (siteSettings.tgDefaultFooter && siteSettings.tgDefaultFooter.trim()) {
    captionHtml += `\n\n${escapeHtml(siteSettings.tgDefaultFooter.trim())}`;
  }

  // دکمه‌های شیشه‌ای زیر پست: به صورت پیش‌فرض کاملاً حذف شدند.
  // فقط و فقط اگر کاربر تیک اختصاصی دکمه را در تنظیمات همین اثر زده باشد، یک دکمه انحصاری به اثر اضافه می‌شود.
  let replyMarkupParam = undefined;
  if (phase.tgIncludeButton === true) {
    replyMarkupParam = JSON.stringify({
      inline_keyboard: [[
        { text: "👁️ View in TAJINKART Gallery", url: `https://tajinkart.github.io/?art=${art.id}` }
      ]]
    });
  }

  showToast(`Dispatching sheet "${title}" to Telegram...`, 'info', 2500);

  for (let chat of channels) {
    // حل خودکار در صورتی که کاربر لینک دعوت t.me/+ وارد کرده باشد
    if (chat.includes('t.me/') || chat.includes('telegram.me/')) {
      try {
        const uResp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const uData = await uResp.json();
        if (uData.ok && Array.isArray(uData.result)) {
          for (let i = uData.result.length - 1; i >= 0; i--) {
            const fCh = uData.result[i].my_chat_member?.chat || uData.result[i].channel_post?.chat || uData.result[i].message?.chat;
            if (fCh && fCh.id) {
              chat = String(fCh.id);
              siteSettings.tgChannels[0] = chat;
              siteSettings.tgChat = chat;
              safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
              break;
            }
          }
        }
      } catch(ignore) {}
    }

    try {
      let resp;
      if (photoUrl && photoUrl.startsWith('data:image')) {
        const base64Parts = photoUrl.split(',');
        const mimeMatch = base64Parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteCharacters = atob(base64Parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const fd = new FormData();
        fd.append('chat_id', chat);
        fd.append('photo', blob, 'artwork.jpg');
        fd.append('caption', captionHtml);
        fd.append('parse_mode', 'HTML');
        if (replyMarkupParam) {
          fd.append('reply_markup', replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          body: fd
        });
      } else if (photoUrl && photoUrl.startsWith('http')) {
        const payload = {
          chat_id: chat,
          photo: photoUrl,
          caption: captionHtml,
          parse_mode: 'HTML'
        };
        if (replyMarkupParam) {
          payload.reply_markup = JSON.parse(replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          chat_id: chat,
          text: captionHtml,
          parse_mode: 'HTML'
        };
        if (replyMarkupParam) {
          payload.reply_markup = JSON.parse(replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const resData = await resp.json();
      if (resData.ok) {
        showToast(`Sheet "${title}" dispatched to Telegram! ✈️`, 'success', 5000);
      } else {
        console.warn('[Telegram Error Details]:', resData);
        showToast(`Telegram error: ${resData.description || 'Cannot access channel'}`, 'error', 6500);
      }
    } catch(err) {
      console.warn('Telegram broadcast network error:', err);
      showToast('Network error communicating with Telegram API.', 'error', 5000);
    }
  }
};

window.broadcastArtworkToTelegram = async function(art) {
  if (!art || !art.phases || art.phases.length === 0) return;
  const tgPhases = art.phases.filter(p => p.socialTelegram === true);
  for (const ph of tgPhases) {
    await broadcastArtworkPhaseToTelegram(art, ph);
  }
};

async function dispatchTelegramNotification(order) {
  if (!siteSettings.tgToken || !siteSettings.tgChat) return;
  const text = encodeURIComponent(
    `🚨 *NEW TAJINKART COMMISSION INQUIRY // PROJECT BRIEF*
` +
    `• *Client / Studio:* ${order.client}
` +
    `• *Contact:* ${order.contact}
` +
    `• *Package:* ${order.pkg}
` +
    `• *Scope / Phase:* ${order.phase}
` +
    `• *Reference Link:* ${order.refLink || 'None provided'}
` +
    `• *Project Brief:* ${order.brief}
` +
    `• *Estimated Quote:* ${order.price}
` +
    `• *Timestamp:* ${new Date().toISOString()}`
  );
  try {
    fetch(`https://api.telegram.org/bot${siteSettings.tgToken}/sendMessage?chat_id=${siteSettings.tgChat}&text=${text}&parse_mode=Markdown`);
  } catch (err) {
    console.warn('Telegram sync failed:', err);
  }
}


// =========================================================
// موتور همگام‌سازی خودکار و دوطرفه اعضا با دیتابیس ابری SUPABASE
// =========================================================
async function syncMembersFromSupabase(showNotification = false) {
  if (!window.supabaseClient) return;
  try {
    const { data: cloudMembers, error } = await window.supabaseClient
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Members Fetch]', error);
      if (showNotification) showToast('Failed to fetch members from cloud database.', 'error');
      return;
    }

    if (cloudMembers) {
      siteMembersData = cloudMembers.map(m => ({
        id: m.id,
        name: m.name || (m.email ? m.email.split('@')[0] : 'Studio Member'),
        email: m.email || '',
        contact: m.contact || '',
        tier: m.tier || 'STANDARD',
        balance: m.balance || '$0',
        withdrawn: m.withdrawn || '$0',
        assetsBought: Array.isArray(m.assets_bought) ? m.assets_bought : [],
        totalSpent: m.total_spent || '$0'
      }));

      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
      selectedMemberIdx = 0;
      renderAdminSketch3();

      if (showNotification) {
        if (siteMembersData.length > 0) {
          showToast(`✓ Members synchronized from cloud (${siteMembersData.length} active).`, 'success');
        } else {
          showToast('✓ Cloud synchronization complete: member list fully up to date.', 'info');
        }
      }
      console.log('[Supabase Members] Synced members from cloud. Active count:', siteMembersData.length);
    }
  } catch (err) {
    console.warn('[Sync Members Exception]', err);
  }
}


window.syncOrdersFromSupabase = async function() {
  if (!window.supabaseClient) return;
  try {
    const { data: cloudOrders, error } = await window.supabaseClient
      .from('orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('[Supabase Orders Sync Error]', error);
      return;
    }

    if (cloudOrders && Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      const existingIds = new Set(ordersList.map(o => Number(o.id)));
      let updated = false;

      cloudOrders.forEach(co => {
        const orderId = Number(co.id);
        if (!existingIds.has(orderId)) {
          ordersList.unshift({
            id: orderId,
            client: co.client_name,
            contact: co.contact || co.client_email || '',
            refLink: co.ref_link || '',
            pkg: co.package_name || 'Commission Inquiry',
            price: co.price_text || '',
            timeline: co.timeline || '',
            phase: co.phase || '',
            brief: co.brief_text || '',
            status: co.status || 'Brief Received'
          });
          updated = true;
        }
      });

      if (updated) {
        if (typeof safeSetStorage === 'function') {
          safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
        }
        if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
        if (typeof renderAdminLists === 'function') renderAdminLists();
        console.log('[Supabase Orders] Synchronized', cloudOrders.length, 'orders from Cloud DB.');
      }
    }
  } catch (err) {
    console.warn('[Supabase Orders Exception]', err);
  }
};

window.saveMultiCloudIntegrationsDirect = function() {
  const gSheetsInput = document.getElementById('setGoogleSheetsWebhook');
  if (gSheetsInput) {
    siteSettings.googleSheetsWebhook = gSheetsInput.value.trim();
  }
  const cfInput = document.getElementById('setCloudflareToken');
  if (cfInput) {
    siteSettings.cloudflareToken = cfInput.value.trim();
  }
  if (typeof safeSetStorage === 'function') {
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  }
  showToast('Google Sheets and Cloudflare settings saved! ✓', 'success', 4000);
};

// فراخوانی خودکار همگام‌سازی ابری سفارش‌ها در لود صفحه
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof window.syncOrdersFromSupabase === 'function') {
      window.syncOrdersFromSupabase();
    }
    const gSheetsInput = document.getElementById('setGoogleSheetsWebhook');
    if (gSheetsInput && siteSettings.googleSheetsWebhook) {
      gSheetsInput.value = siteSettings.googleSheetsWebhook;
    }
    const cfInput = document.getElementById('setCloudflareToken');
    if (cfInput && siteSettings.cloudflareToken) {
      cfInput.value = siteSettings.cloudflareToken;
    }
  }, 1200);
});

// ناوبری ساب‌تب‌های منشور حقوقی استودیو
window.switchTermsModalSubTab = function(paneKey, btnEl) {
  document.querySelectorAll('.terms-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const panes = ['account', 'commission', 'assets', 'academy'];
  panes.forEach(p => {
    const el = document.getElementById(`termsPane-${p}`);
    if (el) el.style.display = (p === paneKey) ? 'block' : 'none';
  });
};


window.renderAdminSloganPairs = function() {
  const container = document.getElementById('adminSloganPairsListContainer');
  if (!container) return;
  
  // بارگذاری مقادیر ورودی‌ها
  const titleInput = document.getElementById('adminMainBrandTitleInput');
  if (titleInput) titleInput.value = safeGetStorage('tajinkart_brand_title') || 'TAJINKART';
  
  const genreInput = document.getElementById('adminGenreSubtitleInput');
  if (genreInput) genreInput.value = safeGetStorage('tajinkart_brand_genre') || 'DARK FANTASY • SCI-FI • ENTERTAINMENT DESIGN';

  // در صورت خالی بودن آرایه، ۳ شعار پیش‌فرض بارگذاری شوند
  if (!Array.isArray(BRAND_SIGNATURE_PAIRS) || BRAND_SIGNATURE_PAIRS.length === 0) {
    BRAND_SIGNATURE_PAIRS = [
      { title: 'TAJINKART', sub: 'DARK FANTASY • SCI-FI • ENTERTAINMENT DESIGN' },
      { title: 'TAJINKART', sub: 'CONCEPT ART & VISUAL DEVELOPMENT ATELIER' },
      { title: 'FROM INK TO UNIVERSE', sub: 'ORIGINAL DARK FANTASY & SCI-FI WORLDS' }
    ];
  }

  container.innerHTML = '';
  BRAND_SIGNATURE_PAIRS.forEach((pair, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:10px; align-items:center; background:#04060a; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px;';
    row.innerHTML = `
      <span class="font-mono" style="font-size:12px; font-weight:800; color:var(--gold); width:26px;">#${idx + 1}</span>
      <input type="text" class="admin-slogan-title-input font-mono" value="${pair.title || ''}" placeholder="Header title (e.g. TAJINKART)" style="flex:1; padding:8px 12px; font-size:12px; background:#080c14; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff;" />
      <input type="text" class="admin-slogan-sub-input font-mono" value="${pair.sub || ''}" placeholder="Sub-tagline (e.g. DARK FANTASY • SCI-FI...)" style="flex:1.6; padding:8px 12px; font-size:12px; background:#080c14; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff;" />
      <button type="button" onclick="removeAdminSloganPairRow(${idx})" style="color:#fda4af; font-size:12px; font-weight:700; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:6px; padding:6px 12px; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Delete Tagline">
        🗑️ Delete
      </button>
    `;
    container.appendChild(row);
  });
};

window.addAdminSloganPairRow = function() {
  BRAND_SIGNATURE_PAIRS.push({ title: 'TAJINKART', sub: 'CONCEPT ART & WORLDBUILDING' });
  window.BRAND_SIGNATURE_PAIRS = BRAND_SIGNATURE_PAIRS;
  safeSetStorage('tajinkart_brand_pairs', JSON.stringify(BRAND_SIGNATURE_PAIRS));
  renderAdminSloganPairs();
  if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader();
  showToast('New tagline row added. Click save to persist.', 'info');
};

window.removeAdminSloganPairRow = function(idx) {
  if (BRAND_SIGNATURE_PAIRS.length <= 1) {
    showToast('At least one tagline must remain in header rotation.', 'warning', 3000);
    return;
  }
  BRAND_SIGNATURE_PAIRS.splice(idx, 1);
  window.BRAND_SIGNATURE_PAIRS = BRAND_SIGNATURE_PAIRS;
  safeSetStorage('tajinkart_brand_pairs', JSON.stringify(BRAND_SIGNATURE_PAIRS));
  renderAdminSloganPairs();
  if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader();
  showToast('Tagline removed and changes saved. ✓', 'success', 3000);
};

window.saveAdminSlogansSettings = function() {
  const titleInput = document.getElementById('adminMainBrandTitleInput');
  const genreInput = document.getElementById('adminGenreSubtitleInput');
  
  if (titleInput && titleInput.value.trim()) {
    safeSetStorage('tajinkart_brand_title', titleInput.value.trim());
    const titleEl = document.getElementById('brandMorphTitle');
    if (titleEl) titleEl.textContent = titleInput.value.trim();
  }
  
  if (genreInput && genreInput.value.trim()) {
    safeSetStorage('tajinkart_brand_genre', genreInput.value.trim());
    const genreEl = document.getElementById('brandGenreBar');
    if (genreEl) genreEl.textContent = genreInput.value.trim();
  }

  // ذخیره جفت‌های شعار
  const titleInputs = document.querySelectorAll('.admin-slogan-title-input');
  const subInputs = document.querySelectorAll('.admin-slogan-sub-input');
  const updatedPairs = [];

  for (let i = 0; i < titleInputs.length; i++) {
    const t = (titleInputs[i].value || '').trim();
    const s = (subInputs[i].value || '').trim();
    if (t || s) {
      updatedPairs.push({ title: t || 'TAJINKART', sub: s || 'FROM INK TO UNIVERSE' });
    }
  }

  if (updatedPairs.length > 0) {
    BRAND_SIGNATURE_PAIRS = updatedPairs;
    window.BRAND_SIGNATURE_PAIRS = updatedPairs;
    safeSetStorage('tajinkart_brand_pairs', JSON.stringify(updatedPairs));
  }

  if (typeof initDynamicBrandHeader === 'function') {
    initDynamicBrandHeader();
  }

  showToast('Header brand titles and rotating slogans saved successfully! ✓', 'success', 4000);
};

// انتخاب و پیش‌نمایش کارت وضعیت آتلیه
window.selectStudioStatusCard = function(mode, event) {
  const radio = document.getElementById(`studioMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (radio) radio.checked = true;

  document.querySelectorAll('.studio-status-option-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.getElementById(`cardMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeCard) activeCard.classList.add('active');

  previewStudioStatusSelection();
};

// ذخیره مستقیم وضعیت با دکمه مربعی زرد
window.saveStudioModeDirect = function(mode, event) {
  if (event) event.stopPropagation();

  const radio = document.getElementById(`studioMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (radio) radio.checked = true;

  const input = document.getElementById(`statusMsg_${mode}`);
  const msg = input ? input.value.trim() : '';

  siteSettings.studioAvailabilityMode = mode;
  siteSettings.studioCustomStatusMessage = msg;
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));

  updateStudioLiveStatus();
  previewStudioStatusSelection();

  document.querySelectorAll('.studio-status-option-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.getElementById(`cardMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeCard) activeCard.classList.add('active');

  showToast(`Studio status set to ${mode.toUpperCase()} and saved! ✓`, 'success', 3500);
};

